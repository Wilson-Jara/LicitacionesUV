import { useMemo, useRef, useState } from 'react'
import { LicitacionList } from '../components/LicitacionList'
import { FilterSidebar } from '../components/FilterSidebar'
import { EstadoCatalogo } from '../components/EstadoCatalogo'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { useLicitaciones } from '../hooks/useLicitaciones'
import { countActiveFilters, filterLicitaciones, sortLicitaciones } from '../licitacionFilters.js'
import { getSectorLabel, getEtiquetaLabel } from '../categorias.js'
import './LicitacionesExplorerPage.css'

const sortOptions = [
  ['', 'Orden del catálogo'],
  ['fecha-asc', 'Cierre más próximo'],
  ['fecha-desc', 'Cierre más lejano'],
  ['monto-asc', 'Monto de menor a mayor'],
  ['monto-desc', 'Monto de mayor a menor'],
]

const ejemplos = ['Mantenimiento', 'Software', 'Consultoría']

function listarSectores(catalogo) {
  return [...new Set(catalogo.map((licitacion) => licitacion.sector).filter(Boolean))].sort(
    (a, b) => getSectorLabel(a).localeCompare(getSectorLabel(b), 'es'),
  )
}

function listarEtiquetas(catalogo) {
  return [
    ...new Set(
      catalogo.flatMap((licitacion) =>
        Array.isArray(licitacion.etiquetas) ? licitacion.etiquetas : [],
      ),
    ),
  ].sort((a, b) => getEtiquetaLabel(a).localeCompare(getEtiquetaLabel(b), 'es'))
}

function LicitacionesExplorerPage() {
  const { filters, setFilter, clearFilters } = useLicitacionFilters()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const searchRef = useRef(null)
  const resultsHeading = useRef(null)
  // El catálogo llega de la API una sola vez; filtros, orden y opciones de los
  // desplegables se calculan en el navegador sobre esa lista.
  const { licitaciones, estado, recargar } = useLicitaciones()
  const sectoresDisponibles = useMemo(() => listarSectores(licitaciones), [licitaciones])
  const etiquetasDisponibles = useMemo(() => listarEtiquetas(licitaciones), [licitaciones])
  const results = sortLicitaciones(filterLicitaciones(licitaciones, filters), filters.sort)
  const activeCount = countActiveFilters(filters)

  function reset() {
    clearFilters()
    searchRef.current?.focus()
  }

  return (
    <section aria-labelledby="explore-title">
      <header className="explore-hero">
        <div className="frame hero-inner">
          <div className="hero-main">
            <h1 id="explore-title">
              Explorar licitaciones<span>.</span>
            </h1>
            <p className="hero-description">Compara fechas de cierre y montos.</p>
            <form
              className="search-form"
              role="search"
              aria-label="Buscar licitaciones"
              onSubmit={(event) => {
                event.preventDefault()
                resultsHeading.current?.focus()
              }}
            >
              <label htmlFor="keyword">Buscar por título</label>
              <div className="search-field">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="10.8" cy="10.8" r="5.8" />
                  <path d="m15 15 4 4" />
                </svg>
                <input
                  ref={searchRef}
                  type="search"
                  id="keyword"
                  placeholder="Ej. mantenimiento"
                  value={filters.keyword}
                  onChange={(event) => setFilter('keyword', event.target.value)}
                />
                <button className="button button--primary" type="submit">
                  Buscar
                </button>
              </div>
              <div className="query-examples" role="group" aria-label="Búsquedas de ejemplo">
                <span aria-hidden="true">Prueba con</span>
                {ejemplos.map((ejemplo) => {
                  const value = ejemplo.toLowerCase()
                  const selected = filters.keyword.trim().toLowerCase() === value
                  return (
                    <button
                      key={ejemplo}
                      className="query-chip"
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setFilter('keyword', selected ? '' : value)}
                    >
                      {ejemplo}
                    </button>
                  )
                })}
              </div>
            </form>
          </div>
          <div className="hero-side">
            <div className="file-mark" aria-hidden="true">
              <span />
            </div>
            <aside className="demo-note" aria-labelledby="demo-title">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8v.1" />
              </svg>
              <div>
                <h2 id="demo-title">Catálogo de demostración</h2>
                <p>Las convocatorias, fechas y montos son ejemplos ficticios.</p>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <div className="frame catalog">
        <button
          type="button"
          className="button mobile-filter-toggle"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-expanded={showMobileFilters}
          aria-controls="filter-sidebar-wrapper"
        >
          {showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          {activeCount > 0 && ' (' + activeCount + ')'}
        </button>
        <div id="filter-sidebar-wrapper" className={showMobileFilters ? 'filters-open' : ''}>
          <FilterSidebar sectores={sectoresDisponibles} etiquetas={etiquetasDisponibles} />
        </div>
        <section aria-labelledby="results-title">
          <div className="results-header">
            <div>
              <h2 id="results-title" ref={resultsHeading} tabIndex={-1}>
                Resultados
              </h2>
              <p role="status">
                {results.length} de {licitaciones.length} licitaciones
              </p>
            </div>
            <div className="sort-control">
              <label htmlFor="licitaciones-sort">Ordenar por</label>
              <select
                id="licitaciones-sort"
                value={filters.sort}
                onChange={(event) => setFilter('sort', event.target.value)}
              >
                {sortOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {estado === 'listo' ? (
            <LicitacionList licitaciones={results} onResetFilters={reset} />
          ) : (
            <EstadoCatalogo estado={estado} onReintentar={recargar} />
          )}
        </section>
      </div>
    </section>
  )
}

export default LicitacionesExplorerPage
