import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  AggregatedStatsPayload,
  AlertsSummaryPayload,
  DashboardPayload,
  DevicePayload,
  LiveMonitorPayload,
  MostFrequentSymptomPayload,
  RecurrentManifestationPayload,
  SymptomsSummaryPayload,
} from '../types/dashboard.types';

const TB_HTTP_BASE = import.meta.env.VITE_TB_URL ?? 'https://thingsboard.cloud';
const TB_WS_BASE = import.meta.env.VITE_TB_WS_URL ?? 'wss://thingsboard.cloud';

const RECONNECT_MIN_DELAY = 1_000;
const RECONNECT_MAX_DELAY = 30_000;
const SUBSCRIBE_CMD_ID = 1;

/* ------------------------------------------------------------------ *
 * Utilidades de desempaquetado (ThingsBoard serializa objetos a JSON)
 * ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Desenvuelve objetos/arrays serializados por ThingsBoard. */
function unwrap(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;

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

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'si', 'sí', 'connected', 'online', 'conectado'].includes(normalized)) return true;
    if (['false', '0', 'no', 'disconnected', 'offline', 'desconectado'].includes(normalized)) return false;
  }
  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function toIsoText(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 1e12 ? value * 1000 : value).toISOString();
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value.trim() : date.toISOString();
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Parseo estricto del payload oficial
 * ------------------------------------------------------------------ */

function parseDispositivo(raw: unknown): DevicePayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  return {
    estado_conexion:
      record.estado_conexion !== undefined ? toBoolean(record.estado_conexion) ?? toText(record.estado_conexion) : null,
    nivel_bateria_porcentaje:
      record.nivel_bateria_porcentaje !== undefined ? toNumber(record.nivel_bateria_porcentaje) : null,
    ultima_sincronizacion:
      record.ultima_sincronizacion !== undefined ? toIsoText(record.ultima_sincronizacion) : null,
  };
}

function parseMonitoreo(raw: unknown): LiveMonitorPayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  return {
    estado_actual: record.estado_actual !== undefined ? toText(record.estado_actual) : null,
    gravedad_actual_porcentaje:
      record.gravedad_actual_porcentaje !== undefined ? toNumber(record.gravedad_actual_porcentaje) : null,
    patron_motriz_actual: record.patron_motriz_actual !== undefined ? toText(record.patron_motriz_actual) : null,
    alerta_atendida: record.alerta_atendida !== undefined ? toBoolean(record.alerta_atendida) : null,
  };
}

function parseAlertas(raw: unknown): AlertsSummaryPayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  return {
    total_rango_fecha: record.total_rango_fecha !== undefined ? toNumber(record.total_rango_fecha) : null,
    variacion_periodo_anterior:
      record.variacion_periodo_anterior !== undefined ? toNumber(record.variacion_periodo_anterior) : null,
    ultima_alerta_registrada:
      record.ultima_alerta_registrada !== undefined ? toIsoText(record.ultima_alerta_registrada) : null,
  };
}

function parseMasFrecuente(raw: unknown): MostFrequentSymptomPayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  return {
    nombre: record.nombre !== undefined ? toText(record.nombre) : null,
    registros: record.registros !== undefined ? toNumber(record.registros) : null,
    porcentaje_incidencia:
      record.porcentaje_incidencia !== undefined ? toNumber(record.porcentaje_incidencia) : null,
  };
}

function parseManifestacion(raw: unknown, index: number): RecurrentManifestationPayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  return {
    sintoma: record.sintoma !== undefined ? toText(record.sintoma) : toText(record[`sintoma_${index}`]),
    frecuencia: record.frecuencia !== undefined ? toNumber(record.frecuencia) : null,
    porcentaje: record.porcentaje !== undefined ? toNumber(record.porcentaje) : null,
  };
}

function parseSintomas(raw: unknown): SymptomsSummaryPayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  const recurrentRaw = Array.isArray(record.manifestaciones_recurrentes)
    ? record.manifestaciones_recurrentes
    : [];
  return {
    mas_frecuente: record.mas_frecuente !== undefined ? parseMasFrecuente(record.mas_frecuente) : null,
    manifestaciones_recurrentes: recurrentRaw
      .map((item, index) => parseManifestacion(item, index))
      .filter((item): item is RecurrentManifestationPayload => item !== null),
  };
}

function parseEstadisticas(raw: unknown): AggregatedStatsPayload | null {
  const record = unwrap(raw);
  if (!record) return null;
  return {
    alertas: record.alertas !== undefined ? parseAlertas(record.alertas) : null,
    sintomas: record.sintomas !== undefined ? parseSintomas(record.sintomas) : null,
  };
}

/** Normaliza el mensaje recibido al payload oficial del dashboard. */
export function parseDashboardPayload(raw: unknown): DashboardPayload | null {
  const envelope = unwrap(raw);
  if (!envelope) return null;

  const root = unwrap(envelope.data) ?? envelope;
  const dispositivo = parseDispositivo(root.dispositivo);
  const monitoreo = parseMonitoreo(root.monitoreo_tiempo_real);
  const estadisticas = parseEstadisticas(root.estadisticas_agregadas);

  if (!dispositivo && !monitoreo && !estadisticas) return null;

  return { dispositivo, monitoreo_tiempo_real: monitoreo, estadisticas_agregadas: estadisticas };
}

/**
 * ThingsBoard envía sólo las claves que cambiaron: se fusiona con el estado
 * previo para no borrar tarjetas cuando llega una actualización parcial.
 */
function mergePayload(prev: DashboardPayload | null, next: DashboardPayload): DashboardPayload {
  return {
    dispositivo: next.dispositivo ?? prev?.dispositivo ?? null,
    monitoreo_tiempo_real: next.monitoreo_tiempo_real ?? prev?.monitoreo_tiempo_real ?? null,
    estadisticas_agregadas: {
      alertas: next.estadisticas_agregadas?.alertas ?? prev?.estadisticas_agregadas?.alertas ?? null,
      sintomas: next.estadisticas_agregadas?.sintomas ?? prev?.estadisticas_agregadas?.sintomas ?? null,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Conexión ThingsBoard
 * ------------------------------------------------------------------ */

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
  payload: DashboardPayload | null;
  isConnected: boolean;
  error: string | null;
  receivedAt: string | null;
}

interface ConnectionState extends UseThingsBoardResult {
  entityId: string | null | undefined;
}

const INITIAL_STATE: ConnectionState = {
  entityId: null,
  payload: null,
  isConnected: false,
  error: null,
  receivedAt: null,
};

export function useThingsBoard(entityId: string | null | undefined): UseThingsBoardResult {
  const [state, setState] = useState<ConnectionState>(INITIAL_STATE);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const disposedRef = useRef(false);

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
    attemptRef.current = 0;

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
          if (cancelled || disposedRef.current) return;
          attemptRef.current = 0;
          setState((prev) => ({
            ...(prev.entityId === entityId ? prev : INITIAL_STATE),
            entityId,
            isConnected: true,
            error: null,
          }));
          subscribe(socket);
        };

        socket.onmessage = (event: MessageEvent<string>) => {
          if (cancelled || disposedRef.current) return;
          try {
            const parsed = JSON.parse(event.data as string) as Record<string, unknown>;
            const next = parseDashboardPayload(parsed);
            if (next) {
              setState((prev) => ({
                ...(prev.entityId === entityId ? prev : INITIAL_STATE),
                entityId,
                payload: mergePayload(prev.entityId === entityId ? prev.payload : null, next),
                receivedAt: new Date().toISOString(),
              }));
            }
          } catch {
            // Mensaje no interpretable: se ignora sin romper la conexión.
          }
        };

        socket.onerror = () => {
          if (cancelled || disposedRef.current) return;
          setState((prev) => ({
            ...(prev.entityId === entityId ? prev : INITIAL_STATE),
            entityId,
            error: 'Error en la conexión WebSocket con ThingsBoard',
          }));
        };

        socket.onclose = () => {
          if (cancelled || disposedRef.current) return;
          setState((prev) => ({
            ...(prev.entityId === entityId ? prev : INITIAL_STATE),
            entityId,
            isConnected: false,
          }));
          socketRef.current = null;
          scheduleReconnect();
        };
      } catch (err) {
        if (cancelled || disposedRef.current) return;
        setState((prev) => ({
          ...(prev.entityId === entityId ? prev : INITIAL_STATE),
          entityId,
          error: err instanceof Error ? err.message : 'No se pudo conectar con ThingsBoard',
          isConnected: false,
        }));
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
  }, [entityId, configError]);

  const isCurrentEntity = state.entityId === entityId;

  return {
    payload: isCurrentEntity ? state.payload : null,
    isConnected: isCurrentEntity ? state.isConnected : false,
    error: (isCurrentEntity ? state.error : null) ?? configError,
    receivedAt: isCurrentEntity ? state.receivedAt : null,
  };
}

export default useThingsBoard;
