export function createRouter() {
  const routes = []

  function register(method, pattern, handler) {
    const keys = []
    const regex = new RegExp(
      `^${pattern.replace(/:([a-zA-Z]+)/g, (_, key) => {
        keys.push(key)
        return '([^/]+)'
      })}$`,
    )
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
      req.params[key] = decodeURIComponent(match[index + 1])
    })
    req.query = Object.fromEntries(url.searchParams)
    await route.handler(req, res)
    return true
  }

  return { get, register, handle }
}
