import PropTypes from 'prop-types'
import { formatRangoUmbral, getNivelAprobadorLabel, getTipoUnidadLabel } from '../umbralesUtils.js'

/**
 * Listado editable de umbrales agrupados por unidad (US-10, CA1).
 *
 * Cada fila expone las acciones de editar y eliminar; cada unidad permite
 * eliminarse junto con sus umbrales.
 */
export function UmbralesTable({ unidades, onEditar, onEliminar, onEliminarUnidad }) {
  if (unidades.length === 0) {
    return (
      <p className="umbrales-vacio">
        No hay unidades configuradas. Agrega una unidad para definir sus umbrales de aprobación.
      </p>
    )
  }

  return (
    <div className="umbrales-lista">
      {unidades.map((unidad) => (
        <section className="umbrales-unidad" key={unidad.id}>
          <header className="umbrales-unidad__header">
            <div>
              <h3 className="umbrales-unidad__nombre">{unidad.nombre}</h3>
              <span className="umbrales-unidad__tipo">{getTipoUnidadLabel(unidad.tipo)}</span>
            </div>
            <button
              type="button"
              className="umbral-btn umbral-btn--danger"
              onClick={() => onEliminarUnidad(unidad)}
            >
              Eliminar unidad
            </button>
          </header>

          {unidad.umbrales.length === 0 ? (
            <p className="umbrales-vacio">Sin umbrales configurados para esta unidad.</p>
          ) : (
            <table className="umbrales-tabla" aria-label={`Umbrales de ${unidad.nombre}`}>
              <thead>
                <tr>
                  <th scope="col">Rango de monto</th>
                  <th scope="col">Nivel aprobador</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {unidad.umbrales.map((umbral) => (
                  <tr key={umbral.id}>
                    <td className="umbrales-tabla__rango">{formatRangoUmbral(umbral)}</td>
                    <td>
                      <span className={`nivel-badge nivel-badge--${umbral.nivelAprobador}`}>
                        {getNivelAprobadorLabel(umbral.nivelAprobador)}
                      </span>
                    </td>
                    <td className="umbrales-tabla__acciones">
                      <button
                        type="button"
                        className="umbral-btn"
                        onClick={() => onEditar(unidad.id, umbral)}
                        aria-label={`Editar umbral ${formatRangoUmbral(umbral)} de ${unidad.nombre}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="umbral-btn umbral-btn--danger"
                        onClick={() => onEliminar(unidad.id, umbral)}
                        aria-label={`Eliminar umbral ${formatRangoUmbral(umbral)} de ${unidad.nombre}`}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  )
}

UmbralesTable.propTypes = {
  unidades: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onEliminarUnidad: PropTypes.func.isRequired,
}
