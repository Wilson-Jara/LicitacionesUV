import { sendJson } from '../lib/http.js'

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
