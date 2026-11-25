import type { ReactElement } from 'react';
import styles from './Banner.module.css';

interface BannerProps {
  deviceLabel: string;
}

/** Banner compacto de cabecera (sustituye al hero a pantalla completa). */
export function Banner({ deviceLabel }: BannerProps): ReactElement {
  return (
    <section className={styles.banner} aria-labelledby="dashboard-title">
      <div className={styles.content}>
        <h1 id="dashboard-title" className={styles.title}>
          Vigía
        </h1>
        <p className={styles.lead}>
          Monitoreo de crisis en tiempo real · Dispositivo: <strong>{deviceLabel}</strong>
        </p>
      </div>
    </section>
  );
}