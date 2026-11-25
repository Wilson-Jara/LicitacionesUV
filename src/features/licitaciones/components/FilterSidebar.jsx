import PropTypes from 'prop-types'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { Check, Info, Search, X } from 'lucide-react'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { getEtiquetaLabel, getSectorLabel } from '../categorias.js'
import { formatLicitacionAmount, getRegionLabel } from '../licitacionUtils.js'
import { countActiveFilters, normalizeAmountBound, VALID_REGIONES } from '../licitacionFilters.js'
import './FilterSidebar.css'

const tipos = [
  ['', 'Todas'],
  ['publica', 'Pública'],
  ['privada', 'Privada'],
]

const ejemplos = ['Mantenimiento', 'Software', 'Consultoría']

const amountFields = [
  ['min', 'Monto mínimo'],
  ['max', 'Monto máximo'],
]

function formatAmountRange(min, max) {
  const minLabel = min && formatLicitacionAmount(Number(min), 'CLP', 20)
  const maxLabel = max && formatLicitacionAmount(Number(max), 'CLP', 20)
  if (minLabel && maxLabel) return `${minLabel} a ${maxLabel}`
  if (minLabel) return `Desde ${minLabel}`
  return maxLabel ? `Hasta ${maxLabel}` : ''
}

function AmountRangeFilter({ min, max, onApply }) {
  const { key, search } = useLocation()
  const source = JSON.stringify([min, max, search ? '' : key])
  const [draft, setDraft] = useState({ source, min, max, error: null })

  if (draft.source !== source) setDraft({ source, min, max, error: null })

  function applyRange(event) {
    event.preventDefault()
    const values = { min: normalizeAmountBound(draft.min), max: normalizeAmountBound(draft.max) }
    const invalid = amountFields.find(([field]) => draft[field].trim() && !values[field])

    let error = null
    if (invalid) {
      error = { field: invalid[0], message: 'Ingresa un número mayor o igual a cero.' }
    } else if (values.min && values.max && Number(values.min) > Number(values.max)) {
      error = { field: 'max', message: 'El monto máximo debe ser mayor o igual al mínimo.' }
    }

    setDraft({ ...draft, ...(error ? {} : values), error })
    if (error) {
      event.currentTarget.elements.namedItem(error.field).focus()
      return
    }
    onApply(values.min, values.max)
  }

  return (
    <form className="filter-amount" onSubmit={applyRange}>
      <fieldset aria-describedby="monto-hint">
        <legend>Rango de monto (CLP)</legend>
        <p id="monto-hint">Deja en blanco cualquier límite que no quieras aplicar.</p>
        <div className="filter-amount__bounds">
          {amountFields.map(([field, label]) => {
            const invalid = draft.error?.field === field
            return (
              <div key={field}>
                <label htmlFor={`monto-${field}`}>{label}</label>
                <input
                  id={`monto-${field}`}
                  name={field}
                  type="text"
                  inputMode="decimal"
                  value={draft[field]}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? 'monto-error' : undefined}
                  onChange={(event) =>
                    setDraft({ ...draft, [field]: event.target.value, error: null })
                  }
                />
              </div>
            )
          })}
        </div>
        {draft.error && (
          <p className="filter-amount__error" id="monto-error" role="alert">
            {draft.error.message}
          </p>
        )}
      </fieldset>
      <button className="button" type="submit">
        Aplicar rango
      </button>
    </form>
  )
}

AmountRangeFilter.propTypes = {
  min: PropTypes.string,
  max: PropTypes.string,
  onApply: PropTypes.func,
}

export function FilterSidebar({ searchRef, onSearchSubmit, sectores = [], etiquetas = [] }) {
  const { filters, setFilter, setAmountRange, clearFilters } = useLicitacionFilters()
  const activeCount = countActiveFilters(filters)
  const activos = [
    ['keyword', filters.keyword.trim(), 'palabra clave'],
    ['region', filters.region && getRegionLabel(filters.region), 'región'],
    ['sector', filters.sector && getSectorLabel(filters.sector), 'sector'],
    ['etiqueta', filters.etiqueta && getEtiquetaLabel(filters.etiqueta), 'etiqueta'],
    ['tipo', filters.tipo && tipos.find(([key]) => key === filters.tipo)?.[1], 'tipo'],
    ['monto', formatAmountRange(filters.min, filters.max), 'monto'],
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

      <AmountRangeFilter min={filters.min} max={filters.max} onApply={setAmountRange} />

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
                      if (key === 'monto') {
                        setAmountRange('', '')
                        document.getElementById('monto-min')?.focus()
                        return
                      }
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
