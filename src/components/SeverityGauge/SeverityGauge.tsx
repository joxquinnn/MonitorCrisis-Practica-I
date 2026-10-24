import type { ReactElement } from 'react';
import { LEVEL_META, LEVEL_ORDER } from '../../constants/dashboard.constants';
import type { Level } from '../../types/dashboard.types';
import { levelFromPercent, toneClass } from '../../utils/dashboard.utils';
import toneStyles from '../../styles/tones.module.css';
import cardStyles from '../../styles/card.module.css';
import styles from './SeverityGauge.module.css';

interface SeverityGaugeProps {
  percent: number;
  yesCount: number;
  totalQuestions: number;
}

const RADIUS = 80;
const ARC_LENGTH = Math.PI * RADIUS;
const ARC_PATH = `M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`;

/** Medidor semicircular de gravedad, más un semáforo textual (nunca depende sólo del color). */
export function SeverityGauge({ percent, yesCount, totalQuestions }: SeverityGaugeProps): ReactElement {
  const level: Level = levelFromPercent(percent);
  const meta = LEVEL_META[level];
  const filled = (Math.max(0, Math.min(100, percent)) / 100) * ARC_LENGTH;

  return (
    <section className={`${cardStyles.card} ${styles.card} ${toneClass(toneStyles, meta.tone)}`} aria-labelledby="severity-title">
      <h3 id="severity-title" className={styles.title}>
        Gravedad de la crisis
      </h3>
      <div
        className={styles.wrap}
        role="img"
        aria-label={`Gravedad ${meta.label.toLowerCase()}: ${Math.round(percent)} por ciento, ${yesCount} de ${totalQuestions} respuestas afirmativas`}
      >
        <svg viewBox="0 0 200 118" className={styles.svg} aria-hidden="true" focusable="false">
          <path d={ARC_PATH} className={styles.track} />
          <path d={ARC_PATH} className={styles.value} strokeDasharray={`${filled} ${ARC_LENGTH}`} />
        </svg>
        <div className={styles.readout}>
          <span className={styles.percent}>{Math.round(percent)}%</span>
          <span className={styles.caption}>
            {yesCount} de {totalQuestions} respuestas «Sí»
          </span>
        </div>
      </div>
      <ul className={styles.lights} aria-label="Escala de gravedad">
        {LEVEL_ORDER.map((item) => (
          <li
            key={item}
            className={`${styles.light} ${toneClass(toneStyles, LEVEL_META[item].tone)} ${
              item === level ? styles.lightActive : ''
            }`}
            aria-current={item === level ? 'true' : undefined}
          >
            <span className={styles.lightDot} aria-hidden="true" />
            {LEVEL_META[item].label}
          </li>
        ))}
      </ul>
    </section>
  );
}
