import { useSearchParams } from 'react-router-dom'

/**
 * Hook que centraliza el estado de los filtros del explorador de licitaciones y
 * lo sincroniza con la URL mediante `useSearchParams`. Los valores vacíos se
 * eliminan del query string para mantener URLs limpias.
 *
 * @returns {{filters: {keyword: string, region: string, tipo: string},
 *   setFilter: Function, clearFilters: Function}} Estado de filtros y sus
 *   operaciones: `filters` traduce el query string a valores (`''` si ausente),
 *   `setFilter(key, value)` actualiza un filtro individual (eliminándolo de la
 *   URL cuando `value` es vacío) y `clearFilters()` restablece todos los filtros.
 * @throws {Error} Si se usa fuera de un contexto de router con search params
 *   disponible (requiere `useSearchParams` de react-router-dom).
 */
export function useLicitacionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    keyword: searchParams.get('keyword') || '',
    region: searchParams.get('region') || '',
    tipo: searchParams.get('tipo') || '',
  }

  const setFilter = (key, value) => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams)
      if (!value) {
        nextParams.delete(key)
        return nextParams
      }
      nextParams.set(key, value)
      return nextParams
    })
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  return { filters, setFilter, clearFilters }
}
