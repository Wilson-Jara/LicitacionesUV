import assert from 'node:assert/strict'
import { HttpError, sendJson } from '../lib/http.js'

/**
 * Registra las rutas de licitaciones:
 * - `GET /api/licitaciones`: listado con filtros opcionales `keyword`, `region` y
 *   `tipo` (HU #43). La palabra clave se recorta (`trim`), igual que en el buscador
 *   del frontend. Sin coincidencias responde 200 con `[]`.
 * - `GET /api/licitaciones/:id`: detalle de una licitación (HU #44); 404 si no existe.
 *
 * El repositorio se recibe por parámetro para poder usar PostgreSQL en
 * producción y uno en memoria en las pruebas.
 *
 * @param {{get: Function}} router - Enrutador creado con `createRouter()`.
 * @param {{list: Function, findById: Function}} repository - Fuente de datos de licitaciones.
 * @returns {void}
 */
export function registerLicitacionesRoutes(router, repository) {
  router.get('/api/licitaciones', async (req, res) => {
    const { region, tipo } = req.query
    // Igual que el buscador del frontend: se ignoran los espacios al inicio y al final
    const keyword = (req.query.keyword || '').trim()
    sendJson(res, 200, await repository.list({ keyword, region, tipo }))
  })

  router.get('/api/licitaciones/:id', async (req, res) => {
    const licitacion = await repository.findById(req.params.id)
    if (!licitacion) throw new HttpError(404, 'Licitación no encontrada')
    // Invariante: el repositorio devuelve la licitación solicitada.
    assert.equal(
      licitacion.id,
      req.params.id,
      'Invariante: el repositorio devolvió una licitación con un id distinto al solicitado',
    )
    sendJson(res, 200, licitacion)
  })
}
