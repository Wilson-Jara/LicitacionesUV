import PropTypes from 'prop-types'
import './LicitacionList.css'

/**
 * Muestra el estado de la carga del catálogo desde la API: un aviso mientras carga
 * o el error con un botón para reintentar. Reutiliza el estilo del estado vacío de la lista.
 *
 * @param {object} props
 * @param {'cargando' | 'error'} props.estado - Estado de la carga que se informa.
 * @param {() => void} [props.onReintentar] - Acción del botón "Reintentar" (solo en error).
 * @returns {JSX.Element} Aviso de carga o de error.
 */
export function EstadoCatalogo({ estado, onReintentar }) {
  if (estado === 'cargando') {
    return (
      <div className="licitaciones-empty" role="status" aria-live="polite">
        <h3>Cargando licitaciones…</h3>
        <p>Consultando la API de licitaciones.</p>
      </div>
    )
  }

  return (
    <div className="licitaciones-empty" role="alert">
      <h3>No se pudo cargar el catálogo</h3>
      <p>La API de licitaciones no respondió. Revisa tu conexión e inténtalo de nuevo.</p>
      {onReintentar && (
        <button type="button" className="button button--primary" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

EstadoCatalogo.propTypes = {
  estado: PropTypes.oneOf(['cargando', 'error']).isRequired,
  onReintentar: PropTypes.func,
}
