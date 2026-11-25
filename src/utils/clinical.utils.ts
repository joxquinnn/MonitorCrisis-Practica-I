import type { ClinicalState } from '../icons/StatusIcon';

export type Tone = 'ok' | 'warn' | 'danger' | 'neutral';

const ALERTA_KEYWORDS = ['alerta', 'crisis', 'critic', 'emergencia'];
const EVALUANDO_KEYWORDS = ['evalu', 'proceso', 'midiendo', 'revision'];

/** Deriva el ícono/tono del estado actual informado por el dispositivo. */
export function resolveClinicalState(estadoActual: string | null): ClinicalState {
  if (!estadoActual) return 'desconocido';
  const normalized = estadoActual
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (ALERTA_KEYWORDS.some((keyword) => normalized.includes(keyword))) return 'alerta';
  if (EVALUANDO_KEYWORDS.some((keyword) => normalized.includes(keyword))) return 'evaluando';
  if (normalized.includes('estable') || normalized.includes('tranquil') || normalized.includes('normal')) {
    return 'estable';
  }
  return 'desconocido';
}

/** Tono semántico asociado al estado actual. */
export function toneForState(state: ClinicalState): Tone {
  switch (state) {
    case 'alerta':
      return 'danger';
    case 'evaluando':
      return 'warn';
    case 'estable':
      return 'ok';
    default:
      return 'neutral';
  }
}

/** `true` cuando el dispositivo reporta estado de alerta. */
export function isAlertState(estadoActual: string | null): boolean {
  return resolveClinicalState(estadoActual) === 'alerta';
}

/**
 * Estado de conexión: se prioriza el valor recibido en `dispositivo.estado_conexion`
 * y, si no existe, el estado real del WebSocket con ThingsBoard.
 */
export function resolveConnection(
  estadoConexion: boolean | string | null | undefined,
  socketConnected: boolean,
): { connected: boolean; label: string } {
  if (typeof estadoConexion === 'boolean') {
    return estadoConexion
      ? { connected: true, label: 'Conectado' }
      : { connected: false, label: 'Desconectado' };
  }
  if (typeof estadoConexion === 'string' && estadoConexion.trim() !== '') {
    const normalized = estadoConexion
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const connected = ['conectado', 'connected', 'online', 'true', 'si', 'sí'].includes(normalized);
    return { connected, label: connected ? 'Conectado' : 'Desconectado' };
  }
  return socketConnected
    ? { connected: true, label: 'Conectado' }
    : { connected: false, label: 'Desconectado' };
}
