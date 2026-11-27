import type { ReactElement } from 'react';
import styles from './Banner.module.css';

interface BannerProps {
  deviceLabel: string;
}

/** Cabecera compacta de página: título y dispositivo activo. */
export function Banner({ deviceLabel }: BannerProps): ReactElement {
  return (
    <section className={styles.banner} aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className={styles.title}>
        Monitoreo de crisis en tiempo real
      </h1>
      <p className={styles.device}>
        <span className={styles.deviceLabel}>Tipo: </span>
        <strong>{deviceLabel}</strong>
      </p>
    </section>
  );
}