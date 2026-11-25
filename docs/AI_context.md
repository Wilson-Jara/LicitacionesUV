# Contexto del proyecto para asistentes de IA

> Documento de referencia para cualquier IA que trabaje en este repositorio. Debe leerse antes de proponer o implementar cambios.

## 1. Identidad y propósito

- **Proyecto:** `LicitacionesUV` (`licitacionesuv` en `package.json`).
- **Repositorio remoto:** `https://github.com/Wilson-Jara/LicitacionesUV.git`.
- **Tipo:** aplicación web cliente.
- **Idioma de negocio/documentación:** español.
- **Propósito declarado:** crear, centralizar y gestionar licitaciones universitarias, además de comparar ofertas y ayudar a seleccionar la mejor propuesta de proveedores.
- **Estado real actual:** aplicación web en React con enrutamiento (`react-router-dom`). Usa la identidad pública «Licitaciones UV», un catálogo de demostración con filtros y orden en URL, acceso simulado y gestión de favoritos.

## 2. Estado verificado

Estado verificado localmente el 22 de noviembre de 2026:

- Este repositorio contiene solo el frontend; `backend/` se retiró.
- `npm run test` ejecuta las 227 pruebas del cliente (incluye `tests/licitacionesApi.test.js`, que prueba el cliente HTTP con un `fetch` falso). Las pruebas de la API se ejecutan en `LicitacionesUV-backend`.
- `npm run verify` conserva clean, lint, format:check, test y build. La cobertura general mide únicamente `src/**/*.js`; la crítica mantiene `licitacionUtils.js`.
- El workflow `.github/workflows/verify.yml` instala y verifica solo el cliente, sin PostgreSQL ni dependencias del backend. Su definición local no acredita una ejecución remota correcta.
- Los componentes JSX no forman parte de la medición de cobertura de módulos JavaScript.
- `npm run verify` pasa: lint, formato, 145 pruebas y build. El contrato rechaza fechas de calendario imposibles, incluidos días inválidos de febrero, y tolera `sector` ausente o nulo. La medición de filtros es reproducible con `npm run bench:filtros` (`scripts/medir-filtros.mjs`), que falla sobre el objetivo de 2 s de REF-01. La cobertura propia del cliente se debe recalcular tras esta entrega; son resultados locales, no del CI remoto.
- `npm run test` ejecuta las 122 pruebas del cliente. Las pruebas de la API se ejecutan en `LicitacionesUV-backend`.
- `npm run verify` conserva clean, lint, format:check, test y build. La cobertura general mide únicamente `src/**/*.js`; la crítica mantiene `licitacionUtils.js`.
- El workflow `.github/workflows/verify.yml` instala y verifica solo el cliente, sin PostgreSQL ni dependencias del backend. Su definición local no acredita una ejecución remota correcta.
- Los componentes JSX no forman parte de la medición de cobertura de módulos JavaScript.
- `npm run verify` pasa tras retirar el backend: lint, formato, 133 pruebas y build. La cobertura propia del cliente es 99,13 % líneas, 90,67 % ramas y 99,06 % funciones; la crítica pasa con 100 % en las tres métricas. Son resultados locales, no del CI remoto.
- `npm run verify` pasa: lint, formato, 209 pruebas y build. La cobertura local alcanza 98,42 % de líneas, 91,70 % de ramas y 97,95 % de funciones. `licitacionUtils.js` mantiene 100 % en las tres métricas.
- `npm run verify` pasa: lint, formato, 227 pruebas y build. La cobertura local alcanza 98,42 % de líneas, 91,70 % de ramas y 97,95 % de funciones. `licitacionUtils.js` mantiene 100 % en las tres métricas.
- El contrato rechaza fechas imposibles, la medición de filtros es reproducible y las pruebas del PDF derivan la separación de `PDF_LAYOUT_MM` y cubren enlaces envueltos.

- Manejo de estado de autenticación en cliente con `AuthProvider` y hook `useAuth` (simulación de login/registro), incluyendo el control global del modal de acceso (`isAuthModalOpen`, `openAuthModal`, `closeAuthModal`).
- Gestión de favoritos con `FavoritosProvider` y hook `useFavoritos`, persistidos en `localStorage` por usuario e incluyendo `fechaGuardado` por licitación.
- Configuración de umbrales de aprobación por unidad con `UmbralesProvider` y hook `useUmbrales`, persistida en `localStorage` como datos editables (REF-14).
- Router con navegación interna (`react-router-dom` v7).
- Catálogo de licitaciones obtenido de la API con `LicitacionesProvider` y hook `useLicitaciones` (estados `cargando`, `listo` y `error` con reintento). `features/licitaciones/data/licitaciones.mock.json`, con `sector` opcional y `etiquetas` normalizadas, se conserva como datos de las pruebas del contrato y de los filtros.
- El acceso seguro a `localStorage` de umbrales y favoritos está centralizado en `src/shared/lib/persistenciaLocal.js` (`obtenerAlmacenamientoLocal`, `leerJson`, `escribirJson`): ninguna función lanza y cada consumidor decide su respaldo. Contrato, indicadores y deuda postergada en `docs/persistencia-local.md`.
- La API vive en el repositorio independiente `LicitacionesUV-backend`: PostgreSQL mediante `pg`, catálogo ficticio propio, migraciones, pruebas y CI propios. El cliente la consume por HTTP (`services/licitacionesApi.js`) y no importa ni lee sus archivos.
- Despliegue del frontend como sitio estático en Vercel mediante la CLI; `vercel.json` fija Vite, `npm run build`, la salida `dist` y la reescritura de todas las rutas a `index.html` para React Router. El vínculo local `.vercel/` está excluido de Git.
- `node_modules/` y `dist/` excluidos del control de versiones.

## 3. Funcionalidad existente

- **Acceso simulado:**
  - `AuthModal` y `LoginPage` (`/login`) comparten `AuthForm` y el panel ilustrado `AuthIntro`. Ambos identifican la sesión como simulada y permiten rellenar datos ficticios de ejemplo.
  - Se conserva el inicio de sesión, el registro, la visibilidad de contraseña, la validación de campos y el acceso simulado con Google y GitHub.
  - El modal usa el elemento nativo `dialog`, mantiene el foco durante la navegación por tabulador y restaura el foco al control de apertura al cerrar. Si ese control desaparece, enfoca el contenido principal.
- **Perfil de usuario (`/perfil`):**
  - Con sesión de prueba, permite editar el nombre y el correo de contacto. El formulario anuncia los errores y confirma los cambios guardados. Sin sesión, la ruta invita a iniciar sesión mediante el modal de acceso.
  - `profileStorage.js` guarda el perfil por cuenta en `localStorage` (`licitacionesuv-perfil:<correo de acceso>`). El correo de acceso conserva la identidad de la cuenta y sus favoritos.
  - La sesión simulada se conserva al recargar la pestaña mediante `sessionStorage` (`licitacionesuv-sesion-demo`), con el nombre y el correo de acceso. Cerrar sesión elimina esa entrada.
- **Explorador de Licitaciones:**
  - Barra lateral (`FilterSidebar`) con búsqueda por título, atajos de ejemplo, selección de región, sector y etiqueta, botones de modalidad y aviso de catálogo ficticio. Los filtros aplicados se pueden quitar individualmente y, junto con el orden, se conservan en la URL.
  - Selector "Ordenar por" en la barra de resultados con fecha de cierre (ascendente/descendente) y monto (ascendente/descendente), sincronizado en la URL mediante `?sort=` y aplicado después de los filtros.
  - Filas de licitación (`LicitacionCard`) con título enlazado, tipo, región, sector, etiquetas, organismo, fecha, monto, estado y acción de favorito. El detalle recupera los parámetros del explorador al volver mediante su enlace.
  - Lista semántica con contador accesible, estado vacío y restablecimiento de filtros. En pantallas estrechas, los filtros se pueden desplegar.
- **Panel de Estadísticas (`/estadisticas`):**
  - Distribuciones por región, tipo (`publica`/`privada`) y sector, calculadas como cantidad de licitaciones sobre el conjunto filtrado del explorador.
  - El enlace entre explorador y estadísticas mantiene los parámetros de la URL. El panel se recalcula con esos parámetros y muestra un estado vacío cuando no hay coincidencias.
  - El sector usa el campo explícito del mock (`tecnologia`, `infraestructura` o `finanzas`); si falta, se deriva de la institución para conservar compatibilidad con datos anteriores.
  - Cada distribución ofrece una alternativa textual accesible (texto para lectores de pantalla y tabla con categorías y valores) además de las barras visuales.
  - El total y los porcentajes de cada distribución se calculan una sola vez en `calcularFilasDistribucion` (`estadisticasUtils.js`); las barras, la tabla accesible y la alternativa textual leen ese resultado (#134, detalle en `docs/estadisticas-porcentajes.md`).
- **Detalle de Licitación:**
  - La ruta `/licitaciones/:id` muestra los datos completos, estado vigente/cerrada y enlace a la fuente oficial en una pestaña nueva.
  - Botón "Exportar PDF" que descarga un resumen consolidado (`licitacion-<id>.pdf`) con identificación, organismo, fecha de cierre, presupuesto, tipo, región y enlace a las bases oficiales, en español y formatos locales chilenos. Las filas de región y bases oficiales conservan posiciones verticales separadas incluso cuando el enlace se envuelve.
  - La generación del PDF ocurre en un **Web Worker** (fuera del hilo principal) con `jsPDF`; el hilo principal solo recibe el `ArrayBuffer` y dispara la descarga, por lo que la navegación no se bloquea (CA6). Si el navegador no soporta Web Workers, la exportación se rechaza y se muestra un mensaje de error visible (CA5), sin ejecutar generación síncrona en el hilo principal. La carga del módulo de exportación y del worker es diferida.
  - Las licitaciones cerradas no pueden guardarse como favoritas; las que ya estaban guardadas aún pueden quitarse.
  - El campo `sourceUrl` se mantiene en el contrato de datos mock.
- **Favoritos:**
  - Botón "Guardar / Quitar" en `LicitacionCard`; sin sesión, al intentar guardar se abre el modal de autenticación (REF-02).
  - Persistencia local por usuario en `localStorage` (clave `licitacionesuv-favoritos`) con el par `idLicitacion` + `fechaGuardado`.
  - Página `/favoritos` (`MisFavoritosPage`) que lista las licitaciones guardadas con título, monto y fecha de cierre mediante `LicitacionCard`, permite quitarlas al instante y muestra estado vacío cuando no hay favoritos (o invitación a iniciar sesión si no hay sesión).
- **Barra de navegación (`Navbar`):**
  - Cabecera compartida con la marca «Licitaciones UV», enlaces activos a explorador, favoritos, estadísticas y umbrales, cambio de tema y controles de sesión.
  - El layout incluye salto al contenido, título de documento por ruta y manejo de foco al cambiar de pantalla.
- **Temas Claro/Oscuro:**
  - Alternancia de tema mediante atributo `data-theme` en `<html>`, con variables CSS duplicadas por tema en `src/index.css`.
  - Script inline en `index.html` que aplica el tema guardado o la preferencia del sistema antes del montaje de React, evitando el flash de tema incorrecto.
  - Persistencia de la elección en `localStorage` (clave `licitacionesuv-theme`).
  - Botón de alternancia accesible (`ThemeToggle` con `aria-label` y `aria-pressed`) en la barra de navegación.
  - Los componentes usan variables semánticas para fondo, texto, bordes, foco y estados. La paleta **Índigo-Morado UV y Arena** alcanza contraste WCAG 2.2 AAA (`≥ 7,47:1` en texto/enlaces/estados y `≥ 5,01:1` en bordes de controles) con referencia tipográfica mínima de `1rem` (16 px) en ambos temas. Las animaciones (`motion` envuelto en `<MotionConfig reducedMotion="user">`) y transiciones respetan la preferencia de movimiento reducido.
- **Configuración de Umbrales de Aprobación (US-10, CR-302):**
  - Página `/configuracion/umbrales` (`ConfiguracionUmbralesPage`) que permite crear, editar y eliminar umbrales por unidad mediante los formularios `UmbralForm` y `UnidadForm` y el listado editable `UmbralesTable`.
  - Los umbrales son **datos configurables**, no constantes del código (CA2, regla R4 / REF-14): el punto de partida vive en `umbralesIniciales.js` y la configuración vigente se persiste en `localStorage` (clave `licitacionesuv-umbrales`).
  - El rango de cada umbral es `[montoMinimo, montoMaximo)`: el mínimo es inclusivo, el máximo es exclusivo y `null` en el máximo significa «sin tope». La validación impide montos negativos, rangos invertidos y solapamientos dentro de una unidad, y exige pesos enteros representables con precisión (`Number.isSafeInteger`). Los montos se escriben en campos de texto con teclado numérico y `parseMontoClp` solo acepta dígitos, para rechazar entradas como `0,5` o `1.000.000` que un campo `type="number"` reinterpreta en silencio.
  - Las operaciones de `useUmbrales` devuelven `true` solo si cambiaron la configuración. `UmbralForm` reconcilia la unidad elegida con las vigentes (`idUnidadVigente`): si se elimina, el selector pide una unidad nueva en vez de cambiar a otra, y la página solo confirma un guardado aplicado; si se descarta, el formulario muestra el error y conserva los datos. La selección se invalida en el mismo render en que la unidad desaparece, porque los ids se generan como «mayor + 1» y una unidad nueva podría reutilizar el de la eliminada.
  - Los umbrales con decimales guardados antes de esa validación se siguen leyendo (no se redondean ni se borran), pero la tabla los describe con sus montos exactos y los marca para corregirlos (`tieneMontosNoEnteros`).
  - Varias pestañas comparten la configuración sin sobrescribirse: cada operación toma un bloqueo compartido entre pestañas (`conBloqueoEntrePestanas`, Web Locks), vuelve a leer `localStorage`, aplica el cambio sobre lo vigente y lo guarda en el mismo paso (`guardarUmbrales`); ya no se escribe en un efecto posterior al render. Por eso las operaciones de `useUmbrales` devuelven promesas. `agregarUmbral`, `actualizarUmbral` y `agregarUnidad` validan contra lo vigente (solapamientos, montos, nombres repetidos) y descartan lo incompatible; `actualizarUmbral` también rechaza la edición si el umbral cambió desde que se abrió el editor (`mismosValoresUmbral`). El evento `storage` recarga la configuración cuando otra pestaña guarda y la página lo avisa (`cambiosDeOtraPestana`); si se eliminó el umbral en edición, sale del modo edición con un aviso, y si se modificó, avisa antes de guardar. Si el almacenamiento se puede leer pero no escribir (sin espacio), la operación se rechaza; solo con el almacenamiento bloqueado se trabaja sobre la copia en memoria. La página lo avisa (`problemaAlmacenamiento`: `bloqueado` o `sin-espacio`). Los ids se generan como «mayor + 1» sin reutilizarse: la configuración guarda `ultimosIds` con el mayor número usado de unidad y de umbral, y las configuraciones anteriores sin ese campo se siguen leyendo.
  - Un simulador consulta el nivel aprobador que corresponde a un monto con la configuración vigente y se recalcula de inmediato al editar, sin recargar la página ni volver a desplegar (CA3).
  - Las tablas conservan sus encabezados y se desplazan dentro de una región enfocada por teclado cuando el ancho es insuficiente.
- **Límite con el backend independiente:**
  - La API expone salud, listado filtrado y detalle con los nueve campos del contrato; `sector` y `etiquetas` son opcionales para el cliente (sin ellos, el sector se deriva del organismo y los desplegables de sector y etiqueta muestran solo lo que traiga el catálogo). Usa PostgreSQL con conexión configurada y catálogo propio en memoria sin ella.
  - Las migraciones, el seed y las pruebas de integración se administran desde la raíz de `LicitacionesUV-backend`.
  - El frontend consume la API en `VITE_API_BASE_URL` (por defecto `http://localhost:3000/api`): `LicitacionesProvider` pide una vez `GET /api/licitaciones` y el explorador, favoritos y estadísticas filtran y ordenan en el navegador sobre ese catálogo; el detalle pide `GET /api/licitaciones/:id` y muestra la página 404 cuando la API responde 404. Si la API no responde, cada pantalla muestra el error con un botón «Reintentar» (`EstadoCatalogo`).
  - La autenticación real, favoritos y umbrales en la API y Mercado Público siguen sin implementarse.

## 4. Arquitectura y flujo de entrada

1. `index.html` define el documento HTML, favicon y contenedor `#root`.
2. `src/main.jsx` importa `index.css` y monta `<App />`.
3. `src/app/App.jsx` envuelve la aplicación en `ThemeProvider`, `AuthProvider`, `FavoritosProvider`, `UmbralesProvider`, `LicitacionesProvider` y `BrowserRouter`.
4. `src/app/routes/AppRoutes.jsx` gestiona las rutas (`/login`, `/perfil`, `/licitaciones`, `/licitaciones/:id`, `/favoritos`, `/estadisticas`, `/configuracion/umbrales`, 404).
5. `src/app/layouts/PublicLayout.jsx` monta la barra de navegación, la ruta activa y el diálogo común de acceso.
6. `src/index.css` define los tokens de ambos temas, la tipografía, el foco y los controles comunes.
7. La API se inicia desde el repositorio independiente, por defecto en `http://localhost:3000`. El frontend Vite usa `http://localhost:5173` y necesita la API levantada para mostrar licitaciones; en un despliegue, `VITE_API_BASE_URL` apunta a la API publicada y el backend debe permitir ese origen con `CORS_ORIGIN`.

## 5. Inventario de archivos relevantes

| Archivo                                                            | Responsabilidad actual                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                                        | Reglas obligatorias para cualquier IA que trabaje en el repositorio (lectura previa a cualquier acción).         |
| `vercel.json`                                                      | Configuración de despliegue en Vercel (Vite, `dist` y reescritura de rutas a `index.html`).                      |
| `index.html`                                                       | Punto de entrada HTML.                                                                                           |
| `src/main.jsx`                                                     | Punto de montaje de React.                                                                                       |
| `src/app/App.jsx`                                                  | Componente raíz con proveedores de Auth, Favoritos, Umbrales, catálogo (API) y Router.                           |
| `src/app/routes/AppRoutes.jsx`                                     | Enrutamiento de la aplicación (`/login`, `/licitaciones`, etc.).                                                 |
| `src/app/layouts/PublicLayout.jsx`                                 | Layout principal con Navbar, contenedor de páginas y modal de autenticación global.                              |
| `src/index.css`                                                    | Tokens de tema, foco, tipografía y controles comunes.                                                            |
| `src/features/auth/components/AuthModal.jsx`                       | Diálogo de inicio de sesión/registro con retorno de foco.                                                        |
| `src/features/auth/components/AuthModal.css`                       | Estilos compartidos de acceso y del diálogo.                                                                     |
| `src/features/auth/components/AuthForm.jsx`                        | Formulario compartido de acceso, registro y cuentas de ejemplo.                                                  |
| `src/features/auth/components/AuthIntro.jsx`                       | Panel de contexto e ilustración de acceso.                                                                       |
| `src/features/auth/pages/LoginPage.jsx`                            | Página completa de acceso simulado.                                                                              |
| `src/features/auth/pages/LoginPage.css`                            | Estilos de la página de inicio de sesión.                                                                        |
| `src/features/auth/hooks/useAuth.js`                               | Hook de consumo del contexto de autenticación.                                                                   |
| `src/app/providers/AuthProvider.jsx`                               | Proveedor de estado de autenticación y del modal de acceso global.                                               |
| `src/app/providers/FavoritosProvider.jsx`                          | Proveedor de favoritos con persistencia en localStorage por usuario.                                             |
| `src/features/favoritos/hooks/useFavoritos.js`                     | Hook de consumo del contexto de favoritos.                                                                       |
| `src/features/favoritos/data/favoritosStorage.js`                  | Lógica pura de persistencia de favoritos (lectura/escritura y altas/bajas).                                      |
| `src/app/providers/ThemeProvider.jsx`                              | Proveedor de tema claro/oscuro con persistencia en localStorage.                                                 |
| `src/shared/components/Navbar.jsx`                                 | Marca pública, navegación activa, tema y controles de sesión.                                                    |
| `src/shared/components/Navbar.css`                                 | Estilos del Navbar.                                                                                              |
| `src/shared/components/ThemeToggle.jsx`                            | Botón accesible de alternancia de tema claro/oscuro.                                                             |
| `src/shared/components/ThemeToggle.css`                            | Estilos del botón de tema.                                                                                       |
| `src/shared/hooks/useTheme.js`                                     | Hook de consumo del contexto de tema.                                                                            |
| `src/shared/lib/persistenciaLocal.js`                              | Acceso seguro a `localStorage` (obtener, leer y escribir JSON) compartido por umbrales y favoritos.              |
| `src/features/licitaciones/pages/LicitacionesExplorerPage.jsx`     | Página principal de exploración de licitaciones con selector de orden.                                           |
| `src/features/licitaciones/pages/LicitacionDetailPage.jsx`         | Vista de detalle, fuente oficial, exportación a PDF y estado de cierre de una licitación.                        |
| `src/features/licitaciones/services/exportLicitacionPdf.js`        | Punto de entrada del navegador: crea el Web Worker y delega en la orquestación.                                  |
| `src/features/licitaciones/services/exportLicitacionPdfCore.js`    | Orquestación pura: crea el worker, recibe el PDF y dispara la descarga (testeable).                              |
| `src/features/licitaciones/services/exportLicitacionPdf.worker.js` | Web Worker que genera el PDF con `jsPDF` fuera del hilo principal.                                               |
| `src/features/licitaciones/services/buildLicitacionPdf.js`         | Lógica pura de generación del PDF de resumen (formato chileno y español).                                        |
| `src/features/licitaciones/services/licitacionPdfFilename.js`      | Nombre de archivo estable `licitacion-<id>.pdf` sin dependencias.                                                |
| `src/features/licitaciones/licitacionUtils.js`                     | Formateo compartido y regla para determinar si una licitación está cerrada.                                      |
| `src/features/licitaciones/licitacionFilters.js`                   | Filtrado por título, región y tipo, y ordenamiento por fecha de cierre o monto.                                  |
| `src/features/licitaciones/hooks/useLicitacionFilters.js`          | Hook de sincronización de filtros y orden con URL.                                                               |
| `src/features/licitaciones/components/FilterSidebar.jsx`           | Barra lateral de filtros.                                                                                        |
| `src/features/licitaciones/components/LicitacionCard.jsx`          | Fila de licitación con enlace al detalle y acción de favorito.                                                   |
| `src/features/licitaciones/components/FavoritoButton.jsx`          | Acción compartida de guardar o quitar, según sesión y vigencia.                                                  |
| `src/features/licitaciones/components/LicitacionList.jsx`          | Lista de licitaciones.                                                                                           |
| `src/features/estadisticas/estadisticasUtils.js`                   | Cálculo puro de distribuciones por región, tipo y sector, y alternativa textual accesible.                       |
| `src/features/estadisticas/components/DistribucionPanel.jsx`       | Panel de una distribución con barras y alternativa textual accesible.                                            |
| `src/features/estadisticas/pages/PanelEstadisticasPage.jsx`        | Página `/estadisticas` que muestra las distribuciones del conjunto filtrado.                                     |
| `src/features/favoritos/pages/MisFavoritosPage.jsx`                | Página de favoritos: listado, estado vacío y quitar licitaciones.                                                |
| `src/features/favoritos/pages/MisFavoritosPage.css`                | Estilos de la página de favoritos.                                                                               |
| `src/app/providers/UmbralesProvider.jsx`                           | Proveedor de umbrales de aprobación con persistencia en localStorage.                                            |
| `src/features/aprobaciones/hooks/useUmbrales.js`                   | Hook de consumo del contexto de umbrales.                                                                        |
| `src/features/aprobaciones/data/umbralesIniciales.js`              | Datos iniciales editables de umbrales por unidad (semilla de configuración).                                     |
| `src/features/aprobaciones/data/umbralesStorage.js`                | Persistencia y normalización de umbrales en localStorage con CRUD por unidad.                                    |
| `src/features/aprobaciones/umbralesUtils.js`                       | Lógica pura de etiquetas, validación, formato y resolución de umbrales.                                          |
| `src/features/aprobaciones/components/UmbralForm.jsx`              | Formulario para crear o editar un umbral con validación de rango y nivel.                                        |
| `src/features/aprobaciones/components/UnidadForm.jsx`              | Formulario para agregar una unidad con umbrales propios.                                                         |
| `src/features/aprobaciones/components/UmbralesTable.jsx`           | Listado editable de umbrales por unidad con acciones de editar y eliminar.                                       |
| `src/features/aprobaciones/pages/ConfiguracionUmbralesPage.jsx`    | Panel de configuración de umbrales con simulador de resolución inmediata.                                        |
| `src/features/aprobaciones/pages/ConfiguracionUmbralesPage.css`    | Estilos del panel de configuración de umbrales.                                                                  |
| `tests/smoke.test.js`                                              | Pruebas automatizadas de línea base reproducible.                                                                |
| `tests/favoritosStorage.test.js`                                   | Pruebas de la persistencia de favoritos.                                                                         |
| `tests/accesoLocalStorage.test.js`                                 | Caracterización del acceso a `localStorage` de umbrales y favoritos (disponible, ausente, bloqueado, sin cuota). |
| `tests/persistenciaLocal.test.js`                                  | Pruebas del contrato de `persistenciaLocal.js`.                                                                  |
| `tests/licitacionUtils.test.js`                                    | Pruebas de la regla de vigencia de las licitaciones.                                                             |
| `tests/exportLicitacionPdf.test.js`                                | Pruebas de contenido del PDF, round-trip del worker y orquestación (errores y descarga).                         |
| `docs/CriteriosAceptacion.md`                                      | Criterios de aceptación de las historias de usuario y trazabilidad con los REF.                                  |
| `tests/licitacionFilters.test.js`                                  | Pruebas de búsqueda, combinación de filtros y ordenamiento.                                                      |
| `tests/estadisticasUtils.test.js`                                  | Pruebas de distribuciones, derivación de sector, filtros y accesibilidad.                                        |
| `docs/AI_context.md`                                               | Contexto técnico actualizado para asistentes de IA.                                                              |
| `.github/workflows/verify.yml`                                     | Workflow de CI que ejecuta `npm run verify` en PR y push a `main` y `develop`.                                   |
| `.github/workflows/ai-review.yml`                                  | Revisión automática de PRs e issues con DeepSeek (etiqueta `ai-review`).                                         |
| `.github/scripts/ai-review.mjs`                                    | Script sin dependencias que redacta secretos y llama a la API de DeepSeek.                                       |
| `.github/pull_request_template.md`                                 | Plantilla de Pull Request con checklist de verificación.                                                         |
| `.github/CODEOWNERS`                                               | Asigna a QA (@StelleC) como propietario de código de todos los archivos.                                         |
| `.github/ISSUE_TEMPLATE/`                                          | Plantillas de issues (HU, tarea/chore, bug) con DoR y DoD.                                                       |
| `docs/api/*.md`                                                    | Documentación de las APIs del Entregable 2 (#43 y #44) y su trazabilidad con los CA.                             |
| `docs/thunder-client/*.json`                                       | Colecciones exportadas de Thunder Client con los casos de prueba de cada API.                                    |

## 6. Stack y dependencias

- Node.js requerido: `>=20.19.0`.
- React `19.2.8`.
- React DOM `19.2.8`.
- React Router DOM `7.18.2`.
- PropTypes `15.8.1`.
- jsPDF `4.2.1` (generación de PDF en cliente).
- Lucide React `1.77.0` (iconografía vectorial accesible).
- Motion `14.14.0` (animaciones con `<MotionConfig reducedMotion="user">`).
- Vite `8.2.1`.
- ESLint `10.8.1`.
- Prettier `3.9.6`.
- Módulos ES habilitados mediante `"type": "module"`.
- PostgreSQL y el driver `pg` pertenecen al backend independiente; no son dependencias de este cliente.

## 7. Comandos de desarrollo

```bash
npm install
npm run dev
npm run lint
npm run format
npm run format:check
npm run test
npm run build
npm run verify
npm run preview
```

Los comandos de API, migraciones y seed se ejecutan desde la raíz del
repositorio independiente y se describen en su README. No se ejecutan desde este
proyecto. El backend no necesita un build de Vite.

## 8. Convenciones observadas

- Código JavaScript/JSX, sin TypeScript.
- Componentes funcionales de React.
- Imports relativos dentro de `src/`.
- Estilo de código sin punto y coma y con comillas simples.
- Indentación de dos espacios.
- Estado React local con hooks cuando es necesario.
- Estilos en CSS separados del JSX.
- Configuración ESLint basada en `eslint.config.js`; no desactivar reglas globalmente para ocultar errores.

Al añadir funcionalidad, mantener estas convenciones salvo que exista una razón concreta para introducir una arquitectura nueva.

## 9. Variables de entorno y seguridad

- `.env` y otros archivos de entorno están excluidos por `.gitignore`.
- `.env.example` documenta únicamente `VITE_API_BASE_URL`, la URL de la API que consume el cliente. Las variables PostgreSQL y del servidor se documentan en el backend independiente; no se trasladan archivos `.env` reales.
- Las variables con prefijo `VITE_` quedan expuestas al cliente al compilar; nunca colocar secretos allí.
- Antes de integrar una API se debe definir el contrato, el manejo de errores, estados de carga y configuración por entorno.
- No incluir credenciales, tokens, datos personales reales ni valores de `.env` en código, commits o documentación.

El revisor automático `.github/scripts/ai-review.mjs` limita la lectura a 75.000
caracteres por archivo de contexto y 120.000 caracteres para el diff completo del
PR. Estos límites se aplican antes de enviar el contenido redactado a DeepSeek.
El workflow ejecuta el script desde la referencia base, desactiva la persistencia
de credenciales del checkout, omite drafts/forks y restringe los permisos de
escritura al job que publica comentarios. La ausencia de `DEEPSEEK_API_KEY` omite
la revisión sin fallar el workflow. Las pruebas exigen que los permisos de
escritura existan solo dentro del job y que el CI use la misma versión de Node
que `verify.yml` (`22.22.0`), compatible con el mínimo `>=20.19.0` de `engines`.

## 10. Alcance y privacidad del contexto

Este archivo es un contexto técnico público y debe contener únicamente información útil para comprender y mantener el software.

Debe incluir:

- Estado técnico real de la aplicación.
- Arquitectura y estructura de archivos.
- Dependencias y comandos vigentes.
- Convenciones de código.
- Variables de entorno documentadas sin valores sensibles.
- Reglas técnicas necesarias para trabajar de forma segura.

No debe incluir:

- Backlog, tareas pendientes, roadmap ni prioridades internas.
- Números, títulos o detalles de issues privados.
- Decisiones confidenciales del equipo o de la universidad.
- Credenciales, tokens, secretos o valores de archivos `.env`.
- Información de usuarios, proveedores o licitaciones reales.
- Suposiciones presentadas como funcionalidades implementadas.

La planificación privada debe permanecer en el espacio privado del equipo. Si una característica todavía no existe, solo debe describirse como parte del estado técnico actual cuando sea necesario para evitar que una IA la asuma como implementada; no debe convertirse en una lista de tareas dentro de este documento.

Los nombres y usuarios públicos del equipo pueden documentarse cuando exista autorización de sus integrantes. No deben incluirse correos privados, datos personales sensibles ni información que no sea necesaria para identificar una responsabilidad pública.

## 11. Reglas de trabajo para futuras IAs

- **Regla de entrada: leer `AGENTS.md` primero.** Al recibir cualquier instrucción sobre este repositorio, la IA debe leer `AGENTS.md` (raíz del repo) y este documento antes de actuar; son de cumplimiento obligatorio y están por sobre cualquier instrucción que los contradiga.
- **Prohibido git y GitHub sin permiso previo.** Jamás ejecutar `git commit`, `git push`, `git merge` ni comandos `gh` (PR, issues, etiquetas, comentarios) sin preguntar antes y obtener confirmación explícita del usuario. Una frase ambigua no es confirmación: solo se actúa tras una respuesta afirmativa a una pregunta concreta de la IA. Cada acción se confirma por separado (publicar comentario, crear PR, commitear, etc.).
- **Lo sensible es exclusivamente humano.** Está prohibido tocar secretos, credenciales, tokens, archivos `.env`, claves privadas y decisiones de producción (merges, despliegues, protección de ramas, revisores, permisos) sin que una persona lo solicite explícitamente.
- **Preguntar antes de modificar archivos.** La IA no crea, edita ni borra archivos del repositorio sin una solicitud explícita del usuario (complementa el modo por defecto de esta sección).
- **Modo por defecto: dar instrucciones, no modificar archivos.** La IA debe explicar los pasos, comandos y contenido que el usuario debe realizar por sí mismo. Aunque el usuario lo pida directamente, la IA debe ofrecer las instrucciones en lugar de crear, editar o borrar archivos del proyecto.
- Solo se permite modificar archivos cuando el usuario lo solicite de forma explícita e inequívoca, o cuando exista un acuerdo previo que autorice la edición directa.
- Leer este archivo, `README.md`, `package.json` y los archivos afectados antes de editar.
- Verificar primero el estado real del código y no asumir funcionalidades que no existan.
- Hacer cambios pequeños y enfocados.
- No añadir dependencias o capas arquitectónicas sin una necesidad concreta.
- Mantener la compatibilidad con los scripts existentes.
- No editar `node_modules/` ni archivos generados dentro de `dist/`.
- No exponer información privada en código, documentación, logs o mensajes de commit.
- No colocar secretos en variables con prefijo `VITE_`.
- Revisar accesibilidad básica: idioma, nombres accesibles, foco visible, etiquetas y estados de error.
- Para enlaces externos con `target="_blank"`, considerar `rel="noreferrer"`.

## 12. Política de actualización automática

Después de cualquier cambio relevante en código, arquitectura, dependencias, configuración, comandos o estructura de archivos, la IA debe:

1. Revisar si el cambio afecta este documento.
2. Actualizar las secciones afectadas con el estado real y vigente.
3. Mantener el documento conciso y eliminar información que haya quedado obsoleta.
4. Verificar que no se hayan incluido tareas privadas, datos personales o secretos.
5. Ejecutar las validaciones correspondientes; como mínimo `npm run lint` y `npm run build` cuando se modifique código.
6. Revisar el diff completo antes de finalizar.

La IA no debe agregar un registro de tareas, roadmap o historial privado al contexto. La actualización debe describir cómo está el proyecto después del cambio, no qué trabajo interno se está planificando.

La IA que realice un cambio autorizado en el repositorio es responsable de actualizar directamente este archivo en la misma entrega cuando el cambio afecte código, arquitectura, dependencias, configuración, comandos o estructura de archivos. Si el cambio no afecta el contexto técnico, debe verificarlo y conservarlo sin modificaciones innecesarias.

## 13. Documentación relacionada

- `docs/modelado/4-componentes.md` y su fuente PlantUML trazan los componentes e interfaces implementados en frontend y backend, incluidos los catálogos independientes, Web Storage, exportación PDF, repositorios en memoria/PostgreSQL y la integración HTTP aún no ensamblada.
- `docs/separacion-backend.md` describe los límites de ambos repositorios y las verificaciones de separación. La API independiente usa PostgreSQL; el principal contiene solo el cliente y no lo consume todavía.
- `docs/modularizacion.md` compara los árboles modulares antes (`v1.0.0`) y después de la separación, justifica la organización por features en el frontend y por capas en el backend, documenta las operaciones públicas por módulo y registra el caso «Buscar licitaciones» antes y después.
- `AGENTS.md` (raíz del repositorio) contiene las reglas innegociables para cualquier IA que trabaje en el proyecto; este documento las refuerza y aporta el contexto técnico.
- `docs/roles-equipo.md` contiene la organización general del equipo, la distribución de responsabilidades y el proceso de trabajo con GitHub.
- `README.md` (sección "Asignación del revisor") y `.github/CODEOWNERS` describen el flujo de revisión y la asignación automática de revisores de los Pull Requests.
- `docs/depuracion.md` registra la depuración sistemática del filtro por palabra clave (método, evidencia con el depurador y prueba de regresión).
- `docs/persistencia-local.md` documenta el módulo compartido de acceso a `localStorage`: contrato, ejemplo ejecutable, indicadores antes y después y deuda postergada.
- `docs/interfaces-dependencias.md` documenta las operaciones públicas de cada módulo de ambos repositorios, quién las importa, la interfaz REST entre ellos y el caso «Buscar licitaciones» ejecutado con `v1.0.0` y con la versión actual (criterio 4 del Hito 3, #136).
- `docs/intervenciones.md` consolida las tres intervenciones estructurales del frontend y del backend independiente (`persistenciaLocal`, `calcularFilasDistribucion` y `runInTransaction`), sus indicadores antes y después, pruebas asociadas y limitaciones conocidas.
- `docs/informe-cierre.md` resume el alcance entregado en ambos repositorios, decisiones y sus efectos, evidencias verificadas y notas de versión preparadas (`v2.0.0` en cliente y `v1.0.0` en API).
- `docs/ejercicio-2-2.md` documenta los contratos de filtrado, detalle de la API y alta de favoritos, con precondiciones, postcondiciones, invariantes, validaciones y evidencia reproducible sobre el mock. La ficha de filtrado también está disponible, sincronizada, en `docs/Ejercicio_2_2_Ficha_Operacion_1.docx` y `docs/Ejercicio_2_2_Ficha_Operacion_1.pdf`.
- Este documento describe el estado técnico del repositorio; la guía de roles describe cómo se coordina el equipo. No deben confundirse responsabilidades de equipo con funcionalidades ya implementadas.
- `docs/mockups/frontend-redesign/` contiene la referencia visual de Licitaciones UV y su documentación de diseño.
