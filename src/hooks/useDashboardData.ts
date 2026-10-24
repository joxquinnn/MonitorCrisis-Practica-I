import { useMemo, useState } from 'react';
import { DEMO_YES, REFERENCE_NOW, SYMPTOM_META, TOTAL_QUESTIONS } from '../constants/dashboard.constants';
import { MOCK } from '../data/mockData';
import type {
  DerivedRangeData,
  HistoryPoint,
  HourPoint,
  LiveState,
  LiveStatus,
  MockData,
  PeakHour,
  RangeKey,
  SymptomData,
  SymptomKey,
  SymptomView,
} from '../types/dashboard.types';
import { formatDateTime, getRangeBounds, isWithin, pad, toInputDate } from '../utils/date.utils';

function computeDerivedRangeData(
  source: MockData,
  range: RangeKey,
  customFrom: string,
  customTo: string,
): DerivedRangeData {
  const { start, end } = getRangeBounds(range, customFrom, customTo);
  const span = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - span);

  const evaluations = source.evaluations.filter((e) => isWithin(e.timestampISO, start, end));
  const alertsNow = source.alerts.filter((a) => isWithin(a.timestampISO, start, end)).length;
  const alertsPrev = source.alerts.filter((a) => isWithin(a.timestampISO, prevStart, start)).length;

  // Síntomas más marcados en el período.
  const counts = new Map<SymptomKey, number>();
  evaluations.forEach((e) => e.symptoms.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
  const symptoms: SymptomData[] = (Object.keys(SYMPTOM_META) as SymptomKey[])
    .map((key) => ({ key, label: SYMPTOM_META[key].label, count: counts.get(key) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const symptomsTotal = symptoms.reduce((sum, s) => sum + s.count, 0);

  // Histórico: "Sí" por evaluación.
  const history: HistoryPoint[] = evaluations.map((e) => ({
    label: formatDateTime(e.timestampISO),
    yes: e.yesCount,
  }));

  // Patrón por hora (promedio de "Sí").
  const byHour = new Map<number, { sum: number; n: number }>();
  evaluations.forEach((e) => {
    const hour = new Date(e.timestampISO).getHours();
    const acc = byHour.get(hour) ?? { sum: 0, n: 0 };
    byHour.set(hour, { sum: acc.sum + e.yesCount, n: acc.n + 1 });
  });

  const hours = [...byHour.keys()];
  const hourly: HourPoint[] = [];
  if (hours.length > 0) {
    for (let h = Math.min(...hours); h <= Math.max(...hours); h += 1) {
      const acc = byHour.get(h);
      hourly.push({ hour: `${pad(h)}:00`, average: acc ? Math.round((acc.sum / acc.n) * 10) / 10 : 0 });
    }
  }

  const candidates = [...byHour.entries()].filter(([, v]) => v.n >= 2);
  const pool = candidates.length > 0 ? candidates : [...byHour.entries()];
  const peak: PeakHour | undefined = pool
    .map(([hour, v]) => ({ hour, average: v.sum / v.n }))
    .sort((a, b) => b.average - a.average)[0];

  return { alertsNow, alertsPrev, symptoms, symptomsTotal, history, hourly, peak, evaluations };
}

export interface UseDashboardData {
  // Filtros
  range: RangeKey;
  setRange: (range: RangeKey) => void;
  customFrom: string;
  setCustomFrom: (date: string) => void;
  customTo: string;
  setCustomTo: (date: string) => void;

  // Vista de síntomas
  symptomView: SymptomView;
  setSymptomView: (view: SymptomView) => void;

  // Monitoreo en vivo
  live: LiveStatus;
  attendedAt: Date | null;
  notifiedAt: Date | null;
  handleAttend: () => void;
  handleNotify: () => void;
  handleDemo: (state: LiveState) => void;

  // Datos fijos y derivados
  mock: MockData;
  derived: DerivedRangeData;
}

/**
 * Encapsula todo el estado interactivo y los cálculos derivados del dashboard.
 * @param source Datos base (ThingsBoard en producción, mock en desarrollo).
 */
export function useDashboardData(source: MockData = MOCK): UseDashboardData {
  const [range, setRange] = useState<RangeKey>('7d');
  const [customFrom, setCustomFrom] = useState<string>(toInputDate(new Date(REFERENCE_NOW.getTime() - 6 * 86_400_000)));
  const [customTo, setCustomTo] = useState<string>(toInputDate(REFERENCE_NOW));
  const [symptomView, setSymptomView] = useState<SymptomView>('bar');
  const [liveOverride, setLiveOverride] = useState<{ key: string; live: LiveStatus } | null>(null);
  const [attendedAt, setAttendedAt] = useState<Date | null>(null);
  const [notifiedAt, setNotifiedAt] = useState<Date | null>(null);

  const derived = useMemo(
    () => computeDerivedRangeData(source, range, customFrom, customTo),
    [source, range, customFrom, customTo],
  );

  // El estado en vivo viene de ThingsBoard; el override local (demo / atender)
  // se mantiene hasta que ThingsBoard envíe una nueva lectura.
  const liveKey = source.live.updatedAtISO;
  const live = liveOverride?.key === liveKey ? liveOverride.live : source.live;

  const handleDemo = (state: LiveState): void => {
    setLiveOverride({
      key: liveKey,
      live: { state, yesCount: DEMO_YES[state], totalQuestions: TOTAL_QUESTIONS, updatedAtISO: new Date().toISOString() },
    });
    setAttendedAt(null);
    setNotifiedAt(null);
  };

  const handleAttend = (): void => {
    setAttendedAt(new Date());
    setLiveOverride({
      key: liveKey,
      live: { state: 'stable', yesCount: 0, totalQuestions: TOTAL_QUESTIONS, updatedAtISO: new Date().toISOString() },
    });
  };

  const handleNotify = (): void => setNotifiedAt(new Date());

  return {
    range,
    setRange,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    symptomView,
    setSymptomView,
    live,
    attendedAt,
    notifiedAt,
    handleAttend,
    handleNotify,
    handleDemo,
    mock: source,
    derived,
  };
}
