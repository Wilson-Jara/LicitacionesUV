export const VALID_REGIONES = ['valparaiso', 'metropolitana', 'biobio', 'antofagasta']
export const VALID_TIPOS = ['publica', 'privada']

function getAllParams(rawParams, key) {
  if (!rawParams) return []
  if (typeof rawParams.getAll === 'function') {
    return rawParams.getAll(key)
  }
  const value = rawParams[key]
  if (Array.isArray(value)) {
    return value
  }
  if (value !== undefined && value !== null) {
    return [value]
  }
  return []
}

/**
 * Resuelve el valor de un filtro a partir de una lista de valores (parámetros repetidos en URL).
 * Aplica la regla acordada: recorre del más reciente al más antiguo y devuelve el último
 * valor válido. Si el último es inválido pero hay uno anterior válido, conserva el anterior.
 * Si todos son inválidos, devuelve cadena vacía (elimina el filtro).
 *
 * @param {Array<unknown>} values - Lista de valores recibidos.
 * @param {Array<string>} allowedValues - Valores permitidos en minúsculas.
 * @returns {string} Valor saneado o cadena vacía.
 */
function resolveLastValidParam(values, allowedValues) {
  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i]
    if (typeof val === 'string') {
      const normalized = val.trim().toLowerCase()
      if (allowedValues.includes(normalized)) {
        return normalized
      }
    }
  }
  return ''
}

function resolveKeywordParam(values) {
  for (let i = values.length - 1; i >= 0; i--) {
    const val = values[i]
    if (typeof val === 'string') {
      return val
    }
  }
  return ''
}

/**
 * Sanea y normaliza los parámetros de filtro de forma defensiva, ya sea que provengan
 * de un objeto plano o de una instancia de `URLSearchParams`. Descarta parámetros
 * desconocidos y resuelve parámetros repetidos según la regla: evalúa del más reciente
 * al más antiguo conservando el último valor válido.
 *
 * Nota sobre `keyword`: se conserva como cadena sin trim destructivo para no entorpecer
 * la escritura en campos controlados de texto; la normalización con trim se aplica al
 * evaluar la coincidencia (`filterLicitaciones`) y al contar activos (`countActiveFilters`).
 *
 * @param {URLSearchParams|Record<string, unknown>} [rawParams={}] - Parámetros en bruto.
 * @returns {{keyword: string, region: string, tipo: string}} Filtros saneados.
 */
export function sanitizeFilterParams(rawParams = {}) {
  const keywordValues = getAllParams(rawParams, 'keyword')
  const regionValues = getAllParams(rawParams, 'region')
  const tipoValues = getAllParams(rawParams, 'tipo')

  const keyword = resolveKeywordParam(keywordValues)
  const region = resolveLastValidParam(regionValues, VALID_REGIONES)
  const tipo = resolveLastValidParam(tipoValues, VALID_TIPOS)

  return { keyword, region, tipo }
}

/**
 * Cuenta la cantidad de filtros activos. Para `keyword` se considera activa solo si
 * contiene texto después de aplicar trim.
 *
 * @param {{keyword?: string, region?: string, tipo?: string}} [filters={}] - Objeto de filtros.
 * @returns {number} Cantidad de filtros efectivamente activos (0 a 3).
 */
export function countActiveFilters(filters = {}) {
  const keyword = typeof filters?.keyword === 'string' ? filters.keyword.trim() : ''
  const region = typeof filters?.region === 'string' ? filters.region.trim() : ''
  const tipo = typeof filters?.tipo === 'string' ? filters.tipo.trim() : ''
  return [keyword, region, tipo].filter(Boolean).length
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
