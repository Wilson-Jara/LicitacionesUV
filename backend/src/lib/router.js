import { HttpError } from './http.js'

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function decodeParam(value) {
  try {
    return decodeURIComponent(value)
  } catch (error) {
    if (error instanceof URIError) throw new HttpError(400, 'Parámetro de ruta mal codificado')
    throw error
  }
}

export function createRouter() {
  const routes = []

  function register(method, pattern, handler) {
    const keys = []
    // split con grupo de captura: los índices impares son nombres de parámetros
    const source = pattern
      .split(/:([a-zA-Z]+)/)
      .map((segment, index) => {
        if (index % 2 === 0) return escapeRegex(segment)
        keys.push(segment)
        return '([^/]+)'
      })
      .join('')
    const regex = new RegExp(`^${source}$`)
    routes.push({ method: method.toUpperCase(), regex, keys, handler })
  }

  function get(pattern, handler) {
    register('GET', pattern, handler)
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost')
    const route = routes.find(
      (candidate) =>
        candidate.method === req.method.toUpperCase() && candidate.regex.test(url.pathname),
    )
    if (!route) return false
    const match = url.pathname.match(route.regex)
    req.params = {}
    route.keys.forEach((key, index) => {
      req.params[key] = decodeParam(match[index + 1])
    })
    req.query = Object.fromEntries(url.searchParams)
    await route.handler(req, res)
    return true
  }

  return { get, register, handle }
}
