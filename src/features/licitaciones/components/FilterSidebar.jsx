import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import './FilterSidebar.css'

export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useLicitacionFilters()

  const handleKeywordChange = (e) => setFilter('keyword', e.target.value)
  const handleRegionChange = (e) => setFilter('region', e.target.value)
  const handleTipoChange = (e) => setFilter('tipo', e.target.value)

  const hasActiveFilters = filters.keyword || filters.region || filters.tipo

  return (
    <aside className="filter-sidebar">
      <h2>Filtros</h2>

      <div className="filter-group">
        <label htmlFor="keyword">Buscar</label>
        <input
          type="text"
          id="keyword"
          placeholder="Palabra clave..."
          value={filters.keyword}
          onChange={handleKeywordChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="region">Región</label>
        <select id="region" value={filters.region} onChange={handleRegionChange}>
          <option value="">Todas las regiones</option>
          <option value="antofagasta">Antofagasta</option>
          <option value="valparaiso">Valparaíso</option>
          <option value="metropolitana">Metropolitana</option>
          <option value="biobio">Biobío</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="tipo">Tipo</label>
        <select id="tipo" value={filters.tipo} onChange={handleTipoChange}>
          <option value="">Todos los tipos</option>
          <option value="publica">Pública</option>
          <option value="privada">Privada</option>
        </select>
      </div>

      {hasActiveFilters ? (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Limpiar filtros
        </button>
      ) : null}
    </aside>
  )
}
