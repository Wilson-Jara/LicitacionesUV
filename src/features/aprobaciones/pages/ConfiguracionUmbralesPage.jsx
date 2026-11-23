import { useMemo, useRef, useState } from 'react'
import { UmbralForm } from '../components/UmbralForm'
import { UnidadForm } from '../components/UnidadForm'
import { UmbralesTable } from '../components/UmbralesTable'
import { useUmbrales } from '../hooks/useUmbrales'
import {
  buscarUmbralParaMonto,
  formatRangoUmbral,
  formatUmbralTimestamp,
  getNivelAprobadorLabel,
  mismosValoresUmbral,
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
    cambiosDeOtraPestana,
    problemaAlmacenamiento,
    crearUmbral,
    editarUmbral,
    quitarUmbral,
    crearUnidad,
    quitarUnidad,
  } = useUmbrales()

  const [edicion, setEdicion] = useState(null)
  // Cada vez que se pulsa «Editar» el formulario se vuelve a montar con los valores
  // vigentes, aunque sea el mismo umbral (#124).
  const aperturasEdicion = useRef(0)
  const [mostrarUnidadForm, setMostrarUnidadForm] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [simulacionUnidad, setSimulacionUnidad] = useState(unidades[0]?.id ?? '')
  const [simulacionMonto, setSimulacionMonto] = useState('')

  const umbralEnEdicion = useMemo(() => {
    if (!edicion) return null
    const unidad = unidades.find((u) => u.id === edicion.idUnidad)
    return unidad?.umbrales.find((umbral) => umbral.id === edicion.idUmbral) ?? null
  }, [edicion, unidades])
  // #124: si otra pestaña eliminó el umbral que se estaba editando, se sale del
  // modo edición en el mismo render (en lugar de guardar sobre un umbral que ya
  // no existe) y el aviso reemplaza al mensaje «Editando…», que dejó de ser cierto.
  if (edicion && !umbralEnEdicion) {
    setEdicion(null)
    setMensaje(
      'El umbral que editabas se eliminó en otra pestaña. Puedes crear uno nuevo con el formulario.',
    )
  }

  const unidadSimulada =
    unidades.find((unidad) => unidad.id === simulacionUnidad) ?? unidades[0] ?? null
  const resultadoSimulacion = resolverResultadoSimulacion(unidadSimulada, simulacionMonto)

  const nombreDeUnidad = (idUnidad) =>
    unidades.find((u) => u.id === idUnidad)?.nombre ?? 'la unidad'

  // #124: otra pestaña cambió el umbral desde que se abrió el editor; guardar
  // se rechazará para no pisar ese cambio, así que se avisa antes.
  const edicionDesactualizada =
    Boolean(edicion && umbralEnEdicion) && !mismosValoresUmbral(umbralEnEdicion, edicion.original)

  // #125: solo se confirma una operación aplicada. Si el proveedor la descarta,
  // se devuelve `false` y el formulario muestra el error con los datos intactos.
  const handleGuardarUmbral = async ({ idUnidad, datos }) => {
    if (edicion) {
      // #124: se envía la versión que se abrió para editar; si otra pestaña la
      // cambió, la actualización se descarta en vez de pisar ese cambio.
      if (!(await editarUmbral(idUnidad, edicion.idUmbral, datos, edicion.original))) {
        setMensaje('')
        return false
      }
      setEdicion(null)
      setMensaje(`Umbral actualizado en ${nombreDeUnidad(idUnidad)}: se aplica de inmediato.`)
      return true
    }
    if (!(await crearUmbral(idUnidad, datos))) {
      setMensaje('')
      return false
    }
    setMensaje(`Umbral agregado a ${nombreDeUnidad(idUnidad)}: se aplica de inmediato.`)
    return true
  }

  const handleEditarUmbral = (idUnidad, umbral) => {
    const { montoMinimo, montoMaximo, nivelAprobador } = umbral
    aperturasEdicion.current += 1
    // `original` y los campos del formulario parten de la misma versión: si se
    // vuelve a pulsar «Editar» tras un cambio de otra pestaña, el formulario se
    // reinicia con esos valores en lugar de conservar los viejos.
    setEdicion({
      idUnidad,
      idUmbral: umbral.id,
      apertura: aperturasEdicion.current,
      original: { montoMinimo, montoMaximo, nivelAprobador },
    })
    setMensaje(`Editando el umbral ${formatRangoUmbral(umbral)} de ${nombreDeUnidad(idUnidad)}.`)
  }

  const handleEliminarUmbral = async (idUnidad, umbral) => {
    const rango = formatRangoUmbral(umbral)
    const aplicado = await quitarUmbral(idUnidad, umbral.id)
    // Si la eliminación se rechazó, el umbral sigue existiendo: se conserva el borrador.
    if (aplicado && edicion?.idUmbral === umbral.id) setEdicion(null)
    setMensaje(
      aplicado
        ? `Umbral ${rango} eliminado de ${nombreDeUnidad(idUnidad)}.`
        : `No se eliminó el umbral ${rango}: ya no existía (pudo eliminarse en otra pestaña) o el navegador no pudo guardar el cambio. Se muestra la configuración vigente.`,
    )
  }

  const handleEliminarUnidad = async (unidad) => {
    const total = unidad.umbrales.length
    const confirmado =
      typeof window === 'undefined' ||
      window.confirm(`¿Eliminar ${unidad.nombre} y sus ${total} umbrales configurados?`)
    if (!confirmado) return
    const aplicado = await quitarUnidad(unidad.id)
    if (aplicado && edicion?.idUnidad === unidad.id) setEdicion(null)
    setMensaje(
      aplicado
        ? `Unidad ${unidad.nombre} eliminada junto con sus umbrales.`
        : `No se eliminó la unidad ${unidad.nombre}: ya no existía (pudo eliminarse en otra pestaña) o el navegador no pudo guardar el cambio. Se muestra la configuración vigente.`,
    )
  }

  const handleCrearUnidad = async (datos) => {
    if (!(await crearUnidad(datos))) {
      setMensaje(
        `No se agregó la unidad ${datos.nombre}: ya existe una unidad con ese nombre (pudo crearse en otra pestaña) o el navegador no pudo guardarla.`,
      )
      return false
    }
    setMostrarUnidadForm(false)
    setMensaje(`Unidad ${datos.nombre} agregada. Ahora puedes configurar sus umbrales.`)
    return true
  }

  return (
    <section className="frame config-umbrales" aria-labelledby="umbrales-title">
      <h1 id="umbrales-title">Umbrales de aprobación por unidad</h1>
      <p className="config-umbrales__subtitle">
        Define los rangos de monto y el nivel de aprobación para cada unidad.
      </p>

      <p className="config-umbrales__status" role="status" aria-live="polite">
        {mensaje}
      </p>
      {cambiosDeOtraPestana && (
        <p className="config-umbrales__status" role="status">
          Se cargaron cambios guardados en otra pestaña: se muestra la configuración vigente.
        </p>
      )}
      {problemaAlmacenamiento === 'bloqueado' && (
        <p className="config-umbrales__status" role="alert">
          El navegador no permite guardar en este sitio (almacenamiento bloqueado): los cambios se
          conservan solo mientras esta pestaña siga abierta.
        </p>
      )}
      {problemaAlmacenamiento === 'sin-espacio' && (
        <p className="config-umbrales__status" role="alert">
          No se pudo guardar porque el almacenamiento del navegador está lleno: el último cambio no
          se aplicó.
        </p>
      )}

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
                Agregar unidad
              </button>
            )}
          </div>
        </div>

        <div className="config-umbrales__aside">
          <div className="config-umbrales__panel">
            <h2 className="config-umbrales__panel-title">
              {edicion ? 'Editar umbral' : 'Nuevo umbral'}
            </h2>
            {edicionDesactualizada && (
              <p className="umbral-form__aviso" role="status">
                Otra pestaña cambió este umbral mientras lo editabas, así que guardar no lo
                sobrescribirá. Cancela y vuelve a editarlo para partir de los valores vigentes.
              </p>
            )}
            <UmbralForm
              key={edicion ? `${edicion.idUmbral}-${edicion.apertura}` : 'nuevo'}
              unidades={unidades}
              umbralEnEdicion={umbralEnEdicion}
              onGuardar={handleGuardarUmbral}
              onCancelar={() => setEdicion(null)}
            />
          </div>

          <div className="config-umbrales__panel">
            <h2 className="config-umbrales__panel-title">Simular aprobación</h2>
            <p className="config-umbrales__hint">
              Consulta qué nivel de aprobación corresponde a un monto con los umbrales actuales.
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
    </section>
  )
}

export default ConfiguracionUmbralesPage
