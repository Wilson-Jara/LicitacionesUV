import { useSearchParams } from 'react-router-dom'
import { sanitizeFilterParams } from '../licitacionFilters.js'

/**
 * Hook que centraliza el estado de los filtros del explorador de licitaciones y
 * lo sincroniza con la URL mediante `useSearchParams`. Sanea defensivamente parámetros
 * inválidos o desconocidos provenientes de la URL y elimina los valores vacíos del
 * query string para mantener URLs limpias.
 *
 * @returns {{filters: {keyword: string, region: string, sector: string,
 *   etiqueta: string, tipo: string, min: string, max: string, sort: string},
 *   setFilter: Function, setAmountRange: Function,
 *   clearFilters: Function}} Estado de filtros y orden, y sus
 *   operaciones: `filters` traduce y sanea el query string (`''` si ausente o inválido),
 *   `setFilter(key, value)` actualiza un filtro u orden individual (eliminándolo de la
 *   URL cuando `value` es vacío), `setAmountRange(min, max)` actualiza ambos límites
 *   validados en una sola navegación y `clearFilters()` restablece todos los parámetros.
 * @throws {Error} Si se usa fuera de un contexto de router con search params
 *   disponible (requiere `useSearchParams` de react-router-dom).
 */
export function useLicitacionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = sanitizeFilterParams(searchParams)

  const updateFilters = (updates) => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams)
      for (const [key, value] of Object.entries(updates)) {
        if (value) nextParams.set(key, value)
        else nextParams.delete(key)
      }
      return nextParams
    })
  }

  const setFilter = (key, value) => updateFilters({ [key]: value })
  const setAmountRange = (min, max) => updateFilters({ min, max })

  const clearFilters = () => {
    setSearchParams({})
  }

  return { filters, setFilter, setAmountRange, clearFilters }
}
