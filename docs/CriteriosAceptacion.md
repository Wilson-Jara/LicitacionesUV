# Criterios de Aceptación — Historias de Usuario

Criterios de aceptación (CA) de las historias de usuario abiertas del tablero, redactados en el formato de la plantilla [`.github/ISSUE_TEMPLATE/historia-de-usuario.md`](../.github/ISSUE_TEMPLATE/historia-de-usuario.md).

> Cada CA es una condición **verificable y medible**. Se cumple o no se cumple; no admite interpretación. El DoR y el DoD comunes a todas las historias están en la plantilla de issue.

## Cómo usar este documento

1. Copiar el bloque de la historia correspondiente en el issue de GitHub.
2. Marcar cada CA al momento de probar (QA).
3. El issue solo se cierra cuando **todos** los CA están cumplidos y `npm run verify` pasa (ver DoD de la plantilla).

## Índice

| Issue | Historia de usuario                                                     | Etiquetas                                                                        |
| ----- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| #43   | Buscar licitaciones por palabra clave                                   | `enhancement`, `filters`, `licitaciones`, `frontend`, `url-state`, `performance` |
| #44   | Ver el detalle de una licitación                                        | `enhancement`, `licitaciones`, `frontend`, `routing`, `ui`                       |
| #45   | Asistente guiado de requerimientos de la licitación                     | `enhancement`, `licitaciones`, `frontend`, `ui`, `architecture`                  |
| #46   | Visualizar licitaciones favoritas en vistas de calendario y lista       | `enhancement`, `licitaciones`, `frontend`, `ui`, `favoritos`, `security`         |
| #47   | Mostrar todos los resultados de búsqueda y filtros con estado accesible | `enhancement`, `filters`, `frontend`, `ui`, `accessibility`, `performance`       |
| #48   | Configurar alertas de nuevas licitaciones                               | `enhancement`, `licitaciones`, `frontend`, `alertas`, `security`                 |
| #49   | Exportar resumen y bases de licitación en PDF                           | `enhancement`, `licitaciones`, `frontend`, `export`                              |

---

## #43 · Buscar licitaciones por palabra clave

**Como** visitante, **quiero** buscar licitaciones por palabra clave, **para** encontrar convocatorias relevantes a mi rubro sin revisar todo el listado.

### Criterios de aceptación

- **CA1:** Existe un campo de búsqueda en el explorador de licitaciones; al ingresar un término y confirmar, el listado muestra solo las licitaciones cuyo `title` o `institution` contienen el texto (comparación sin distinguir mayúsculas/minúsculas).
- **CA2:** El término buscado se refleja en la URL como `?keyword=...`; al recargar o compartir el enlace, el filtro se conserva (REF-09).
- **CA3:** El listado filtrado se actualiza en menos de 2 segundos para el conjunto de datos mock (REF-01).
- **CA4:** Si no hay coincidencias, se muestra el estado vacío con un botón que limpia el filtro de búsqueda (REF-05).
- **CA5:** El campo tiene etiqueta accesible, es operable por teclado y el resultado filtrado se anuncia a lectores de pantalla (REF-13).
- **CA6:** Al vaciar el término, el listado vuelve a mostrar todas las licitaciones y el parámetro `keyword` desaparece de la URL.

---

## #44 · Ver el detalle de una licitación

**Como** usuario, **quiero** ver el detalle de una licitación, **para** evaluar si me conviene antes de consultar las bases oficiales.

### Criterios de aceptación

- **CA1:** Desde cada tarjeta del listado y de favoritos se puede navegar a la ruta de detalle `/licitaciones/:id` (etiqueta `routing`).
- **CA2:** El detalle muestra `title`, `institution`, `amount` formateado en CLP según `currency`, `closingDate` en formato local chileno, `type` (pública/privada) y `region`.
- **CA3:** El detalle incluye un enlace a la fuente oficial de la licitación que se abre en una pestaña nueva con `rel="noreferrer"`.
- **CA4:** Si el `:id` no existe en los datos mock, se muestra un estado "licitación no encontrada" con enlace de regreso al listado, sin pantalla en blanco (REF-05).
- **CA5:** El botón atrás del navegador regresa al listado conservando los filtros previos (sincronizados en la URL).
- **CA6:** La vista es responsive (escritorio y móvil) y navegable por teclado (REF-05, REF-13).

---

## #45 · Asistente guiado de requerimientos de la licitación

**Como** usuario, **quiero** un asistente guiado de requerimientos, **para** entender paso a paso qué exige una licitación antes de postular.

### Criterios de aceptación

- **CA1:** Desde el detalle de la licitación se accede al asistente mediante un botón visible ("Asistente de requerimientos").
- **CA2:** El asistente presenta una secuencia de pasos numerados con indicador de progreso "Paso X de N" siempre visible.
- **CA3:** El usuario puede avanzar y retroceder entre pasos sin perder las respuestas ya ingresadas.
- **CA4:** Al finalizar, se muestra un resumen de los requerimientos seleccionados y un enlace para volver al detalle de la licitación.
- **CA5:** El estado del asistente vive solo en el cliente (memoria/URL); al salir sin finalizar no persiste ni envía datos a un servidor (REF-10).
- **CA6:** Cada paso es operable por teclado y el cambio de paso se anuncia a lectores de pantalla mediante una región `aria-live` (REF-13).
- **CA7:** La funcionalidad se construye como un módulo aislado dentro de `features/licitaciones` con componentes de responsabilidad única (REF-06); si el alcance crece, se documenta la decisión en `docs/Arquitectura.md`.

---

## #46 · Visualizar licitaciones favoritas en vistas de calendario y lista

**Como** usuario autenticado, **quiero** ver mis licitaciones favoritas en vista de calendario y de lista, **para** planificar mi trabajo según las fechas de cierre.

### Criterios de aceptación

- **CA1:** Sin sesión iniciada, la página `/favoritos` invita a iniciar sesión y no muestra favoritos de ningún usuario (REF-02, ya implementado en `MisFavoritosPage`).
- **CA2:** Con sesión iniciada, se listan únicamente los favoritos del usuario autenticado, leídos desde `localStorage` (clave `licitacionesuv-favoritos`).
- **CA3:** Existe un selector de vista "Lista" / "Calendario"; alternar entre ambas no recarga la página ni pierde los datos.
- **CA4:** La vista Calendario ubica cada favorito en el día de su `closingDate`; si hay varias el mismo día, se agrupan y se indica su cantidad.
- **CA5:** Al quitar un favorito desde cualquiera de las dos vistas, la licitación desaparece de ambas de forma inmediata.
- **CA6:** Si el usuario no tiene favoritos, ambas vistas muestran un estado vacío con una invitación a guardar licitaciones (REF-05).
- **CA7:** El calendario abre en el mes actual y permite navegar al mes anterior y siguiente.
- **CA8:** Montos y fechas se muestran con formato local chileno (CLP y `Intl`, REF-12).

---

## #47 · Mostrar todos los resultados de búsqueda y filtros con estado accesible

**Como** usuario, **quiero** que el listado muestre todos los resultados (o un estado claro cuando no los hay) y que los filtros activos sean accesibles, **para** no perder oportunidades ni depender del ratón.

### Criterios de aceptación

- **CA1:** El listado muestra todos los resultados que cumplen la combinación de filtros activos (`keyword`, `region`, `tipo`) sin truncar ni paginar de forma implícita.
- **CA2:** Se muestra un contador con la cantidad de resultados y un resumen de los filtros activos, cada uno con acción de eliminación individual.
- **CA3:** El resumen de resultados y filtros activos se anuncia a lectores de pantalla (`aria-live`) y cada chip de filtro es operable y removible con teclado (REF-13).
- **CA4:** Cuando no hay resultados, se muestra el estado vacío con un botón "Limpiar filtros" que restablece la URL (REF-09).
- **CA5:** El listado es responsive (escritorio y móvil) y muestra un estado de carga mientras aplica el filtrado (REF-05).
- **CA6:** El filtrado completo responde en menos de 2 segundos desde la interacción del usuario (REF-01).
- **CA7:** Los componentes usan HTML semántico (`section`, `ul`/`li`, encabezados jerárquicos) y contraste de color suficiente (REF-13).

---

## #48 · Configurar alertas de nuevas licitaciones

**Como** usuario autenticado, **quiero** configurar alertas de nuevas licitaciones, **para** recibir avisos de convocatorias que coincidan con mis criterios.

> Alcance de esta entrega: **configuración** de alertas en el cliente (Fase 1). El envío real de notificaciones por correo corresponde a la Fase 3 (ver README).

### Criterios de aceptación

- **CA1:** Solo un usuario con sesión iniciada puede crear o editar alertas; sin sesión, la acción abre el modal de autenticación (REF-02).
- **CA2:** El formulario permite definir un nombre de alerta y sus criterios (palabra clave, región y tipo), reutilizando los mismos campos del explorador.
- **CA3:** Una alerta se puede activar o desactivar sin eliminarla, y el cambio se refleja de inmediato en la lista.
- **CA4:** Las alertas se persisten en `localStorage` asociadas al usuario y sobreviven a la recarga de la página (misma línea que favoritos; REF-10).
- **CA5:** Una alerta se puede eliminar y desaparece de la lista sin recargar la página.
- **CA6:** Si una alerta no tiene ningún criterio, se muestra un mensaje de validación y no se guarda.
- **CA7:** Formulario y lista son operables por teclado y los mensajes de estado/error se anuncian a lectores de pantalla (REF-13).

---

## #49 · Exportar resumen y bases de licitación en PDF

**Como** usuario, **quiero** exportar el resumen y las bases de una licitación en PDF, **para** compartirla o archivarla.

### Criterios de aceptación

- **CA1:** En el detalle de la licitación existe un botón "Exportar PDF" visible.
- **CA2:** El PDF generado incluye `title`, `institution`, monto formateado en CLP con su `currency`, `closingDate`, `type`, `region` y el enlace a la fuente oficial.
- **CA3:** El archivo se descarga con un nombre estable basado en el identificador, por ejemplo `licitacion-<id>.pdf`.
- **CA4:** La generación corresponde a los datos de la licitación seleccionada y no mezcla información de otras.
- **CA5:** Si la generación falla, se muestra un mensaje de error visible y la interfaz sigue siendo utilizable (REF-05).
- **CA6:** La exportación no bloquea la interfaz; el usuario puede seguir navegando mientras se genera.
- **CA7:** El contenido del PDF está íntegramente en español, con montos y fechas en formato local chileno (REF-12).
- **CA8:** La exportación está disponible para cualquier usuario; no requiere sesión ni persiste datos personales (no aplica REF-02).

---

## Matriz de trazabilidad HU ↔ Etiquetas ↔ REF

| Issue | Etiquetas                                                                        | REF cubiertos                          |
| ----- | -------------------------------------------------------------------------------- | -------------------------------------- |
| #43   | `enhancement`, `filters`, `licitaciones`, `frontend`, `url-state`, `performance` | REF-01, REF-05, REF-09, REF-10, REF-13 |
| #44   | `enhancement`, `licitaciones`, `frontend`, `routing`, `ui`                       | REF-05, REF-10, REF-12, REF-13         |
| #45   | `enhancement`, `licitaciones`, `frontend`, `ui`, `architecture`                  | REF-05, REF-06, REF-10, REF-13         |
| #46   | `enhancement`, `licitaciones`, `frontend`, `ui`, `favoritos`, `security`         | REF-02, REF-05, REF-10, REF-12, REF-13 |
| #47   | `enhancement`, `filters`, `frontend`, `ui`, `accessibility`, `performance`       | REF-01, REF-05, REF-09, REF-12, REF-13 |
| #48   | `enhancement`, `licitaciones`, `frontend`, `alertas`, `security`                 | REF-02, REF-05, REF-10, REF-13         |
| #49   | `enhancement`, `licitaciones`, `frontend`, `export`                              | REF-01, REF-05, REF-10, REF-12         |

## Revisión de correspondencia etiquetas ↔ REF

Las etiquetas del repositorio son **por área funcional**, no por requisito; por eso la correspondencia con los REF es parcial y se completa con esta matriz.

| REF                                | Etiqueta que lo representa     | Estado                                  |
| ---------------------------------- | ------------------------------ | --------------------------------------- |
| REF-01 Rendimiento                 | `performance`                  | Agregada en esta revisión               |
| REF-02 Seguridad (sesión)          | `security`                     | Agregada en esta revisión               |
| REF-03 Seguridad (secretos)        | `security`                     | Agregada en esta revisión               |
| REF-05 Usabilidad (estados)        | `ui`                           | Cobertura parcial (sin etiqueta propia) |
| REF-06 Mantenibilidad              | `code-quality`, `architecture` | Cubierto                                |
| REF-09 Restricción técnica (URL)   | `url-state`                    | Cubierto                                |
| REF-10 Restricción técnica (mocks) | `mock-data`                    | Cubierto                                |
| REF-12 Formato local (es-CL/CLP)   | —                              | Sin etiqueta; se verifica vía CA        |
| REF-13 Accesibilidad               | `accessibility`                | Cubierto                                |

**Brecha detectada:** REF-05 y REF-12 no tienen etiqueta propia. Se decidió **no crear etiquetas adicionales** para evitar proliferación y verificarlos mediante los CA de cada historia. Si el equipo prefiere poder filtrarlos, bastaría con crear `usabilidad` y `formato-es-cl`.

## Definition of Ready / Definition of Done

Ambos son los de la plantilla de historia de usuario (`.github/ISSUE_TEMPLATE/historia-de-usuario.md`) y aplican a las siete historias:

- **DoR:** criterios de aceptación definidos y verificables, alcance y dependencias identificados, estimación acordada y dudas funcionales resueltas antes de implementar.
- **DoD:** todos los CA cumplidos, `npm run verify` en verde (lint, formato, test y build), revisión y aprobación de al menos un par (PR fusionado) y sin reapertura por errores atribuibles a la entrega.
