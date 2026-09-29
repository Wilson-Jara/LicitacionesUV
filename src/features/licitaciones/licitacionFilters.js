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

export function filterLicitaciones(licitaciones, filters) {
  return licitaciones.filter((licitacion) => matchesAllFilters(licitacion, filters))
}
