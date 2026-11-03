import { useContext } from 'react'
import { FavoritosContext } from '../../../app/providers/FavoritosProvider'

/**
 * Entrega los favoritos del usuario actual y las acciones para consultarlos o modificarlos.
 *
 * @returns {{favoritos: Array<object>, isFavorito: Function, agregarFavorito: Function, quitarFavorito: Function}} Estado y acciones de favoritos.
 * @throws {Error} Si se usa fuera de un `FavoritosProvider`.
 */
export const useFavoritos = () => {
  const context = useContext(FavoritosContext)

  if (!context) {
    throw new Error('useFavoritos must be used within a FavoritosProvider')
  }

  return context
}
