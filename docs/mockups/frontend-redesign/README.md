# Referencia visual de Licitaciones UV

Primera entrega del rediseño. El explorador prioriza la búsqueda y la comparación de licitaciones para proveedores. El acceso muestra cómo distinguir la sesión simulada. La propuesta visual se documenta en [DESIGN.md](DESIGN.md).

La [implementación en React](implementacion.md) tiene sus propias capturas y resultados de verificación.

## Prototipos

- [Explorador de licitaciones](index.html). Incluye búsqueda por título, atajos de ejemplo, región, tipo, orden, estado sin resultados y un diálogo con detalle de ejemplo.
- [Acceso simulado](acceso.html). Usa «Rellenar con datos de ejemplo» para probar la validación, la visibilidad de la contraseña y el mensaje de sesión iniciada.

Abre los HTML en el navegador. Desde la raíz del proyecto también puedes ejecutar `python -m http.server 8080 --bind 127.0.0.1` y abrir `http://127.0.0.1:8080/docs/mockups/frontend-redesign/`. Al servir el prototipo por HTTP, el tema se conserva entre pantallas y los filtros se pueden compartir mediante la URL.

Las convocatorias se basan en los ejemplos del [catálogo local](../../../src/features/licitaciones/data/licitaciones.mock.json). El prototipo ajusta algunas fechas y usa el 19 de noviembre de 2026 como referencia fija para mostrar tanto licitaciones vigentes como cerradas.

## Capturas

| Pantalla | Escritorio claro | Escritorio oscuro | Móvil claro | Móvil oscuro |
| --- | --- | --- | --- | --- |
| Explorador | [PNG](capturas/index-escritorio-claro.png) | [PNG](capturas/index-escritorio-oscuro.png) | [PNG](capturas/index-movil-claro.png) | [PNG](capturas/index-movil-oscuro.png) |
| Acceso | [PNG](capturas/acceso-escritorio-claro.png) | [PNG](capturas/acceso-escritorio-oscuro.png) | [PNG](capturas/acceso-movil-claro.png) | [PNG](capturas/acceso-movil-oscuro.png) |

## Verificación de la referencia

Capturas y comprobaciones ejecutadas en Chrome 157.0.8103.79 en Windows. Escritorio a 1440 × 960 y móvil a 390 × 844 píxeles CSS.

| Comprobación | Resultado |
| --- | --- |
| Contraste programático de los colores computados | 25 pares por tema. Los pares de texto desde 6,39:1 y los pares de controles y foco desde 3,70:1 superaron su umbral. [Detalle de mediciones](contraste.md). |
| Reflujo a 320 píxeles CSS | Sin desplazamiento horizontal de página en las dos pantallas y los dos temas. |
| Texto al 200 % | A 1280 píxeles de ancho, ambas pantallas conservaron el reflujo y los controles accesibles con tamaño de fuente base duplicado. |
| Árbol de accesibilidad de Chrome | Un encabezado de nivel 1 por pantalla, región principal y nombres accesibles para los controles visibles, en los tres anchos y ambos temas. |
| Interacción con teclado | Se comprobó el enlace para saltar al contenido, la apertura de filtros, el cambio de tema y las acciones del formulario. El detalle recibe foco al abrirse, se cierra con Escape y devuelve el foco al resultado. |
| Comportamiento | Búsqueda sin resultados, limpieza de filtros, filtros y orden recuperados desde la URL, persistencia del tema y confirmación del acceso simulado con datos de ejemplo. |
| Búsquedas de ejemplo | Se comprobó que se aplican y quitan con teclado, se sincronizan con la URL y se identifican visualmente al activar movimiento reducido. |

La evaluación manual con lector de pantalla y la revisión del modal de autenticación de React corresponden a la etapa de implementación. Las demás rutas de la aplicación se comprobarán al implementar sus bloques.

## Referencias anteriores

| Referencia | Uso |
| --- | --- |
| [Bandeja de aprobaciones CR-302](../CR-302-bandeja-aprobaciones.html) | Histórica como referencia visual. Conserva el flujo documentado de aprobaciones. |
| [Panel de umbrales y subrogancias CR-302](../CR-302-panel-umbrales-subrogancias.html) | Histórica como referencia visual. Para el comportamiento vigente de umbrales, la fuente es [ConfiguracionUmbralesPage.jsx](../../../src/features/aprobaciones/pages/ConfiguracionUmbralesPage.jsx). |
| Wireframes institucionales de Figma citados en el proyecto | Históricos como referencia de marca. El [README del repositorio](../../../README.md#-mockups) registra los enlaces de Figma como pendientes de incorporación. |
