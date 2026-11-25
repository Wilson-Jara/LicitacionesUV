# Interfaces y dependencias entre módulos

> Criterio 4 del Hito 3 (ISF224), seguimiento de #136 · Responsable: Benjamin Lazo (@lazo1838k)
>
> Revisado sobre `develop` del frontend (`1e8b921`) y del backend (`cc2832b`) el 24-11-2026.

Este documento responde dos preguntas:

1. **Qué ofrece cada módulo y quién lo usa:** sus operaciones públicas, quién las importa y qué contrato cumplen.
2. **Si reorganizar el sistema cambió su comportamiento:** el mismo caso, «Buscar licitaciones», ejecutado con `v1.0.0` (catálogo local) y con la versión actual (catálogo desde la API), con resultados registrados.

## 1. Dirección de las dependencias

```text
Frontend (LicitacionesUV)                          Backend (LicitacionesUV-backend)

páginas (Explorador, Detalle,                      server.js ── elige el repositorio
Favoritos, Estadísticas)                               │        (PostgreSQL o memoria)
   │ useLicitaciones()                                 ▼
   ▼                                               createApp(app.js) ── CORS, errores
LicitacionesProvider ── estado cargando/listo/error    │
   │ fetchLicitaciones() / fetchLicitacion(id)         ▼
   ▼                                               registerLicitacionesRoutes
licitacionesApi.js ──── HTTP + JSON ────────────▶      │ normalizarFiltrosListado()
   (único archivo que conoce la URL)                   ▼
                                                   LicitacionesRepository: list · findById
reglas puras sin red:                                  ├─ createMemoryLicitacionesRepository
licitacionFilters, estadisticasUtils,                  └─ createPgLicitacionesRepository ── pg
persistenciaLocal, umbralesUtils
```

Reglas que se cumplen y que se comprobaron con `git grep`:

- **Ninguna página importa la fuente de datos.** En `v1.0.0`, 4 páginas importaban `licitaciones.mock.json`; hoy ninguna lo hace. El JSON queda solo como datos de prueba.
- **Un solo archivo del frontend hace `fetch` y conoce `VITE_API_BASE_URL`:** `src/features/licitaciones/services/licitacionesApi.js`.
- **Las rutas del backend no conocen la base de datos.** Solo `src/server.js` y `src/db/pool.js` importan `pg`. Las rutas reciben el repositorio por parámetro (`createApp({ licitacionesRepository })`).
- **Las reglas de negocio no dependen de React ni de la red** (`licitacionFilters.js`, `estadisticasUtils.js`, `umbralesUtils.js`), por eso se prueban con `node --test`.

| Indicador                                                      | `v1.0.0` | Actual                     |
| -------------------------------------------------------------- | -------- | -------------------------- |
| Archivos del frontend que conocen la fuente de datos           | 4        | 1 (`licitacionesApi.js`)   |
| Archivos del backend que conocen PostgreSQL (`pg`)             | —        | 2 (`server.js`, `pool.js`) |
| Archivos a editar para cambiar de dónde salen las licitaciones | 4        | 1 en cada repositorio      |

## 2. Operaciones públicas por módulo

### Frontend

| Módulo                                                                | Operaciones públicas                                                                                                                                   | Quién lo importa                                                                                                                              | Contrato                                                                                                                                                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `features/licitaciones/services/licitacionesApi.js`                   | `fetchLicitaciones()`, `fetchLicitacion(id)`, `ApiError`, `resolveApiBaseUrl()`, `DEFAULT_API_BASE_URL`                                                | `app/providers/LicitacionesProvider.jsx`, `pages/LicitacionDetailPage.jsx`, `tests/licitacionesApi.test.js`                                   | `fetchLicitaciones` devuelve la lista o lanza `ApiError` (`status` 0 si no hubo red). `fetchLicitacion` devuelve `null` con 404 y lanza ante otros errores. `fetch` es inyectable para probar sin red. |
| `app/providers/LicitacionesProvider.jsx` + `hooks/useLicitaciones.js` | `useLicitaciones()` → `{ licitaciones, estado, error, recargar }`                                                                                      | `LicitacionesExplorerPage`, `MisFavoritosPage`, `PanelEstadisticasPage` (el proveedor lo monta `app/App.jsx`)                                 | Pide el catálogo una vez. `estado` es `cargando`, `listo` o `error`; `recargar()` reintenta. Fuera del proveedor, el hook lanza un error explícito.                                                    |
| `features/licitaciones/licitacionFilters.js`                          | `sanitizeFilterParams`, `filterLicitaciones`, `sortLicitaciones`, `countActiveFilters`, `VALID_REGIONES`, `VALID_TIPOS`, `VALID_SORTS`                 | `LicitacionesExplorerPage`, `FilterSidebar`, `useLicitacionFilters`, `estadisticasUtils`, `contratoLicitaciones`, `scripts/medir-filtros.mjs` | Funciones puras: no modifican la lista recibida. Parámetro repetido → último valor válido; inválido → se ignora. La API aplica la misma regla (backend #5).                                            |
| `features/estadisticas/estadisticasUtils.js`                          | `calcularDistribuciones`, `obtenerLicitacionesFiltradas`, `calcularFilasDistribucion`, `generarAlternativaTextual`, `derivarSector`, `formatearConteo` | `PanelEstadisticasPage`, `DistribucionPanel`, `tests/estadisticasUtils.test.js`, `tests/distribucionPorcentajes.test.js`                      | `obtenerLicitacionesFiltradas` reutiliza `filterLicitaciones`, así que las estadísticas usan el mismo filtro que el explorador. Total y porcentajes se calculan una sola vez (#134).                   |
| `shared/lib/persistenciaLocal.js`                                     | `obtenerAlmacenamientoLocal`, `leerJson`, `escribirJson`, `conBloqueoEntrePestanas`                                                                    | `favoritosStorage.js`, `umbralesStorage.js`, `FavoritosProvider.jsx`, `UmbralesProvider.jsx`                                                  | Ninguna operación lanza; cada consumidor decide su respaldo (#124, `docs/persistencia-local.md`).                                                                                                      |
| `features/favoritos/data/favoritosStorage.js` + `useFavoritos`        | `getFavoritos`, `addFavorito`, `removeFavorito`, `readFavoritosStore`, `writeFavoritosStore`, `getUserId`                                              | `FavoritosProvider.jsx` (y por él, `useFavoritos` en `FavoritoButton`, `MisFavoritosPage` y `Navbar`)                                         | Funciones puras sobre el almacén `{ [usuario]: [{ idLicitacion, fechaGuardado }] }`; no duplican favoritos.                                                                                            |
| `features/aprobaciones/data/umbralesStorage.js` + `umbralesUtils.js`  | `agregarUmbral`, `actualizarUmbral`, `eliminarUmbral`, `agregarUnidad`, `guardarUmbrales`; `validarUmbral`, `resolverNivelAprobador`, `parseMontoClp`… | `UmbralesProvider.jsx` → `useUmbrales` → `ConfiguracionUmbralesPage`, que pasa los datos a `UmbralForm`, `UnidadForm` y `UmbralesTable`       | Rango `[mínimo, máximo)`, sin solapamientos por unidad y con montos enteros seguros.                                                                                                                   |
| `features/licitaciones/services/exportLicitacionPdf.js`               | `exportLicitacionPdf(licitacion)`                                                                                                                      | `LicitacionDetailPage` (importación diferida con `import()` al pulsar «Exportar PDF»)                                                         | Genera el PDF en un Web Worker con jsPDF; si no hay Workers, rechaza con un mensaje visible.                                                                                                           |

### Backend

| Módulo                                                          | Operaciones públicas                                                                                                                                                                          | Quién lo importa                                                                            | Contrato                                                                                                                             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app.js`                                                    | `createApp({ licitacionesRepository })`                                                                                                                                                       | `src/server.js` y las pruebas HTTP                                                          | Devuelve el manejador de `http.createServer`. Sin repositorio usa el de memoria. `HttpError` → su código; otro error → 500 genérico. |
| `src/data/licitaciones.repository.js`                           | **Interfaz `LicitacionesRepository`:** `list(filtros)`, `findById(id)`. Fábricas `createMemoryLicitacionesRepository`, `createPgLicitacionesRepository`; `mapLicitacionRow`, `buildListQuery` | `src/app.js` (memoria), `src/server.js` (PostgreSQL), pruebas                               | Las dos implementaciones son asíncronas y devuelven el mismo contrato de 11 campos. `findById` devuelve `null` si no existe.         |
| `src/routes/licitaciones.routes.js`                             | `registerLicitacionesRoutes(router, repository)`                                                                                                                                              | `src/app.js`                                                                                | `GET /api/licitaciones` (200, lista o `[]`) y `GET /api/licitaciones/:id` (200 o 404).                                               |
| `src/lib/filtrosListado.js`                                     | `normalizarFiltrosListado(searchParams)`, `normalizarClave`, `REGIONES_VALIDAS`, `TIPOS_VALIDOS`                                                                                              | `src/routes/licitaciones.routes.js`                                                         | Misma regla que `sanitizeFilterParams` del frontend; ambos repositorios reciben filtros ya saneados (#5).                            |
| `src/lib/montos.js`                                             | `montoDelContrato(valor)`, `MontoFueraDeRangoError`, `MONTO_MAXIMO`                                                                                                                           | `src/data/licitaciones.repository.js`                                                       | Entero de 0 a `Number.MAX_SAFE_INTEGER`; fuera de rango lanza en vez de alterar el monto (#7).                                       |
| `src/lib/router.js` · `src/lib/http.js`                         | `createRouter()` · `sendJson`, `HttpError`, `readJsonBody`                                                                                                                                    | `src/app.js` y las rutas                                                                    | Enrutador sin framework; parámetros mal codificados → 400.                                                                           |
| `src/db/migrator.js` · `seed.js` · `transaction.js` · `pool.js` | `runMigrations`, `listMigrationFiles` · `seedLicitaciones` · `runInTransaction` · `createPool`, `runWithClient`                                                                               | `scripts/migrate.js`, `scripts/seed.js`; `transaction.js` lo usan `migrator.js` y `seed.js` | Cada migración y la carga del seed corren en una transacción; si fallan, se revierten (backend #6).                                  |

### Interfaz entre los dos repositorios (REST)

| Operación                   | Respuesta                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/health`           | `200 { status: "ok", service, uptime, timestamp }`                                                                                                                                                       |
| `GET /api/licitaciones`     | `200` con una lista de licitaciones de 11 campos (`id`, `title`, `amount`, `currency`, `institution`, `closingDate`, `type`, `region`, `sector`, `etiquetas`, `sourceUrl`); `[]` si no hay coincidencias |
| `GET /api/licitaciones/:id` | `200` con una licitación, `404 { error: "Licitación no encontrada" }` o `400` si el id está mal codificado                                                                                               |

El frontend solo usa estas tres rutas, a través de `licitacionesApi.js`. Detalle completo en `LicitacionesUV-backend/docs/api/`.

## 3. Mismo caso antes y después: «Buscar licitaciones»

**Versiones comparadas:**

- **Antes:** tag `v1.0.0` del frontend (`4e7a74b`, 03-11-2026), que leía `licitaciones.mock.json` desde cada página. Se ejecutó con `git worktree add ../v1.0.0-caso v1.0.0`, `npm ci` y `npm run dev -- --port 5174`.
- **Después:** versión desplegada. El frontend es `https://licitacionesuv.vercel.app` (rama `main`, `fcde946`) y la API es `https://licitacionesuv-backend.onrender.com` (`develop`, `cc2832b`, con el repositorio en memoria).

**Ejecución:** 24-11-2026, mismos pasos en ambas versiones. La columna «Peticiones a la API» se obtuvo con `performance.getEntriesByType('resource')` en el navegador.

| #   | Paso (URL)                                       | `v1.0.0` (catálogo local)                                                                      | Actual (catálogo desde la API)                | Peticiones a la API (actual)                 |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| 1   | `/licitaciones?keyword=software`                 | 1 de 6: «Renovación de licencias de software»                                                  | 1 de 6: «Renovación de licencias de software» | `GET /api/licitaciones` (una sola vez)       |
| 2   | `/licitaciones?region=valparaiso&tipo=publica`   | 2 de 6: «Servicio de mantenimiento de infraestructura» y «Renovación de licencias de software» | 2 de 6: las mismas dos                        | ninguna nueva: filtra en el navegador        |
| 3   | `/licitaciones?region=atacama` (región inválida) | 6 de 6: el filtro se ignora                                                                    | 6 de 6: el filtro se ignora                   | ninguna nueva                                |
| 4   | `/licitaciones/licitacion-003` (detalle)         | «Consultoría en seguridad de la información»                                                   | «Consultoría en seguridad de la información»  | `GET /api/licitaciones/licitacion-003` → 200 |
| 5   | `/licitaciones/no-existe` (recurso ausente)      | «Página no encontrada»                                                                         | «Página no encontrada»                        | `GET /api/licitaciones/no-existe` → 404      |

En `v1.0.0` no hubo ninguna petición a `/api/` en ningún paso.

**Resultado:** los cinco pasos muestran el mismo resultado observable. Cambió la **fuente** de los datos, no el comportamiento: las páginas pasaron de importar el JSON a pedirlo a `useLicitaciones`, y el detalle a `fetchLicitacion`. El filtrado sigue en el navegador con las mismas funciones (`filterLicitaciones` y `sortLicitaciones`), por eso los pasos 2 y 3 no generan peticiones.

**Diferencias esperadas por la nueva dependencia de red:**

- Aparece un estado **«Cargando licitaciones…»** mientras responde la API. En el plan gratis de Render, la primera petición tras un período de inactividad tarda hasta unos 50 s (se observó durante esta ejecución: `503 Application loading`, y luego `200`).
- Si la API no responde, se muestra **«No se pudo cargar el catálogo»** con «Reintentar». En `v1.0.0` ese error no podía ocurrir.

### Cómo repetirlo

```bash
# Antes (v1.0.0)
git worktree add ../v1.0.0-caso v1.0.0
cd ../v1.0.0-caso && npm ci && npm run dev -- --port 5174
# abrir http://localhost:5174 + cada URL de la tabla

# Después (versión actual, en local)
# terminal 1, en LicitacionesUV-backend: npm start
# terminal 2, en LicitacionesUV: npm run dev
# abrir http://localhost:5173 + cada URL de la tabla
```

Al terminar: `git worktree remove ../v1.0.0-caso`.
