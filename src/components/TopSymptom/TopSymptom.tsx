import type { ReactElement } from 'react';
import type { MostFrequentSymptomPayload } from '../../types/dashboard.types';
import { formatInteger, formatPercent } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import styles from './TopSymptom.module.css';

interface TopSymptomProps {
  masFrecuente: MostFrequentSymptomPayload | null;
}

/** Síntoma predominante (`estadisticas_agregadas.sintomas.mas_frecuente`). */
export function TopSymptom({ masFrecuente }: TopSymptomProps): ReactElement {
  const nombre = masFrecuente?.nombre ?? null;
  const registros = formatInteger(masFrecuente?.registros ?? null);
  const incidencia = formatPercent(masFrecuente?.porcentaje_incidencia ?? null);

  return (
    <section className={`${cardStyles.card} ${styles.card}`} aria-labelledby="top-symptom-title">
      <h3 id="top-symptom-title" className={styles.title}>
        Síntoma más frecuente
      </h3>

      {nombre ? (
        <>
          <p className={styles.name}>{nombre}</p>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Registros</dt>
              <dd className={`${styles.statValue} ${registros ? '' : styles.noData}`}>
                {registros ?? 'Sin datos disponibles'}
              </dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Incidencia</dt>
              <dd className={`${styles.statValue} ${incidencia ? '' : styles.noData}`}>
                {incidencia ?? 'Sin datos disponibles'}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className={styles.empty}>Sin datos disponibles</p>
      )}
    </section>
  );
}