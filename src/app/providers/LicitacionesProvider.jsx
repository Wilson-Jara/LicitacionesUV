/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { fetchLicitaciones } from '../../features/licitaciones/services/licitacionesApi.js'

/** Contexto del catálogo de licitaciones obtenido de la API; se consume con `useLicitaciones`. */
export const LicitacionesContext = createContext(null)

/**
 * Carga una sola vez el catálogo desde `GET /api/licitaciones` y lo comparte con el explorador,
 * favoritos y estadísticas, que filtran y ordenan en el navegador sobre esa misma lista.
 * Expone el estado de la carga para que cada página muestre "cargando" o el error con reintento.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido con acceso al catálogo.
 * @returns {JSX.Element} Proveedor del catálogo de licitaciones.
 */
export const LicitacionesProvider = ({ children }) => {
  const [licitaciones, setLicitaciones] = useState([])
  const [estado, setEstado] = useState('cargando')
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    fetchLicitaciones()
      .then((data) => {
        if (!vigente) return
        setLicitaciones(data)
        setEstado('listo')
      })
      .catch((err) => {
        if (!vigente) return
        setError(err)
        setEstado('error')
      })
    return () => {
      vigente = false
    }
  }, [intento])

  const recargar = useCallback(() => {
    setEstado('cargando')
    setError(null)
    setIntento((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({ licitaciones, estado, error, recargar }),
    [licitaciones, estado, error, recargar],
  )

  return <LicitacionesContext.Provider value={value}>{children}</LicitacionesContext.Provider>
}

LicitacionesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
