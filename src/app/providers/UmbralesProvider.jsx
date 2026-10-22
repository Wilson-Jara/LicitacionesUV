/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
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

export const UmbralesContext = createContext(null)

function getStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const UmbralesProvider = ({ children }) => {
  const [store, setStore] = useState(() => readUmbralesStore(getStorage()))

  // CA2 (REF-14): la configuración se persiste como datos, no como código.
  useEffect(() => {
    writeUmbralesStore(getStorage(), store)
  }, [store])

  const crearUmbral = useCallback((idUnidad, datos) => {
    setStore((prev) => agregarUmbral(prev, idUnidad, datos, new Date().toISOString()))
  }, [])

  const editarUmbral = useCallback((idUnidad, idUmbral, datos) => {
    setStore((prev) => actualizarUmbral(prev, idUnidad, idUmbral, datos, new Date().toISOString()))
  }, [])

  const quitarUmbral = useCallback((idUnidad, idUmbral) => {
    setStore((prev) => eliminarUmbral(prev, idUnidad, idUmbral, new Date().toISOString()))
  }, [])

  const crearUnidad = useCallback((datos) => {
    setStore((prev) => agregarUnidad(prev, datos, new Date().toISOString()))
  }, [])

  const quitarUnidad = useCallback((idUnidad) => {
    setStore((prev) => eliminarUnidad(prev, idUnidad, new Date().toISOString()))
  }, [])

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
