import { useMemo, useRef, useState } from 'react'
import { Calendar, CheckCircle2, ChevronDown, SlidersHorizontal, Wallet } from 'lucide-react'
import { LicitacionList } from '../components/LicitacionList'
import { FilterSidebar } from '../components/FilterSidebar'
import { EstadoCatalogo } from '../components/EstadoCatalogo'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { useLicitaciones } from '../hooks/useLicitaciones'
import { countActiveFilters, filterLicitaciones, sortLicitaciones } from '../licitacionFilters.js'
import { formatLicitacionAmount, isLicitacionCerrada } from '../licitacionUtils.js'
import { getSectorLabel, getEtiquetaLabel } from '../categorias.js'
import './LicitacionesExplorerPage.css'

const sortOptions = [
  ['', 'Orden del catálogo'],
  ['fecha-asc', 'Cierre más próximo'],
  ['fecha-desc', 'Cierre más lejano'],
  ['monto-asc', 'Monto de menor a mayor'],
  ['monto-desc', 'Monto de mayor a menor'],
]

function formatShortDate(closingDate) {
  if (!closingDate) return '—'
  const date = new Date(`${closingDate}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function getNextClosingLabel(licitaciones) {
  const vigentes = licitaciones
    .filter((item) => !isLicitacionCerrada(item.closingDate))
    .sort((a, b) => a.closingDate.localeCompare(b.closingDate))
  if (vigentes.length > 0) return formatShortDate(vigentes[0].closingDate)
  if (!licitaciones.length) return '—'
  const latest = [...licitaciones].sort((a, b) => b.closingDate.localeCompare(a.closingDate))
  return formatShortDate(latest[0].closingDate)
}

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
  const vigentesCount = results.filter((item) => !isLicitacionCerrada(item.closingDate)).length
  const totalAmount = results.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const ratioVigente = results.length ? vigentesCount / results.length : 0
  const nextClosing = getNextClosingLabel(results)

  function reset() {
    clearFilters()
    searchRef.current?.focus()
  }

  return (
    <section className="explorer-workspace" aria-labelledby="explore-title">
      <div className="explorer-shell">
        <button
          type="button"
          className="button mobile-filter-toggle"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-expanded={showMobileFilters}
          aria-controls="filter-sidebar-wrapper"
        >
          <span className="mobile-filter-toggle__label">
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span>
              {showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              {activeCount > 0 && ' (' + activeCount + ')'}
            </span>
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={
              showMobileFilters
                ? 'mobile-filter-toggle__chevron is-open'
                : 'mobile-filter-toggle__chevron'
            }
          />
        </button>

        <div
          id="filter-sidebar-wrapper"
          className={showMobileFilters ? 'explorer-rail filters-open' : 'explorer-rail'}
        >
          <FilterSidebar
            searchRef={searchRef}
            onSearchSubmit={() => resultsHeading.current?.focus()}
            sectores={sectoresDisponibles}
            etiquetas={etiquetasDisponibles}
          />
        </div>

        <div className="explorer-main">
          <header className="results-header">
            <div className="results-header__title">
              <h1 id="explore-title" ref={resultsHeading} tabIndex={-1}>
                Explorador de licitaciones
              </h1>
              <p role="status">
                {results.length} de {licitaciones.length} convocatorias visibles
              </p>
            </div>
            <div className="sort-control">
              <label htmlFor="licitaciones-sort">Ordenar:</label>
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
          </header>

          <dl className="workspace-kpis" aria-label="Resumen de resultados visibles">
            <div className="workspace-kpi workspace-kpi--progress">
              <div className="workspace-kpi__row">
                <span className="workspace-kpi__icon" aria-hidden="true">
                  <CheckCircle2 size={20} />
                </span>
                <div className="workspace-kpi__text">
                  <dt>Vigentes</dt>
                  <dd>
                    {vigentesCount} de {results.length}
                  </dd>
                </div>
              </div>
              <div className="workspace-kpi__track" aria-hidden="true">
                <span
                  className="workspace-kpi__fill"
                  style={{ transform: `scaleX(${ratioVigente})` }}
                />
              </div>
            </div>

            <div className="workspace-kpi">
              <div className="workspace-kpi__row">
                <span className="workspace-kpi__icon" aria-hidden="true">
                  <Wallet size={20} />
                </span>
                <div className="workspace-kpi__text">
                  <dt>Monto filtrado</dt>
                  <dd className="workspace-kpi__amount">
                    {formatLicitacionAmount(totalAmount, 'CLP')}
                  </dd>
                </div>
              </div>
            </div>

            <div className="workspace-kpi">
              <div className="workspace-kpi__row">
                <span className="workspace-kpi__icon" aria-hidden="true">
                  <Calendar size={20} />
                </span>
                <div className="workspace-kpi__text">
                  <dt>Próximo cierre</dt>
                  <dd>{nextClosing}</dd>
                </div>
              </div>
            </div>
          </dl>

          {estado === 'listo' ? (
            <LicitacionList licitaciones={results} onResetFilters={reset} />
          ) : (
            <EstadoCatalogo estado={estado} onReintentar={recargar} />
          )}
        </div>
      </div>
    </section>
  )
}

export default LicitacionesExplorerPage
