# QA de regresión del frontend — Issue #128

Validación independiente de las correcciones en persistencia local de favoritos (#46), concurrencia de umbrales (#124), guardado y montos de umbrales (#125) y exportación PDF (#126).

## Entorno y versión probada

| Campo             | Valor                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Fecha             | 2026-11-22                                                                                                                        |
| Responsable       | Mauricio Henríquez (`@StelleC`), QA                                                                                               |
| Versión probada   | `develop @ 42f65df` (incluye #151, frontend conectado a la API)                                                                   |
| Rama de evidencia | `chore/128-qa-regresion-frontend`                                                                                                 |
| Sistema operativo | Windows 11 x64                                                                                                                    |
| Node.js           | PENDIENTE                                                                                                                         |
| Navegador         | PENDIENTE                                                                                                                         |
| Frontend          | `npm run dev` → `http://localhost:5173`                                                                                           |
| API               | `LicitacionesUV-backend` (`develop`), `npm start` sin `DATABASE_URL`: catálogo ficticio en memoria en `http://localhost:3000/api` |
| Datos             | Solo datos ficticios del catálogo de prueba y usuarios de demostración.                                                           |

## Verificación automatizada

| Comando          | Resultado |
| ---------------- | --------- |
| `npm run verify` | PENDIENTE |

## Convenciones

- **Defecto reportado:** comportamiento descrito en el issue de cada corrección antes del arreglo; separa los casos previos de la aceptación posterior. La línea base automatizada previa es `develop @ 5fa3312` (21 de noviembre).
- **Aceptación:** resultado obtenido en la versión probada, posterior a las correcciones.
- Estado: ✅ pasa · ❌ falla · ⚠️ pasa con observación.

## Matriz de pruebas

### A. Umbrales en dos pestañas (#124)

Precondición común: abrir `/configuracion/umbrales` en dos pestañas (A y B) del mismo navegador. La columna «Defecto reportado» resume la descripción del issue antes de la corrección.

| ID     | Escenario                                  | Pasos                                                                                          | Resultado esperado (CA de #124)                                                                                    | Defecto reportado                                          | Obtenido  | Estado |
| ------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | --------- | ------ |
| UMB-01 | Unidades distintas desde dos pestañas      | En A crear la unidad «QA Pestaña A»; en B, sin recargar, crear «QA Pestaña B». Recargar ambas. | Las dos unidades siguen visibles en ambas pestañas.                                                                | Un guardado posterior sustituía los cambios de la primera. | PENDIENTE |        |
| UMB-02 | Aviso de cambio en otra pestaña            | Con A y B abiertas, agregar un umbral en A y volver a B.                                       | B muestra la configuración vigente y el aviso «Se cargaron cambios guardados en otra pestaña».                     | B conservaba un estado anterior.                           | PENDIENTE |        |
| UMB-03 | Edición incompatible sobre el mismo umbral | En B pulsar «Editar» en un umbral; en A cambiar ese umbral; en B guardar.                      | B no sobrescribe: informa «No se guardó el umbral: la configuración cambió…» y muestra el valor de A.              | La edición de B pisaba silenciosamente la de A.            | PENDIENTE |        |
| UMB-04 | Umbral eliminado en otra pestaña           | Eliminar en A el umbral que B está editando.                                                   | B sale del modo edición con el aviso «El umbral que editabas se eliminó en otra pestaña».                          | —                                                          | PENDIENTE |        |
| UMB-05 | Lista de unidades vacía                    | Eliminar todas las unidades y recargar.                                                        | La lista vacía se conserva (no vuelve la configuración inicial) y la página indica que hay que agregar una unidad. | —                                                          | PENDIENTE |        |

### B. Unidad seleccionada y montos al guardar (#125)

| ID     | Escenario                             | Pasos                                                                                                    | Resultado esperado (CA de #125)                                                                   | Defecto reportado                                       | Obtenido  | Estado |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------- | ------ |
| MON-01 | Eliminar la unidad seleccionada       | Seleccionar la unidad X en el formulario de umbral; eliminar X (en la misma pestaña o en otra); guardar. | La interfaz pide una unidad válida o muestra un error; no confirma una operación descartada.      | El formulario confirmaba una operación descartada.      | PENDIENTE |        |
| MON-02 | Máximo fraccionario                   | Mínimo `0`, máximo `0.5`.                                                                                | Se rechaza: «El monto máximo debe ser un entero en pesos…».                                       | Se aceptaban fracciones que mostraban un rango erróneo. | PENDIENTE |        |
| MON-03 | Mínimo fraccionario o con separadores | Mínimo `1500000.50`; luego `1.000.000`.                                                                  | Se rechazan: «Ingresa un monto mínimo en pesos enteros…».                                         | Se aceptaban decimales.                                 | PENDIENTE |        |
| MON-04 | Monto no representable                | Máximo `9007199254740993`.                                                                               | Se rechaza por no ser un entero seguro.                                                           | —                                                       | PENDIENTE |        |
| MON-05 | Rango de un peso y rango sin tope     | Crear `0`–`1` y otro umbral con mínimo `5000000` y máximo vacío.                                         | Ambos se guardan; el segundo se muestra sin tope.                                                 | —                                                       | PENDIENTE |        |
| MON-06 | Rango invertido o negativo            | Mínimo `-1`; luego mínimo `5000000` y máximo `1000000`.                                                  | Se rechazan con mensaje asociado al campo (`role="alert"`).                                       | —                                                       | PENDIENTE |        |
| MON-07 | Crear, editar y simular               | Crear un umbral válido, editarlo y simular un monto dentro del rango.                                    | Se confirma «Umbral agregado/actualizado…» y el simulador indica el nivel de aprobación correcto. | —                                                       | PENDIENTE |        |

### C. Favoritos: lectura fallida y recuperación (#46, CA9)

| ID     | Escenario                        | Pasos                                                                                                               | Resultado esperado                                                                | Defecto reportado | Obtenido  | Estado |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------- | --------- | ------ |
| FAV-01 | Guardar y quitar con sesión      | Iniciar sesión de demostración, marcar una licitación abierta como favorita, abrir `/favoritos`, quitarla.          | Aparece en `/favoritos` y desaparece al quitarla; el cambio persiste al recargar. | —                 | PENDIENTE |        |
| FAV-02 | Valor corrupto en almacenamiento | En DevTools → Application → Local Storage, reemplazar `licitacionesuv-favoritos` por `{{{` y recargar `/favoritos`. | La página carga sin errores, con estado vacío; no hay excepción en consola.       | —                 | PENDIENTE |        |
| FAV-03 | Recuperación tras corrupción     | Después de FAV-02, marcar una licitación como favorita y recargar.                                                  | Se guarda un JSON válido y el favorito persiste.                                  | —                 | PENDIENTE |        |
| FAV-04 | Acceso sin sesión                | Cerrar sesión y abrir `/favoritos`; intentar marcar un favorito desde el explorador.                                | No se muestran favoritos privados; se pide iniciar sesión.                        | —                 | PENDIENTE |        |

### D. Exportación PDF (#126)

| ID     | Escenario                         | Pasos                                                      | Resultado esperado                                                                                       | Defecto reportado                                            | Obtenido  | Estado |
| ------ | --------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------- | ------ |
| PDF-01 | Apertura del PDF                  | Abrir el detalle de una licitación y exportar PDF.         | Se descarga `<id>.pdf` y abre en el visor sin errores.                                                   | —                                                            | PENDIENTE |        |
| PDF-02 | Región y bases en filas separadas | Revisar el PDF de PDF-01.                                  | «Región» y «Bases oficiales» aparecen en filas distintas, sin superponerse; el enlace largo se envuelve. | Ambas filas compartían la misma coordenada y se superponían. | PENDIENTE |        |
| PDF-03 | Exportar con teclado              | Llegar al botón de exportar con Tab y activarlo con Enter. | El PDF se genera y el estado se anuncia.                                                                 | —                                                            | PENDIENTE |        |

### E. Teclado y flujos existentes

| ID     | Escenario                        | Pasos                                                          | Resultado esperado                                                                                      | Obtenido  | Estado |
| ------ | -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------- | ------ |
| KEY-01 | Formulario de umbral con teclado | Completar y enviar el formulario de umbral solo con Tab/Enter. | Todos los campos son alcanzables y los mensajes de éxito/error se anuncian (`role="status"`/`"alert"`). | PENDIENTE |        |
| FLU-01 | Búsqueda y filtros               | Buscar por título y combinar región + tipo en el explorador.   | Resultados correctos, filtros conservados en la URL.                                                    | PENDIENTE |        |
| FLU-02 | Detalle y volver                 | Abrir un detalle y volver al explorador.                       | Se conservan los filtros aplicados.                                                                     | PENDIENTE |        |

## Resumen

| Grupo                | Casos | Pasan | Fallan | Observaciones |
| -------------------- | ----: | ----: | -----: | ------------- |
| A. Umbrales pestañas |     5 |       |        |               |
| B. Unidad y montos   |     7 |       |        |               |
| C. Favoritos         |     4 |       |        |               |
| D. PDF               |     3 |       |        |               |
| E. Teclado y flujos  |     3 |       |        |               |
