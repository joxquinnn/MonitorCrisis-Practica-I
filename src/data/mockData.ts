import {
  DEMO_YES,
  HOUR_WEIGHTS,
  REFERENCE_NOW,
  SYMPTOM_WEIGHTS,
  TOTAL_QUESTIONS,
} from '../constants/dashboard.constants';
import type { CrisisAlert, Evaluation, MockData, SymptomKey } from '../types/dashboard.types';
import { mulberry32, pickWeighted } from '../utils/random.utils';

const ALERT_THRESHOLD_RATIO = 0.7;

function buildEvaluations(rand: () => number): Evaluation[] {
  const evaluations: Evaluation[] = [];

  for (let dayOffset = 59; dayOffset >= 0; dayOffset -= 1) {
    const evaluationsToday = 1 + Math.floor(rand() * 4);
    for (let i = 0; i < evaluationsToday; i += 1) {
      const hour = pickWeighted(HOUR_WEIGHTS, rand);
      const minute = Math.floor(rand() * 60);
      const date = new Date(REFERENCE_NOW);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(hour, minute, 0, 0);
      if (date.getTime() > REFERENCE_NOW.getTime()) continue;

      const base = hour === 8 ? 5 : hour === 20 ? 4 : 2;
      const yesCount = Math.min(
        TOTAL_QUESTIONS,
        Math.max(0, base + Math.floor(rand() * 6) - 2),
      );

      const symptomCount = yesCount >= 6 ? 3 : yesCount >= 3 ? 2 : yesCount >= 1 ? 1 : 0;
      const symptoms: SymptomKey[] = [];
      while (symptoms.length < symptomCount) {
        const candidate = pickWeighted(SYMPTOM_WEIGHTS, rand);
        if (!symptoms.includes(candidate)) symptoms.push(candidate);
      }

      evaluations.push({
        id: `ev-${date.getTime()}`,
        timestampISO: date.toISOString(),
        yesCount,
        totalQuestions: TOTAL_QUESTIONS,
        symptoms,
      });
    }
  }

  return evaluations.sort((a, b) => a.timestampISO.localeCompare(b.timestampISO));
}

function buildAlerts(evaluations: Evaluation[]): CrisisAlert[] {
  return evaluations
    .filter((e) => e.yesCount / e.totalQuestions >= ALERT_THRESHOLD_RATIO)
    .map((e) => ({
      id: `al-${e.id}`,
      timestampISO: e.timestampISO,
      severityPercent: (e.yesCount / e.totalQuestions) * 100,
      symptoms: e.symptoms,
      attended: true,
    }));
}

function buildMockData(): MockData {
  const rand = mulberry32(20260920);
  const evaluations = buildEvaluations(rand);
  const alerts = buildAlerts(evaluations);

  return {
    childName: 'Mateo',
    device: {
      batteryPercent: 78,
      mqttConnected: true,
      lastSyncISO: REFERENCE_NOW.toISOString(),
    },
    live: {
      state: 'stable',
      yesCount: DEMO_YES.stable,
      totalQuestions: TOTAL_QUESTIONS,
      updatedAtISO: REFERENCE_NOW.toISOString(),
    },
    evaluations,
    alerts,
  };
}

/**
 * Datos de demostración generados con una semilla fija (estables entre recargas).
 * Sustituye este módulo por una llamada a tu API o por el estado que recibas vía MQTT.
 */
export const MOCK: MockData = buildMockData();
