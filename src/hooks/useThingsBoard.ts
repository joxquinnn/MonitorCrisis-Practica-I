import { useEffect, useMemo, useRef, useState } from 'react';
import { ALERT_THRESHOLD_PERCENT, TOTAL_QUESTIONS } from '../constants/dashboard.constants';
import type {
  CrisisAlert,
  Evaluation,
  LiveState,
  LiveStatus,
  MockData,
  SymptomKey,
} from '../types/dashboard.types';

const TB_HTTP_BASE = import.meta.env.VITE_TB_URL ?? 'https://thingsboard.cloud';
const TB_WS_BASE = import.meta.env.VITE_TB_WS_URL ?? 'wss://thingsboard.cloud';

const RECONNECT_MIN_DELAY = 1_000;
const RECONNECT_MAX_DELAY = 30_000;
const SUBSCRIBE_CMD_ID = 1;

const SYMPTOM_ALIASES: Record<string, SymptomKey> = {
  palpitaciones: 'palpitaciones',
  palpitacion: 'palpitaciones',
  palpitacioncardiaco: 'palpitaciones',
  resequedadboca: 'resequedadBoca',
  boca: 'resequedadBoca',
  resequedad: 'resequedadBoca',
  faltaaire: 'faltaAire',
  aire: 'faltaAire',
  necesidadcaminar: 'necesidadCaminar',
  caminar: 'necesidadCaminar',
  caminarnecesidad: 'necesidadCaminar',
};

const LIVE_ALIASES: Record<string, LiveState> = {
  stable: 'stable',
  estable: 'stable',
  tranquilo: 'stable',
  normal: 'stable',
  evaluating: 'evaluating',
  evaluando: 'evaluating',
  evaluacion: 'evaluating',
  crisis: 'crisis',
  alerta: 'crisis',
  emergency: 'crisis',
  alertacritica: 'crisis', // Agregado para el script de Crisis Mayor
};

/** Estado inicial para que la UI pueda pintarse mientras llegan los primeros datos. */
function emptyData(childName: string): MockData {
  const now = new Date().toISOString();
  return {
    childName,
    device: { batteryPercent: 0, mqttConnected: false, lastSyncISO: now },
    live: { state: 'stable', yesCount: 0, totalQuestions: TOTAL_QUESTIONS, updatedAtISO: now },
    evaluations: [],
    alerts: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
- ThingsBoard serializa los payloads como strings JSON cuando el valor es un
- objeto. Este helper intenta desempaquetarlos de forma tolerante.
 */
function unwrap(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;

  // Manejar el formato de arreglo doble de ThingsBoard: [[timestamp, "json_string"]]
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0]) && value[0].length > 1) {
      return unwrap(value[0][1]);
    }
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return unwrap(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }
  if (isRecord(value)) return value;
  return null;
}

function pick<T = unknown>(source: Record<string, unknown> | null, keys: string[]): T | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key] as T;
  }
  return undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'si', 'sí', 'connected', 'online', 'conectado'].includes(normalized)) return true;
    if (['false', '0', 'no', 'disconnected', 'offline', 'desconectado'].includes(normalized)) return false;
  }
  return fallback;
}

function toIsoString(value: unknown, fallback = new Date().toISOString()): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 1e12 ? value * 1000 : value).toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return fallback;
}

function toSymptomKey(value: unknown): SymptomKey | null {
  if (typeof value !== 'string') return null;
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
  return SYMPTOM_ALIASES[normalized] ?? null;
}

function toSymptomKeys(value: unknown): SymptomKey[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,;|]/) : [];
  const keys = list
    .map(toSymptomKey)
    .filter((key): key is SymptomKey => key !== null);
  return [...new Set(keys)];
}

function toLiveState(value: unknown, fallback: LiveState = 'stable'): LiveState {
  if (typeof value !== 'string') return fallback;
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
  return LIVE_ALIASES[normalized] ?? fallback;
}

function parseEvaluations(raw: unknown): Evaluation[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item, index): Evaluation | null => {
      const record = unwrap(item);
      if (!record) return null;
      const totalQuestions = toNumber(
        pick(record, ['total_preguntas', 'totalQuestions', 'total_preguntas_totales']),
        TOTAL_QUESTIONS,
      );
      const yesCount = toNumber(
        pick(record, ['respuestas_si', 'yesCount', 'si', 'respuestas_afirmativas']),
        0,
      );
      const timestampISO = toIsoString(
        pick(record, ['timestampISO', 'timestamp', 'fecha', 'hora', 'ts']),
      );
      return {
        id: String(pick(record, ['id', '_id', 'evaluacion_id']) ?? `tb-${index}-${timestampISO}`),
        timestampISO,
        yesCount,
        totalQuestions,
        symptoms: toSymptomKeys(pick(record, ['symptoms', 'sintomas', 'sintomas_respondidos'])),
      };
    })
    .filter((evaluation): evaluation is Evaluation => evaluation !== null)
    .sort((a, b) => a.timestampISO.localeCompare(b.timestampISO));
}

/** Extrae el estado unificado a partir del bloque `data` recibido por el WebSocket. */
function buildState(
  payload: Record<string, unknown>,
  previous: MockData,
  fallbackName: string,
): MockData {
  const root = unwrap(pick(payload, ['data'])) ?? payload;
  const dispositivo = unwrap(pick(root, ['dispositivo', 'device']));
  const monitoreo = unwrap(pick(root, ['monitoreo_tiempo_real', 'monitoreo', 'live']));
  const estadisticas = unwrap(pick(root, ['estadisticas_agregadas', 'estadisticas', 'stats'])) ?? {};

  const nombre = pick<string>(dispositivo, ['nombre', 'name', 'nombre_nino', 'childName']);
  const childName = nombre ?? previous.childName ?? fallbackName;

  const batteryPercent = toNumber(
    pick(dispositivo, ['bateria', 'battery', 'batteryPercent', 'bateria_porcentaje', 'nivel_bateria_porcentaje']),
    previous.device.batteryPercent,
  );
  const mqttConnected = toBoolean(
    pick(dispositivo, ['mqtt_conectado', 'mqttConnected', 'conectado', 'connected', 'estado_conexion']),
    previous.device.mqttConnected,
  );
  const lastSyncISO = toIsoString(
    pick(dispositivo, ['ultima_sincronizacion', 'lastSyncISO', 'last_sync', 'updated']),
    previous.device.lastSyncISO,
  );

  const totalQuestions = toNumber(
    pick(monitoreo, ['total_preguntas', 'totalQuestions']),
    previous.live.totalQuestions || TOTAL_QUESTIONS,
  );

  // El script de crisis mayor manda porcentaje directo. Lo traducimos a respuestas "sí".
  const gravedadPorcentaje = pick(monitoreo, ['gravedad_actual_porcentaje', 'gravedad_porcentaje']);
  
  const yesCount = gravedadPorcentaje !== undefined 
    ? Math.round((toNumber(gravedadPorcentaje) / 100) * totalQuestions)
    : toNumber(pick(monitoreo, ['respuestas_si', 'yesCount', 'si']), previous.live.yesCount);

  const live: LiveStatus = {
    state: toLiveState(pick(monitoreo, ['estado', 'state', 'estado_actual']), previous.live.state),
    yesCount,
    totalQuestions,
    updatedAtISO: toIsoString(
      pick(monitoreo, ['actualizado', 'updatedAtISO', 'updated', 'timestamp']),
      previous.live.updatedAtISO,
    ),
  };

  // Extraer síntomas recurrentes si vienen en el formato agrupado (Script Crisis Mayor)
  const sintomasObj = unwrap(pick(estadisticas, ['sintomas']));
  let recurrentSymptoms: SymptomKey[] = [];
  if (sintomasObj && Array.isArray(sintomasObj.manifestaciones_recurrentes)) {
    recurrentSymptoms = toSymptomKeys(
      sintomasObj.manifestaciones_recurrentes.map((m: Record<string, unknown>) => m.sintoma)
    );
  }

 // Evaluaciones: Intentamos leer un historial explícito enviado por el script
  const evaluationsRaw = pick(estadisticas, ['evaluaciones', 'evaluacion', 'evaluations']);
  const evaluations: Evaluation[] = evaluationsRaw !== undefined 
    ? parseEvaluations(evaluationsRaw) 
    : [...previous.evaluations];

  // Si el script no envía un historial, acumulamos el dato en vivo actual para armar el gráfico localmente
  if (evaluationsRaw === undefined) {
    const lastEval = evaluations[evaluations.length - 1];
    // Solo agregamos un nuevo punto si el timestamp es diferente al último (para no duplicar)
    if (!lastEval || lastEval.timestampISO !== live.updatedAtISO) {
      evaluations.push({
        id: `tb-eval-local-${Date.now()}`,
        timestampISO: live.updatedAtISO,
        yesCount: live.yesCount,
        totalQuestions: live.totalQuestions,
        symptoms: recurrentSymptoms,
      });

      // Mantenemos solo los últimos 15 puntos para que el gráfico no se apriete demasiado
      if (evaluations.length > 15) {
        evaluations.shift();
      }
    }
  }

  // Alertas
  const alertasObj = unwrap(pick(estadisticas, ['alertas']));
  let alerts: CrisisAlert[] = previous.alerts; // Usamos explícitamente el tipo CrisisAlert importado
  
  if (alertasObj && typeof alertasObj.total_rango_fecha === 'number') {
    // Si viene el total agregado, generamos alertas simuladas para reflejarlas en la UI
    const total = alertasObj.total_rango_fecha;
    const ts = toIsoString(alertasObj.ultima_alerta_registrada, live.updatedAtISO);
    alerts = Array.from({ length: total }).map((_, i) => ({
      id: `tb-alert-agg-${i}-${ts}`,
      timestampISO: ts,
      severityPercent: toNumber(gravedadPorcentaje, 95),
      symptoms: recurrentSymptoms,
      attended: false
    }));
  } else if (evaluations.length > 0) {
    // Fallback: derivar alertas de las evaluaciones críticas
    alerts = evaluations
      .filter((evaluation) => (evaluation.yesCount / evaluation.totalQuestions) * 100 >= ALERT_THRESHOLD_PERCENT)
      .map((evaluation) => ({
        id: `tb-alert-${evaluation.id}`,
        timestampISO: evaluation.timestampISO,
        severityPercent: (evaluation.yesCount / evaluation.totalQuestions) * 100,
        symptoms: evaluation.symptoms,
        attended: false,
      }));
  }

  return {
    childName: childName || fallbackName,
    device: { batteryPercent, mqttConnected, lastSyncISO },
    live,
    evaluations,
    alerts,
  };
}

async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${TB_HTTP_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Login falló (${response.status} ${response.statusText})`);
  }

  const body = (await response.json()) as { token?: string };
  if (!body.token) throw new Error('La respuesta de login no incluye un token');

  return body.token;
}

export interface UseThingsBoardResult {
  data: MockData | null;
  isConnected: boolean;
  error: string | null;
}

export function useThingsBoard(entityId: string | null | undefined): UseThingsBoardResult {
  const [data, setData] = useState<MockData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const disposedRef = useRef(false);

  const fallbackName = useMemo(() => 'Dispositivo', []);

  const configError = useMemo(() => {
    if (!entityId) return 'Falta el entityId del dispositivo';
    if (!import.meta.env.VITE_TB_USERNAME || !import.meta.env.VITE_TB_PASSWORD) {
      return 'Faltan las variables de entorno VITE_TB_USERNAME y VITE_TB_PASSWORD';
    }
    return null;
  }, [entityId]);

  useEffect(() => {
    disposedRef.current = false;
    let cancelled = false;

    if (configError) {
      return undefined;
    }

    const username = import.meta.env.VITE_TB_USERNAME as string;
    const password = import.meta.env.VITE_TB_PASSWORD as string;

    const clearReconnect = (): void => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const scheduleReconnect = (): void => {
      if (cancelled || disposedRef.current) return;
      clearReconnect();
      const delay = Math.min(RECONNECT_MAX_DELAY, RECONNECT_MIN_DELAY * 2 ** attemptRef.current);
      attemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(() => {
        void connect();
      }, delay);
    };

    const subscribe = (socket: WebSocket): void => {
      socket.send(
        JSON.stringify({
          tsSubCmds: [
            {
              entityType: 'DEVICE',
              entityId: entityId as string,
              scope: 'LATEST_TELEMETRY',
              cmdId: SUBSCRIBE_CMD_ID,
            },
          ],
          historyCmds: [],
          attrSubCmds: [],
        }),
      );
    };

    const connect = async (): Promise<void> => {
      if (cancelled || disposedRef.current) return;

      try {
        const token = await login(username, password);
        if (cancelled || disposedRef.current) return;

        const socket = new WebSocket(
          `${TB_WS_BASE}/api/ws/plugins/telemetry?token=${encodeURIComponent(token)}`,
        );
        socketRef.current = socket;

        socket.onopen = () => {
          attemptRef.current = 0;
          setIsConnected(true);
          setError(null);
          subscribe(socket);
        };

        socket.onmessage = (event: MessageEvent<string>) => {
          try {
            const parsed = JSON.parse(event.data as string) as Record<string, unknown>;
            const payload = unwrap(parsed) ?? {};
            setData((previous) => buildState(payload, previous ?? emptyData(fallbackName), fallbackName));
          } catch {
            // Mensaje no interpretable: se ignora sin romper la conexión.
          }
        };

        socket.onerror = () => {
          setError('Error en la conexión WebSocket con ThingsBoard');
        };

        socket.onclose = () => {
          setIsConnected(false);
          socketRef.current = null;
          scheduleReconnect();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo conectar con ThingsBoard');
        setIsConnected(false);
        scheduleReconnect();
      }
    };

    void connect();

    return () => {
      cancelled = true;
      disposedRef.current = true;
      clearReconnect();
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }
    };
  }, [entityId, configError, fallbackName]);

  return { data, isConnected, error: error ?? configError };
}

export default useThingsBoard;