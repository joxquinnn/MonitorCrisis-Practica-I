# Especificación de Refactorización Visual y Funcional — Dashboard Clínico (Modo Claro)

Refactoriza la vista principal del dashboard para transformarla en una interfaz de grado **clínico, limpia, confiable y altamente accesible** en **Modo Claro**, utilizando una base blanca acompañada de tonos celeste/cyan pastel suaves, tipografía distintiva y una estricta correspondencia con los datos verificables provenientes del dispositivo ESP32.

---

## 1. Sistema de Diseño, Color y Contraste (WCAG 2.1 AA)

El diseño debe transmitir calma clínica, precisión y claridad visual. **Todos los pares de color de texto y fondo deben cumplir con un contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande o elementos de interfaz.**

### Paleta de Colores Verificada
- **Fondos Principales (Base Clara + Celeste/Cyan Pastel):**
  - Fondo general de página: `#F8FDFF` o `bg-cyan-50/40` (blanco con un matiz celeste muy sutil para evitar fatiga visual).
  - Superficie de tarjetas (Cards): `#FFFFFF` (`bg-white`) con sombra difusa suave (`shadow-sm shadow-cyan-900/5`) y borde fino `#CFFAFE` (`border-cyan-100`) o `#E2E8F0` (`border-slate-200`).
  - Superficies secundarias / Destacados suaves: `#ECFEFF` (`bg-cyan-50`) o `#E0F2FE` (`bg-sky-50`) — celeste/cyan pastel claro.
- **Tipografía y Contraste (Prohibido usar cyan pastel para texto):**
  - Texto principal y métricas clave: `#0F172A` (`text-slate-900`) — Contraste > 16:1 sobre blanco y pastel.
  - Texto secundario / Etiquetas: `#475569` (`text-slate-600`) — Contraste > 7:1 sobre blanco y pastel.
  - Acento interactivo (enlaces, íconos activos, bordes de foco, barras de gráficos): `#0E7490` (`cyan-700`, contraste 5.3:1 sobre blanco) y `#155E75` (`cyan-800`, contraste > 6.9:1 sobre `cyan-50`).
- **Estados Semánticos Clínicos (Color + Ícono + Etiqueta obligatorios):**
  - **Alerta / Crítico:** Fondo `#FEF2F2` (`bg-red-50`), borde `#FECACA` (`border-red-200`), texto e ícono `#B91C1C` (`text-red-700`, contraste 5.9:1).
  - **Conectado / Estable / Atendida:** Fondo `#ECFDF5` (`bg-emerald-50`), borde `#A7F3D0` (`border-emerald-200`), texto e ícono `#047857` (`text-emerald-700`, contraste 5.2:1).
  - **Advertencia / Batería media:** Fondo `#FFFBEB` (`bg-amber-50`), borde `#FDE68A` (`border-amber-200`), texto e ícono `#B45309` (`text-amber-700`, contraste 4.9:1).

---

## 2. Tipografía Distintiva y Legibilidad Clínica

Sustituye las fuentes genéricas por una combinación moderna, con personalidad propia y alta legibilidad en pantallas médicas:
- **Títulos y Encabezados (Display):** **`Sora`** (Google Fonts, pesos `600` y `700`). Aporta un carácter geométrico único, moderno y tecnológico sin perder seriedad clínica.
- **Cuerpo, Etiquetas y Lectura de Datos:** **`Plus Jakarta Sans`** (Google Fonts, pesos `400`, `500`, `600`, `700`). Limpia, humanista y sumamente legible en tamaños pequeños.
- **Números y Métricas:** Aplicar obligatoriamente `font-variant-numeric: tabular-nums` (`tabular-nums` en Tailwind) en porcentajes, contadores y marcas de tiempo (`ultima_sincronizacion`, `ultima_alerta_registrada`) para evitar saltos visuales al actualizar datos en tiempo real.

---

## 3. Integridad de Datos (Cero Información No Verificable)

**Regla estricta:** La interfaz **solo** puede renderizar información que exista explícitamente en el esquema JSON oficial recibido desde la API.
- **PROHIBIDO** inventar, simular o hardcodear datos clínicos no presentes en el payload (por ejemplo: frecuencia cardíaca en BPM, saturación de oxígeno $SpO_2$, nombre del paciente, presión arterial, diagnósticos médicos o gráficos de líneas históricos con puntos inventados si la API no entrega series temporales).
- **Manejo honesto de estados:** Si un campo llega vacío, `null` o falla la conexión, mostrar explícitamente `"Sin datos disponibles"` o `"Desconectado"` en lugar de valores ficticios (`0%`, `"Normal"`, etc.).

### Mapeo Exacto con el JSON Oficial
Cada componente del dashboard debe vincularse únicamente a las siguientes claves:

1. **Barra de Estado / Dispositivo (`dispositivo`):**
   - `dispositivo.estado_conexion` → Badge de estado (`Conectado` / `Desconectado`).
   - `dispositivo.nivel_bateria_porcentaje` → Indicador numérico + ícono de batería (`42%`).
   - `dispositivo.ultima_sincronizacion` → Fecha/hora formateada a zona horaria local legible (ej. `12 oct 2026, 20:30`), indicando claramente que corresponde a la última sincronización recibida.
2. **Monitoreo en Tiempo Real (`monitoreo_tiempo_real`):**
   - `monitoreo_tiempo_real.estado_actual` → Estado actual (ej. `"Alerta"`).
   - `monitoreo_tiempo_real.gravedad_actual_porcentaje` → Medidor visual / barra de progreso con valor numérico exacto (`50%`).
   - `monitoreo_tiempo_real.patron_motriz_actual` → Etiqueta destacada del patrón detectado (ej. `"AGITACION"`).
   - `monitoreo_tiempo_real.alerta_atendida` → Indicador booleano claro (`"Pendiente de atención"` si es `false` / `"Atendida"` si es `true`).
3. **Resumen de Alertas (`estadisticas_agregadas.alertas`):**
   - `total_rango_fecha` → Contador principal de alertas en el periodo seleccionado.
   - `variacion_periodo_anterior` → Indicador de variación respecto al periodo previo (ej. `+4 respecto al periodo anterior`).
   - `ultima_alerta_registrada` → Marca de tiempo legible de la última alerta.
4. **Análisis de Síntomas (`estadisticas_agregadas.sintomas`):**
   - `mas_frecuente` (`nombre`, `registros`, `porcentaje_incidencia`) → Tarjeta destacada con el síntoma predominante.
   - `manifestaciones_recurrentes` (arreglo de `{ sintoma, frecuencia, porcentaje }`) → Gráfico de barras horizontales limpias (o tabla estructurada con barras de progreso en `#0E7490` sobre riel `#E0F2FE`) que muestre exactamente el nombre del síntoma, su frecuencia absoluta y su porcentaje.

---

## 4. Estructura y Layout (Enfoque Clínico Funcional)

Prioriza el acceso inmediato a la información crítica sobre efectos decorativos pesados:
- **Navbar Superior Fija (`sticky top-0` o `fixed top-0`):**
  - Fondo blanco translúcido (`bg-white/85 backdrop-blur-md`) con borde inferior suave (`border-b border-cyan-100`).
  - Agrupa de forma equilibrada:
    1. Nombre de la aplicación a la izquierda.
    2. Contenedor central con: Estado de conexión (`estado_conexion`), Nivel de batería (`nivel_bateria_porcentaje`) y Última sincronización (`ultima_sincronizacion`).
    3. Selector/Filtro de rango de tiempo a la derecha (solo habilitar opciones que realmente filtren o consulten datos válidos; si el filtro aún es visual/mock, indicarlo claramente o deshabilitar opciones no implementadas).
- **Encabezado Compacto (Reemplazo del Hero de `100vh`):**
  - En un entorno clínico, un Hero a pantalla completa oculta alertas críticas. Sustitúyelo por un **banner de cabecera limpio y compacto** con un gradiente pastel sutil (`bg-gradient-to-r from-cyan-50 via-sky-50/60 to-white`), título principal en `Sora` y acceso inmediato en el primer pantallazo (*above the fold*) a la tarjeta de **Monitoreo en Tiempo Real**.
- **Grid de Métricas y Visualizaciones:**
  - Layout responsivo limpio (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - Jerarquía visual clara:
    1. **Prioridad 1 (Ancho completo o destacado superior):** Monitoreo en Tiempo Real (`estado_actual`, `alerta_atendida`, `gravedad_actual_porcentaje`, `patron_motriz_actual`).
    2. **Prioridad 2 (Fila intermedia):** Resumen de Alertas (`total_rango_fecha`, `variacion_periodo_anterior`, `ultima_alerta_registrada`) y Síntoma Más Frecuente (`mas_frecuente`).
    3. **Prioridad 3 (Sección de desglose):** Manifestaciones Recurrentes (`manifestaciones_recurrentes`) con gráfico accesible y tabla de respaldo legible.

---

## 5. Requisitos Obligatorios de Accesibilidad (A11y)

1. **HTML Semántico:** Usar correctamente `<header>`, `<nav>`, `<main>`, `<section>` y jerarquía estricta de encabezados (`<h1>` único, luego `<h2>`, `<h3>` sin saltar niveles).
2. **Independencia del Color (Daltonismo):** Ningún estado clínico (`Alerta`, `Conectado`, `Pendiente`) puede comunicarse solo con color. Siempre combinar **color + ícono reconocible + texto explícito**.
3. **Lectores de Pantalla y Tiempo Real:**
   - Agregar `aria-live="assertive"` (o `role="alert"`) en el contenedor de alertas activas cuando `estado_actual === "Alerta"` y `alerta_atendida === false`.
   - Agregar `aria-label` descriptivos a íconos, medidores de batería y barras de progreso (`role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`).
4. **Navegación por Teclado y Foco Visible:** Todos los controles interactivos (filtros, botones, tooltips) deben ser navegables con `Tab` y mostrar un anillo de foco claro (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2`).
5. **Movimiento Reducido:** Respetar la preferencia del sistema `prefers-reduced-motion: reduce` desactivando animaciones de pulso o transiciones continuas en usuarios sensibles al movimiento.