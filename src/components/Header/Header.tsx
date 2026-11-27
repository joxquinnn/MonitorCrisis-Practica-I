import type { ReactElement } from 'react';
import { BatteryIcon } from '../../icons/BatteryIcon';
import { ClockIcon } from '../../icons/ClockIcon';
import type { DeviceScenario, DevicePayload } from '../../types/dashboard.types';
import { resolveConnection } from '../../utils/clinical.utils';
import { formatLocalDateTime, formatPercent } from '../../utils/format.utils';
import utilStyles from '../../styles/utils.module.css';
import styles from './Header.module.css';

interface HeaderProps {
  dispositivo: DevicePayload | null;
  isConnected: boolean;
  scenarios: DeviceScenario[];
  activeDeviceId: string;
  onScenarioChange: (id: string) => void;
}

/**
 * Navbar superior fija y translúcida: aplicación a la izquierda, estado del
 * dispositivo al centro y selectores a la derecha.
 */
export function Header({
  dispositivo,
  isConnected,
  scenarios,
  activeDeviceId,
  onScenarioChange,
}: HeaderProps): ReactElement {
  const connection = resolveConnection(dispositivo?.estado_conexion, isConnected);
  const battery = formatPercent(dispositivo?.nivel_bateria_porcentaje ?? null);
  const lastSync = formatLocalDateTime(dispositivo?.ultima_sincronizacion ?? null);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Barra principal">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>Vigía</span>
        </div>

        <div className={styles.statusGroup} role="group" aria-label="Estado del dispositivo">
          <p
            className={`${styles.chip} ${connection.connected ? styles.chipOk : styles.chipOff}`}
            role="status"
          >
            <span className={styles.chipIcon} aria-hidden="true">
              {connection.connected ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              )}
            </span>
            <span>{connection.label}</span>
          </p>

          <p className={styles.chip}>
            <span className={styles.chipIcon} aria-hidden="true">
              <BatteryIcon percent={dispositivo?.nivel_bateria_porcentaje ?? null} />
            </span>
            <span>
              <span className={styles.chipLabel}>Batería:</span>{' '}
              <span className={styles.numValue}>{battery ?? 'Sin datos disponibles'}</span>
            </span>
          </p>

          <p className={styles.chip}>
            <span className={styles.chipIcon} aria-hidden="true">
              <ClockIcon size={18} />
            </span>
            <span>
              <span className={styles.chipLabel}>Última sincronización:</span>{' '}
              <span className={styles.numValue}>{lastSync ?? 'Sin datos disponibles'}</span>
            </span>
          </p>
        </div>

        <div className={styles.actions}>
          <label className={styles.field} htmlFor="range-filter">
            <span className={styles.fieldLabel}>Rango de fechas</span>
            <select
              id="range-filter"
              className={styles.select}
              value="none"
              disabled
              title="Filtro no disponible: se muestra el período entregado por la API"
              aria-describedby="range-filter-note"
            >
              <option value="none">No disponible</option>
            </select>
          </label>
          <span className={utilStyles.srOnly} id="range-filter-note">
            El filtro de rango no está disponible. Se muestra el período entregado por la API.
          </span>

          <label className={styles.field} htmlFor="device-select">
            <span className={styles.fieldLabel}>Tipo de situación</span>
            <select
              id="device-select"
              className={styles.select}
              value={activeDeviceId}
              onChange={(event) => onScenarioChange(event.target.value)}
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </nav>
    </header>
  );
}