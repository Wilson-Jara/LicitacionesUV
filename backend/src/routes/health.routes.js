import { sendJson } from '../lib/http.js'

/**
 * Registra `GET /api/health`, que informa que el servicio está activo junto con
 * su tiempo en ejecución y la hora actual. Se usa para comprobar que la API levantó.
 *
 * @param {{get: Function}} router - Enrutador creado con `createRouter()`.
 * @returns {void}
 */
export function registerHealthRoutes(router) {
  router.get('/api/health', (req, res) => {
    sendJson(res, 200, {
      status: 'ok',
      service: 'licitacionesuv-backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  })
}
