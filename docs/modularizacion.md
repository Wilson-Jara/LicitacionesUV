# Modularización, interfaces públicas y comparación antes/después

> Criterios C3 y C4 · Asociado a [#161](https://github.com/Wilson-Jara/LicitacionesUV/issues/161) y [#136](https://github.com/Wilson-Jara/LicitacionesUV/issues/136) · Responsables: Wilson Jara (@Wilson-Jara) y Benjamín Lazo (@lazo1838k)

Este documento presenta la evolución modular entre la entrega `v1.0.0` y la arquitectura actual en dos repositorios independientes ([`LicitacionesUV`](https://github.com/Wilson-Jara/LicitacionesUV) y [`LicitacionesUV-backend`](https://github.com/Wilson-Jara/LicitacionesUV-backend)), justifica el estilo de organización de cada uno, ubica dónde residen presentación, reglas y datos, detalla las operaciones públicas de los módulos clave y registra la ejecución comparada del caso **«Buscar licitaciones»** antes y después.

Complementa [docs/Arquitectura.md](Arquitectura.md), [docs/separacion-backend.md](separacion-backend.md) y el diagrama UML de componentes en [docs/modelado/4-componentes.md](modelado/4-componentes.md).

---

## 1. Árbol modular antes y después

### Antes (`v1.0.0` — repositorio único con `backend/` acoplado)

En `v1.0.0`, el repositorio principal concentraba la SPA React y una carpeta `backend/` interna cuyo cargador en memoria leía directamente el JSON del frontend (`src/features/licitaciones/data/licitaciones.mock.json`), mientras la SPA aún importaba ese mismo archivo de forma estática sin pasar por HTTP ni contar con un módulo compartido de `localStorage`:

```text
LicitacionesUV/ (v1.0.0)
├── src/
│   ├── app/
│   │   ├── layouts/PublicLayout.jsx
│   │   ├── providers/{AuthProvider,FavoritosProvider,ThemeProvider,UmbralesProvider}.jsx
│   │   └── routes/{AppRoutes,NotFoundPage}.jsx
│   ├── features/
│   │   ├── auth/          (pages, components, hooks — sesión simulada en memoria)
│   │   ├── licitaciones/  (pages, components, hooks, licitacionFilters.js, licitacionUtils.js,
│   │   │                   services/*Pdf*.js y data/licitaciones.mock.json leído directo en UI)
│   │   ├── favoritos/     (pages, hooks, data/favoritosStorage.js con acceso propio a localStorage)
│   │   └── aprobaciones/  (pages, components, hooks, umbralesUtils.js, data/umbralesStorage.js)
│   └── shared/
│       ├── components/{Navbar,ThemeToggle}.jsx
│       └── hooks/useTheme.js
└── backend/               (acoplado al mismo repo, CI y package.json)
    ├── migrations/
    └── src/
        ├── app.js, server.js
        ├── routes/{health,licitaciones}.routes.js
        ├── data/{licitaciones.repository.js, mockLicitaciones.js -> leía el mock del frontend}
        └── db/{pool.js, migrator.js, seed.js -> BEGIN/COMMIT/ROLLBACK duplicados}
```

### Después (versión actual — repositorios desacoplados y contratos explícitos)

Tras separar repositorios ([#113](https://github.com/Wilson-Jara/LicitacionesUV/issues/113)), ensamblar el cliente HTTP ([#151](https://github.com/Wilson-Jara/LicitacionesUV/pull/151)) y aplicar las intervenciones de mantenimiento ([#124](https://github.com/Wilson-Jara/LicitacionesUV/issues/124), [#134](https://github.com/Wilson-Jara/LicitacionesUV/issues/134), [backend #6](https://github.com/Wilson-Jara/LicitacionesUV-backend/issues/6), [backend #5](https://github.com/Wilson-Jara/LicitacionesUV-backend/issues/5) y [backend #7](https://github.com/Wilson-Jara/LicitacionesUV-backend/issues/7)), cada repositorio instala, prueba y despliega su propio árbol sin compartir lecturas de disco:

```text
LicitacionesUV/ (Frontend SPA — React + Vite)
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── layouts/PublicLayout.jsx
│   │   ├── providers/{Theme,Auth,Favoritos,Umbrales,Licitaciones}Provider.jsx
│   │   └── routes/{AppRoutes,NotFoundPage}.jsx
│   ├── features/
│   │   ├── auth/          (components/, pages/{Login,Perfil}Page.jsx, hooks/useAuth.js, data/profileStorage.js)
│   │   ├── licitaciones/  (components/, pages/, hooks/{useLicitaciones,useLicitacionFilters}.js,
│   │   │                   licitacionFilters.js, licitacionUtils.js, categorias.js, contratoLicitaciones.js,
│   │   │                   services/{licitacionesApi.js, *LicitacionPdf*.js}, data/licitaciones.mock.json)
│   │   ├── estadisticas/  (components/DistribucionPanel.jsx, pages/PanelEstadisticasPage.jsx, estadisticasUtils.js)
│   │   ├── favoritos/     (pages/MisFavoritosPage.jsx, hooks/useFavoritos.js, data/favoritosStorage.js)
│   │   └── aprobaciones/  (components/, pages/ConfiguracionUmbralesPage.jsx, hooks/useUmbrales.js,
│   │                       umbralesUtils.js, data/{umbralesIniciales,umbralesStorage}.js)
│   └── shared/
│       ├── components/{Navbar,ThemeToggle}.jsx
│       ├── hooks/useTheme.js
│       └── lib/persistenciaLocal.js
└── tests/                 (227 pruebas unitarias y de contratos del cliente)
```

```text
LicitacionesUV-backend/ (API REST — node:http + PostgreSQL 16)
├── migrations/postgresql/ (001_esquema_inicial .. 004_montos_enteros_seguros)
├── scripts/               (migrate.js, seed.js)
├── src/
│   ├── server.js          (arranque, selección PostgreSQL vs memoria y apagado limpio)
│   ├── app.js             (ensamblaje HTTP, CORS, lectura JSON y manejo uniforme de errores)
│   ├── config/env.js      (PORT, CORS_ORIGIN, DATABASE_URL, DATABASE_URL_TEST)
│   ├── routes/            (health.routes.js, licitaciones.routes.js)
│   ├── lib/               (router.js, http.js, filtrosListado.js, montos.js)
│   ├── data/              (licitaciones.repository.js, mockLicitaciones.js, licitaciones.mock.json)
│   └── db/                (pool.js, transaction.js, migrator.js, seed.js)
└── tests/                 (suites unitarias, HTTP con dobles e integración real con PostgreSQL 16)
```

---

## 2. Separación de responsabilidades y justificación arquitectónica

### Dónde viven presentación, reglas y acceso a datos

| Responsabilidad                                 | En `LicitacionesUV` (Frontend)                                                                                                                                                                                                                              | En `LicitacionesUV-backend` (Backend)                                                                                                                                                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Presentación / frontera de entrada**          | Componentes `.jsx` y hojas `.css` en `src/app/`, `src/shared/components/` y `src/features/*/pages/` + `components/`. Hooks en `hooks/` sincronizan estado de UI y URL (`useLicitacionFilters`).                                                             | Manejador HTTP en `src/app.js` (CORS, preflight `OPTIONS`, códigos de error), enrutador `src/lib/router.js`, utilidades `src/lib/http.js` y rutas en `src/routes/*.routes.js`.                                                                                   |
| **Reglas de negocio y validación de contratos** | Módulos JavaScript puros sin dependencia de React (100 % ejecutables en `node --test`): `licitacionFilters.js`, `licitacionUtils.js`, `categorias.js`, `contratoLicitaciones.js`, `estadisticasUtils.js`, `umbralesUtils.js` y `buildLicitacionPdf.js`.     | Módulos puros de dominio y frontera en `src/lib/filtrosListado.js` (saneamiento idéntico al explorador), `src/lib/montos.js` (enteros seguros `0..MAX_SAFE_INTEGER`) e invariante de identificador en `licitaciones.routes.js`.                                  |
| **Acceso a datos y persistencia**               | Cliente HTTP `src/features/licitaciones/services/licitacionesApi.js` (inyectado en `LicitacionesProvider.jsx`), adaptadores locales `favoritosStorage.js`, `umbralesStorage.js`, `profileStorage.js` y núcleo seguro `src/shared/lib/persistenciaLocal.js`. | Contrato polimórfico `IRepositorio` en `src/data/licitaciones.repository.js` (`createPgLicitacionesRepository` sobre `src/db/pool.js` y `createMemoryLicitacionesRepository` sobre `mockLicitaciones.js`), más control transaccional en `src/db/transaction.js`. |

### ¿Por qué funcionalidades (_features_) en el frontend y capas (_layers_) en el backend?

1. **Frontend organizado por _features_ (`src/features/*`):** en una SPA cada cambio de producto (por ejemplo, categorizar por sector/etiqueta en `#94` o calcular porcentajes accesibles en `#134`) modifica al mismo tiempo la vista, el hook de estado y la función pura de ese dominio. Agrupar por funcionalidad maximiza la cohesión interna, evita que módulos no relacionados (como `aprobaciones` y `estadisticas`) se acoplen entre sí y restringe `src/shared/` únicamente a piezas transversales reales (`Navbar`, `ThemeToggle`, `persistenciaLocal`).
2. **Backend organizado por capas técnicas (`routes` → `lib` → `data` → `db`):** la API expone un conjunto acotado de recursos sin estado de interfaz y su principal eje de variación es **la infraestructura de datos** (ejecutar con PostgreSQL 16 en producción/CI o con el catálogo en memoria en desarrollo rápido y pruebas HTTP aisladas). Separar horizontalmente `routes/` respecto de `data/` mediante la interfaz `IRepositorio` permite inyectar `createMemoryLicitacionesRepository` o `createPgLicitacionesRepository` desde `server.js`/`createApp()` sin cambiar una sola línea de las rutas HTTP ni de las reglas de filtrado.

---

## 3. Operaciones públicas por módulo e importadores reales (C4)

| Módulo                                                                        | Propósito                                                                                                                    | Operaciones públicas exportadas                                                                                                                                                                       | Quién lo importa (producción y pruebas)                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/licitaciones/services/licitacionesApi.js`                       | Cliente HTTP desacoplado hacia la API independiente con `fetch` inyectable.                                                  | `fetchLicitaciones({ baseUrl, fetchImpl })`, `fetchLicitacion(id, { baseUrl, fetchImpl })`, `resolveApiBaseUrl(value)`, `ApiError`, `DEFAULT_API_BASE_URL`                                            | `src/app/providers/LicitacionesProvider.jsx` (`fetchLicitaciones`), `src/features/licitaciones/pages/LicitacionDetailPage.jsx` (`fetchLicitacion`), `tests/licitacionesApi.test.js`.                                                                                   |
| `src/features/licitaciones/hooks/useLicitaciones.js`                          | Exponer el estado del catálogo remoto (`licitaciones`, `estado`, `error`, `recargar`) a las vistas sin acoplarlas a `fetch`. | `useLicitaciones()` (respaldado por `LicitacionesProvider` en `src/app/providers/LicitacionesProvider.jsx`)                                                                                           | `LicitacionesExplorerPage.jsx`, `MisFavoritosPage.jsx`, `PanelEstadisticasPage.jsx` (`LicitacionesProvider` se monta en `src/app/App.jsx`).                                                                                                                            |
| `src/shared/lib/persistenciaLocal.js`                                         | Acceso defensivo a `localStorage` (JSON seguro y exclusión mutua entre pestañas) sin lanzar excepciones.                     | `obtenerAlmacenamientoLocal()`, `leerJson(storage, clave)`, `escribirJson(storage, clave, valor)`, `conBloqueoEntrePestanas(nombre, tarea, locks)`                                                    | `umbralesStorage.js`, `favoritosStorage.js`, `UmbralesProvider.jsx`, `FavoritosProvider.jsx`, `tests/persistenciaLocal.test.js`.                                                                                                                                       |
| `src/features/licitaciones/licitacionFilters.js`                              | Saneamiento de parámetros de URL, evaluación combinada de filtros y ordenamiento inmutable del catálogo.                     | `sanitizeFilterParams(rawParams)`, `countActiveFilters(filters)`, `filterLicitaciones(licitaciones, filters)`, `sortLicitaciones(licitaciones, sort)`, `VALID_REGIONES`, `VALID_TIPOS`, `VALID_SORTS` | `useLicitacionFilters.js`, `LicitacionesExplorerPage.jsx`, `PanelEstadisticasPage.jsx`, `FilterSidebar.jsx`, `tests/licitacionFilters.test.js`, `scripts/medir-filtros.mjs`.                                                                                           |
| `src/features/estadisticas/estadisticasUtils.js`                              | Cálculo puro de distribuciones, totales, porcentajes y alternativa textual accesible.                                        | `calcularFilasDistribucion(datos)`, `calcularDistribucionPorRegion`, `calcularDistribucionPorTipo`, `calcularDistribucionPorSector`, `generarAlternativaTextual`                                      | `DistribucionPanel.jsx`, `PanelEstadisticasPage.jsx`, `tests/distribucionPorcentajes.test.js`, `tests/estadisticasUtils.test.js`.                                                                                                                                      |
| `LicitacionesUV-backend/src/data/licitaciones.repository.js` (`IRepositorio`) | Aislar la lectura de licitaciones detrás del contrato asíncrono `IRepositorio` (`list`, `findById`) en memoria o PostgreSQL. | `createMemoryLicitacionesRepository(licitaciones)` → `{ list, findById }`, `createPgLicitacionesRepository(db)` → `{ list, findById }`, `mapLicitacionRow(row)`, `buildListQuery(filters)`            | `src/app.js` (memoria por defecto), `src/server.js` (PostgreSQL con `DATABASE_URL`), consumido por interfaz en `src/routes/licitaciones.routes.js`; probado en `tests/licitaciones.repository.test.js`, `tests/licitaciones.test.js` y `tests/db.integration.test.js`. |
| `LicitacionesUV-backend/src/lib/filtrosListado.js`                            | Normalizar `keyword`, `region` y `tipo` en la frontera HTTP con las mismas reglas del explorador React.                      | `normalizarFiltrosListado(searchParams)`, `normalizarClave(valor)`, `REGIONES_VALIDAS`, `TIPOS_VALIDOS`                                                                                               | `src/routes/licitaciones.routes.js`, `tests/filtrosListado.test.js`.                                                                                                                                                                                                   |
| `LicitacionesUV-backend/src/lib/montos.js`                                    | Garantizar que los montos `BIGINT` de PostgreSQL se entreguen en JSON como enteros exactos (`0..Number.MAX_SAFE_INTEGER`).   | `montoDelContrato(valor)`, `MontoFueraDeRangoError`, `MONTO_MAXIMO`                                                                                                                                   | `src/data/licitaciones.repository.js` (`mapLicitacionRow`), `tests/montos.test.js`.                                                                                                                                                                                    |
| `LicitacionesUV-backend/src/db/transaction.js`                                | Centralizar el ciclo `BEGIN` / `COMMIT` / `ROLLBACK` conservando errores primarios y de reversión.                           | `runInTransaction(client, operation, errorPrefix)`                                                                                                                                                    | `src/db/migrator.js`, `src/db/seed.js`, `tests/db.test.js`, `tests/db.integration.test.js`.                                                                                                                                                                            |

---

## 4. Mismo caso ejecutado antes y después: «Buscar licitaciones» (C4)

Se verificó que la operación principal del sistema (**«Buscar licitaciones»**, HU #43 / US-04 / US-12) produce exactamente los mismos resultados bajo la estructura monolítica anterior (`v1.0.0`, donde la vista filtraba directamente el archivo estático `licitaciones.mock.json`) y bajo la arquitectura modular actual (donde el cliente obtiene el catálogo vía `fetchLicitaciones` desde `GET /api/licitaciones` en `LicitacionesUV-backend` y aplica `filterLicitaciones`, además de ofrecer el mismo filtrado en el endpoint HTTP).

### Comando reproducible ejecutado (ambos repositorios en directorios hermanos)

```bash
node --input-type=module -e "
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { filterLicitaciones } from './src/features/licitaciones/licitacionFilters.js';
import { fetchLicitaciones } from './src/features/licitaciones/services/licitacionesApi.js';
import { createApp } from '../LicitacionesUV-backend/src/app.js';

const mockV1 = JSON.parse(readFileSync('./src/features/licitaciones/data/licitaciones.mock.json', 'utf8'));
const casos = [
  { nombre: 'Sin filtros (catálogo completo)', filtros: {} },
  { nombre: 'Por palabra clave (keyword=software)', filtros: { keyword: 'software' } },
  { nombre: 'Combinado (region=metropolitana, tipo=privada)', filtros: { region: 'metropolitana', tipo: 'privada' } },
  { nombre: 'Sin coincidencias (keyword=inexistente)', filtros: { keyword: 'inexistente' } },
];

const server = createServer(createApp());
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const baseUrl = 'http://127.0.0.1:' + server.address().port + '/api';

try {
  const catalogoApi = await fetchLicitaciones({ baseUrl });
  for (const c of casos) {
    const antes = filterLicitaciones(mockV1, c.filtros).map((l) => l.id);
    const despuesSpa = filterLicitaciones(catalogoApi, c.filtros).map((l) => l.id);
    const qs = new URLSearchParams(c.filtros).toString();
    const resHttp = await fetch(baseUrl + '/licitaciones' + (qs ? '?' + qs : ''));
    const despuesApi = (await resHttp.json()).map((l) => l.id);
    console.log(c.nombre, { antes, despuesSpa, despuesApi });
  }
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
"
```

### Resultados registrados (fecha de verificación: 2026-11-25)

| Subcaso de «Buscar licitaciones»                                 | Antes (`v1.0.0`: `mock` estático → `filterLicitaciones`)                                 | Después en SPA (`fetchLicitaciones` → `LicitacionesProvider` → `filterLicitaciones`)     | Después en API (`GET /api/licitaciones` → `normalizarFiltrosListado` → `IRepositorio.list`) | Paridad  |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | :------: |
| **1. Catálogo completo** (`{}`)                                  | `6` registros (`licitacion-001` .. `licitacion-006`)                                     | `6` registros (`licitacion-001` .. `licitacion-006`)                                     | `200 OK` · `6` registros (`licitacion-001` .. `licitacion-006`)                             | Idéntico |
| **2. Palabra clave** (`?keyword=software`)                       | `1` registro: `licitacion-005` («Renovación de licencias de software», `$3.200.000`)     | `1` registro: `licitacion-005` («Renovación de licencias de software», `$3.200.000`)     | `200 OK` · `1` registro: `licitacion-005` (`amount: 3200000`)                               | Idéntico |
| **3. Filtros combinados** (`?region=metropolitana&tipo=privada`) | `1` registro: `licitacion-002` («Adquisición de equipamiento tecnológico», `$8.700.000`) | `1` registro: `licitacion-002` («Adquisición de equipamiento tecnológico», `$8.700.000`) | `200 OK` · `1` registro: `licitacion-002` (`amount: 8700000`)                               | Idéntico |
| **4. Sin coincidencias** (`?keyword=inexistente`)                | `0` registros (`[]`, muestra estado vacío con restablecimiento)                          | `0` registros (`[]`, muestra estado vacío con restablecimiento)                          | `200 OK` · `[]`                                                                             | Idéntico |

> **Efecto de la modularización:** el consumidor visual (`LicitacionesExplorerPage.jsx`) pasó de importar un archivo JSON estático a invocar `useLicitaciones()`, sin alterar `useLicitacionFilters.js`, `FilterSidebar.jsx` ni `LicitacionList.jsx`, e incorporando manejo explícito de carga y error de red (`EstadoCatalogo.jsx`) cuando la API no está disponible.
