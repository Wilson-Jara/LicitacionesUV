# Implementación del rediseño en React

La aplicación adopta la marca Licitaciones UV, la paleta violeta y amarilla, las fichas geométricas y las filas de resultados de la [referencia aprobada](README.md). Conserva los controles de sesión, las rutas, el catálogo ficticio, las reglas de favoritos, el PDF, las estadísticas y la configuración de umbrales.

## Evidencia por bloque

Capturas de la aplicación compilada en Chrome 157.0.8103.79 para Windows. Escritorio a 1440 × 960 y móvil a 390 × 844 píxeles CSS.

| Bloque y vista | Escritorio claro | Escritorio oscuro | Móvil claro | Móvil oscuro |
| --- | --- | --- | --- | --- |
| Navegación, tema y página de acceso | [PNG](capturas-react/acceso-escritorio-light.png) | [PNG](capturas-react/acceso-escritorio-dark.png) | [PNG](capturas-react/acceso-movil-light.png) | [PNG](capturas-react/acceso-movil-dark.png) |
| Modal de acceso | [PNG](capturas-react/modal-escritorio-light.png) | [PNG](capturas-react/modal-escritorio-dark.png) | [PNG](capturas-react/modal-movil-light.png) | [PNG](capturas-react/modal-movil-dark.png) |
| Explorador y filtros | [PNG](capturas-react/explorador-escritorio-light.png) | [PNG](capturas-react/explorador-escritorio-dark.png) | [PNG](capturas-react/explorador-movil-light.png) | [PNG](capturas-react/explorador-movil-dark.png) |
| Detalle y acciones | [PNG](capturas-react/detalle-escritorio-light.png) | [PNG](capturas-react/detalle-escritorio-dark.png) | [PNG](capturas-react/detalle-movil-light.png) | [PNG](capturas-react/detalle-movil-dark.png) |
| Favoritos | [PNG](capturas-react/favoritos-escritorio-light.png) | [PNG](capturas-react/favoritos-escritorio-dark.png) | [PNG](capturas-react/favoritos-movil-light.png) | [PNG](capturas-react/favoritos-movil-dark.png) |
| Estadísticas | [PNG](capturas-react/estadisticas-escritorio-light.png) | [PNG](capturas-react/estadisticas-escritorio-dark.png) | [PNG](capturas-react/estadisticas-movil-light.png) | [PNG](capturas-react/estadisticas-movil-dark.png) |
| Configuración de umbrales | [PNG](capturas-react/umbrales-escritorio-light.png) | [PNG](capturas-react/umbrales-escritorio-dark.png) | [PNG](capturas-react/umbrales-movil-light.png) | [PNG](capturas-react/umbrales-movil-dark.png) |
| Ruta no encontrada | [PNG](capturas-react/404-escritorio-light.png) | [PNG](capturas-react/404-escritorio-dark.png) | [PNG](capturas-react/404-movil-light.png) | [PNG](capturas-react/404-movil-dark.png) |

## Verificación

| Comprobación | Resultado |
| --- | --- |
| `npm run verify` | Lint, formato, 121 pruebas y compilación correctos. |
| axe-core 4.10.3 | 32 análisis de rutas y modal en escritorio y móvil, claro y oscuro. Sin infracciones detectadas en las reglas seleccionadas de WCAG 2.2 A y AA. [Mediciones de contraste y revisión de los casos indeterminados](contraste-react.md). |
| Reflujo | Sin desplazamiento horizontal global a 320 píxeles CSS ni al duplicar el tamaño de fuente base en un viewport de 1280 píxeles. Las tablas de umbrales se desplazan dentro de su contenedor con teclado. |
| Navegación y modal | Salto al contenido, selección con Enter, foco al abrir el diálogo, ciclo de Tab, cierre con Escape y retorno al botón de apertura. El árbol de accesibilidad de Chrome identifica el diálogo y su nombre. |
| Búsqueda y estadísticas | Los atajos aplican y quitan filtros con teclado. Los parámetros se conservan entre el explorador, el regreso desde el detalle y estadísticas. El estado seleccionado permanece visible con movimiento reducido. |
| Acceso y favoritos | Validación de contraseña al registrar, ejemplo de acceso, intento de guardar sin sesión, inicio de sesión, guardado, listado y eliminación. |
| PDF y umbrales | Descarga de un PDF válido desde el detalle. Creación de una unidad y un umbral y actualización del resultado del simulador. |

La comprobación interactiva con un lector de pantalla y la revisión de pares por bloque están pendientes. El árbol de accesibilidad de Chrome respalda la revisión semántica del diálogo.
