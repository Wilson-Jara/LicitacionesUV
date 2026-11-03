import { useState } from 'react'
import PropTypes from 'prop-types'
import { NIVELES_APROBADOR, esValido, getTipoUnidadLabel, validarUmbral } from '../umbralesUtils.js'

function parseMonto(valor) {
  if (typeof valor !== 'string' || valor.trim() === '') return null
  return Number(valor)
}

/**
 * Formulario para crear o editar un umbral de una unidad (US-10, CA1).
 *
 * El formulario valida rango y nivel aprobador antes de delegar en `onGuardar`.
 * Al editar, la unidad queda fija para no mover el umbral de unidad por error.
 */
export function UmbralForm({ unidades, umbralEnEdicion = null, onGuardar, onCancelar }) {
  const editando = Boolean(umbralEnEdicion)
  const [idUnidad, setIdUnidad] = useState(umbralEnEdicion?.idUnidad ?? unidades[0]?.id ?? '')
  const [montoMinimo, setMontoMinimo] = useState(
    umbralEnEdicion ? String(umbralEnEdicion.montoMinimo) : '',
  )
  const [montoMaximo, setMontoMaximo] = useState(
    umbralEnEdicion?.montoMaximo != null ? String(umbralEnEdicion.montoMaximo) : '',
  )
  const [nivelAprobador, setNivelAprobador] = useState(umbralEnEdicion?.nivelAprobador ?? '')
  const [errores, setErrores] = useState({})

  const sinUnidades = unidades.length === 0

  const handleSubmit = (event) => {
    event.preventDefault()

    const datos = {
      montoMinimo: parseMonto(montoMinimo),
      montoMaximo: parseMonto(montoMaximo),
      nivelAprobador,
    }
    const unidad = unidades.find((u) => u.id === idUnidad)
    const otrosUmbrales = (unidad?.umbrales ?? []).filter(
      (umbral) => umbral.id !== umbralEnEdicion?.id,
    )
    const nuevosErrores = validarUmbral(datos, otrosUmbrales)

    setErrores(nuevosErrores)
    if (!esValido(nuevosErrores)) return

    onGuardar({ idUnidad, datos })
    if (!editando) {
      setMontoMinimo('')
      setMontoMaximo('')
    }
  }

  return (
    <form className="umbral-form" onSubmit={handleSubmit} noValidate>
      <h3 className="umbral-form__title">
        {editando ? 'Editar umbral' : 'Agregar umbral a una unidad'}
      </h3>

      {sinUnidades ? (
        <p className="umbral-form__aviso">
          Crea primero una unidad para poder configurar sus umbrales de aprobación.
        </p>
      ) : (
        <>
          <div className="umbral-form__grid">
            <div className="umbral-form__group">
              <label htmlFor="umbral-unidad">Unidad</label>
              <select
                id="umbral-unidad"
                value={idUnidad}
                onChange={(event) => setIdUnidad(event.target.value)}
                disabled={editando}
              >
                {unidades.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} · {getTipoUnidadLabel(unidad.tipo)}
                  </option>
                ))}
              </select>
            </div>

            <div className="umbral-form__group">
              <label htmlFor="umbral-nivel">Nivel aprobador</label>
              <select
                id="umbral-nivel"
                value={nivelAprobador}
                onChange={(event) => setNivelAprobador(event.target.value)}
                aria-invalid={Boolean(errores.nivelAprobador)}
                aria-describedby={errores.nivelAprobador ? 'umbral-nivel-error' : undefined}
              >
                <option value="">Selecciona un nivel…</option>
                {Object.entries(NIVELES_APROBADOR).map(([clave, etiqueta]) => (
                  <option key={clave} value={clave}>
                    {etiqueta}
                  </option>
                ))}
              </select>
              {errores.nivelAprobador && (
                <p className="umbral-form__error" id="umbral-nivel-error" role="alert">
                  {errores.nivelAprobador}
                </p>
              )}
            </div>

            <div className="umbral-form__group">
              <label htmlFor="umbral-minimo">Monto mínimo (inclusivo)</label>
              <input
                id="umbral-minimo"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={montoMinimo}
                onChange={(event) => setMontoMinimo(event.target.value)}
                aria-invalid={Boolean(errores.montoMinimo)}
                aria-describedby={errores.montoMinimo ? 'umbral-minimo-error' : undefined}
              />
              {errores.montoMinimo && (
                <p className="umbral-form__error" id="umbral-minimo-error" role="alert">
                  {errores.montoMinimo}
                </p>
              )}
            </div>

            <div className="umbral-form__group">
              <label htmlFor="umbral-maximo">Monto máximo (exclusivo, opcional)</label>
              <input
                id="umbral-maximo"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Sin tope"
                value={montoMaximo}
                onChange={(event) => setMontoMaximo(event.target.value)}
                aria-invalid={Boolean(errores.montoMaximo)}
                aria-describedby={errores.montoMaximo ? 'umbral-maximo-error' : undefined}
              />
              {errores.montoMaximo && (
                <p className="umbral-form__error" id="umbral-maximo-error" role="alert">
                  {errores.montoMaximo}
                </p>
              )}
            </div>
          </div>

          <div className="umbral-form__actions">
            <button type="submit" className="umbral-btn umbral-btn--primary">
              {editando ? 'Guardar cambios' : 'Agregar umbral'}
            </button>
            {editando && (
              <button type="button" className="umbral-btn" onClick={onCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </>
      )}
    </form>
  )
}

UmbralForm.propTypes = {
  unidades: PropTypes.arrayOf(PropTypes.object).isRequired,
  umbralEnEdicion: PropTypes.object,
  onGuardar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
}
