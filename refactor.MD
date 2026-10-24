Refactoriza la vista principal del dashboard para transformar la interfaz actual en una experiencia moderna, profesional y estructurada en Modo Oscuro con acentos Cyan.

### 1. Sistema de Diseño y Tema
- **Modo Oscuro Predeterminado:** Usa fondos oscuros profundos (`#0f172a`, `#090d16` o equivalentes de Tailwind como `slate-900` / `zinc-950`).
- **Color de Acento:** Usa un tono Cyan resplandeciente (`cyan-400`, `cyan-500`, con sombras tipo `glow`/neon sutiles).
- **Consistencia Visual:** Aplica bordes finos sutiles (`border-cyan-500/20` o `border-slate-800`), tipografía limpia y tarjetas con contraste adecuado.

### 2. Estructura y Layout (Estilo Landing Page)
- **Navbar Superior Fija (`fixed top-0`):**
  - Aplica un efecto **Glassmorphism** (`backdrop-blur-md`, fondo semitransparente oscuro `bg-slate-950/70` y borde inferior sutil).
  - Centra perfectamente en el eje horizontal un contenedor que agrupe:
    1. Métrica e icono de Batería.
    2. Estado de conexión (Badge de Conectado/Desconectado con indicador luminoso).
    3. Selector/Filtro de rango de tiempo (`24h`, `Última semana`, etc.).
- **Header / Sección Hero (`100vh` / `min-h-screen`):**
  - Debe ocupar el 100% de la altura del viewport.
  - Incluye un fondo visual atrayente con efecto Parallax o gradientes oscuros en capas (`bg-fixed` / overlay semitransparente).
  - Muestra únicamente el título/nombre principal de la aplicación centrado horizontal y verticalmente, con tipografía moderna e imponente.
  - Incluye un indicador de scroll sutil en la parte inferior para invitar a bajar.
- **Secciones de Métricas y Gráficos (Scroll abajo del Hero):**
  - Reorganiza todas las tarjetas y gráficos existentes (Monitoreo en vivo, Estado de gravedad, Históricos, Síntomas recurrentes, Total de alertas).
  - Agrupa la información de forma jerárquica mediante un grid responsivo limpio (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - Rediseña las tarjetas usando fondos elevados con bordes suaves, efectos hover discretos e integrando el acento Cyan en métricas clave, íconos y líneas de los gráficos.