import PropTypes from 'prop-types'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { Check, Info, Search, X } from 'lucide-react'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { getEtiquetaLabel, getSectorLabel } from '../categorias.js'
import { getRegionLabel } from '../licitacionUtils.js'
import { countActiveFilters, VALID_REGIONES } from '../licitacionFilters.js'
import './FilterSidebar.css'

const tipos = [
  ['', 'Todas'],
  ['publica', 'Pública'],
  ['privada', 'Privada'],
]

const ejemplos = ['Mantenimiento', 'Software', 'Consultoría']

export function FilterSidebar({ searchRef, onSearchSubmit, sectores = [], etiquetas = [] }) {
  const { filters, setFilter, clearFilters } = useLicitacionFilters()
  const activeCount = countActiveFilters(filters)
  const activos = [
    ['keyword', filters.keyword.trim(), 'palabra clave'],
    ['region', filters.region && getRegionLabel(filters.region), 'región'],
    ['sector', filters.sector && getSectorLabel(filters.sector), 'sector'],
    ['etiqueta', filters.etiqueta && getEtiquetaLabel(filters.etiqueta), 'etiqueta'],
    ['tipo', filters.tipo && tipos.find(([key]) => key === filters.tipo)?.[1], 'tipo'],
  ].filter(([, value]) => value)

  return (
    <aside className="filter-sidebar" aria-labelledby="filter-heading">
      <div className="filter-sidebar__top">
        <div>
          <h2 id="filter-heading">Filtros</h2>
          <p className="filter-sidebar__hint">Filtra en vivo sin recargar</p>
        </div>
        <span className="filter-count-pill">
          {activeCount} {activeCount === 1 ? 'activo' : 'activos'}
        </span>
      </div>

      <form
        className="filter-search"
        role="search"
        aria-label="Buscar licitaciones"
        onSubmit={(event) => {
          event.preventDefault()
          onSearchSubmit?.()
        }}
      >
        <label htmlFor="keyword">Buscar por título</label>
        <div className="filter-search__box">
          <Search size={18} aria-hidden="true" className="filter-search__icon" />
          <input
            ref={searchRef}
            type="search"
            id="keyword"
            placeholder="Ej. mantenimiento, software..."
            value={filters.keyword}
            onChange={(event) => setFilter('keyword', event.target.value)}
          />
        </div>
      </form>

      <div className="filter-group">
        <span className="filter-group__label" id="ejemplos-label">
          Atajos de ejemplo
        </span>
        <div className="filter-chips" role="group" aria-labelledby="ejemplos-label">
          {ejemplos.map((ejemplo) => {
            const value = ejemplo.toLowerCase()
            const selected = filters.keyword.trim().toLowerCase() === value
            return (
              <button
                key={ejemplo}
                type="button"
                className="filter-chip"
                aria-pressed={selected}
                onClick={() => setFilter('keyword', selected ? '' : value)}
              >
                {selected && <Check size={15} aria-hidden="true" />}
                <span>{ejemplo}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="region">Región</label>
        <select
          id="region"
          value={filters.region}
          onChange={(event) => setFilter('region', event.target.value)}
        >
          <option value="">Todas las regiones</option>
          {VALID_REGIONES.map((region) => (
            <option key={region} value={region}>
              {getRegionLabel(region)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sector">Sector</label>
        <select
          id="sector"
          value={filters.sector}
          onChange={(event) => setFilter('sector', event.target.value)}
        >
          <option value="">Todos los sectores</option>
          {sectores.map((sector) => (
            <option key={sector} value={sector}>
              {getSectorLabel(sector)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="etiqueta">Etiqueta</label>
        <select
          id="etiqueta"
          value={filters.etiqueta}
          onChange={(event) => setFilter('etiqueta', event.target.value)}
        >
          <option value="">Todas las etiquetas</option>
          {etiquetas.map((etiqueta) => (
            <option key={etiqueta} value={etiqueta}>
              {getEtiquetaLabel(etiqueta)}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="filter-type">
        <legend>Modalidad</legend>
        <div className="filter-chips" role="group" aria-label="Modalidad de licitación">
          {tipos.map(([value, label]) => {
            const selected = filters.tipo === value
            return (
              <button
                key={value || 'todas'}
                type="button"
                className="filter-chip"
                aria-pressed={selected}
                onClick={() => setFilter('tipo', value)}
              >
                {selected && <Check size={15} aria-hidden="true" />}
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <AnimatePresence initial={false}>
        {activos.length > 0 && (
          <Motion.ul
            className="filter-applied"
            aria-label="Filtros aplicados"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <AnimatePresence initial={false}>
              {activos.map(([key, value, label]) => (
                <Motion.li
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    type="button"
                    aria-label={'Quitar filtro de ' + label + ': ' + value}
                    onClick={() => {
                      setFilter(key, '')
                      const target = key === 'tipo' ? 'filter-reset' : key
                      document.getElementById(target)?.focus()
                    }}
                  >
                    <span>{value}</span>
                    <X size={16} aria-hidden="true" />
                  </button>
                </Motion.li>
              ))}
            </AnimatePresence>
          </Motion.ul>
        )}
      </AnimatePresence>

      <button
        id="filter-reset"
        type="button"
        className="button filter-reset-btn"
        onClick={clearFilters}
      >
        Restablecer filtros
      </button>

      <div className="filter-demo-note" role="note">
        <Info size={18} aria-hidden="true" className="filter-demo-note__icon" />
        <p>
          <strong>Catálogo de demostración:</strong> datos ficticios locales para consulta y
          pruebas.
        </p>
      </div>
    </aside>
  )
}

FilterSidebar.propTypes = {
  searchRef: PropTypes.shape({ current: PropTypes.any }),
  onSearchSubmit: PropTypes.func,
  sectores: PropTypes.arrayOf(PropTypes.string),
  etiquetas: PropTypes.arrayOf(PropTypes.string),
}
