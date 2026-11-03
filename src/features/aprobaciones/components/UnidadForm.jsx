import { useState } from 'react'
import PropTypes from 'prop-types'
import { TIPOS_UNIDAD, esValido, validarUnidad } from '../umbralesUtils.js'

/**
 * Formulario compacto para crear una unidad con umbrales propios (US-10).
 *
 * Se abre desde el botón «Agregar unidad» del panel de configuración.
 */
export function UnidadForm({ unidades, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('facultad')
  const [errores, setErrores] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const datos = { nombre: nombre.trim(), tipo }
    const nuevosErrores = validarUnidad(datos, unidades)

    setErrores(nuevosErrores)
    if (!esValido(nuevosErrores)) return

    onGuardar(datos)
    setNombre('')
    setTipo('facultad')
  }

  return (
    <form className="umbral-form umbral-form--unidad" onSubmit={handleSubmit} noValidate>
      <h3 className="umbral-form__title">Agregar unidad</h3>
      <div className="umbral-form__grid">
        <div className="umbral-form__group">
          <label htmlFor="unidad-nombre">Nombre de la unidad o facultad</label>
          <input
            id="unidad-nombre"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Ej. Facultad de Arquitectura"
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? 'unidad-nombre-error' : undefined}
          />
          {errores.nombre && (
            <p className="umbral-form__error" id="unidad-nombre-error" role="alert">
              {errores.nombre}
            </p>
          )}
        </div>

        <div className="umbral-form__group">
          <label htmlFor="unidad-tipo">Tipo</label>
          <select
            id="unidad-tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            aria-invalid={Boolean(errores.tipo)}
            aria-describedby={errores.tipo ? 'unidad-tipo-error' : undefined}
          >
            {Object.entries(TIPOS_UNIDAD).map(([clave, etiqueta]) => (
              <option key={clave} value={clave}>
                {etiqueta}
              </option>
            ))}
          </select>
          {errores.tipo && (
            <p className="umbral-form__error" id="unidad-tipo-error" role="alert">
              {errores.tipo}
            </p>
          )}
        </div>
      </div>

      <div className="umbral-form__actions">
        <button type="submit" className="umbral-btn umbral-btn--primary">
          Agregar unidad
        </button>
        <button type="button" className="umbral-btn" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

UnidadForm.propTypes = {
  unidades: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGuardar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
}
