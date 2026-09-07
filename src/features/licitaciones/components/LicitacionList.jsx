import PropTypes from 'prop-types'
import { LicitacionCard } from './LicitacionCard'
import './LicitacionList.css'

export function LicitacionList({ licitaciones, onResetFilters }) {
  if (!licitaciones || licitaciones.length === 0) {
    return (
      <div className="licitaciones-empty">
        <div className="empty-icon-shield" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>
        <h3 className="empty-title">No se encontraron licitaciones</h3>
        <p className="empty-subtitle">
          No hay procesos que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
        {onResetFilters && (
          <button type="button" className="btn-empty-reset" onClick={onResetFilters}>
            Restablecer todos los filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="licitaciones-grid">
      {licitaciones.map((licitacion) => (
        <LicitacionCard key={licitacion.id} licitacion={licitacion} />
      ))}
    </div>
  )
}

LicitacionList.propTypes = {
  licitaciones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onResetFilters: PropTypes.func,
}
