import type { ReactElement } from 'react';
import { PatternIcon } from '../../icons/PatternIcon';
import { StatusIcon } from '../../icons/StatusIcon';
import type { LiveMonitorPayload } from '../../types/dashboard.types';
import { isAlertState, resolveClinicalState, toneForState } from '../../utils/clinical.utils';
import { formatPercent } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import toneStyles from '../../styles/tones.module.css';
import utilStyles from '../../styles/utils.module.css';
import styles from './LiveMonitor.module.css';

interface LiveMonitorProps {
  live: LiveMonitorPayload | null;
}

const svgProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Tarjeta principal: estado actual, atención de la alerta, gravedad y patrón motriz. */
export function LiveMonitor({ live }: LiveMonitorProps): ReactElement {
  const state = resolveClinicalState(live?.estado_actual ?? null);
  const tone = toneForState(state);
  const attended = live?.alerta_atendida ?? null;
  const pending = attended === false;
  const emergency = isAlertState(live?.estado_actual ?? null) && pending;

  const gravity = live?.gravedad_actual_porcentaje ?? null;
  const gravityLabel = formatPercent(gravity);
  const pattern = live?.patron_motriz_actual ?? null;
  const estado = live?.estado_actual ?? null;

  const attendedClass =
    attended === null ? styles.attendedNone : pending ? styles.attendedPending : styles.attendedOk;
  const attendedText =
    attended === null ? 'Sin datos disponibles' : pending ? 'Pendiente de atención' : 'Atendida';

  const clamped = gravity === null ? 0 : Math.max(0, Math.min(100, gravity));
  const ringOffset = RING_LENGTH * (1 - clamped / 100);

  return (
    <section
      className={`${cardStyles.card} ${styles.card} ${toneStyles[`tone_${tone}`]} ${
        emergency ? styles.emergency : ''
      }`}
      aria-labelledby="live-title"
    >
      {/* Región persistente: el anuncio sólo ocurre cuando cambia su contenido. */}
      <p className={utilStyles.srOnly} role="alert">
        {emergency ? 'Alerta activa pendiente de atención' : ''}
      </p>

      <h3 id="live-title" className={styles.title}>
        Monitoreo en tiempo real
      </h3>

      <div className={styles.statusBlock} role="status">
        <span className={styles.stateIcon} aria-hidden="true">
          <StatusIcon state={state} />
        </span>
        <div className={styles.stateText}>
          <p className={styles.stateLabel}>Estado actual</p>
          <p className={`${styles.stateValue} ${estado ? '' : styles.noData}`}>
            {estado ?? 'Sin datos disponibles'}
          </p>
        </div>
        <p className={`${styles.attended} ${attendedClass}`}>
          <span className={styles.attendedIcon} aria-hidden="true">
            {attended === null ? (
              <svg {...svgProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5" />
                <path d="M12 16h.01" />
              </svg>
            ) : pending ? (
              <svg {...svgProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5.5" />
                <path d="M12 16h.01" />
              </svg>
            ) : (
              <svg {...svgProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12.5l2.7 2.7L16 9.5" />
              </svg>
            )}
          </span>
          {attendedText}
        </p>
      </div>

      <div className={styles.metrics}>
        <div className={`${styles.metric} ${styles.gaugeMetric}`}>
          <p className={styles.metricLabel} id="gravity-label">
            Gravedad actual
          </p>
          <div
            className={styles.ringWrap}
            {...(gravity !== null
              ? {
                  role: 'progressbar',
                  'aria-labelledby': 'gravity-label',
                  'aria-valuemin': 0,
                  'aria-valuemax': 100,
                  'aria-valuenow': gravity,
                  'aria-valuetext': gravityLabel ?? undefined,
                }
              : {})}
          >
            <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
              <circle className={styles.ringTrack} cx="60" cy="60" r={RING_RADIUS} />
              {gravity !== null ? (
                <circle
                  className={styles.ringFill}
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={ringOffset}
                />
              ) : null}
            </svg>
            <p className={`${styles.ringValue} ${gravityLabel ? '' : styles.ringNoData}`}>
              {gravityLabel ?? 'Sin datos disponibles'}
            </p>
          </div>
        </div>

        <div className={styles.metric}>
          <p className={styles.metricLabel}>
            <span className={styles.metricIcon} aria-hidden="true">
              <PatternIcon />
            </span>
            Patrón motriz actual
          </p>
          <p className={`${styles.patternValue} ${pattern ? '' : styles.noData}`}>
            {pattern ?? 'Sin datos disponibles'}
          </p>
        </div>
      </div>
    </section>
  );
}