export type SymptomKey =
  | 'palpitaciones'
  | 'resequedadBoca'
  | 'faltaAire'
  | 'necesidadCaminar';

export type LiveState = 'stable' | 'evaluating' | 'crisis';
export type RangeKey = '24h' | '7d' | '30d' | 'custom';
export type Level = 'low' | 'medium' | 'high';
export type Tone = 'ok' | 'warn' | 'danger' | 'neutral';
export type SymptomView = 'bar' | 'donut';
export type TrendDirection = 'up' | 'down' | 'flat';

/** Escenario de simulación seleccionable en el navbar. */
export interface DeviceScenario {
  id: string;
  label: string;
}

export interface DeviceStatus {
  batteryPercent: number;
  mqttConnected: boolean;
  lastSyncISO: string;
}

export interface SymptomData {
  key: SymptomKey;
  label: string;
  count: number;
}

/** Una evaluación (test) respondida en el dispositivo. */
export interface Evaluation {
  id: string;
  timestampISO: string;
  yesCount: number;
  totalQuestions: number;
  symptoms: SymptomKey[];
}

export interface CrisisAlert {
  id: string;
  timestampISO: string;
  severityPercent: number;
  symptoms: SymptomKey[];
  attended: boolean;
}

export interface LiveStatus {
  state: LiveState;
  yesCount: number;
  totalQuestions: number;
  updatedAtISO: string;
}

export interface MockData {
  childName: string;
  device: DeviceStatus;
  live: LiveStatus;
  evaluations: Evaluation[];
  alerts: CrisisAlert[];
}

export interface HistoryPoint {
  label: string;
  yes: number;
}

export interface HourPoint {
  hour: string;
  average: number;
}

export interface PeakHour {
  hour: number;
  average: number;
}

/** Datos ya filtrados y agregados para el rango de fechas seleccionado. */
export interface DerivedRangeData {
  alertsNow: number;
  alertsPrev: number;
  symptoms: SymptomData[];
  symptomsTotal: number;
  history: HistoryPoint[];
  hourly: HourPoint[];
  peak: PeakHour | undefined;
  evaluations: Evaluation[];
}

export interface DeviceRisk {
  tone: Tone;
  label: string;
  detail: string;
}
