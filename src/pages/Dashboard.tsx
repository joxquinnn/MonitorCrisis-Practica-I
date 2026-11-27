import type { ReactElement } from 'react';
import { useState } from 'react';
import { AlertsSummary } from '../components/AlertsSummary/AlertsSummary';
import { Banner } from '../components/Banner/Banner';
import { DeviceStatus } from '../components/DeviceStatus/DeviceStatus';
import { Header } from '../components/Header/Header';
import { LiveMonitor } from '../components/LiveMonitor/LiveMonitor';
import { RecurrentManifestations } from '../components/RecurrentManifestations/RecurrentManifestations';
import { TopSymptom } from '../components/TopSymptom/TopSymptom';
import { useThingsBoard } from '../hooks/useThingsBoard';
import type { DeviceScenario } from '../types/dashboard.types';
import styles from '../styles/Dashboard.module.css';

/** Dispositivos configurados por entorno (sin datos simulados). */
const DEVICES = {
  NORMAL: import.meta.env.VITE_TB_DEVICE_NORMAL ?? '',
  AISLADA: import.meta.env.VITE_TB_DEVICE_AISLADA ?? '',
  MAYOR: import.meta.env.VITE_TB_DEVICE_MAYOR ?? '',
};

const SCENARIOS: DeviceScenario[] = [
  { id: DEVICES.NORMAL, label: 'Situación normal' },
  { id: DEVICES.AISLADA, label: 'Crisis aislada' },
  { id: DEVICES.MAYOR, label: 'Crisis mayor (estrés)' },
].filter((scenario) => scenario.id !== '');

export default function Dashboard(): ReactElement {
  const [activeDeviceId, setActiveDeviceId] = useState<string>(SCENARIOS[0]?.id ?? '');
  const { payload, isConnected, error } = useThingsBoard(activeDeviceId);

  const dispositivo = payload?.dispositivo ?? null;
  const live = payload?.monitoreo_tiempo_real ?? null;
  const alertas = payload?.estadisticas_agregadas?.alertas ?? null;
  const sintomas = payload?.estadisticas_agregadas?.sintomas ?? null;

  const activeLabel =
    SCENARIOS.find((scenario) => scenario.id === activeDeviceId)?.label ?? 'dispositivo seleccionado';

  return (
    <div className={styles.page}>
      <Header
        dispositivo={dispositivo}
        isConnected={isConnected}
        scenarios={SCENARIOS}
        activeDeviceId={activeDeviceId}
        onScenarioChange={setActiveDeviceId}
      />

      <main className={styles.main} id="dashboard">
        <Banner deviceLabel={activeLabel} />

        {!payload && (
          <p className={styles.status} role="status" aria-live="polite">
            {error
              ? `Esperando datos del dispositivo… (${error})`
              : 'Esperando la primera sincronización del dispositivo…'}
          </p>
        )}

        <section className={styles.section} aria-labelledby="sec-current">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="sec-current">
              Estado actual
            </h2>
          </div>
          <div className={styles.gridPrimary}>
            <LiveMonitor live={live} />
            <DeviceStatus dispositivo={dispositivo} isConnected={isConnected} />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sec-summary">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle} id="sec-summary">
              Resumen del período
            </h2>
          </div>
          <div className={styles.gridSummary}>
            <div className={styles.stack}>
              <AlertsSummary alertas={alertas} />
              <TopSymptom masFrecuente={sintomas?.mas_frecuente ?? null} />
            </div>
            <RecurrentManifestations manifestaciones={sintomas?.manifestaciones_recurrentes ?? []} />
          </div>
        </section>

        <p className={styles.footnote}>Vigía · Datos provenientes del dispositivo seleccionado.</p>
      </main>
    </div>
  );
}