---
name: Licitaciones UV
description: Referencia visual para una interfaz de consulta y comparación de licitaciones.
colors:
  pagina-clara: "#faf9f6"
  superficie-clara: "#fffefa"
  lectura-clara: "#252127"
  secundario-claro: "#615964"
  control-claro: "#807383"
  accion-clara: "#603489"
  sobre-accion-clara: "#ffffff"
  introduccion-clara: "#eee7f3"
  aviso-claro: "#e6d9ee"
  amarillo-claro: "#f9e481"
  pagina-oscura: "#1b171f"
  superficie-oscura: "#25202a"
  lectura-oscura: "#f1eaf3"
  secundario-oscuro: "#c2b6c6"
  control-oscuro: "#928399"
  accion-oscura: "#dbb5fb"
  sobre-accion-oscura: "#281635"
  introduccion-oscura: "#32243e"
  aviso-oscuro: "#402e4d"
  amarillo-oscuro: "#f3d97f"
  sobre-amarillo: "#3b292e"
typography:
  texto:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  titulo-resultado:
    fontFamily: "Segoe UI, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.32
rounded:
  control: "0.5rem"
  panel: "0.75rem"
  estado: "0.35rem"
spacing:
  margen-movil: "1rem"
  margen-escritorio: "2rem"
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

La referencia organiza las convocatorias como un índice editorial. La búsqueda tiene prioridad en la cabecera y los resultados se leen por filas con datos en posiciones repetibles. La identidad usa la marca de texto «Licitaciones UV» y un símbolo de listado geométrico.

## Colors

El violeta identifica la marca, las acciones principales y los enlaces activos. Las superficies marfil del tema claro y ciruela del oscuro separan navegación, introducción y contenido. El amarillo acentúa las fichas decorativas y las búsquedas de ejemplo cuando están seleccionadas. Los estados de vigencia tienen su propia superficie y se leen como texto. Consulta la [matriz de contraste](contraste.md) antes de reutilizar un par en otra superficie.

## Typography

La referencia usa Georgia en los encabezados editoriales y Segoe UI para navegación, controles y datos. Los títulos de resultados se distinguen por peso y subrayado. Fechas y montos usan cifras tabulares y se formatean con la configuración regional `es-CL`.

## Layout

El contenido ocupa hasta 76 rem. El explorador presenta los filtros a la izquierda y alinea las fechas y los montos en el listado. A 45 rem o menos, los filtros comienzan plegados, el listado ocupa una columna y el formulario de acceso aparece antes del panel de contexto.

En React, cada fila se adapta al ancho de su listado. Las tablas de umbrales conservan sus encabezados y ofrecen desplazamiento horizontal dentro de un contenedor enfocable.

## Elevation & Depth

Las superficies se separan mediante cambios de tono y líneas finas. El diálogo de detalle usa un velo detrás del contenido para concentrar el foco.

## Shapes

Los botones y campos tienen esquinas suaves. Los filtros y paneles usan un radio mayor. Las filas comparten divisores horizontales y los estados tienen un radio compacto.

## Components

- **Navegación.** El enlace activo se identifica con subrayado y `aria-current`. El tema oscuro usa un botón con estado pulsado y tratamiento visual persistente.
- **Búsqueda y formularios.** Cada campo tiene etiqueta visible. Conserva el contorno con contraste y un anillo de foco de 2 px separado del control.
- **Búsquedas de ejemplo.** Los botones aplican o quitan un término sin modificar los demás filtros. El subrayado y el estado pulsado acompañan al color. Con movimiento reducido, el cambio visual es inmediato.
- **Resultados.** El tipo y la región preceden al título. El organismo, la fecha, el monto y la vigencia siguen un orden repetible que facilita la comparación.
- **Avisos y estados.** El catálogo y la sesión indican explícitamente que son simulados. Los estados de vigencia se expresan con «Vigente» o «Cerrada».
