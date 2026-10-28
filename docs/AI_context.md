# Contexto del proyecto para asistentes de IA

> Documento de referencia para cualquier IA que trabaje en este repositorio. Debe leerse antes de proponer o implementar cambios.

## 1. Identidad y propósito

- **Proyecto:** `LicitacionesUV` (`licitacionesuv` en `package.json`).
- **Repositorio remoto:** `https://github.com/Wilson-Jara/LicitacionesUV.git`.
- **Tipo:** aplicación web cliente.
- **Idioma de negocio/documentación:** español.
- **Propósito declarado:** crear, centralizar y gestionar licitaciones universitarias, además de comparar ofertas y ayudar a seleccionar la mejor propuesta de proveedores.
- **Estado real actual:** aplicación web en React con enrutamiento (`react-router-dom`), interfaz y módulo de acceso basados en el wireframe oficial de Figma de la Universidad de Valparaíso, explorador de licitaciones con filtros y orden sincronizados en URL y gestión de favoritos.

## 2. Estado verificado

Revisión realizada en octubre de 2026:

- `npm run lint`: pasa sin errores.
- `npm run build`: pasa correctamente y genera `dist/`.
- `npm run test`: suite de smoke tests, persistencia de favoritos, búsqueda, reglas de cierre, exportación PDF, filtros accesibles, ordenamiento por fecha/monto, distribuciones de estadísticas y API del backend pasando (124/124 tests; las pruebas de integración con PostgreSQL se omiten sin `DATABASE_URL_TEST` y corren en CI).
- `npm run format:check`: pasa con formato consistente Prettier.
- `npm run verify`: ejecuta limpia, lint, format:check, test y build con éxito.
- Integración continua con GitHub Actions (`.github/workflows/verify.yml`) que ejecuta `npm run verify` en PR y push a `main`/`develop`, con un servicio `postgres:16` para las pruebas de integración del backend.
- Asignación automática de revisores en Pull Requests mediante `.github/CODEOWNERS`, complementaria a la protección de ramas (al menos 1 aprobación de un par).
- Manejo de estado de autenticación en cliente con `AuthProvider` y hook `useAuth` (simulación de login/registro), incluyendo el control global del modal de acceso (`isAuthModalOpen`, `openAuthModal`, `closeAuthModal`).
- Gestión de favoritos con `FavoritosProvider` y hook `useFavoritos`, persistidos en `localStorage` por usuario e incluyendo `fechaGuardado` por licitación.
- Router con navegación interna (`react-router-dom` v7).
- Persistencia local y datos mock en `features/licitaciones/data/licitaciones.mock.json`.
- Backend base en `backend/`: API REST con el módulo nativo `node:http` y PostgreSQL mediante `pg`, endpoints de salud y licitaciones con el mismo contrato del mock (REF-10), configuración por entorno y pruebas con `node --test` cubiertas por `npm run test` desde la raíz.
- `node_modules/` y `dist/` excluidos del control de versiones.

## 3. Funcionalidad existente

- **Módulo de Autenticación Institucional (Figma Wireframes):**
  - Modal de autenticación (`AuthModal`) y página dedicada de acceso (`LoginPage` en `/login`).
  - Diseño _split-screen_: panel izquierdo con identidad institucional de la Universidad de Valparaíso / República de Chile, escudo, métricas en línea y colores oficiales (Azul Marino `#0E1B38` y Dorado `#C59B27`); los paneles de marca permanecen navy en ambos temas.
  - Panel derecho con formulario de acceso ("Módulo de Acceso"), campos de correo institucional y contraseña con botón para alternar visibilidad, aviso de soporte institucional, enlaces a términos e indicador de estado operativo.
  - Alternancia entre inicio de sesión y registro de cuenta.
  - Accesos sociales simulados con Google y GitHub.
  - Validación de campos con mensajes de error.
- **Explorador de Licitaciones:**
  - Header Hero institucional con sobretítulo dorado, estadísticas clave del portal y tipografía institucional.
  - Barra lateral de filtros (`FilterSidebar`) con la estética de Figma: sobretítulo dorado, buscador con limpieza rápida, búsqueda por título, selectores estilizados, botones _pills_ de tipo, chips interactivos de filtros activos con eliminación individual, aviso informativo institucional y estado sincronizado con URL.
  - Selector "Ordenar por" en la barra de resultados con fecha de cierre (ascendente/descendente) y monto (ascendente/descendente), sincronizado en la URL mediante `?sort=` y aplicado después de los filtros.
  - Tarjetas de licitación (`LicitacionCard`) con iconos vectoriales, indicador de estado por puntos (verde para Pública, ámbar para Privada), etiqueta de región, botón de acción y botón Guardar/Quitar favorito.
  - Enlace a la vista de detalle (`/licitaciones/:id`) desde el título y la acción de cada tarjeta.
  - Lista de licitaciones (`LicitacionList`) con estado vacío ilustrado y botón directo de restablecimiento de filtros.
  - Barra de resumen de resultados y alternancia de filtros para dispositivos móviles.
- **Panel de Estadísticas (`/estadisticas`):**
  - Distribuciones por región, tipo (`publica`/`privada`) y sector, calculadas como cantidad de licitaciones sobre el conjunto filtrado del explorador.
  - Se recalcula al cambiar, combinar o limpiar filtros; al quedar sin resultados muestra un estado vacío y no conserva cifras anteriores.
  - El sector se deriva de la institución (Universidad, Municipalidad, Ministerio, Banco, Empresa u Otro) porque el mock no trae un campo de etiqueta propio; cada licitación cuenta en una categoría.
  - Cada distribución ofrece una alternativa textual accesible (texto para lectores de pantalla y tabla con categorías y valores) además de las barras visuales.
- **Detalle de Licitación:**
  - La ruta `/licitaciones/:id` muestra los datos completos, estado vigente/cerrada y enlace a la fuente oficial en una pestaña nueva.
  - Botón "Exportar PDF" que descarga un resumen consolidado (`licitacion-<id>.pdf`) con identificación, organismo, fecha de cierre, presupuesto, tipo, región y enlace a las bases oficiales, en español y formatos locales chilenos.
  - La generación del PDF ocurre en un **Web Worker** (fuera del hilo principal) con `jsPDF`; el hilo principal solo recibe el `ArrayBuffer` y dispara la descarga, por lo que la navegación no se bloquea (CA6). Si el navegador no soporta Web Workers, la exportación se rechaza y se muestra un mensaje de error visible (CA5), sin ejecutar generación síncrona en el hilo principal. La carga del módulo de exportación y del worker es diferida.
  - Las licitaciones cerradas no pueden guardarse como favoritas; las que ya estaban guardadas aún pueden quitarse.
  - El campo `sourceUrl` se mantiene en el contrato de datos mock.
- **Favoritos:**
  - Botón "Guardar / Quitar" en `LicitacionCard`; sin sesión, al intentar guardar se abre el modal de autenticación (REF-02).
  - Persistencia local por usuario en `localStorage` (clave `licitacionesuv-favoritos`) con el par `idLicitacion` + `fechaGuardado`.
  - Página `/favoritos` (`MisFavoritosPage`) que lista las licitaciones guardadas con título, monto y fecha de cierre mediante `LicitacionCard`, permite quitarlas al instante y muestra estado vacío cuando no hay favoritos (o invitación a iniciar sesión si no hay sesión).
- **Barra de Navegación (`Navbar`):**
  - Cabecera institucional con isotipo UV, enlaces a licitaciones/favoritos, información de usuario logueado con avatar y botón de acceso modal.
- **Temas Claro/Oscuro:**
  - Alternancia de tema mediante atributo `data-theme` en `<html>`, con variables CSS duplicadas por tema en `src/index.css`.
  - Script inline en `index.html` que aplica el tema guardado o la preferencia del sistema antes del montaje de React, evitando el flash de tema incorrecto.
  - Persistencia de la elección en `localStorage` (clave `licitacionesuv-theme`).
  - Botón de alternancia accesible (`ThemeToggle` con `aria-label` y `aria-pressed`) en la barra de navegación.
  - Los componentes usan variables semánticas (`--card-bg`, `--surface-soft`, `--border-strong`, etc.); los hex restantes pertenecen a paneles de marca navy que permanecen oscuros en ambos temas.
- **Backend (base Fase 2):**
  - Servidor HTTP con el módulo nativo `node:http` (sin dependencias): entrada `backend/src/server.js`, composición en `backend/src/app.js` (CORS, parseo JSON, enrutamiento y manejo de errores) y enrutador propio con parámetros de ruta en `backend/src/lib/router.js`.
  - `GET /api/health` (estado del servicio) y `GET /api/licitaciones` con filtros opcionales (`keyword` solo sobre el título y sin espacios externos, `region` y `tipo`; todos sin distinguir mayúsculas) y detalle `GET /api/licitaciones/:id`.
  - Manejo de errores: cuerpo JSON inválido o `:id` mal codificado responden 400, cuerpos de más de 1 MB responden 413 y los errores 5xx devuelven un mensaje genérico (el detalle solo se registra con `console.error`).
  - Datos de licitaciones mediante un repositorio (`backend/src/data/licitaciones.repository.js`): PostgreSQL cuando existe `DATABASE_URL` y, si no, el mock del frontend en memoria, con el mismo contrato y los mismos filtros en ambos casos (REF-10). El frontend todavía lee el mock local; la migración a la API es una entrega posterior.
  - Esquema PostgreSQL con migraciones SQL numeradas en `backend/migrations/` (las 8 entidades del dominio y el catálogo de regiones), aplicadas con `npm run db:migrate` y registradas en `schema_migrations`; `npm run db:seed` carga las licitaciones desde el mock. Las tablas de CR-302 existen sin endpoints.
  - PostgreSQL 16 local con `docker-compose.yml` (raíz), que también crea la base de pruebas `licitaciones_test`.
  - CORS habilitado para el dev server de Vite y configuración por entorno en `backend/.env.example` (`PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `DATABASE_URL_TEST` y `JWT_SECRET` reservada).

## 4. Arquitectura y flujo de entrada

1. `index.html` define el documento HTML, favicon y contenedor `#root`.
2. `src/main.jsx` importa `index.css` y monta `<App />`.
3. `src/app/App.jsx` envuelve la aplicación en `ThemeProvider`, `AuthProvider`, `FavoritosProvider` y `BrowserRouter`.
4. `src/app/routes/AppRoutes.jsx` gestiona las rutas (`/login`, `/licitaciones`, `/licitaciones/:id`, `/favoritos`, `/estadisticas`, 404).
5. `src/app/layouts/PublicLayout.jsx` define el layout con la barra de navegación persistente.
6. `src/index.css` define las variables de diseño institucional (Navy, Gold, neutros, sombras y tipografía).
7. `backend/src/server.js` inicia el servidor HTTP de la API (por defecto en `http://localhost:3000`); el frontend todavía lee el mock local y la migración a la API corresponde a una entrega posterior.

## 5. Inventario de archivos relevantes

| Archivo                                                            | Responsabilidad actual                                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                                        | Reglas obligatorias para cualquier IA que trabaje en el repositorio (lectura previa a cualquier acción). |
| `index.html`                                                       | Punto de entrada HTML.                                                                                   |
| `src/main.jsx`                                                     | Punto de montaje de React.                                                                               |
| `src/app/App.jsx`                                                  | Componente raíz con proveedores de Auth, Favoritos y Router.                                             |
| `src/app/routes/AppRoutes.jsx`                                     | Enrutamiento de la aplicación (`/login`, `/licitaciones`, etc.).                                         |
| `src/app/layouts/PublicLayout.jsx`                                 | Layout principal con Navbar, contenedor de páginas y modal de autenticación global.                      |
| `src/index.css`                                                    | Variables globales de diseño institucional UV, reset y tipografía.                                       |
| `src/features/auth/components/AuthModal.jsx`                       | Modal de inicio de sesión/registro con split-screen de Figma.                                            |
| `src/features/auth/components/AuthModal.css`                       | Estilos del modal institucional.                                                                         |
| `src/features/auth/pages/LoginPage.jsx`                            | Página completa de inicio de sesión según wireframe de Figma.                                            |
| `src/features/auth/pages/LoginPage.css`                            | Estilos de la página de inicio de sesión.                                                                |
| `src/features/auth/hooks/useAuth.js`                               | Hook de consumo del contexto de autenticación.                                                           |
| `src/app/providers/AuthProvider.jsx`                               | Proveedor de estado de autenticación y del modal de acceso global.                                       |
| `src/app/providers/FavoritosProvider.jsx`                          | Proveedor de favoritos con persistencia en localStorage por usuario.                                     |
| `src/features/favoritos/hooks/useFavoritos.js`                     | Hook de consumo del contexto de favoritos.                                                               |
| `src/features/favoritos/data/favoritosStorage.js`                  | Lógica pura de persistencia de favoritos (lectura/escritura y altas/bajas).                              |
| `src/app/providers/ThemeProvider.jsx`                              | Proveedor de tema claro/oscuro con persistencia en localStorage.                                         |
| `src/shared/components/Navbar.jsx`                                 | Barra de navegación institucional con escudo y acciones de usuario.                                      |
| `src/shared/components/Navbar.css`                                 | Estilos del Navbar.                                                                                      |
| `src/shared/components/ThemeToggle.jsx`                            | Botón accesible de alternancia de tema claro/oscuro.                                                     |
| `src/shared/components/ThemeToggle.css`                            | Estilos del botón de tema.                                                                               |
| `src/shared/hooks/useTheme.js`                                     | Hook de consumo del contexto de tema.                                                                    |
| `src/features/licitaciones/pages/LicitacionesExplorerPage.jsx`     | Página principal de exploración de licitaciones con selector de orden.                                   |
| `src/features/licitaciones/pages/LicitacionDetailPage.jsx`         | Vista de detalle, fuente oficial, exportación a PDF y estado de cierre de una licitación.                |
| `src/features/licitaciones/services/exportLicitacionPdf.js`        | Punto de entrada del navegador: crea el Web Worker y delega en la orquestación.                          |
| `src/features/licitaciones/services/exportLicitacionPdfCore.js`    | Orquestación pura: crea el worker, recibe el PDF y dispara la descarga (testeable).                      |
| `src/features/licitaciones/services/exportLicitacionPdf.worker.js` | Web Worker que genera el PDF con `jsPDF` fuera del hilo principal.                                       |
| `src/features/licitaciones/services/buildLicitacionPdf.js`         | Lógica pura de generación del PDF de resumen (formato chileno y español).                                |
| `src/features/licitaciones/services/licitacionPdfFilename.js`      | Nombre de archivo estable `licitacion-<id>.pdf` sin dependencias.                                        |
| `src/features/licitaciones/licitacionUtils.js`                     | Formateo compartido y regla para determinar si una licitación está cerrada.                              |
| `src/features/licitaciones/licitacionFilters.js`                   | Filtrado por título, región y tipo, y ordenamiento por fecha de cierre o monto.                          |
| `src/features/licitaciones/hooks/useLicitacionFilters.js`          | Hook de sincronización de filtros y orden con URL.                                                       |
| `src/features/licitaciones/components/FilterSidebar.jsx`           | Barra lateral de filtros.                                                                                |
| `src/features/licitaciones/components/LicitacionCard.jsx`          | Tarjeta individual de licitación con botón Guardar/Quitar favorito.                                      |
| `src/features/licitaciones/components/LicitacionList.jsx`          | Lista de licitaciones.                                                                                   |
| `src/features/estadisticas/estadisticasUtils.js`                   | Cálculo puro de distribuciones por región, tipo y sector, y alternativa textual accesible.               |
| `src/features/estadisticas/components/DistribucionPanel.jsx`       | Panel de una distribución con barras y alternativa textual accesible.                                    |
| `src/features/estadisticas/pages/PanelEstadisticasPage.jsx`        | Página `/estadisticas` que muestra las distribuciones del conjunto filtrado.                             |
| `src/features/favoritos/pages/MisFavoritosPage.jsx`                | Página de favoritos: listado, estado vacío y quitar licitaciones.                                        |
| `src/features/favoritos/pages/MisFavoritosPage.css`                | Estilos de la página de favoritos.                                                                       |
| `tests/smoke.test.js`                                              | Pruebas automatizadas de línea base reproducible.                                                        |
| `tests/favoritosStorage.test.js`                                   | Pruebas de la persistencia de favoritos.                                                                 |
| `tests/licitacionUtils.test.js`                                    | Pruebas de la regla de vigencia de las licitaciones.                                                     |
| `tests/exportLicitacionPdf.test.js`                                | Pruebas de contenido del PDF, round-trip del worker y orquestación (errores y descarga).                 |
| `docs/CriteriosAceptacion.md`                                      | Criterios de aceptación de las historias de usuario y trazabilidad con los REF.                          |
| `tests/licitacionFilters.test.js`                                  | Pruebas de búsqueda, combinación de filtros y ordenamiento.                                              |
| `tests/estadisticasUtils.test.js`                                  | Pruebas de distribuciones, derivación de sector, filtros y accesibilidad.                                |
| `docs/AI_context.md`                                               | Contexto técnico actualizado para asistentes de IA.                                                      |
| `.github/workflows/verify.yml`                                     | Workflow de CI que ejecuta `npm run verify` en PR y push a `main` y `develop`.                           |
| `.github/workflows/ai-review.yml`                                  | Revisión automática de PRs e issues con DeepSeek (etiqueta `ai-review`).                                 |
| `.github/scripts/ai-review.mjs`                                    | Script sin dependencias que redacta secretos y llama a la API de DeepSeek.                               |
| `.github/pull_request_template.md`                                 | Plantilla de Pull Request con checklist de verificación.                                                 |
| `.github/CODEOWNERS`                                               | Asigna automáticamente los revisores de cada PR según el área modificada.                                |
| `.github/ISSUE_TEMPLATE/`                                          | Plantillas de issues (HU, tarea/chore, bug) con DoR y DoD.                                               |
| `backend/package.json`                                             | Dependencia `pg` y scripts del backend (`dev`, `start`, `test`, `db:migrate`, `db:seed`).                |
| `backend/src/server.js`                                            | Punto de entrada del servidor HTTP de la API.                                                            |
| `backend/src/app.js`                                               | Composición de la API: CORS, parseo JSON, enrutamiento y manejo de errores.                              |
| `backend/src/lib/router.js`                                        | Enrutador HTTP propio con parámetros de ruta (`:id`).                                                    |
| `backend/src/lib/http.js`                                          | Helpers de respuesta JSON, lectura de cuerpo y errores HTTP.                                             |
| `backend/src/config/env.js`                                        | Configuración por entorno con carga de `backend/.env`.                                                   |
| `backend/src/routes/health.routes.js`                              | Endpoint `GET /api/health`.                                                                              |
| `backend/src/routes/licitaciones.routes.js`                        | Endpoints de listado y detalle de licitaciones.                                                          |
| `backend/src/data/licitaciones.repository.js`                      | Repositorios de licitaciones (memoria y PostgreSQL) con el contrato del mock.                            |
| `backend/src/data/mockLicitaciones.js`                             | Carga del mock del frontend como datos de ejemplo del backend.                                           |
| `backend/src/db/`                                                  | Conexión (`pool.js`), migraciones (`migrator.js`) y carga del seed (`seed.js`).                          |
| `backend/migrations/*.sql`                                         | Migraciones SQL numeradas del esquema PostgreSQL.                                                        |
| `backend/scripts/`                                                 | Scripts `db:migrate` y `db:seed`.                                                                        |
| `backend/db/init/`                                                 | Script de inicio del contenedor que crea la base de pruebas.                                             |
| `docker-compose.yml`                                               | PostgreSQL 16 para desarrollo local.                                                                     |
| `backend/tests/*.test.js`                                          | Pruebas de la API con `node --test`.                                                                     |
| `docs/api/*.md`                                                    | Documentación de las APIs del Entregable 2 (#43 y #44) y su trazabilidad con los CA.                     |
| `docs/thunder-client/*.json`                                       | Colecciones exportadas de Thunder Client con los casos de prueba de cada API.                            |

## 6. Stack y dependencias

- Node.js requerido: `>=20.19.0`.
- React `19.2.8`.
- React DOM `19.2.8`.
- React Router DOM `7.18.2`.
- PropTypes `15.8.1`.
- jsPDF `4.2.1` (generación de PDF en cliente).
- Vite `8.2.1`.
- ESLint `10.8.1`.
- Prettier `3.9.6`.
- Módulos ES habilitados mediante `"type": "module"`.
- Backend: Node.js con el módulo nativo `node:http` y `pg` `8.23.1` como única dependencia (driver de PostgreSQL); PostgreSQL 16; la configuración ESLint declara `globals.node` para `backend/**`.

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

Backend (desde la carpeta `backend/`):

```bash
npm run dev   # servidor con recarga automática (node --watch)
npm start     # servidor
npm test      # pruebas de la API (también cubiertas por npm run verify desde la raíz)
npm run db:migrate  # aplica las migraciones pendientes (requiere DATABASE_URL)
npm run db:seed     # carga las licitaciones del mock en la base
```

PostgreSQL local (desde la raíz, con las variables `POSTGRES_*` en `.env`): `docker compose up -d`.

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
- `.env.example` (raíz) define `VITE_API_BASE_URL` (el frontend aún no la consume); `backend/.env.example` define `PORT` y `CORS_ORIGIN` y documenta, comentadas, `DATABASE_URL` (sin ella la API usa el mock), `DATABASE_URL_TEST` (debe terminar en `_test`) y `JWT_SECRET` (reservada). El `.env.example` raíz documenta además `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `POSTGRES_PORT` para Docker Compose.
- Las variables con prefijo `VITE_` quedan expuestas al cliente al compilar; nunca colocar secretos allí.
- Antes de integrar una API se debe definir el contrato, el manejo de errores, estados de carga y configuración por entorno.
- No incluir credenciales, tokens, datos personales reales ni valores de `.env` en código, commits o documentación.

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

- `AGENTS.md` (raíz del repositorio) contiene las reglas innegociables para cualquier IA que trabaje en el proyecto; este documento las refuerza y aporta el contexto técnico.
- `docs/roles-equipo.md` contiene la organización general del equipo, la distribución de responsabilidades y el proceso de trabajo con GitHub.
- `README.md` (sección "Asignación del revisor") y `.github/CODEOWNERS` describen el flujo de revisión y la asignación automática de revisores de los Pull Requests.
- `docs/depuracion.md` registra la depuración sistemática del filtro por palabra clave (método, evidencia con el depurador y prueba de regresión).
- Este documento describe el estado técnico del repositorio; la guía de roles describe cómo se coordina el equipo. No deben confundirse responsabilidades de equipo con funcionalidades ya implementadas.
