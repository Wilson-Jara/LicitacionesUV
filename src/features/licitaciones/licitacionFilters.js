export function filterLicitaciones(licitaciones, filters) {
  const keyword = (filters.keyword || '').trim().toLowerCase()

  return licitaciones.filter((licitacion) => {
    return (
      (!keyword || licitacion.title.toLowerCase().includes(keyword)) &&
      (!filters.region || licitacion.region === filters.region) &&
      (!filters.tipo || licitacion.type === filters.tipo)
    )
  })
}
