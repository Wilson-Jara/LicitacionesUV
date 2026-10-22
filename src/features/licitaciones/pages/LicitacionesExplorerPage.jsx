import { useState, useMemo } from 'react'
import { LicitacionList } from '../components/LicitacionList'
import { FilterSidebar } from '../components/FilterSidebar'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { filterLicitaciones, countActiveFilters, sortLicitaciones } from '../licitacionFilters.js'
import mockData from '../data/licitaciones.mock.json'
import './LicitacionesExplorerPage.css'

const SORT_OPTIONS = [
  { value: '', label: 'Orden por defecto' },
  { value: 'fecha-asc', label: 'Fecha de cierre: más próxima' },
  { value: 'fecha-desc', label: 'Fecha de cierre: más lejana' },
  { value: 'monto-asc', label: 'Monto: menor a mayor' },
  { value: 'monto-desc', label: 'Monto: mayor a menor' },
]

function LicitacionesExplorerPage() {
  const { filters, setFilter, clearFilters } = useLicitacionFilters()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredData = useMemo(() => {
    return sortLicitaciones(filterLicitaciones(mockData, filters), filters.sort)
  }, [filters])

  const activeFiltersCount = countActiveFilters(filters)

  return (
    <section className="licitaciones-explorer">
      {/* Hero Header Institucional UV */}
      <header className="licitaciones-hero">
        <div className="hero-content">
          <span className="hero-overline">PORTAL DE ADQUISICIONES INSTITUCIONALES</span>
          <h1 className="hero-title">Explorar Licitaciones Vigentes</h1>
          <p className="hero-description">
            Consulta, seguimiento y postulación a procesos de compras y contrataciones de la
            Universidad de Valparaíso y organismos del sector público y privado.
          </p>
          <div className="hero-kpis">
            <div className="hero-kpi-item">
              <span className="kpi-val">{mockData.length}</span>
              <span className="kpi-lbl">Total Procesos</span>
            </div>
            <div className="hero-kpi-divider"></div>
            <div className="hero-kpi-item">
              <span className="kpi-val">{filteredData.length}</span>
              <span className="kpi-lbl">Coincidencias</span>
            </div>
            <div className="hero-kpi-divider"></div>
            <div className="hero-kpi-item">
              <span className="kpi-val">100%</span>
              <span className="kpi-lbl">Transparencia</span>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Resumen y Control Móvil */}
      <div className="licitaciones-results-bar">
        <div className="results-counter" role="status" aria-live="polite" aria-atomic="true">
          Mostrando <strong>{filteredData.length}</strong> de <strong>{mockData.length}</strong>{' '}
          licitaciones disponibles
        </div>

        <div className="results-actions">
          <div className="sort-control">
            <label className="sort-label" htmlFor="licitaciones-sort">
              Ordenar por
            </label>
            <select
              id="licitaciones-sort"
              className="sort-select"
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className={`mobile-filter-toggle ${showMobileFilters ? 'active' : ''}`}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            aria-expanded={showMobileFilters}
            aria-controls="filter-sidebar-wrapper"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
            </svg>
            <span>{showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
            {activeFiltersCount > 0 && (
              <span className="mobile-filter-badge">{activeFiltersCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="licitaciones-layout">
        <div
          id="filter-sidebar-wrapper"
          className={`filter-sidebar-wrapper ${showMobileFilters ? 'mobile-open' : ''}`}
        >
          <FilterSidebar />
        </div>
        <div className="licitaciones-content">
          <LicitacionList licitaciones={filteredData} onResetFilters={clearFilters} />
        </div>
      </div>
    </section>
  )
}

export default LicitacionesExplorerPage
