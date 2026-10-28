import PropTypes from 'prop-types'
import { formatearConteo, generarAlternativaTextual } from '../estadisticasUtils.js'
import './DistribucionPanel.css'

/**
 * Panel de distribución con alternativa textual accesible (CA1, CA3).
 * No inventa categorías sin registros.
 */
export function DistribucionPanel({ titulo, dimension, datos = [] }) {
  const total = Array.isArray(datos)
    ? datos.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)
    : 0
  const alternativa = generarAlternativaTextual(dimension, datos)

  return (
    <section className="dist-panel" aria-labelledby={`dist-${dimension}-titulo`}>
      <header className="dist-panel__header">
        <h3 id={`dist-${dimension}-titulo`} className="dist-panel__titulo">
          {titulo}
        </h3>
        <span className="dist-panel__total">Total: {formatearConteo(total)}</span>
      </header>

      {/* Alternativa textual accesible (CA3) */}
      <p className="sr-only">{alternativa}</p>

      {datos.length === 0 ? (
        <p className="dist-panel__vacio">Sin categorías con registros.</p>
      ) : (
        <div className="dist-panel__grafico" role="img" aria-label={alternativa}>
          <ul className="dist-panel__lista">
            {datos.map((item) => {
              const cantidad = Number(item.cantidad) || 0
              const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0
              return (
                <li key={item.clave || item.etiqueta} className="dist-panel__item">
                  <div className="dist-panel__fila">
                    <span className="dist-panel__etiqueta">{item.etiqueta}</span>
                    <span className="dist-panel__valor">
                      {formatearConteo(cantidad)} ({porcentaje}%)
                    </span>
                  </div>
                  <div className="dist-panel__barra-contenedor" aria-hidden="true">
                    <div className="dist-panel__barra" style={{ width: `${porcentaje}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Tabla accesible oculta para lectores de pantalla (refuerzo CA3) */}
      {datos.length > 0 && (
        <table className="sr-only">
          <caption>
            Distribución por {dimension.toLowerCase()} - {titulo}
          </caption>
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item) => {
              const cantidad = Number(item.cantidad) || 0
              const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0
              return (
                <tr key={`tabla-${item.clave || item.etiqueta}`}>
                  <th scope="row">{item.etiqueta}</th>
                  <td>{formatearConteo(cantidad)}</td>
                  <td>{porcentaje}%</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td>{formatearConteo(total)}</td>
              <td>100%</td>
            </tr>
          </tfoot>
        </table>
      )}
    </section>
  )
}

DistribucionPanel.propTypes = {
  titulo: PropTypes.string.isRequired,
  dimension: PropTypes.string.isRequired,
  datos: PropTypes.arrayOf(
    PropTypes.shape({
      clave: PropTypes.string,
      etiqueta: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
    }),
  ),
}
