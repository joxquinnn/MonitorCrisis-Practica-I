import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS, SYMPTOM_META } from '../../constants/dashboard.constants';
import { SymptomIcon } from '../../icons/SymptomIcon';
import type { SymptomData, SymptomView } from '../../types/dashboard.types';
import cardStyles from '../../styles/card.module.css';
import styles from './SymptomsPanel.module.css';

interface SymptomsPanelProps {
  symptoms: SymptomData[];
  symptomsTotal: number;
  view: SymptomView;
  onViewChange: (view: SymptomView) => void;
}

const TOOLTIP_STYLE = {
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 10,
  color: CHART_COLORS.tooltipText,
  fontSize: 12,
  boxShadow: '0 12px 32px rgba(2, 6, 23, 0.6)',
};

export function SymptomsPanel({ symptoms, symptomsTotal, view, onViewChange }: SymptomsPanelProps): ReactElement {
  const hasSymptoms = symptomsTotal > 0;

  return (
    <section className={cardStyles.card} aria-labelledby="symptoms-title">
      <div className={styles.head}>
        <h2 id="symptoms-title" className={styles.title}>
          Manifestaciones recurrentes
        </h2>
        <div className={styles.segmented} role="group" aria-label="Tipo de gráfico">
          <button
            type="button"
            aria-pressed={view === 'bar'}
            className={view === 'bar' ? styles.segActive : ''}
            onClick={() => onViewChange('bar')}
          >
            Barras
          </button>
          <button
            type="button"
            aria-pressed={view === 'donut'}
            className={view === 'donut' ? styles.segActive : ''}
            onClick={() => onViewChange('donut')}
          >
            Dona
          </button>
        </div>
      </div>

      {hasSymptoms ? (
        <>
          <div
            className={styles.chartBox}
            role="img"
            aria-label={`Distribución de síntomas: ${symptoms.map((s) => `${s.label} ${s.count}`).join(', ')}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              {view === 'bar' ? (
                <BarChart data={symptoms} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                  <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
                    axisLine={{ stroke: CHART_COLORS.grid }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={132}
                    tick={{ fontSize: 13, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(34, 211, 238, 0.07)' }} />
                  <Bar dataKey="count" name="Registros" radius={[0, 8, 8, 0]}>
                    {symptoms.map((s) => (
                      <Cell key={s.key} fill={SYMPTOM_META[s.key].color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie data={symptoms} dataKey="count" nameKey="label" innerRadius="58%" outerRadius="88%" paddingAngle={2}>
                    {symptoms.map((s) => (
                      <Cell key={s.key} fill={SYMPTOM_META[s.key].color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          <ul className={styles.legend}>
            {symptoms.map((s) => (
              <li key={s.key} className={styles.legendItem}>
                <span className={styles.legendIcon} style={{ color: SYMPTOM_META[s.key].color }}>
                  <SymptomIcon symptom={s.key} size={20} />
                </span>
                <span className={styles.legendName}>{s.label}</span>
                <span className={styles.legendValue}>
                  {s.count} · {Math.round((s.count / symptomsTotal) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.empty}>No hay síntomas registrados en este período. Prueba con un rango más amplio.</p>
      )}
    </section>
  );
}
