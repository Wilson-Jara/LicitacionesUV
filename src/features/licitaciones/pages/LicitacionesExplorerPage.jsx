import { useState, useMemo } from 'react'
import { LicitacionList } from '../components/LicitacionList'
import { FilterSidebar } from '../components/FilterSidebar'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { filterLicitaciones } from '../licitacionFilters.js'
import mockData from '../data/licitaciones.mock.json'
import './LicitacionesExplorerPage.css'

function LicitacionesExplorerPage() {
  const { filters, clearFilters } = useLicitacionFilters()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredData = useMemo(() => {
    return filterLicitaciones(mockData, filters)
  }, [filters])

  const activeFiltersCount = [filters.keyword, filters.region, filters.tipo].filter(Boolean).length

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
        <div className="results-counter">
          Mostrando <strong>{filteredData.length}</strong> de <strong>{mockData.length}</strong>{' '}
          licitaciones disponibles
        </div>

        <button
          type="button"
          className={`mobile-filter-toggle ${showMobileFilters ? 'active' : ''}`}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-expanded={showMobileFilters}
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

      <div className="licitaciones-layout">
        <div className={`filter-sidebar-wrapper ${showMobileFilters ? 'mobile-open' : ''}`}>
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
