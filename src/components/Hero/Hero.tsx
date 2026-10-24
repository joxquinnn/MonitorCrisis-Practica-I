import type { ReactElement } from 'react';
import { APP_NAME, APP_TAGLINE } from '../../constants/dashboard.constants';
import styles from './Hero.module.css';

/** Sección hero a pantalla completa con el nombre de la aplicación centrada. */
export function Hero(): ReactElement {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.layers} aria-hidden="true">
        <span className={styles.orbA} />
        <span className={styles.orbB} />
        <span className={styles.orbC} />
        <span className={styles.grid} />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>{APP_TAGLINE}</p>
        <h1 id="hero-title" className={styles.title}>
          {APP_NAME}
        </h1>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.lead}>
          Supervisa evaluaciones, alertas de crisis y síntomas recurrentes en un solo lugar.
        </p>
      </div>

      <a className={styles.scrollHint} href="#dashboard" aria-label="Ir al panel de métricas">
        <span className={styles.scrollText}>Desplázate</span>
        <span className={styles.scrollMouse} aria-hidden="true">
          <span className={styles.scrollWheel} />
        </span>
      </a>
    </section>
  );
}
