/**
 * Utilidades de formato local. No inventan valores: cuando el dato es
 * inexistente (`null`/`undefined`/inválido) devuelven `null` para que la
 * interfaz pueda mostrar "Sin datos disponibles".
 */

const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Convierte un valor a Date local válido, o `null` si no existe. */
export function parseLocalDate(value: string | null | undefined): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `12 oct 2026, 20:30` en zona horaria local. */
export function formatLocalDateTime(value: string | null | undefined): string | null {
  const date = parseLocalDate(value);
  if (!date) return null;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `20:30` en zona horaria local. */
export function formatLocalTime(value: string | null | undefined): string | null {
  const date = parseLocalDate(value);
  if (!date) return null;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Texto único para datos ausentes. */
export const NO_DATA = 'Sin datos disponibles';

/** Entero legible; devuelve `null` si no hay número. */
export function formatInteger(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value);
}

/** Porcentaje legible; devuelve `null` si no hay número. */
export function formatPercent(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value * 10) / 10;
  return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(rounded)}%`;
}

/** Variación respecto al periodo anterior: `+4`, `−2`, `Sin cambios`. */
export function formatVariation(value: number | null | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value === 0) return 'Sin cambios respecto al periodo anterior';
  const sign = value > 0 ? '+' : '−';
  return `${sign}${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Math.abs(value))} respecto al periodo anterior`;
}
