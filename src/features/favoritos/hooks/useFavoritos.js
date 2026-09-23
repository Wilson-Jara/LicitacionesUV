import { useContext } from 'react'
import { FavoritosContext } from '../../../app/providers/FavoritosProvider'

export const useFavoritos = () => {
  const context = useContext(FavoritosContext)

  if (!context) {
    throw new Error('useFavoritos must be used within a FavoritosProvider')
  }

  return context
}
