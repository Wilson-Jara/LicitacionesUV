import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HttpError, sendJson } from '../lib/http.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const seedPath = resolve(currentDir, '../data/licitaciones.seed.json')

function loadSeed() {
  try {
    return JSON.parse(readFileSync(seedPath, 'utf8'))
  } catch (error) {
    throw new Error(`No se pudo cargar el seed de licitaciones (${seedPath}): ${error.message}`, {
      cause: error,
    })
  }
}

const licitaciones = loadSeed()

function equalsIgnoreCase(value, expected) {
  return String(value).toLowerCase() === expected.toLowerCase()
}

// CA1 de #43: la palabra clave se busca solo en el título, igual que el frontend
function matchesKeyword(licitacion, keyword) {
  return licitacion.title.toLowerCase().includes(keyword.toLowerCase())
}

export function registerLicitacionesRoutes(router) {
  router.get('/api/licitaciones', (req, res) => {
    const { region, tipo } = req.query
    // Igual que el buscador del frontend: se ignoran los espacios al inicio y al final
    const keyword = (req.query.keyword || '').trim()
    let resultado = licitaciones
    if (keyword) resultado = resultado.filter((l) => matchesKeyword(l, keyword))
    if (region) resultado = resultado.filter((l) => equalsIgnoreCase(l.region, region))
    if (tipo) resultado = resultado.filter((l) => equalsIgnoreCase(l.type, tipo))
    sendJson(res, 200, resultado)
  })

  router.get('/api/licitaciones/:id', (req, res) => {
    const licitacion = licitaciones.find((l) => l.id === req.params.id)
    if (!licitacion) throw new HttpError(404, 'Licitación no encontrada')
    sendJson(res, 200, licitacion)
  })
}
