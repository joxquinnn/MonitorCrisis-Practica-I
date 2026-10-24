import { DAY_MS, REFERENCE_NOW } from '../constants/dashboard.constants';
import type { RangeKey } from '../types/dashboard.types';

export interface Bounds {
  start: Date;
  end: Date;
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toInputDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${formatTime(d)}`;
}

/** Calcula el inicio y fin del rango seleccionado, con respaldo si el rango personalizado es inválido. */
export function getRangeBounds(range: RangeKey, customFrom: string, customTo: string): Bounds {
  const end = new Date(REFERENCE_NOW);
  if (range === '24h') return { start: new Date(end.getTime() - DAY_MS), end };
  if (range === '7d') return { start: new Date(end.getTime() - 7 * DAY_MS), end };
  if (range === '30d') return { start: new Date(end.getTime() - 30 * DAY_MS), end };

  const from = new Date(`${customFrom}T00:00:00`);
  const to = new Date(`${customTo}T23:59:59`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return { start: new Date(end.getTime() - 7 * DAY_MS), end };
  }
  return { start: from, end: to };
}

export function isWithin(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}
