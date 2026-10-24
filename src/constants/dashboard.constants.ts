import type { Level, LiveState, RangeKey, SymptomKey, Tone } from '../types/dashboard.types';

export const TOTAL_QUESTIONS = 10;
export const ALERT_THRESHOLD_PERCENT = 70;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;

/** Momento de referencia para generar/filtrar los datos mock. Reemplázalo por `new Date()` en producción. */
export const REFERENCE_NOW = new Date();

/** Nombre principal de la aplicación (hero + navbar). */
export const APP_NAME = 'Vigía';
export const APP_TAGLINE = 'Monitoreo de crisis en tiempo real';

export const SYMPTOM_META: Record<SymptomKey, { label: string; color: string }> = {
  palpitaciones: { label: 'Palpitaciones', color: '#38BDF8' },
  resequedadBoca: { label: 'Resequedad de boca', color: '#2DD4BF' },
  faltaAire: { label: 'Falta de aire', color: '#FBBF24' },
  necesidadCaminar: { label: 'Necesidad de caminar', color: '#C084FC' },
};

/** Paleta de los gráficos (Recharts) para el modo oscuro. */
export const CHART_COLORS = {
  grid: '#1E293B',
  axis: '#64748B',
  line: '#22D3EE',
  bar: '#22D3EE',
  lineSoft: 'rgba(34, 211, 238, 0.25)',
  threshold: '#F87171',
  tooltipBg: '#0F172A',
  tooltipBorder: 'rgba(34, 211, 238, 0.35)',
  tooltipText: '#E2E8F0',
} as const;

export const RANGE_OPTIONS: Array<{ value: RangeKey; label: string }> = [
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Última semana' },
  { value: '30d', label: 'Último mes' },
  { value: 'custom', label: 'Personalizado' },
];

export const LIVE_META: Record<LiveState, { tone: Tone; title: string; description: string }> = {
  stable: {
    tone: 'ok',
    title: 'Tranquilo / Estable',
    description: 'La última evaluación no muestra señales de crisis.',
  },
  evaluating: {
    tone: 'warn',
    title: 'Evaluando sintomatología',
    description: 'El niño está respondiendo el test en el dispositivo.',
  },
  crisis: {
    tone: 'danger',
    title: 'ALERTA: Crisis en proceso',
    description: 'Se detectó una posible crisis. Acude junto al niño.',
  },
};

export const LEVEL_META: Record<Level, { tone: Tone; label: string }> = {
  low: { tone: 'ok', label: 'Leve' },
  medium: { tone: 'warn', label: 'Moderada' },
  high: { tone: 'danger', label: 'Alta' },
};

export const LEVEL_ORDER: Level[] = ['low', 'medium', 'high'];

/** Valores de "Sí" usados por la vista de demostración del monitoreo directo. */
export const DEMO_YES: Record<LiveState, number> = {
  stable: 1,
  evaluating: 4,
  crisis: 8,
};

/** Pesos relativos de cada síntoma al generar datos mock. */
export const SYMPTOM_WEIGHTS: Array<[SymptomKey, number]> = [
  ['palpitaciones', 4],
  ['faltaAire', 3],
  ['necesidadCaminar', 2],
  ['resequedadBoca', 2],
];

/** Horas del día con mayor probabilidad de evaluaciones: [hora, peso]. */
export const HOUR_WEIGHTS: Array<[number, number]> = [
  [7, 2],
  [8, 6],
  [9, 2],
  [13, 3],
  [16, 2],
  [20, 4],
  [21, 2],
];
