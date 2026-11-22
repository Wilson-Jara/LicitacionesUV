# ISF225 — Diagrama de componentes

Este modelo representa el estado implementado de los repositorios
[`LicitacionesUV`](https://github.com/Wilson-Jara/LicitacionesUV) y
[`LicitacionesUV-backend`](https://github.com/Wilson-Jara/LicitacionesUV-backend).
La fuente editable está en [`4-componentes.puml`](4-componentes.puml). Se usa
PlantUML con notación UML 2: las interfaces provistas se muestran como bolas
(`P`) y las requeridas como enchufes `portout` (`R`).

![Diagrama UML de componentes de LicitacionesUV](4-componentes.svg)

> Para renderizar localmente: `plantuml docs/modelado/4-componentes.puml`. El
> archivo no necesita datos privados ni variables de entorno.

## Nota explicativa (8 líneas)

1. La SPA React usa hoy el catálogo JSON del frontend; no consume la API independiente.
2. Tema, perfil, favoritos y umbrales requieren la Web Storage API y persisten bajo claves propias en `localStorage`.
3. La exportación PDF se ejecuta en un Web Worker y requiere la biblioteca externa jsPDF.
4. El backend provee salud, listado y detalle mediante una interfaz HTTP de solo lectura.
5. `src/server.js` inyecta uno de dos adaptadores con la interfaz `list`/`findById`.
6. Sin `DATABASE_URL`, el adaptador en memoria carga el catálogo propio del backend.
7. Con `DATABASE_URL`, el adaptador PostgreSQL consulta mediante `pg.Pool` y SQL parametrizado.
8. La interfaz HTTP requerida por la SPA queda sin ensamblar porque #113 excluyó esa integración.

## Trazabilidad de componentes e interfaces

| Elemento del diagrama      | Ruta implementada                                                                                                                                                                         | Interfaz o responsabilidad comprobada                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| SPA React                  | `src/app/`, `src/features/`                                                                                                                                                               | Compone rutas, features, filtros, favoritos y umbrales.                                            |
| Catálogo local del cliente | `src/features/licitaciones/data/licitaciones.mock.json`                                                                                                                                   | JSON importado por explorador, detalle y estadísticas.                                             |
| Persistencia del navegador | `src/app/providers/ThemeProvider.jsx`, `src/features/auth/data/profileStorage.js`, `src/features/favoritos/data/favoritosStorage.js`, `src/features/aprobaciones/data/umbralesStorage.js` | Requiere `Storage.getItem/setItem`; separa tema, perfil, favoritos y umbrales bajo claves propias. |
| Exportación PDF            | `src/features/licitaciones/services/exportLicitacionPdf.js`, `exportLicitacionPdfCore.js`, `exportLicitacionPdf.worker.js`, `buildLicitacionPdf.js`                                       | Mensajes con el worker, `ArrayBuffer`, `Blob` y descarga; jsPDF genera el documento.               |
| Arranque del backend       | `LicitacionesUV-backend/src/server.js`                                                                                                                                                    | Selecciona repositorio según `DATABASE_URL` e inyecta la dependencia en `createApp`.               |
| API HTTP                   | `LicitacionesUV-backend/src/app.js`, `src/routes/health.routes.js`, `src/routes/licitaciones.routes.js`                                                                                   | Provee `GET /api/health`, `GET /api/licitaciones` y `GET /api/licitaciones/:id`.                   |
| Contrato de repositorio    | `LicitacionesUV-backend/src/data/licitaciones.repository.js`                                                                                                                              | Ambos adaptadores proveen `list(filters)` y `findById(id)`.                                        |
| Catálogo en memoria        | `LicitacionesUV-backend/src/data/mockLicitaciones.js`, `src/data/licitaciones.mock.json`                                                                                                  | Se carga únicamente cuando no se configura PostgreSQL.                                             |
| PostgreSQL                 | `LicitacionesUV-backend/src/db/pool.js`, `migrations/postgresql/`                                                                                                                         | `pg.Pool` requiere `DATABASE_URL`; el repositorio usa consultas parametrizadas.                    |

## Comprobación de conexiones

- La importación del mock del cliente se observa en las páginas de licitaciones y
  estadísticas; no existe un cliente `fetch` ni consumo de `VITE_API_BASE_URL`.
- `ThemeProvider` usa `window.localStorage`; `AuthProvider`, `FavoritosProvider`
  y `UmbralesProvider` lo entregan a sus respectivos módulos de persistencia.
- `exportLicitacionPdf.js` crea el worker; el núcleo envía `postMessage`, recibe
  el búfer y crea el `Blob`; el worker delega la composición a jsPDF.
- En el backend, `server.js` crea el adaptador PostgreSQL solo con
  `DATABASE_URL`; en caso contrario `createApp` construye el adaptador en memoria.
- `registerLicitacionesRoutes` depende solo de la interfaz del repositorio, por
  lo que ambas implementaciones son intercambiables.
- El `pg.Pool` es el único componente que importa `pg` y abre la conexión con
  PostgreSQL; el catálogo JSON del backend no depende del frontend.
- No se conecta gráficamente la SPA con la API: dibujar esa unión afirmaría una
  integración que todavía no existe.

## Evidencia de separación

La tarea [#113](https://github.com/Wilson-Jara/LicitacionesUV/issues/113) y su
evidencia de cierre confirman que el frontend conserva su mock y que la API,
PostgreSQL, migraciones, pruebas y catálogo propio viven en
`LicitacionesUV-backend`. También declaran fuera de alcance la conexión HTTP del
frontend, por lo que el diagrama muestra la interfaz requerida sin ensamblarla.
