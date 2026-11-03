/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../../features/auth/hooks/useAuth'
import {
  addFavorito,
  getFavoritos,
  getUserId,
  readFavoritosStore,
  removeFavorito,
  writeFavoritosStore,
} from '../../features/favoritos/data/favoritosStorage'

/** Contexto de favoritos del usuario actual; se consume mediante `useFavoritos`. */
export const FavoritosContext = createContext(null)

function getStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Provee los favoritos del usuario autenticado y las acciones para guardarlos o quitarlos.
 * Lee la configuración local al iniciar y persiste los cambios cuando el almacenamiento está disponible.
 * Sin un usuario identificado, las acciones de agregar y quitar no modifican los favoritos.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido con acceso al contexto de favoritos.
 * @returns {JSX.Element} Proveedor de favoritos para los componentes descendientes.
 */
export const FavoritosProvider = ({ children }) => {
  const { user } = useAuth()
  const [store, setStore] = useState(() => readFavoritosStore(getStorage()))
  const userId = getUserId(user)

  const favoritos = useMemo(() => getFavoritos(store, userId), [store, userId])

  useEffect(() => {
    writeFavoritosStore(getStorage(), store)
  }, [store])

  const isFavorito = useCallback(
    (idLicitacion) => favoritos.some((f) => f.idLicitacion === idLicitacion),
    [favoritos],
  )

  const agregarFavorito = useCallback(
    (licitacion) => {
      if (!userId) return
      setStore((prev) => addFavorito(prev, userId, licitacion.id, new Date().toISOString()))
    },
    [userId],
  )

  const quitarFavorito = useCallback(
    (idLicitacion) => {
      if (!userId) return
      setStore((prev) => removeFavorito(prev, userId, idLicitacion))
    },
    [userId],
  )

  const value = useMemo(
    () => ({ favoritos, isFavorito, agregarFavorito, quitarFavorito }),
    [favoritos, isFavorito, agregarFavorito, quitarFavorito],
  )

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
}

FavoritosProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
