import { useContext } from 'react'
import { LicitacionesContext } from '../../../app/providers/LicitacionesProvider'

/**
 * Entrega el catálogo de licitaciones de la API y el estado de su carga.
 *
 * @returns {{licitaciones: Array<object>, estado: 'cargando' | 'listo' | 'error', error: Error | null, recargar: Function}} Catálogo, estado y acción para reintentar.
 * @throws {Error} Si se usa fuera de un `LicitacionesProvider`.
 */
export const useLicitaciones = () => {
  const context = useContext(LicitacionesContext)

  if (!context) {
    throw new Error('useLicitaciones must be used within a LicitacionesProvider')
  }

  return context
}
