import PropTypes from 'prop-types'
import { LicitacionCard } from './LicitacionCard'
import './LicitacionList.css'

export function LicitacionList({ licitaciones, onResetFilters }) {
  if (!licitaciones.length) {
    return (
      <div className="licitaciones-empty">
        <h3>No encontramos licitaciones</h3>
        <p>Prueba otro título o limpia los filtros para volver a explorar el catálogo.</p>
        {onResetFilters && (
          <button type="button" className="button button--primary" onClick={onResetFilters}>
            Limpiar filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <ul className="licitaciones-list" role="list">
      {licitaciones.map((licitacion) => (
        <li key={licitacion.id}>
          <LicitacionCard licitacion={licitacion} />
        </li>
      ))}
    </ul>
  )
}

LicitacionList.propTypes = {
  licitaciones: PropTypes.arrayOf(PropTypes.object).isRequired,
  onResetFilters: PropTypes.func,
}
