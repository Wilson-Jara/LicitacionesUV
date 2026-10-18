# Documentación de la API — LicitacionesUV

API REST del backend (`backend/`), implementada con el módulo nativo `node:http` de Node.js. Devuelve las licitaciones con el mismo contrato de datos que el mock del frontend (REF-10).

## APIs del Entregable 2

| API | Método y ruta               | Historia de usuario                       | Documentación                                      | Colección de Thunder Client                                                                              |
| --- | --------------------------- | ----------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | `GET /api/licitaciones`     | #43 Buscar licitaciones por palabra clave | [listado-licitaciones.md](listado-licitaciones.md) | [API1-buscar-licitaciones-HU43](../thunder-client/thunder-collection_API1-buscar-licitaciones-HU43.json) |
| 2   | `GET /api/licitaciones/:id` | #44 Ver el detalle de una licitación      | `detalle-licitacion.md` (llega con el PR #90)      | `thunder-collection_API2-detalle-licitacion-HU44.json` (llega con el PR #90)                             |

## Cómo levantar la API

```bash
cd backend
npm start
```

La API queda en `http://localhost:3000`. No necesita base de datos: sin `DATABASE_URL` usa los datos de ejemplo del frontend.

## Cómo ejecutar las pruebas con Thunder Client

1. Instala la extensión **Thunder Client** en VS Code.
2. En Thunder Client, abre **Collections → menú ☰ → Import** y selecciona el archivo `.json` de `docs/thunder-client/`.
3. Con la API levantada, abre el menú de la colección y elige **Run All**. Cada caso indica en su nombre la técnica que cubre: éxito, clase de equivalencia, valor límite, regla de negocio o error.

## Formato común

- Las respuestas son JSON (`Content-Type: application/json; charset=utf-8`).
- Los errores tienen la forma `{ "error": "<mensaje>" }`.
- Los errores internos (5xx) responden siempre `Error interno del servidor`, sin detalles; el detalle solo queda en el registro del servidor.
- CORS habilitado para el dev server de Vite (`http://localhost:5173` por defecto).

## Contrato de una licitación

| Campo         | Tipo   | Descripción                                |
| ------------- | ------ | ------------------------------------------ |
| `id`          | string | Identificador único (ej. `licitacion-001`) |
| `title`       | string | Título de la licitación                    |
| `amount`      | number | Monto estimado                             |
| `currency`    | string | Moneda, código ISO 4217 (ej. `CLP`)        |
| `institution` | string | Institución convocante                     |
| `closingDate` | string | Fecha de cierre, formato `YYYY-MM-DD`      |
| `type`        | string | Modalidad: `publica` o `privada`           |
| `region`      | string | Clave de la región (ej. `valparaiso`)      |
| `sourceUrl`   | string | URL de la publicación oficial              |
