import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import './FilterSidebar.css'

const REGIONES = [
  { value: '', label: 'Todas las regiones' },
  { value: 'valparaiso', label: 'Valparaíso (UV)' },
  { value: 'metropolitana', label: 'Metropolitana' },
  { value: 'biobio', label: 'Biobío' },
  { value: 'antofagasta', label: 'Antofagasta' },
]

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'publica', label: 'Pública' },
  { value: 'privada', label: 'Privada' },
]

export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useLicitacionFilters()

  const handleKeywordChange = (e) => setFilter('keyword', e.target.value)
  const handleRegionChange = (e) => setFilter('region', e.target.value)
  const handleTipoChange = (value) => setFilter('tipo', value)

  const activeCount = [filters.keyword, filters.region, filters.tipo].filter(Boolean).length
  const hasActiveFilters = activeCount > 0

  const activeRegionLabel = REGIONES.find((r) => r.value === filters.region)?.label
  const activeTipoLabel = TIPOS.find((t) => t.value === filters.tipo)?.label

  return (
    <aside className="filter-sidebar" aria-label="Filtros de búsqueda">
      <div className="filter-header">
        <span className="filter-overline">BÚSQUEDA Y FILTROS</span>
        <div className="filter-title-row">
          <div className="filter-title-group">
            <span className="filter-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
            </span>
            <h2 className="filter-title">Filtrar procesos</h2>
          </div>
          {hasActiveFilters && (
            <span className="filter-count-badge">
              {activeCount} activo{activeCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <div className="active-filters-chips">
          <span className="chips-label">Aplicados:</span>
          <div className="chips-list">
            {filters.keyword && (
              <span className="filter-chip">
                <span>&ldquo;{filters.keyword}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setFilter('keyword', '')}
                  aria-label="Quitar filtro de palabra clave"
                >
                  &times;
                </button>
              </span>
            )}
            {filters.region && (
              <span className="filter-chip">
                <span>{activeRegionLabel}</span>
                <button
                  type="button"
                  onClick={() => setFilter('region', '')}
                  aria-label="Quitar filtro de región"
                >
                  &times;
                </button>
              </span>
            )}
            {filters.tipo && (
              <span className="filter-chip">
                <span>{activeTipoLabel}</span>
                <button
                  type="button"
                  onClick={() => setFilter('tipo', '')}
                  aria-label="Quitar filtro de tipo"
                >
                  &times;
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="filter-group">
        <label htmlFor="keyword">PALABRA CLAVE</label>
        <div className="filter-input-wrapper">
          <span className="input-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </span>
          <input
            type="text"
            id="keyword"
            placeholder="Buscar por título..."
            value={filters.keyword}
            onChange={handleKeywordChange}
          />
          {filters.keyword && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={() => setFilter('keyword', '')}
              aria-label="Limpiar campo de búsqueda"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="region">REGIÓN GEOGRÁFICA</label>
        <div className="filter-select-wrapper">
          <select id="region" value={filters.region} onChange={handleRegionChange}>
            {REGIONES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <span className="select-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">MODALIDAD DE LICITACIÓN</span>
        <div className="filter-type-pills">
          {TIPOS.map((t) => {
            const isSelected = filters.tipo === t.value
            return (
              <button
                key={t.value}
                type="button"
                className={`type-pill ${isSelected ? 'active' : ''} ${t.value ? t.value : 'all'}`}
                onClick={() => handleTipoChange(t.value)}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <button type="button" className="clear-filters-btn" onClick={clearFilters}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
          Restablecer filtros
        </button>
      )}

      {/* Aviso Informativo Institucional (estilo Figma) */}
      <div className="filter-notice">
        <div className="filter-notice-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
        <p className="filter-notice-text">
          Las licitaciones publicadas cumplen con los estándares de compras universitarias y
          transparencia pública.
        </p>
      </div>

      <div className="filter-status-footer">
        <span className="status-dot"></span>
        <span>Filtros sincronizados con URL</span>
      </div>
    </aside>
  )
}
