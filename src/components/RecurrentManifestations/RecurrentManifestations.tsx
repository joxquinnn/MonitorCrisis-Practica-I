import type { ReactElement } from 'react';
import type { RecurrentManifestationPayload } from '../../types/dashboard.types';
import { formatInteger, formatPercent } from '../../utils/format.utils';
import cardStyles from '../../styles/card.module.css';
import utilStyles from '../../styles/utils.module.css';
import styles from './RecurrentManifestations.module.css';

interface RecurrentManifestationsProps {
  manifestaciones: RecurrentManifestationPayload[];
}

/**
 * Manifestaciones recurrentes en una única tabla: nombre, frecuencia absoluta
 * y porcentaje con barra. Así la información no se presenta dos veces.
 */
export function RecurrentManifestations({ manifestaciones }: RecurrentManifestationsProps): ReactElement {
  const rows = manifestaciones.filter(
    (item) => item.sintoma !== null || item.frecuencia !== null || item.porcentaje !== null,
  );

  return (
    <section className={`${cardStyles.card} ${styles.card}`} aria-labelledby="recurrent-title">
      <h3 id="recurrent-title" className={styles.title}>
        Manifestaciones recurrentes
      </h3>

      {rows.length === 0 ? (
        <p className={styles.empty}>Sin datos disponibles</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={utilStyles.srOnly}>
              Manifestaciones recurrentes con su frecuencia y porcentaje
            </caption>
            <thead>
              <tr>
                <th scope="col">Manifestación</th>
                <th scope="col" className={styles.num}>
                  Frecuencia
                </th>
                <th scope="col">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => {
                const percent = item.porcentaje;
                const percentLabel = formatPercent(percent);
                const name = item.sintoma ?? 'Sin datos disponibles';
                const freq = formatInteger(item.frecuencia);

                return (
                  <tr key={`${name}-${index}`}>
                    <th scope="row">{name}</th>
                    <td className={`${styles.num} ${freq ? '' : styles.noData}`}>
                      {freq ?? 'Sin datos disponibles'}
                    </td>
                    <td>
                      <div className={styles.pctCell}>
                        {percent !== null ? (
                          <div
                            className={styles.track}
                            role="progressbar"
                            aria-label={`${name}: ${percentLabel ?? ''}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                            aria-valuetext={percentLabel ?? undefined}
                          >
                            <span
                              className={styles.fill}
                              style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                            />
                          </div>
                        ) : null}
                        <span className={`${styles.pctText} ${percentLabel ? '' : styles.noData}`}>
                          {percentLabel ?? 'Sin datos disponibles'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}