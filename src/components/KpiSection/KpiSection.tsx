import type { ReactElement } from 'react';
import { SYMPTOM_META } from '../../constants/dashboard.constants';
import { SymptomIcon } from '../../icons/SymptomIcon';
import { TrendIcon } from '../../icons/TrendIcon';
import type { DerivedRangeData, DeviceStatus, RangeKey, TrendDirection } from '../../types/dashboard.types';
import { evaluateDeviceRisk, kpiTitle, toneClass, trendCopy } from '../../utils/dashboard.utils';
import { formatDateTime } from '../../utils/date.utils';
import toneStyles from '../../styles/tones.module.css';
import cardStyles from '../../styles/card.module.css';
import styles from './KpiSection.module.css';

interface KpiSectionProps {
  range: RangeKey;
  derived: DerivedRangeData;
  device: DeviceStatus;
}

export function KpiSection({ range, derived, device }: KpiSectionProps): ReactElement {
  const delta = derived.alertsNow - derived.alertsPrev;
  const trendDirection: TrendDirection = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  // Más alertas = peor, por eso "up" usa tono de advertencia en vez de "ok".
  const trendTone = delta > 0 ? 'warn' : delta < 0 ? 'ok' : 'neutral';

  const topSymptom = derived.symptoms[0];
  const hasSymptoms = derived.symptomsTotal > 0;
  const deviceRisk = evaluateDeviceRisk(device);

  return (
    <section className={styles.kpis} aria-label="Resumen del período">
      <article className={cardStyles.card}>
        <h2 className={styles.label}>{kpiTitle(range)}</h2>
        <p className={styles.value}>{derived.alertsNow}</p>
        <p className={`${styles.badge} ${toneClass(toneStyles, trendTone)}`}>
          <TrendIcon direction={trendDirection} />
          {trendCopy(range, delta)}
        </p>
      </article>

      <article className={cardStyles.card}>
        <h2 className={styles.label}>Síntoma más frecuente</h2>
        {topSymptom && hasSymptoms ? (
          <div className={styles.symptomKpi}>
            <span className={styles.symptomIcon} style={{ color: SYMPTOM_META[topSymptom.key].color }}>
              <SymptomIcon symptom={topSymptom.key} size={36} />
            </span>
            <div>
              <p className={styles.symptomName}>{topSymptom.label}</p>
              <p className={styles.hint}>
                {topSymptom.count} registros en el período (
                {Math.round((topSymptom.count / derived.symptomsTotal) * 100)}%)
              </p>
            </div>
          </div>
        ) : (
          <p className={styles.hint}>Sin síntomas registrados en este período.</p>
        )}
      </article>

      <article className={cardStyles.card}>
        <h2 className={styles.label}>Estado de riesgo del dispositivo</h2>
        <p className={`${styles.badge} ${styles.badgeLarge} ${toneClass(toneStyles, deviceRisk.tone)}`}>
          {deviceRisk.label}
        </p>
        <p className={styles.hint}>{deviceRisk.detail}</p>
        <p className={styles.hint}>Última sincronización: {formatDateTime(device.lastSyncISO)}</p>
      </article>
    </section>
  );
}
