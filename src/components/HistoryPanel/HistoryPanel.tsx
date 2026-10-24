import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ALERT_THRESHOLD_PERCENT,
  CHART_COLORS,
  TOTAL_QUESTIONS,
} from '../../constants/dashboard.constants';
import type { HistoryPoint, HourPoint, PeakHour } from '../../types/dashboard.types';
import { toneClass } from '../../utils/dashboard.utils';
import { pad } from '../../utils/date.utils';
import toneStyles from '../../styles/tones.module.css';
import cardStyles from '../../styles/card.module.css';
import styles from './HistoryPanel.module.css';

interface HistoryPanelProps {
  history: HistoryPoint[];
  hourly: HourPoint[];
  peak: PeakHour | undefined;
}

const ALERT_YES_THRESHOLD = (ALERT_THRESHOLD_PERCENT / 100) * TOTAL_QUESTIONS;

const TOOLTIP_STYLE = {
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 10,
  color: CHART_COLORS.tooltipText,
  fontSize: 12,
  boxShadow: '0 12px 32px rgba(2, 6, 23, 0.6)',
};

export function HistoryPanel({ history, hourly, peak }: HistoryPanelProps): ReactElement {
  const hasHistory = history.length > 0;

  return (
    <section className={cardStyles.card} aria-labelledby="history-title">
      <div className={styles.head}>
        <h2 id="history-title" className={styles.title}>
          Histórico de evaluaciones
        </h2>
        {peak && (
          <p className={`${styles.badge} ${toneClass(toneStyles, 'warn')}`}>
            Hora pico: {pad(peak.hour)}:00 ({peak.average.toFixed(1)} «Sí» en promedio)
          </p>
        )}
      </div>

      {hasHistory ? (
        <>
          <p className={styles.caption}>Respuestas «Sí» en cada evaluación</p>
          <div
            className={styles.chartBox}
            role="img"
            aria-label={`Línea de tiempo con ${history.length} evaluaciones. La línea punteada marca el umbral de alerta en ${ALERT_YES_THRESHOLD} respuestas.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 12, right: 16, bottom: 4, left: -12 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={48}
                />
                <YAxis
                  domain={[0, TOTAL_QUESTIONS]}
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: CHART_COLORS.lineSoft }} />
                <ReferenceLine
                  y={ALERT_YES_THRESHOLD}
                  stroke={CHART_COLORS.threshold}
                  strokeDasharray="5 4"
                  label={{
                    value: 'Umbral de alerta',
                    position: 'insideTopRight',
                    fontSize: 12,
                    fill: CHART_COLORS.threshold,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="yes"
                  name="Respuestas «Sí»"
                  stroke={CHART_COLORS.line}
                  strokeWidth={2.5}
                  dot={history.length <= 40 ? { r: 3, fill: CHART_COLORS.line } : false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className={styles.caption}>Promedio de «Sí» según la hora del día</p>
          <div
            className={`${styles.chartBox} ${styles.chartBoxShort}`}
            role="img"
            aria-label="Promedio de respuestas afirmativas por hora del día"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
                <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, TOTAL_QUESTIONS]}
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: 'rgba(34, 211, 238, 0.07)' }}
                />
                <Bar
                  dataKey="average"
                  name="Promedio de «Sí»"
                  fill={CHART_COLORS.bar}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className={styles.empty}>No hay evaluaciones en este período.</p>
      )}
    </section>
  );
}
