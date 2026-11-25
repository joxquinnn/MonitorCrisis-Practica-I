import type { ReactElement } from 'react';
import type { MostFrequentSymptomPayload } from '../../types/dashboard.types';
import { formatInteger, formatPercent } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import styles from './TopSymptom.module.css';

interface TopSymptomProps {
  masFrecuente: MostFrequentSymptomPayload | null;
}

/** Tarjeta Prioridad 2: síntoma predominante (`estadisticas_agregadas.sintomas.mas_frecuente`). */
export function TopSymptom({ masFrecuente }: TopSymptomProps): ReactElement {
  const nombre = masFrecuente?.nombre ?? null;
  const registros = formatInteger(masFrecuente?.registros ?? null);
  const incidencia = formatPercent(masFrecuente?.porcentaje_incidencia ?? null);

  return (
    <section className={cardStyles.card} aria-labelledby="top-symptom-title">
      <h3 id="top-symptom-title" className={styles.title}>
        Síntoma más frecuente
      </h3>

      {nombre ? (
        <>
          <p className={styles.name}>{nombre}</p>
          <p className={styles.hint}>
            {registros ?? 'Sin datos disponibles'} registros ·{' '}
            {incidencia ?? 'Sin datos disponibles'} de incidencia
          </p>
        </>
      ) : (
        <p className={styles.hint}>Sin datos disponibles</p>
      )}
    </section>
  );
}
