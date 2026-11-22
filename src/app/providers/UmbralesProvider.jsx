/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  actualizarUmbral,
  agregarUmbral,
  agregarUnidad,
  eliminarUmbral,
  eliminarUnidad,
  readUmbralesStore,
  writeUmbralesStore,
} from '../../features/aprobaciones/data/umbralesStorage'
import { obtenerAlmacenamientoLocal as getStorage } from '../../shared/lib/persistenciaLocal'

/**
 * Contexto de React para compartir la configuración de umbrales y unidades de aprobación.
 */
export const UmbralesContext = createContext(null)

/**
 * Proveedor de contexto que administra el estado y persistencia de umbrales de aprobación por unidad.
 * Permite consultar unidades y realizar operaciones CRUD sobre umbrales y unidades (CA2, REF-14).
 *
 * Cada operación devuelve `true` si cambió la configuración y `false` si se
 * descartó (por ejemplo, porque la unidad o el umbral ya no existe), para que la
 * interfaz solo confirme operaciones aplicadas (#125).
 *
 * @param {object} props - Propiedades del componente.
 * @param {import('react').ReactNode} props.children - Componentes descendientes con acceso al contexto.
 * @returns {import('react').JSX.Element} Proveedor de contexto con operaciones de umbrales.
 */
export const UmbralesProvider = ({ children }) => {
  const [store, setStore] = useState(() => readUmbralesStore(getStorage()))
  // Copia sincrónica del último estado: permite saber al instante si una
  // operación se aplicó, sin esperar al siguiente render.
  const storeRef = useRef(store)

  // CA2 (REF-14): la configuración se persiste como datos, no como código.
  useEffect(() => {
    writeUmbralesStore(getStorage(), store)
  }, [store])

  // Las funciones de umbralesStorage devuelven el mismo objeto cuando descartan
  // la operación; esa identidad indica si hubo cambio.
  const aplicar = useCallback((operacion) => {
    const actual = storeRef.current
    const siguiente = operacion(actual, new Date().toISOString())
    if (siguiente === actual) return false
    storeRef.current = siguiente
    setStore(siguiente)
    return true
  }, [])

  const crearUmbral = useCallback(
    (idUnidad, datos) => aplicar((prev, ahora) => agregarUmbral(prev, idUnidad, datos, ahora)),
    [aplicar],
  )

  const editarUmbral = useCallback(
    (idUnidad, idUmbral, datos) =>
      aplicar((prev, ahora) => actualizarUmbral(prev, idUnidad, idUmbral, datos, ahora)),
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
      crearUmbral,
      editarUmbral,
      quitarUmbral,
      crearUnidad,
      quitarUnidad,
    }),
    [
      store.unidades,
      store.actualizadoEn,
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
