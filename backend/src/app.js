import { config } from './config/env.js'
import { HttpError, readJsonBody, sendJson } from './lib/http.js'
import { createRouter } from './lib/router.js'
import { registerHealthRoutes } from './routes/health.routes.js'
import { registerLicitacionesRoutes } from './routes/licitaciones.routes.js'
import { createMemoryLicitacionesRepository } from './data/licitaciones.repository.js'
import { loadMockLicitaciones } from './data/mockLicitaciones.js'

function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', config.corsOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return true
  }
  return false
}

/**
 * Arma la aplicación HTTP de la API: aplica CORS, responde el preflight `OPTIONS`,
 * lee el cuerpo JSON en `POST`/`PUT`/`PATCH`, despacha al enrutador y traduce
 * los errores a respuestas `{ error: mensaje }`.
 *
 * Decisiones no evidentes:
 * - Un `HttpError` se responde con su código y su mensaje; cualquier otro error
 *   responde 500 con un mensaje genérico, para no exponer detalles internos
 *   (el detalle solo se registra con `console.error`).
 * - El repositorio se recibe por parámetro: sin él se usan los datos de ejemplo
 *   en memoria, lo que permite probar y desarrollar sin base de datos.
 *
 * @param {object} [options]
 * @param {{list: Function, findById: Function}} [options.licitacionesRepository] -
 *   Fuente de datos de licitaciones; por defecto, el mock del frontend en memoria.
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void>}
 *   Manejador para `http.createServer`.
 */
export function createApp({
  licitacionesRepository = createMemoryLicitacionesRepository(loadMockLicitaciones()),
} = {}) {
  const router = createRouter()
  registerHealthRoutes(router)
  registerLicitacionesRoutes(router, licitacionesRepository)

  return async (req, res) => {
    try {
      if (applyCors(req, res)) return
      req.query = {}
      req.params = {}
      req.body = undefined
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        req.body = await readJsonBody(req)
      }
      const handled = await router.handle(req, res)
      if (!handled) sendJson(res, 404, { error: 'Ruta no encontrada' })
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      if (status >= 500) {
        console.error(error)
        sendJson(res, status, { error: 'Error interno del servidor' })
        return
      }
      sendJson(res, status, { error: error.message })
    }
  }
}
