import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HttpError, sendJson } from '../lib/http.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const seedPath = resolve(currentDir, '../data/licitaciones.seed.json')
const licitaciones = JSON.parse(readFileSync(seedPath, 'utf8'))

function matchesKeyword(licitacion, keyword) {
  const termino = keyword.toLowerCase()
  return (
    licitacion.title.toLowerCase().includes(termino) ||
    licitacion.institution.toLowerCase().includes(termino)
  )
}

export function registerLicitacionesRoutes(router) {
  router.get('/api/licitaciones', (req, res) => {
    const { keyword, region, tipo } = req.query
    let resultado = licitaciones
    if (keyword) resultado = resultado.filter((l) => matchesKeyword(l, keyword))
    if (region) resultado = resultado.filter((l) => l.region === region)
    if (tipo) resultado = resultado.filter((l) => l.type === tipo)
    sendJson(res, 200, resultado)
  })

  router.get('/api/licitaciones/:id', (req, res) => {
    const licitacion = licitaciones.find((l) => l.id === req.params.id)
    if (!licitacion) throw new HttpError(404, 'Licitación no encontrada')
    sendJson(res, 200, licitacion)
  })
}
