import { useSearchParams } from 'react-router-dom'
import { sanitizeFilterParams } from '../licitacionFilters.js'

/**
 * Hook que centraliza el estado de los filtros del explorador de licitaciones y
 * lo sincroniza con la URL mediante `useSearchParams`. Sanea defensivamente parámetros
 * inválidos o desconocidos provenientes de la URL y elimina los valores vacíos del
 * query string para mantener URLs limpias.
 *
 * @returns {{filters: {keyword: string, region: string, tipo: string},
 *   setFilter: Function, clearFilters: Function}} Estado de filtros y sus
 *   operaciones: `filters` traduce y sanea el query string (`''` si ausente o inválido),
 *   `setFilter(key, value)` actualiza un filtro individual (eliminándolo de la
 *   URL cuando `value` es vacío) y `clearFilters()` restablece todos los filtros.
 * @throws {Error} Si se usa fuera de un contexto de router con search params
 *   disponible (requiere `useSearchParams` de react-router-dom).
 */
export function useLicitacionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = sanitizeFilterParams(searchParams)

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
