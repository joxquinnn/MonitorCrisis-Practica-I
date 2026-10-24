# 📊 Enterprise IoT Real-Time Monitoring Dashboard

Plataforma corporativa de monitoreo e inteligencia operativa diseñada para la supervisión continua, análisis en tiempo real e interpretabilidad de telemetría IoT integrada con **ThingsBoard Enterprise**. La solución proporciona una interfaz centralizada de alta disponibilidad para la toma de decisiones estratégicas e identificación temprana de anomalías operativas.

![IoT Dashboard Banner](https://img.shields.io/badge/Status-Production--Ready-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_%7C_TypeScript_%7C_Tailwind-black?style=for-the-badge)

---

## 🌟 Valor de Negocio y Capacidades Clave

* **Monitoreo en Tiempo Real de Alta Disponibilidad:** Transmisión bi-direccional de métricas operativas vía WebSockets de baja latencia, garantizando la visibilidad instantánea del estado de dispositivos críticos y niveles de energía.
* **Análisis Histórico y Diagnóstico Proactivo:** Visualización agregada de patrones de comportamiento, niveles de severidad y tendencias de eventos para optimizar tiempos de respuesta operativos (MTTR).
* **Gestión Inteligente de Alertas:** Panel de eventos clasificado por niveles de severidad con indicadores dinámicos para simplificar la priorización de incidencias.
* **Interfaz de Grado Industrial:** Diseño optimizado en *Dark Mode* con acentos Cyan de alto contraste y arquitectura de componentes *Glassmorphism*, diseñado para salas de control y centros de monitoreo (NOC).

---

## 🛠️ Arquitectura Tecnológica

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **IoT Engine & Data Pipeline:** ThingsBoard Cloud / Enterprise (WebSockets API & MQTT Protocol).
* **Gestión de Estado y Datos:** Hooks optimizados para streaming de datos en tiempo real y tipado estricto.

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

Crea un archivo `.env` en la raíz del proyecto con la configuración de tu instancia de ThingsBoard:

```env
VITE_THINGSBOARD_WS_URL=wss://demo.thingsboard.io/api/ws
VITE_THINGSBOARD_ACCESS_TOKEN=tu_token_de_acceso
```

### 3. Instalación de dependencias y ejecución

```bash
# Instalar dependencias
npm install

# Iniciar entorno de producción / desarrollo
npm run dev
```

El panel estará accesible en `http://localhost:5173`.

---

## 📁 Estructura del Proyecto

```
.
├── src/
│   ├── components/     # Componentes modulares de la interfaz gráfica
│   ├── hooks/          # Conectores de infraestructura (WebSocket & ThingsBoard API)
│   ├── types/          # Definiciones de dominio y tipos de datos TypeScript
│   ├── constants/      # Mapeos de UI y constantes de negocio
│   ├── App.tsx         # Layout principal del dashboard
│   └── main.tsx        # Punto de entrada de la aplicación React
├── public/             # Recursos estáticos de la plataforma
├── tailwind.config.js  # Sistema de diseño (Dark Theme & Cyan accents)
└── package.json        # Gestión de dependencias y scripts de compilación
```

---

## 🔒 Seguridad y Rendimiento

* **Conexiones Cifradas:** Comunicación segura mediante WebSockets con TLS (WSS).
* **Rendimiento de Renderizado:** Memorización de componentes para procesamiento eficiente de flujos continuos de datos a alta frecuencia.

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos de la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.