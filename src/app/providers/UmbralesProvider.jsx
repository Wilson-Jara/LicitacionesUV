/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  UMBRALES_STORAGE_KEY,
  actualizarUmbral,
  agregarUmbral,
  agregarUnidad,
  eliminarUmbral,
  eliminarUnidad,
  guardarUmbrales,
  readUmbralesStore,
} from '../../features/aprobaciones/data/umbralesStorage'
import {
  conBloqueoEntrePestanas,
  obtenerAlmacenamientoLocal as getStorage,
} from '../../shared/lib/persistenciaLocal'

/**
 * Contexto de React para compartir la configuración de umbrales y unidades de aprobación.
 */
export const UmbralesContext = createContext(null)

const BLOQUEO_UMBRALES = 'licitacionesuv-umbrales'

/**
 * Proveedor de contexto que administra el estado y persistencia de umbrales de aprobación por unidad.
 * Permite consultar unidades y realizar operaciones CRUD sobre umbrales y unidades (CA2, REF-14).
 *
 * Cada operación devuelve una promesa con `true` si cambió la configuración y
 * `false` si se descartó (por ejemplo, porque la unidad o el umbral ya no existe),
 * para que la interfaz solo confirme operaciones aplicadas (#125).
 *
 * Varias pestañas comparten la misma configuración (#124):
 * - Cada operación toma un bloqueo compartido entre pestañas (Web Locks), vuelve
 *   a leer `localStorage`, aplica el cambio sobre lo vigente y lo guarda en el
 *   mismo paso (`guardarUmbrales`), de modo que no pisa lo que otra pestaña
 *   guardó. Si el cambio ya no es compatible, se descarta y la pestaña pasa a
 *   mostrar la configuración vigente.
 * - El evento `storage` avisa cuando otra pestaña guardó; la configuración se
 *   recarga y `cambiosDeOtraPestana` queda en `true` hasta el próximo cambio local.
 * - `problemaAlmacenamiento` avisa si el navegador no deja guardar:
 *   `'bloqueado'` (los cambios viven solo en esta pestaña) o `'sin-espacio'`
 *   (el último cambio se rechazó porque no se pudo escribir).
 *
 * @param {object} props - Propiedades del componente.
 * @param {import('react').ReactNode} props.children - Componentes descendientes con acceso al contexto.
 * @returns {import('react').JSX.Element} Proveedor de contexto con operaciones de umbrales.
 */
export const UmbralesProvider = ({ children }) => {
  const [store, setStore] = useState(() => readUmbralesStore(getStorage()))
  const [cambiosDeOtraPestana, setCambiosDeOtraPestana] = useState(false)
  const [problemaAlmacenamiento, setProblemaAlmacenamiento] = useState(null)
  // Copia sincrónica del estado: permite saber al instante si una operación se
  // aplicó y sirve de base si el almacenamiento está bloqueado.
  const storeRef = useRef(store)

  const mostrar = useCallback((siguiente) => {
    storeRef.current = siguiente
    setStore(siguiente)
  }, [])

  // CA2 (REF-14): la configuración se persiste como datos, no como código. Se
  // escribe dentro de cada operación y no en un efecto posterior al render: un
  // efecto podía escribir una copia vieja encima de lo que otra pestaña guardó
  // entre el render y su ejecución.
  const aplicar = useCallback(
    (operacion) =>
      conBloqueoEntrePestanas(BLOQUEO_UMBRALES, () => {
        const {
          store: siguiente,
          aplicado,
          problema,
        } = guardarUmbrales(getStorage(), storeRef.current, operacion, new Date().toISOString())
        if (siguiente !== storeRef.current) mostrar(siguiente)
        setProblemaAlmacenamiento(problema)
        if (aplicado) setCambiosDeOtraPestana(false)
        return aplicado
      }),
    [mostrar],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const alGuardarOtraPestana = (event) => {
      // `key` es null cuando otra pestaña vacía todo el almacenamiento.
      if (event.key !== null && event.key !== UMBRALES_STORAGE_KEY) return
      mostrar(readUmbralesStore(getStorage()))
      setCambiosDeOtraPestana(true)
    }
    window.addEventListener('storage', alGuardarOtraPestana)
    return () => window.removeEventListener('storage', alGuardarOtraPestana)
  }, [mostrar])

  const crearUmbral = useCallback(
    (idUnidad, datos) => aplicar((prev, ahora) => agregarUmbral(prev, idUnidad, datos, ahora)),
    [aplicar],
  )

  const editarUmbral = useCallback(
    (idUnidad, idUmbral, datos, esperado) =>
      aplicar((prev, ahora) => actualizarUmbral(prev, idUnidad, idUmbral, datos, ahora, esperado)),
    [aplicar],
  )

  const quitarUmbral = useCallback(
    (idUnidad, idUmbral) =>
      aplicar((prev, ahora) => eliminarUmbral(prev, idUnidad, idUmbral, ahora)),
    [aplicar],
  )

  const crearUnidad = useCallback(
    (datos) => aplicar((prev, ahora) => agregarUnidad(prev, datos, ahora)),
    [aplicar],
  )

  const quitarUnidad = useCallback(
    (idUnidad) => aplicar((prev, ahora) => eliminarUnidad(prev, idUnidad, ahora)),
    [aplicar],
  )

  const value = useMemo(
    () => ({
      unidades: store.unidades,
      actualizadoEn: store.actualizadoEn,
      cambiosDeOtraPestana,
      problemaAlmacenamiento,
      crearUmbral,
      editarUmbral,
      quitarUmbral,
      crearUnidad,
      quitarUnidad,
    }),
    [
      store.unidades,
      store.actualizadoEn,
      cambiosDeOtraPestana,
      problemaAlmacenamiento,
      crearUmbral,
      editarUmbral,
      quitarUmbral,
      crearUnidad,
      quitarUnidad,
    ],
  )

  return <UmbralesContext.Provider value={value}>{children}</UmbralesContext.Provider>
}

UmbralesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
