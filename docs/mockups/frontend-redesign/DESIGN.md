---
name: Licitaciones UV
description: Referencia visual para una interfaz de consulta y comparación de licitaciones con contraste WCAG 2.2 AAA (Índigo-Morado UV y Arena).
colors:
  pagina-clara: "#f6f6fa"
  superficie-clara: "#ffffff"
  lectura-clara: "#191627"
  secundario-claro: "#47425d"
  control-claro: "#5f5878"
  accion-clara: "#4e2a84"
  sobre-accion-clara: "#ffffff"
  introduccion-clara: "#eeebf7"
  aviso-claro: "#e2dbf5"
  arena-clara: "#f6dc7a"
  pagina-oscura: "#110f1b"
  superficie-oscura: "#1a1728"
  lectura-oscura: "#f2effa"
  secundario-oscuro: "#c6c0dc"
  control-oscuro: "#9189b0"
  accion-oscura: "#cbb4ff"
  sobre-accion-oscura: "#1c0f33"
  introduccion-oscura: "#211c34"
  aviso-oscuro: "#2c2445"
  arena-oscura: "#f0d470"
  sobre-arena-clara: "#261e12"
  sobre-arena-oscura: "#221b10"
typography:
  texto:
    fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  titulo-resultado:
    fontFamily: "Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.32
rounded:
  control: "0.625rem"
  panel: "0.875rem"
  estado: "999px"
spacing:
  margen-movil: "0.75rem"
  margen-escritorio: "1.75rem"
components:
  boton-principal-claro:
    backgroundColor: "{colors.accion-clara}"
    textColor: "{colors.sobre-accion-clara}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1rem"
  boton-principal-oscuro:
    backgroundColor: "{colors.accion-oscura}"
    textColor: "{colors.sobre-accion-oscura}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1rem"
---

# Sistema visual de Licitaciones UV

## Overview

La interfaz organiza las convocatorias como un espacio de trabajo moderno a pantalla completa («Workspace Pro»): barra superior fija, panel lateral tonal izquierdo con búsqueda, atajos y filtros, resumen compacto en 3 KPIs y tarjetas escaneables con datos en posiciones repetibles. La identidad conserva el acento morado de Licitaciones UV refinado a una paleta **Índigo-Morado UV y Arena** calibrada a **WCAG 2.2 AAA** en ambos temas (#145).

## Colors

El índigo-morado (`#4e2a84` en claro, `#cbb4ff` en oscuro) identifica la marca, las acciones principales y los enlaces activos. Las superficies neutras frías (`#f6f6fa` / `#ffffff`) y noche índigo en oscuro (`#110f1b` / `#1a1728`) separan navegación, panel lateral de filtros y contenido. El acento arena/ámbar (`#f6dc7a` / `#f0d470`) marca filtros activos y atajos de ejemplo junto a icono y subrayado. Todos los estados de vigencia y error se acompañan de texto, borde e iconografía (`lucide-react`). Consulta la [matriz de contraste en React](contraste-react.md) antes de reutilizar un par en otra superficie.

## Typography

Se utiliza una familia sans-serif moderna de sistema (`Segoe UI`, `system-ui`, `-apple-system`) en unidades relativas (`rem`) con **tamaño mínimo de referencia de `1rem` (16 px)** en texto principal, metadatos, botones, formularios, etiquetas, tablas y mensajes de estado. Fechas y montos usan cifras tabulares (`font-variant-numeric: tabular-nums`) con formato regional `es-CL`.

## Layout

En escritorio, el explorador y la navegación ocupan el `100 %` del ancho de pantalla, con la barra lateral tonal fija al hacer scroll (`18rem`–`22rem`) y el listado principal a la derecha. A `62rem` o menos, los filtros se pliegan detrás de un botón accesible de ancho completo, los KPIs y las tarjetas se adaptan sin desplazamiento horizontal general incluso a `320px` CSS y zoom de texto al `200 %`, respetando `env(safe-area-inset-*)` en móviles. Las tablas de umbrales conservan encabezados y se desplazan dentro de su propio contenedor enfocable por teclado.

## Motion & Accessibility

Las transiciones (`motion` con `<MotionConfig reducedMotion="user">`) aportan continuidad espacial en el indicador activo de navegación (`layoutId`), reordenamiento FLIP de resultados (`layout`), micro-feedback táctil en favoritos y entrada del diálogo de acceso. Los efectos de elevación `:hover` se restringen a `@media (hover: hover)` y con `prefers-reduced-motion: reduce` el movimiento espacial se suprime conservando las señales de estado y foco.
