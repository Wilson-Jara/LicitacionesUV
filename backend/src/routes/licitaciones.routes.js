import { HttpError, sendJson } from '../lib/http.js'

export function registerLicitacionesRoutes(router, repository) {
  router.get('/api/licitaciones', async (req, res) => {
    const { keyword, region, tipo } = req.query
    sendJson(res, 200, await repository.list({ keyword, region, tipo }))
  })

  router.get('/api/licitaciones/:id', async (req, res) => {
    const licitacion = await repository.findById(req.params.id)
    if (!licitacion) throw new HttpError(404, 'Licitación no encontrada')
    sendJson(res, 200, licitacion)
  })
}
