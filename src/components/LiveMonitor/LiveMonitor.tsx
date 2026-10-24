import type { ReactElement } from 'react';
import { LIVE_META } from '../../constants/dashboard.constants';
import { StatusIcon } from '../../icons/StatusIcon';
import type { CrisisAlert, LiveState, LiveStatus } from '../../types/dashboard.types';
import { toneClass } from '../../utils/dashboard.utils';
import { formatDateTime, formatTime } from '../../utils/date.utils';
import toneStyles from '../../styles/tones.module.css';
import cardStyles from '../../styles/card.module.css';
import styles from './LiveMonitor.module.css';

interface LiveMonitorProps {
  childName: string;
  live: LiveStatus;
  lastAlert: CrisisAlert | undefined;
  attendedAt: Date | null;
  notifiedAt: Date | null;
  onAttend: () => void;
  onNotify: () => void;
  onDemo: (state: LiveState) => void;
}

const LIVE_STATES: LiveState[] = ['stable', 'evaluating', 'crisis'];

const DEMO_LABELS: Record<LiveState, string> = {
  stable: 'Estable',
  evaluating: 'Evaluando',
  crisis: 'Crisis',
};

export function LiveMonitor({
  childName,
  live,
  lastAlert,
  attendedAt,
  notifiedAt,
  onAttend,
  onNotify,
  onDemo,
}: LiveMonitorProps): ReactElement {
  const meta = LIVE_META[live.state];
  const isCrisis = live.state === 'crisis';

  return (
    <section
      className={`${cardStyles.card} ${styles.live} ${toneClass(toneStyles, meta.tone)} ${
        isCrisis ? styles.crisis : ''
      }`}
      aria-labelledby="live-title"
    >
      <div className={styles.main}>
        <p className={styles.eyebrow} id="live-title">
          Monitoreo directo · {childName}
        </p>

        {/* role="alert" anuncia el cambio a lectores de pantalla sólo en crisis */}
        <div role={isCrisis ? 'alert' : 'status'} className={styles.statusRow}>
          <span className={styles.icon}>
            <StatusIcon state={live.state} />
          </span>
          <div>
            <p className={styles.statusTitle}>{meta.title}</p>
            <p className={styles.description}>{meta.description}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onAttend}
            disabled={!isCrisis}
          >
            Marcar alerta como atendida
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onNotify}>
            Notificar al tutor
          </button>
        </div>

        <div className={styles.feedback} aria-live="polite">
          {attendedAt && <p>Alerta marcada como atendida a las {formatTime(attendedAt)}.</p>}
          {notifiedAt && <p>Tutor notificado a las {formatTime(notifiedAt)}.</p>}
        </div>

        <p className={styles.meta}>
          Actualizado a las {formatTime(new Date(live.updatedAtISO))}
          {lastAlert && (
            <>
              {' '}
              · Última alerta registrada: {formatDateTime(lastAlert.timestampISO)}
              {lastAlert.attended ? ' (atendida)' : ' (sin atender)'}
            </>
          )}
        </p>

        <div className={styles.demo} role="group" aria-label="Vista de demostración del estado">
          <span className={styles.demoLabel}>Vista de demostración</span>
          {LIVE_STATES.map((state) => (
            <button
              key={state}
              type="button"
              className={`${styles.demoBtn} ${live.state === state ? styles.demoBtnActive : ''}`}
              aria-pressed={live.state === state}
              onClick={() => onDemo(state)}
            >
              {DEMO_LABELS[state]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
