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

// Sin repositorio explícito se usan los datos mock en memoria (pruebas y desarrollo sin BD)
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
