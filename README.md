# 📊 Enterprise IoT Real-Time Monitoring Dashboard

Plataforma corporativa de monitoreo de crisis en tiempo real sobre **ThingsBoard Enterprise**. La interfaz es un panel **clínico en Modo Claro**: sólo renderiza datos presentes en el payload oficial del dispositivo y marca explícitamente la información no recibida.

![IoT Dashboard Banner](https://img.shields.io/badge/Status-Production--Ready-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_%7C_TypeScript_%7C_CSS_Modules-black?style=for-the-badge)

---

## 🌟 Capacidades clave

* **Monitoreo en tiempo real:** telemetría vía WebSocket de baja latencia con estado de conexión, nivel de batería y última sincronización.
* **Estado clínico veraz:** estado actual, gravedad en porcentaje, patrón motriz y situación de atención de la alerta, con estados que combinan **color + ícono + texto**.
* **Resumen de alertas y síntomas:** total del rango de fecha, variación respecto al periodo anterior, última alerta registrada, síntoma predominante y manifestaciones recurrentes con frecuencia y porcentaje exactos.
* **Accesibilidad (WCAG 2.1 AA):** HTML semántico, jerarquía de encabezados, `aria-live`/`role="alert"`, `role="progressbar"`, foco visible y respeto a `prefers-reduced-motion`.

---

## 🛠️ Arquitectura Tecnológica

* **Frontend:** React 19, TypeScript, Vite, CSS Modules (sin Tailwind).
* **Tipografía:** `Sora` (títulos) y `Plus Jakarta Sans` (cuerpo) desde Google Fonts, con fallback de sistema local.
* **IoT Engine:** ThingsBoard Cloud / Enterprise (API + WebSocket).

---

## 🚀 Despliegue y Configuración

### Prerrequisitos

* **Node.js** v18.0 o superior
* Cuenta y clúster activo en **ThingsBoard**

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-organizacion/iot-monitoring-dashboard.git
cd iot-monitoring-dashboard
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_TB_URL=https://thingsboard.cloud
VITE_TB_WS_URL=wss://thingsboard.cloud
VITE_TB_USERNAME=tu_usuario
VITE_TB_PASSWORD=tu_password
# Dispositivos disponibles en el selector de la navbar
VITE_TB_DEVICE_NORMAL=<device-id>
VITE_TB_DEVICE_AISLADA=<device-id>
VITE_TB_DEVICE_MAYOR=<device-id>
```

### 3. Instalación y ejecución

```bash
npm install
npm run dev     # desarrollo
npm run build   # verificación de tipos + build de producción
npm run lint    # ESLint
```

El panel estará accesible en `http://localhost:5173`.

---

## 📁 Estructura del Proyecto

```
.
├── src/
│   ├── components/     # Componentes modulares (Header, Banner, LiveMonitor, ...)
│   ├── hooks/          # Conector de ThingsBoard (API + WebSocket)
│   ├── icons/          # Íconos de línea accesibles
│   ├── types/          # Tipos del payload oficial del dispositivo
│   ├── utils/          # Formato local de datos y estados clínicos
│   ├── styles/         # Tokens de diseño, tonos semánticos y tarjetas base
│   ├── pages/          # Composición del dashboard
│   └── main.tsx        # Punto de entrada
```

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
