import type { ReactElement } from 'react';
import { ClockIcon } from '../../icons/ClockIcon';
import { TrendIcon, type TrendDirection } from '../../icons/TrendIcon';
import type { AlertsSummaryPayload } from '../../types/dashboard.types';
import { formatInteger, formatLocalDateTime, formatVariation } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import toneStyles from '../../styles/tones.module.css';
import styles from './AlertsSummary.module.css';

interface AlertsSummaryProps {
  alertas: AlertsSummaryPayload | null;
}

/** Tarjeta Prioridad 2: resumen de alertas del período informado por la API. */
export function AlertsSummary({ alertas }: AlertsSummaryProps): ReactElement {
  const total = formatInteger(alertas?.total_rango_fecha ?? null);
  const variation = formatVariation(alertas?.variacion_periodo_anterior ?? null);
  const lastAlert = formatLocalDateTime(alertas?.ultima_alerta_registrada ?? null);
  const delta = alertas?.variacion_periodo_anterior ?? null;

  const direction: TrendDirection = delta === null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  // Más alertas ⇒ peor tono (advertencia); menos alertas ⇒ estado favorable.
  const tone = delta === null || delta === 0 ? 'neutral' : delta > 0 ? 'warn' : 'ok';

  return (
    <section className={cardStyles.card} aria-labelledby="alerts-title">
      <h3 id="alerts-title" className={styles.title}>
        Resumen de alertas
      </h3>

      <p className={`${styles.total} ${total === null ? styles.noData : ''}`}>
        {total ?? 'Sin datos disponibles'}
      </p>
      <p className={styles.totalLabel}>Alertas en el rango de fecha consultado</p>

      <p className={`${styles.variation} ${toneStyles[`tone_${tone}`]}`}>
        <span className={styles.variationIcon} aria-hidden="true">
          <TrendIcon direction={direction} />
        </span>
        {variation ?? 'Sin datos de variación'}
      </p>

      <p className={styles.lastAlert}>
        <span className={styles.lastAlertIcon} aria-hidden="true">
          <ClockIcon size={18} />
        </span>
        <span>
          <span className={styles.lastAlertLabel}>Última alerta registrada:</span>{' '}
          <span className={styles.timeValue}>{lastAlert ?? 'Sin datos disponibles'}</span>
        </span>
      </p>
    </section>
  );
}