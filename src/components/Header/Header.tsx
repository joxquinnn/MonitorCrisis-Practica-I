import type { ReactElement } from 'react';
import { APP_NAME, RANGE_OPTIONS, REFERENCE_NOW } from '../../constants/dashboard.constants';
import { BatteryIcon } from '../../icons/BatteryIcon';
import type { DeviceScenario, DeviceStatus, RangeKey } from '../../types/dashboard.types';
import { toInputDate } from '../../utils/date.utils';
import styles from './Header.module.css';

interface HeaderProps {
  device: DeviceStatus;
  isConnected: boolean;
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  customFrom: string;
  onCustomFromChange: (date: string) => void;
  customTo: string;
  onCustomToChange: (date: string) => void;
  scenario: string;
  scenarios: DeviceScenario[];
  onScenarioChange: (id: string) => void;
}

/** Navbar superior fija (glassmorphism) con el grupo central de control del dashboard. */
export function Header({
  device,
  isConnected,
  range,
  onRangeChange,
  customFrom,
  onCustomFromChange,
  customTo,
  onCustomToChange,
  scenario,
  scenarios,
  onScenarioChange,
}: HeaderProps): ReactElement {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>{APP_NAME}</span>
        </div>

        <div className={styles.controls}>
          <div className={styles.chip} title="Nivel de batería del dispositivo">
            <span className={styles.chipIcon}>
              <BatteryIcon percent={device.batteryPercent} />
            </span>
            <span>
              <span className={styles.srOnly}>Batería: </span>
              {device.batteryPercent}%
            </span>
          </div>

          <div className={`${styles.chip} ${isConnected ? styles.chipOn : styles.chipOff}`} role="status">
            <span className={`${styles.led} ${isConnected ? styles.ledOn : styles.ledOff}`} aria-hidden="true" />
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>

          <div className={styles.rangeGroup}>
            <label htmlFor="range" className={styles.srOnly}>
              Rango de fechas
            </label>
            <select
              id="range"
              className={styles.select}
              value={range}
              onChange={(e) => onRangeChange(e.target.value as RangeKey)}
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {range === 'custom' && (
              <div className={styles.customRange}>
                <label className={styles.dateField}>
                  Desde
                  <input
                    type="date"
                    value={customFrom}
                    max={customTo}
                    onChange={(e) => onCustomFromChange(e.target.value)}
                  />
                </label>
                <label className={styles.dateField}>
                  Hasta
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    max={toInputDate(REFERENCE_NOW)}
                    onChange={(e) => onCustomToChange(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className={styles.scenario}>
          <label htmlFor="scenario" className={styles.scenarioLabel}>
            Escenario
          </label>
          <select
            id="scenario"
            className={styles.select}
            value={scenario}
            onChange={(e) => onScenarioChange(e.target.value)}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
