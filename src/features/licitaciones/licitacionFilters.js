export const VALID_REGIONES = ['valparaiso', 'metropolitana', 'biobio', 'antofagasta']
export const VALID_TIPOS = ['publica', 'privada']

/**
 * Sanea y normaliza los parámetros de filtro de forma defensiva, ya sea que provengan
 * de un objeto plano o de una instancia de `URLSearchParams`. Descarta parámetros
 * desconocidos y normaliza a cadena vacía cualquier valor no válido para región o tipo.
 *
 * @param {URLSearchParams|Record<string, unknown>} [rawParams={}] - Parámetros en bruto.
 * @returns {{keyword: string, region: string, tipo: string}} Filtros saneados.
 */
export function sanitizeFilterParams(rawParams = {}) {
  const getParam = (key) => {
    if (!rawParams) return ''
    if (typeof rawParams.get === 'function') {
      return rawParams.get(key) || ''
    }
    return rawParams[key] || ''
  }

  const rawKeyword = getParam('keyword')
  const keyword = typeof rawKeyword === 'string' ? rawKeyword : ''

  const rawRegion = getParam('region')
  const normalizedRegion = typeof rawRegion === 'string' ? rawRegion.trim().toLowerCase() : ''
  const region = VALID_REGIONES.includes(normalizedRegion) ? normalizedRegion : ''

  const rawTipo = getParam('tipo')
  const normalizedTipo = typeof rawTipo === 'string' ? rawTipo.trim().toLowerCase() : ''
  const tipo = VALID_TIPOS.includes(normalizedTipo) ? normalizedTipo : ''

  return { keyword, region, tipo }
}

function normalizeKeyword(keyword) {
  return (keyword || '').trim().toLowerCase()
}

function matchesKeyword(licitacion, keyword) {
  if (!keyword) return true
  if (typeof licitacion?.title !== 'string') return false
  return licitacion.title.toLowerCase().includes(keyword)
}

function matchesRegion(licitacion, region) {
  if (!region) return true
  return licitacion?.region === region
}

function matchesTipo(licitacion, tipo) {
  if (!tipo) return true
  return licitacion?.type === tipo
}

function matchesAllFilters(licitacion, filters) {
  return (
    matchesKeyword(licitacion, normalizeKeyword(filters.keyword)) &&
    matchesRegion(licitacion, filters.region) &&
    matchesTipo(licitacion, filters.tipo)
  )
}

/**
 * Evalúa el catálogo de licitaciones y devuelve únicamente las que cumplen
 * todos los filtros activos. Un filtro ausente o vacío se ignora y no restringe
 * el resultado.
 *
 * @param {Array<{title: string, region: string, type: string}>} [licitaciones=[]] -
 *   Catálogo de licitaciones. Cada elemento debe exponer `title` (texto de
 *   búsqueda), `region` y `type` (claves internas comparadas por igualdad).
 * @param {{keyword?: string, region?: string, tipo?: string}} [filters={}] - Filtros
 *   a aplicar: `keyword` busca de forma insensible a mayúsculas únicamente en
 *   el título (quitando espacios externos con `trim`); `region` y `tipo` exigen coincidencia
 *   exacta con la clave de la licitación y descartan valores no válidos.
 * @returns {Array} Nueva lista con las licitaciones que cumplen todos los
 *   criterios activos; vacía si ninguna coincide. No muta el arreglo de entrada.
 */
export function filterLicitaciones(licitaciones = [], filters = {}) {
  if (!Array.isArray(licitaciones)) return []
  const safeFilters = sanitizeFilterParams(filters)
  return licitaciones.filter((licitacion) => matchesAllFilters(licitacion, safeFilters))
}
