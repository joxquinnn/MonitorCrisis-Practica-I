import type { ReactElement } from 'react';
import { BatteryIcon } from '../../icons/BatteryIcon';
import { ClockIcon } from '../../icons/ClockIcon';
import type { DevicePayload } from '../../types/dashboard.types';
import { resolveConnection } from '../../utils/clinical.utils';
import { formatLocalDateTime, formatPercent } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import toneStyles from '../../styles/tones.module.css';
import styles from './DeviceStatus.module.css';

interface DeviceStatusProps {
  dispositivo: DevicePayload | null;
  isConnected: boolean;
}

function batteryTone(percent: number | null): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (percent === null) return 'neutral';
  if (percent < 15) return 'danger';
  if (percent < 30) return 'warn';
  return 'ok';
}

/** Tarjeta Prioridad 1: estado del dispositivo (conexión, batería, sincronización). */
export function DeviceStatus({ dispositivo, isConnected }: DeviceStatusProps): ReactElement {
  const connection = resolveConnection(dispositivo?.estado_conexion, isConnected);
  const percent = dispositivo?.nivel_bateria_porcentaje ?? null;
  const percentLabel = formatPercent(percent);
  const lastSync = formatLocalDateTime(dispositivo?.ultima_sincronizacion ?? null);
  const tone = batteryTone(percent);

  return (
    <section
      className={`${cardStyles.card} ${styles.card} ${toneStyles[`tone_${tone}`]}`}
      aria-labelledby="device-title"
    >
      <h3 id="device-title" className={styles.title}>
        Estado del dispositivo
      </h3>

      <div className={styles.row}>
        <span className={styles.rowIcon} aria-hidden="true">
          {connection.connected ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          )}
        </span>
        <div className={styles.rowBody}>
          <p className={styles.rowLabel}>Conexión</p>
          <p
            className={`${styles.rowValue} ${
              connection.connected ? styles.valueOk : styles.valueOff
            }`}
          >
            {connection.label}
          </p>
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowIcon} aria-hidden="true">
          <BatteryIcon percent={percent} />
        </span>
        <div className={styles.rowBody}>
          <p className={styles.rowLabel} id="battery-label">
            Nivel de batería
          </p>
          {percent !== null ? (
            <div
              className={styles.progress}
              role="progressbar"
              aria-labelledby="battery-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={percentLabel ?? undefined}
            >
              <span
                className={styles.progressFill}
                style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
              />
            </div>
          ) : null}
          <p
            className={`${styles.rowValue} ${styles.numValue} ${
              percent !== null ? styles.batteryValue : styles.noData
            }`}
          >
            {percentLabel ?? 'Sin datos disponibles'}
          </p>
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.rowIcon} aria-hidden="true">
          <ClockIcon />
        </span>
        <div className={styles.rowBody}>
          <p className={styles.rowLabel}>Última sincronización recibida</p>
          <p className={`${styles.rowValue} ${styles.numValue} ${lastSync ? '' : styles.noData}`}>
            {lastSync ?? 'Sin datos disponibles'}
          </p>
        </div>
      </div>
    </section>
  );
}