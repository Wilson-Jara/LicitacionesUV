function normalizeKeyword(keyword) {
  return (keyword || '').trim().toLowerCase()
}

function matchesKeyword(licitacion, keyword) {
  if (!keyword) return true
  return licitacion.title.toLowerCase().includes(keyword)
}

function matchesRegion(licitacion, region) {
  if (!region) return true
  return licitacion.region === region
}

function matchesTipo(licitacion, tipo) {
  if (!tipo) return true
  return licitacion.type === tipo
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
 * @param {Array<{title: string, region: string, type: string}>} licitaciones -
 *   Catálogo de licitaciones. Cada elemento debe exponer `title` (texto de
 *   búsqueda), `region` y `type` (claves internas comparadas por igualdad).
 * @param {{keyword?: string, region?: string, tipo?: string}} filters - Filtros
 *   a aplicar: `keyword` busca de forma insensible a mayúsculas únicamente en
 *   el título; `region` y `tipo` exigen coincidencia exacta con la clave de la
 *   licitación.
 * @returns {Array} Nueva lista con las licitaciones que cumplen todos los
 *   criterios activos; vacía si ninguna coincide. No muta el arreglo de entrada.
 */
export function filterLicitaciones(licitaciones, filters) {
  return licitaciones.filter((licitacion) => matchesAllFilters(licitacion, filters))
}
