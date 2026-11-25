import type { ReactElement } from 'react';
import type { RecurrentManifestationPayload } from '../../types/dashboard.types';
import { formatInteger, formatPercent } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import styles from './RecurrentManifestations.module.css';

interface RecurrentManifestationsProps {
  manifestaciones: RecurrentManifestationPayload[];
}

/**
 * Sección Prioridad 3: manifestaciones recurrentes con barras CSS accesibles
 * (frecuencia y porcentaje exactos) y una tabla legible de respaldo.
 */
export function RecurrentManifestations({ manifestaciones }: RecurrentManifestationsProps): ReactElement {
  const rows = manifestaciones.filter(
    (item) => item.sintoma !== null || item.frecuencia !== null || item.porcentaje !== null,
  );

  return (
    <section className={cardStyles.card} aria-labelledby="recurrent-title">
      <div className={styles.head}>
        <h3 id="recurrent-title" className={styles.title}>
          Manifestaciones recurrentes
        </h3>
        <p className={styles.caption}>Frecuencia y porcentaje de cada manifestación en el período.</p>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>Sin datos disponibles</p>
      ) : (
        <>
          <ul className={styles.bars}>
            {rows.map((item, index) => {
              const percent = item.porcentaje;
              const percentLabel = formatPercent(percent);
              const freqLabel = formatInteger(item.frecuencia);
              const name = item.sintoma ?? 'Sin datos disponibles';
              const labelId = `recurrencia-nombre-${index}`;

              return (
                <li key={`${name}-${index}`} className={styles.barItem}>
                  <div className={styles.barHeader}>
                    <span className={styles.barName} id={labelId}>
                      {name}
                    </span>
                    <span className={styles.barValues}>
                      {freqLabel ?? 'Sin datos disponibles'} registros ·{' '}
                      {percentLabel ?? 'Sin datos disponibles'}
                    </span>
                  </div>
                  {percent !== null ? (
                    <div
                      className={styles.track}
                      role="progressbar"
                      aria-labelledby={labelId}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percent}
                      aria-valuetext={`${name}: ${freqLabel ?? 'sin datos'} registros, ${percentLabel ?? 'sin datos'}`}
                    >
                      <span
                        className={styles.fill}
                        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.tableCaption}>Manifestaciones recurrentes detalladas</caption>
              <thead>
                <tr>
                  <th scope="col">Manifestación</th>
                  <th scope="col">Frecuencia</th>
                  <th scope="col">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => (
                  <tr key={`fila-${index}`}>
                    <th scope="row">{item.sintoma ?? 'Sin datos disponibles'}</th>
                    <td>{formatInteger(item.frecuencia) ?? 'Sin datos disponibles'}</td>
                    <td>{formatPercent(item.porcentaje) ?? 'Sin datos disponibles'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}