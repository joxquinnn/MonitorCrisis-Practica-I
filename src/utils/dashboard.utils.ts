import { ALERT_THRESHOLD_PERCENT } from '../constants/dashboard.constants';
import type { DeviceRisk, DeviceStatus, Level, RangeKey, Tone } from '../types/dashboard.types';

export function levelFromPercent(percent: number): Level {
  if (percent >= ALERT_THRESHOLD_PERCENT) return 'high';
  if (percent > 30) return 'medium';
  return 'low';
}

export function trendCopy(range: RangeKey, delta: number): string {
  const reference: Record<RangeKey, string> = {
    '24h': 'respecto a las 24 h previas',
    '7d': 'respecto a la semana pasada',
    '30d': 'respecto al mes anterior',
    custom: 'respecto al período anterior',
  };
  if (delta === 0) return `Sin cambios ${reference[range]}`;
  return `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${reference[range]}`;
}

export function kpiTitle(range: RangeKey): string {
  const titles: Record<RangeKey, string> = {
    '24h': 'Total de alertas · 24 h',
    '7d': 'Total de alertas · semana',
    '30d': 'Total de alertas · mes',
    custom: 'Total de alertas · período',
  };
  return titles[range];
}

export function evaluateDeviceRisk(device: DeviceStatus): DeviceRisk {
  if (!device.mqttConnected) {
    return {
      tone: 'danger',
      label: 'Riesgo: sin conexión',
      detail: 'No se están recibiendo alertas del dispositivo.',
    };
  }
  if (device.batteryPercent < 15) {
    return {
      tone: 'danger',
      label: 'Batería crítica',
      detail: `Batería al ${device.batteryPercent}%. Cárgalo lo antes posible.`,
    };
  }
  if (device.batteryPercent < 30) {
    return {
      tone: 'warn',
      label: 'Atención: batería baja',
      detail: `Batería al ${device.batteryPercent}%. Conviene cargarlo hoy.`,
    };
  }
  return {
    tone: 'ok',
    label: 'Operativo',
    detail: `Batería al ${device.batteryPercent}% y conexión estable.`,
  };
}

/** Convierte un tono semántico en la clase CSS Module correspondiente (`tone_ok`, `tone_warn`, ...). */
export function toneClass(styles: Record<string, string>, tone: Tone): string {
  return styles[`tone_${tone}`] ?? '';
}
