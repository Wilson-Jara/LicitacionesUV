import { useMemo, useState } from 'react'
import { UmbralForm } from '../components/UmbralForm'
import { UnidadForm } from '../components/UnidadForm'
import { UmbralesTable } from '../components/UmbralesTable'
import { useUmbrales } from '../hooks/useUmbrales'
import {
  buscarUmbralParaMonto,
  formatRangoUmbral,
  formatUmbralTimestamp,
  getNivelAprobadorLabel,
} from '../umbralesUtils.js'
import './ConfiguracionUmbralesPage.css'

function resolverResultadoSimulacion(unidad, montoTexto) {
  if (!unidad) return 'Agrega una unidad para simular la resolución del aprobador.'
  if (typeof montoTexto !== 'string' || montoTexto.trim() === '') {
    return 'Ingresa un monto para conocer el nivel de aprobación requerido.'
  }
  const monto = Number(montoTexto)
  if (!Number.isFinite(monto) || monto < 0) return 'Ingresa un monto válido (mayor o igual a 0).'

  const umbral = buscarUmbralParaMonto(unidad.umbrales, monto)
  if (!umbral) return 'Ningún umbral configurado cubre ese monto para esta unidad.'

  return `Aprobación requerida: ${getNivelAprobadorLabel(umbral.nivelAprobador)} · rango ${formatRangoUmbral(umbral)}`
}

/**
 * Panel de configuración de umbrales de aprobación por unidad (US-10, CR-302).
 *
 * CA1: crear, editar y eliminar umbrales por unidad.
 * CA2: los umbrales viven como configuración editable (regla R4 / REF-14).
 * CA3: cada cambio se refleja de inmediato (la resolución del aprobador se
 * recalcula en el momento, sin recargar ni volver a desplegar).
 */
function ConfiguracionUmbralesPage() {
  const {
    unidades,
    actualizadoEn,
    crearUmbral,
    editarUmbral,
    quitarUmbral,
    crearUnidad,
    quitarUnidad,
  } = useUmbrales()

  const [edicion, setEdicion] = useState(null)
  const [mostrarUnidadForm, setMostrarUnidadForm] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [simulacionUnidad, setSimulacionUnidad] = useState(unidades[0]?.id ?? '')
  const [simulacionMonto, setSimulacionMonto] = useState('')

  const umbralEnEdicion = useMemo(() => {
    if (!edicion) return null
    const unidad = unidades.find((u) => u.id === edicion.idUnidad)
    return unidad?.umbrales.find((umbral) => umbral.id === edicion.idUmbral) ?? null
  }, [edicion, unidades])

  const unidadSimulada =
    unidades.find((unidad) => unidad.id === simulacionUnidad) ?? unidades[0] ?? null
  const resultadoSimulacion = resolverResultadoSimulacion(unidadSimulada, simulacionMonto)

  const nombreDeUnidad = (idUnidad) =>
    unidades.find((u) => u.id === idUnidad)?.nombre ?? 'la unidad'

  const handleGuardarUmbral = ({ idUnidad, datos }) => {
    if (edicion) {
      editarUmbral(idUnidad, edicion.idUmbral, datos)
      setEdicion(null)
      setMensaje(`Umbral actualizado en ${nombreDeUnidad(idUnidad)}: se aplica de inmediato.`)
      return
    }
    crearUmbral(idUnidad, datos)
    setMensaje(`Umbral agregado a ${nombreDeUnidad(idUnidad)}: se aplica de inmediato.`)
  }

  const handleEditarUmbral = (idUnidad, umbral) => {
    setEdicion({ idUnidad, idUmbral: umbral.id })
    setMensaje(`Editando el umbral ${formatRangoUmbral(umbral)} de ${nombreDeUnidad(idUnidad)}.`)
  }

  const handleEliminarUmbral = (idUnidad, umbral) => {
    quitarUmbral(idUnidad, umbral.id)
    if (edicion?.idUmbral === umbral.id) setEdicion(null)
    setMensaje(`Umbral ${formatRangoUmbral(umbral)} eliminado de ${nombreDeUnidad(idUnidad)}.`)
  }

  const handleEliminarUnidad = (unidad) => {
    const total = unidad.umbrales.length
    const confirmado =
      typeof window === 'undefined' ||
      window.confirm(`¿Eliminar ${unidad.nombre} y sus ${total} umbrales configurados?`)
    if (!confirmado) return
    quitarUnidad(unidad.id)
    if (edicion?.idUnidad === unidad.id) setEdicion(null)
    setMensaje(`Unidad ${unidad.nombre} eliminada junto con sus umbrales.`)
  }

  const handleCrearUnidad = (datos) => {
    crearUnidad(datos)
    setMostrarUnidadForm(false)
    setMensaje(`Unidad ${datos.nombre} agregada. Ahora puedes configurar sus umbrales.`)
  }

  return (
    <section className="config-umbrales">
      <div className="config-umbrales__overline">Configuración del flujo · R2 y R4</div>
      <h1 className="config-umbrales__title">Umbrales de aprobación por unidad</h1>
      <p className="config-umbrales__subtitle">
        La normativa de aprobación se gestiona aquí como datos configurables: cada unidad define sus
        propios rangos de monto y su nivel aprobador. Actualizar estos valores no requiere modificar
        el código ni volver a desplegar el sistema (REF-14).
      </p>

      <p className="config-umbrales__status" role="status" aria-live="polite">
        {mensaje}
      </p>

      <div className="config-umbrales__columns">
        <div className="config-umbrales__panel">
          <h2 className="config-umbrales__panel-title">Umbrales configurados</h2>
          <UmbralesTable
            unidades={unidades}
            onEditar={handleEditarUmbral}
            onEliminar={handleEliminarUmbral}
            onEliminarUnidad={handleEliminarUnidad}
          />
          <div className="config-umbrales__panel-footer">
            <span className="config-umbrales__timestamp">
              Última actualización: {formatUmbralTimestamp(actualizadoEn)}
            </span>
            {mostrarUnidadForm ? (
              <UnidadForm
                unidades={unidades}
                onGuardar={handleCrearUnidad}
                onCancelar={() => setMostrarUnidadForm(false)}
              />
            ) : (
              <button
                type="button"
                className="umbral-btn umbral-btn--primary"
                onClick={() => setMostrarUnidadForm(true)}
              >
                + Agregar unidad
              </button>
            )}
          </div>
        </div>

        <div className="config-umbrales__aside">
          <div className="config-umbrales__panel">
            <h2 className="config-umbrales__panel-title">
              {edicion ? 'Editar umbral' : 'Nuevo umbral'}
            </h2>
            <UmbralForm
              key={edicion?.idUmbral ?? 'nuevo'}
              unidades={unidades}
              umbralEnEdicion={umbralEnEdicion}
              onGuardar={handleGuardarUmbral}
              onCancelar={() => setEdicion(null)}
            />
          </div>

          <div className="config-umbrales__panel">
            <h2 className="config-umbrales__panel-title">Resolución inmediata</h2>
            <p className="config-umbrales__hint">
              Consulta qué nivel aprueba un monto con la configuración vigente. El resultado cambia
              al instante cuando editas un umbral, sin recargar la página.
            </p>
            <div className="simulador">
              <div className="umbral-form__group">
                <label htmlFor="simulacion-unidad">Unidad</label>
                <select
                  id="simulacion-unidad"
                  value={unidadSimulada?.id ?? ''}
                  onChange={(event) => setSimulacionUnidad(event.target.value)}
                  disabled={unidades.length === 0}
                >
                  {unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="umbral-form__group">
                <label htmlFor="simulacion-monto">Monto de la licitación (CLP)</label>
                <input
                  id="simulacion-monto"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="Ej. 12000000"
                  value={simulacionMonto}
                  onChange={(event) => setSimulacionMonto(event.target.value)}
                />
              </div>
              <p className="simulador__resultado" aria-live="polite">
                {resultadoSimulacion}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="config-umbrales__note">
        <b>Regla R4 (normativa cambiante):</b> los umbrales se almacenan como configuración. Cuando
        la normativa cambie, el encargado administrativo actualiza los valores en esta pantalla y el
        sistema los aplica a las licitaciones pendientes sin cambios de código ni nueva versión.
      </div>
    </section>
  )
}

export default ConfiguracionUmbralesPage
