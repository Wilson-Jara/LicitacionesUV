import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  NIVELES_APROBADOR,
  esValido,
  getTipoUnidadLabel,
  idUnidadVigente,
  parseMontoClp,
  validarUmbral,
} from '../umbralesUtils.js'

const ERROR_GUARDADO =
  'No se guardó el umbral porque la configuración cambió: la unidad o el umbral ya no existe, o el rango dejó de ser válido. Revisa los datos e inténtalo de nuevo.'

/**
 * Formulario para crear o editar un umbral de una unidad (US-10, CA1).
 *
 * El formulario valida rango y nivel aprobador antes de delegar en `onGuardar`.
 * Al editar, la unidad queda fija para no mover el umbral de unidad por error.
 *
 * Los montos se escriben en campos de texto con teclado numérico y no en
 * `type="number"`: el navegador interpreta en silencio entradas como `1.000.000`
 * (la convierte en 1) o `0,5`, mientras que el texto permite rechazarlas con un
 * mensaje (#125).
 *
 * Si la unidad elegida desaparece de `unidades`, el selector vuelve a «Selecciona
 * una unidad…» en lugar de cambiar en silencio a otra, y el guardado se bloquea
 * hasta elegir una disponible. Los campos solo se limpian cuando `onGuardar`
 * confirma que la operación se aplicó (#125).
 *
 * @param {object} props - Propiedades del componente.
 * @param {Array<object>} props.unidades - Unidades configuradas con sus umbrales.
 * @param {object|null} [props.umbralEnEdicion=null] - Umbral que se edita, o `null` para crear.
 * @param {(cambio: { idUnidad: string, datos: object }) => boolean} props.onGuardar -
 *   Guarda el umbral y devuelve `true` solo si la operación se aplicó.
 * @param {() => void} props.onCancelar - Cancela la edición.
 * @returns {import('react').JSX.Element} Formulario de umbral.
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
  const [errorGuardado, setErrorGuardado] = useState('')
  const [unidadesPrevias, setUnidadesPrevias] = useState(unidades)
  const [unidadEliminada, setUnidadEliminada] = useState(false)

  // #125: si la unidad elegida desaparece, la selección se invalida en el mismo
  // render. Basta comparar ids en cada render no alcanza: los ids se generan como
  // «mayor + 1», así que una unidad creada después podría reutilizar el id de la
  // eliminada y quedar seleccionada sin que nadie la elija.
  if (unidades !== unidadesPrevias) {
    setUnidadesPrevias(unidades)
    if (idUnidad !== '' && idUnidadVigente(unidades, idUnidad) === '') {
      setIdUnidad('')
      setUnidadEliminada(true)
    }
  }

  const sinUnidades = unidades.length === 0
  const idSeleccionado = idUnidadVigente(unidades, idUnidad)

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorGuardado('')

    const datos = {
      montoMinimo: parseMontoClp(montoMinimo),
      montoMaximo: parseMontoClp(montoMaximo),
      nivelAprobador,
    }
    const unidad = unidades.find((u) => u.id === idSeleccionado)
    const otrosUmbrales = (unidad?.umbrales ?? []).filter(
      (umbral) => umbral.id !== umbralEnEdicion?.id,
    )
    const nuevosErrores = validarUmbral(datos, otrosUmbrales)
    if (!unidad) {
      nuevosErrores.idUnidad = unidadEliminada
        ? 'La unidad que habías elegido ya no existe. Selecciona una unidad disponible.'
        : 'Selecciona la unidad a la que pertenece el umbral.'
    }

    setErrores(nuevosErrores)
    if (!esValido(nuevosErrores)) return

    // Solo se confirma una operación aplicada: si no se guardó, se informa y se
    // conservan los datos escritos para corregirlos.
    if (!onGuardar({ idUnidad: idSeleccionado, datos })) {
      setErrorGuardado(ERROR_GUARDADO)
      return
    }
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
                value={idSeleccionado}
                onChange={(event) => {
                  setIdUnidad(event.target.value)
                  setUnidadEliminada(false)
                }}
                disabled={editando}
                aria-invalid={Boolean(errores.idUnidad)}
                aria-describedby={errores.idUnidad ? 'umbral-unidad-error' : undefined}
              >
                <option value="" disabled>
                  Selecciona una unidad…
                </option>
                {unidades.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} · {getTipoUnidadLabel(unidad.tipo)}
                  </option>
                ))}
              </select>
              {errores.idUnidad && (
                <p className="umbral-form__error" id="umbral-unidad-error" role="alert">
                  {errores.idUnidad}
                </p>
              )}
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
                type="text"
                inputMode="numeric"
                autoComplete="off"
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
                type="text"
                inputMode="numeric"
                autoComplete="off"
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

          {errorGuardado && (
            <p className="umbral-form__error" role="alert">
              {errorGuardado}
            </p>
          )}

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
