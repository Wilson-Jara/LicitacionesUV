export function filterLicitaciones(licitaciones, filters) {
  const keyword = filters.keyword.trim().toLowerCase()

  return licitaciones.filter((licitacion) => {
    const matchesKeyword = !keyword || licitacion.title.toLowerCase().includes(keyword)
    const matchesRegion = !filters.region || licitacion.region === filters.region
    const matchesTipo = !filters.tipo || licitacion.type === filters.tipo

    return matchesKeyword && matchesRegion && matchesTipo
  })
}
