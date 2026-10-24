import type { ReactElement } from 'react';
import { useState } from 'react';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Hero/Hero';
import { HistoryPanel } from '../components/HistoryPanel/HistoryPanel';
import { KpiSection } from '../components/KpiSection/KpiSection';
import { LiveMonitor } from '../components/LiveMonitor/LiveMonitor';
import { SeverityGauge } from '../components/SeverityGauge/SeverityGauge';
import { SymptomsPanel } from '../components/SymptomsPanel/SymptomsPanel';
import { useDashboardData } from '../hooks/useDashboardData';
import { useThingsBoard } from '../hooks/useThingsBoard';
import type { DeviceScenario } from '../types/dashboard.types';
import '../styles/tokens.css';
import styles from '../styles/Dashboard.module.css';

// 1. Extraemos los 3 IDs desde el .env
const DEVICES = {
  NORMAL: import.meta.env.VITE_TB_DEVICE_NORMAL ?? '',
  AISLADA: import.meta.env.VITE_TB_DEVICE_AISLADA ?? '',
  MAYOR: import.meta.env.VITE_TB_DEVICE_MAYOR ?? '',
};

const SCENARIOS: DeviceScenario[] = [
  { id: DEVICES.NORMAL, label: 'Situación normal' },
  { id: DEVICES.AISLADA, label: 'Crisis aislada' },
  { id: DEVICES.MAYOR, label: 'Crisis mayor (estrés)' },
];

export default function Dashboard(): ReactElement {
  // 2. Estado para controlar qué dispositivo está activo (inicia en Normal)
  const [activeDeviceId, setActiveDeviceId] = useState<string>(DEVICES.NORMAL);

  // 3. Pasamos el ID dinámico al hook
  const { data, isConnected, error } = useThingsBoard(activeDeviceId);
  const dashboard = useDashboardData(data ?? undefined);

  const {
    range,
    setRange,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    symptomView,
    setSymptomView,
    live,
    attendedAt,
    notifiedAt,
    handleAttend,
    handleNotify,
    handleDemo,
    mock,
    derived,
  } = dashboard;

  const lastAlert = mock.alerts[mock.alerts.length - 1];

  const header = (
    <Header
      device={mock.device}
      isConnected={isConnected}
      range={range}
      onRangeChange={setRange}
      customFrom={customFrom}
      onCustomFromChange={setCustomFrom}
      customTo={customTo}
      onCustomToChange={setCustomTo}
      scenario={activeDeviceId}
      scenarios={SCENARIOS}
      onScenarioChange={setActiveDeviceId}
    />
  );

  // Render principal del Dashboard
  return (
    <div className={styles.page}>
      {header}
      <Hero />

      <main className={styles.main} id="dashboard">
        {!data && (
          <div className={styles.loading} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <p>
              {error
                ? `Esperando telemetría del dispositivo… (${error})`
                : 'Esperando telemetría inicial del dispositivo…'}
            </p>
          </div>
        )}

        {(data || mock) && (
          <>
            <section className={styles.section} aria-labelledby="sec-live">
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle} id="sec-live">
                  Monitoreo en vivo
                  <span>Estado actual del dispositivo y acciones de respuesta inmediata.</span>
                </h2>
                <span className={styles.sectionAccent}>Tiempo real</span>
              </div>

              <div className={styles.grid}>
                <div className={styles.span2}>
                  <LiveMonitor
                    childName={mock.childName}
                    live={live}
                    lastAlert={lastAlert}
                    attendedAt={attendedAt}
                    notifiedAt={notifiedAt}
                    onAttend={handleAttend}
                    onNotify={handleNotify}
                    onDemo={handleDemo}
                  />
                </div>
                <SeverityGauge
                  percent={(live.yesCount / live.totalQuestions) * 100}
                  yesCount={live.yesCount}
                  totalQuestions={live.totalQuestions}
                />
              </div>
            </section>

            <section className={styles.section} aria-labelledby="sec-kpis">
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle} id="sec-kpis">
                  Indicadores clave
                  <span>Totales de alertas, síntomas predominantes y riesgo del dispositivo.</span>
                </h2>
                <span className={styles.sectionAccent}>Período</span>
              </div>

              <KpiSection range={range} derived={derived} device={mock.device} />
            </section>

            <section className={styles.section} aria-labelledby="sec-analytics">
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle} id="sec-analytics">
                  Análisis histórico
                  <span>Síntomas recurrentes y evolución de las evaluaciones.</span>
                </h2>
                <span className={styles.sectionAccent}>Tendencia</span>
              </div>

              <div className={styles.grid}>
                <SymptomsPanel
                  symptoms={derived.symptoms}
                  symptomsTotal={derived.symptomsTotal}
                  view={symptomView}
                  onViewChange={setSymptomView}
                />
                <div className={styles.span2}>
                  <HistoryPanel
                    history={derived.history}
                    hourly={derived.hourly}
                    peak={derived.peak}
                  />
                </div>
              </div>
            </section>

            <p className={styles.footnote}>Vigía · Panel de control de salud infantil</p>
          </>
        )}
      </main>
    </div>
  );
}
