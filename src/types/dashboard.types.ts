/**
 * Tipos del payload OFICIAL recibido desde ThingsBoard.
 *
 * La UI sólo puede renderizar información que exista explícitamente en este
 * esquema. Si un campo llega ausente, `null` o vacío, se representa como
 * `null` y la interfaz muestra "Sin datos disponibles" / "Desconectado".
 */

/** Bloque `dispositivo`. */
export interface DevicePayload {
  /** `true`/`false` o texto libre ("conectado"/"desconectado"). */
  estado_conexion: boolean | string | null;
  /** Nivel de batería en porcentaje (0-100). */
  nivel_bateria_porcentaje: number | null;
  /** Marca de tiempo ISO de la última sincronización recibida. */
  ultima_sincronizacion: string | null;
}

/** Bloque `monitoreo_tiempo_real`. */
export interface LiveMonitorPayload {
  /** Estado actual informado por el dispositivo (ej. "Alerta"). */
  estado_actual: string | null;
  /** Gravedad actual en porcentaje (0-100). */
  gravedad_actual_porcentaje: number | null;
  /** Patrón motriz detectado (ej. "AGITACION"). */
  patron_motriz_actual: string | null;
  /** `false` ⇒ alerta pendiente de atención. */
  alerta_atendida: boolean | null;
}

/** Bloque `estadisticas_agregadas.alertas`. */
export interface AlertsSummaryPayload {
  /** Total de alertas del rango de fecha consultado por la API. */
  total_rango_fecha: number | null;
  /** Variación respecto al periodo anterior (ej. 4 → "+4"). */
  variacion_periodo_anterior: number | null;
  /** Marca de tiempo ISO de la última alerta registrada. */
  ultima_alerta_registrada: string | null;
}

/** Síntoma predominante informado por la API. */
export interface MostFrequentSymptomPayload {
  nombre: string | null;
  registros: number | null;
  porcentaje_incidencia: number | null;
}

/** Manifestación recurrente informada por la API. */
export interface RecurrentManifestationPayload {
  sintoma: string | null;
  frecuencia: number | null;
  porcentaje: number | null;
}

/** Bloque `estadisticas_agregadas.sintomas`. */
export interface SymptomsSummaryPayload {
  mas_frecuente: MostFrequentSymptomPayload | null;
  manifestaciones_recurrentes: RecurrentManifestationPayload[];
}

/** Bloque `estadisticas_agregadas`. */
export interface AggregatedStatsPayload {
  alertas: AlertsSummaryPayload | null;
  sintomas: SymptomsSummaryPayload | null;
}

/** Payload completo normalizado. */
export interface DashboardPayload {
  dispositivo: DevicePayload | null;
  monitoreo_tiempo_real: LiveMonitorPayload | null;
  estadisticas_agregadas: AggregatedStatsPayload | null;
}

/** Dispositivo seleccionable desde la navbar (configurado por entorno). */
export interface DeviceScenario {
  id: string;
  label: string;
}
