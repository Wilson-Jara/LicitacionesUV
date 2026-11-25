import { normalizarCategoria, VALID_ETIQUETAS, VALID_SECTORES } from './categorias.js'

/** Claves de región aceptadas en los filtros; cualquier otro valor se descarta. */
export const VALID_REGIONES = ['valparaiso', 'metropolitana', 'biobio', 'antofagasta']

/** Tipos de licitación aceptados en los filtros (`publica` y `privada`). */
export const VALID_TIPOS = ['publica', 'privada']

/** Criterios de orden aceptados en `?sort=`; cualquier otro valor se descarta. */
export const VALID_SORTS = ['fecha-asc', 'fecha-desc', 'monto-asc', 'monto-desc']

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
      const normalized = normalizarCategoria(val)
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

export function normalizeAmountBound(value) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d+)?$/.test(normalized) || !Number.isFinite(Number(normalized))) return ''
  return normalized
}

function resolveAmountRange(rawParams) {
  const min = getAllParams(rawParams, 'min').map(normalizeAmountBound).findLast(Boolean) || ''
  const max = getAllParams(rawParams, 'max').map(normalizeAmountBound).findLast(Boolean) || ''
  if (min && max && Number(min) > Number(max)) return { min: '', max: '' }
  return { min, max }
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
 * @returns {{keyword: string, region: string, sector: string, etiqueta: string,
 *   tipo: string, min: string, max: string, sort: string}} Filtros y orden saneados.
 */
export function sanitizeFilterParams(rawParams = {}) {
  const keywordValues = getAllParams(rawParams, 'keyword')
  const regionValues = getAllParams(rawParams, 'region')
  const sectorValues = getAllParams(rawParams, 'sector')
  const etiquetaValues = getAllParams(rawParams, 'etiqueta')
  const tipoValues = getAllParams(rawParams, 'tipo')
  const sortValues = getAllParams(rawParams, 'sort')

  const keyword = resolveKeywordParam(keywordValues)
  const region = resolveLastValidParam(regionValues, VALID_REGIONES)
  const sector = resolveLastValidParam(sectorValues, VALID_SECTORES)
  const etiqueta = resolveLastValidParam(etiquetaValues, VALID_ETIQUETAS)
  const tipo = resolveLastValidParam(tipoValues, VALID_TIPOS)
  const sort = resolveLastValidParam(sortValues, VALID_SORTS)

  return { keyword, region, sector, etiqueta, tipo, ...resolveAmountRange(rawParams), sort }
}

/**
 * Cuenta la cantidad de filtros activos. Para `keyword` se considera activa solo si
 * contiene texto después de aplicar trim.
 *
 * @param {{keyword?: string, region?: string, sector?: string, etiqueta?: string,
 *   tipo?: string, min?: string, max?: string}} [filters={}] - Objeto de filtros.
 * @returns {number} Cantidad de filtros efectivamente activos (0 a 6).
 */
export function countActiveFilters(filters = {}) {
  const keyword = typeof filters?.keyword === 'string' ? filters.keyword.trim() : ''
  const region = typeof filters?.region === 'string' ? filters.region.trim() : ''
  const sector = typeof filters?.sector === 'string' ? filters.sector.trim() : ''
  const etiqueta = typeof filters?.etiqueta === 'string' ? filters.etiqueta.trim() : ''
  const tipo = typeof filters?.tipo === 'string' ? filters.tipo.trim() : ''
  const { min, max } = resolveAmountRange(filters)
  return [keyword, region, sector, etiqueta, tipo, min || max].filter(Boolean).length
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

function matchesSector(licitacion, sector) {
  if (!sector) return true
  return normalizarCategoria(licitacion?.sector) === sector
}

function matchesEtiqueta(licitacion, etiqueta) {
  if (!etiqueta) return true
  if (!Array.isArray(licitacion?.etiquetas)) return false
  return licitacion.etiquetas.some((tag) => normalizarCategoria(tag) === etiqueta)
}

function matchesTipo(licitacion, tipo) {
  if (!tipo) return true
  return licitacion?.type === tipo
}

function matchesAmount(licitacion, min, max) {
  if (!min && !max) return true
  const { amount, currency = 'CLP' } = licitacion ?? {}
  if (currency !== 'CLP' || !Number.isFinite(amount) || amount < 0) return false
  return (!min || amount >= Number(min)) && (!max || amount <= Number(max))
}

function matchesAllFilters(licitacion, filters) {
  return (
    matchesKeyword(licitacion, normalizeKeyword(filters.keyword)) &&
    matchesRegion(licitacion, filters.region) &&
    matchesSector(licitacion, filters.sector) &&
    matchesEtiqueta(licitacion, filters.etiqueta) &&
    matchesTipo(licitacion, filters.tipo) &&
    matchesAmount(licitacion, filters.min, filters.max)
  )
}

/**
 * Evalúa el catálogo de licitaciones y devuelve únicamente las que cumplen
 * todos los filtros activos. Un filtro ausente o vacío se ignora y no restringe
 * el resultado.
 *
 * @param {Array<{title: string, region: string, sector?: string,
 *   etiquetas?: Array<string>, type: string, amount?: number, currency?: string}>} [licitaciones=[]] -
 *   Catálogo de licitaciones. Cada elemento debe exponer `title` (texto de
 *   búsqueda), `region` y `type` (claves internas comparadas por igualdad);
 *   `sector` y `etiquetas` son opcionales y se comparan normalizados.
 * @param {{keyword?: string, region?: string, sector?: string, etiqueta?: string,
 *   tipo?: string, min?: string, max?: string}} [filters={}] - Filtros a aplicar: `keyword` busca de forma
 *   insensible a mayúsculas únicamente en el título (quitando espacios externos
 *   con `trim`); `region`, `sector`, `etiqueta` y `tipo` exigen coincidencia
 *   exacta con la clave de la licitación, sin distinguir mayúsculas ni tildes,
 *   y descartan valores no válidos. `min` y `max` son límites inclusivos en CLP.
 * @returns {Array} Nueva lista con las licitaciones que cumplen todos los
 *   criterios activos; vacía si ninguna coincide. No muta el arreglo de entrada.
 */
export function filterLicitaciones(licitaciones = [], filters = {}) {
  if (!Array.isArray(licitaciones)) return []
  const safeFilters = sanitizeFilterParams(filters)
  return licitaciones.filter((licitacion) => matchesAllFilters(licitacion, safeFilters))
}

function getSortableValue(licitacion, field) {
  if (field === 'monto') {
    const rawValue = licitacion?.amount
    if (typeof rawValue === 'string' && rawValue.trim() === '') return null
    const numero = typeof rawValue === 'string' ? Number(rawValue) : rawValue
    return Number.isFinite(numero) ? numero : null
  }
  const rawDate = licitacion?.closingDate
  if (typeof rawDate !== 'string' || Number.isNaN(Date.parse(rawDate))) return null
  return Date.parse(rawDate)
}

function compareById(aId, bId) {
  const a = String(aId ?? '')
  const b = String(bId ?? '')
  if (a === b) return 0
  return a.localeCompare(b)
}

function compareSortableValues(aValue, bValue, directionFactor, aId, bId) {
  const aIsValid = aValue !== null
  const bIsValid = bValue !== null
  if (!aIsValid && !bIsValid) return 0
  if (!aIsValid) return 1
  if (!bIsValid) return -1
  if (aValue < bValue) return -directionFactor
  if (aValue > bValue) return directionFactor
  return compareById(aId, bId)
}

/**
 * Ordena una lista de licitaciones según el criterio indicado, sin mutar la
 * lista original. Los elementos sin fecha o monto válidos se ubican siempre al
 * final, independientemente de la dirección. Un criterio ausente o inválido
 * conserva el orden original.
 *
 * @param {Array<{closingDate?: string, amount?: number}>} [licitaciones=[]] -
 *   Lista a ordenar.
 * @param {string} [sort=''] - Criterio de orden: `fecha-asc`, `fecha-desc`,
 *   `monto-asc` o `monto-desc`.
 * @returns {Array} Nueva lista ordenada.
 */
export function sortLicitaciones(licitaciones = [], sort = '') {
  if (!Array.isArray(licitaciones)) return []
  const criterio = typeof sort === 'string' ? sort.trim().toLowerCase() : ''
  if (!VALID_SORTS.includes(criterio)) return [...licitaciones]

  const [field, direccion] = criterio.split('-')
  const directionFactor = direccion === 'asc' ? 1 : -1

  return [...licitaciones].sort((a, b) =>
    compareSortableValues(
      getSortableValue(a, field),
      getSortableValue(b, field),
      directionFactor,
      a?.id,
      b?.id,
    ),
  )
}
