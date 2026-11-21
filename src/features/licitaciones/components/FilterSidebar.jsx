import PropTypes from 'prop-types'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import { getEtiquetaLabel, getSectorLabel } from '../categorias.js'
import { getRegionLabel } from '../licitacionUtils.js'
import { VALID_REGIONES } from '../licitacionFilters.js'
import './FilterSidebar.css'

const tipos = [
  ['', 'Todos los tipos'],
  ['publica', 'Pública'],
  ['privada', 'Privada'],
]

export function FilterSidebar({ sectores = [], etiquetas = [] }) {
  const { filters, setFilter, clearFilters } = useLicitacionFilters()
  const activos = [
    ['keyword', filters.keyword.trim(), 'palabra clave'],
    ['region', filters.region && getRegionLabel(filters.region), 'región'],
    ['sector', filters.sector && getSectorLabel(filters.sector), 'sector'],
    ['etiqueta', filters.etiqueta && getEtiquetaLabel(filters.etiqueta), 'etiqueta'],
    ['tipo', filters.tipo && tipos.find(([key]) => key === filters.tipo)?.[1], 'tipo'],
  ].filter(([, value]) => value)

  return (
    <aside className="filter-sidebar" aria-labelledby="filter-heading">
      <h2 id="filter-heading">Filtros</h2>
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
        <legend>Tipo de licitación</legend>
        {tipos.map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="tipo-licitacion"
              value={value}
              checked={filters.tipo === value}
              onChange={() => setFilter('tipo', value)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      {activos.length > 0 && (
        <ul className="filter-applied" aria-label="Filtros aplicados">
          {activos.map(([key, value, label]) => (
            <li key={key}>
              <button
                type="button"
                aria-label={'Quitar filtro de ' + label + ': ' + value}
                onClick={() => {
                  setFilter(key, '')
                  const target = ['keyword', 'region', 'sector', 'etiqueta'].includes(key)
                    ? key
                    : 'filter-reset'
                  document.getElementById(target)?.focus()
                }}
              >
                <span>{value}</span>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button id="filter-reset" type="button" className="text-button" onClick={clearFilters}>
        Limpiar filtros
      </button>
    </aside>
  )
}

FilterSidebar.propTypes = {
  sectores: PropTypes.arrayOf(PropTypes.string),
  etiquetas: PropTypes.arrayOf(PropTypes.string),
}
