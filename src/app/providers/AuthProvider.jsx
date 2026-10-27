/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import PropTypes from 'prop-types'

/**
 * Contexto de React para compartir el estado de usuario y la apertura del modal de autenticación.
 */
export const AuthContext = createContext(null)

/**
 * Proveedor de contexto que administra el estado global de autenticación del usuario
 * y la visibilidad del modal de acceso (`AuthModal`).
 *
 * @param {object} props - Propiedades del componente.
 * @param {import('react').ReactNode} props.children - Nodos hijos que tendrán acceso al contexto.
 * @returns {import('react').JSX.Element} Componente proveedor de contexto de autenticación.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const login = (userData) => {
    setUser(userData)
    setIsAuthModalOpen(false)
  }

  const logout = () => {
    setUser(null)
  }

  const register = (userData) => {
    setUser(userData)
    setIsAuthModalOpen(false)
  }

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  const value = {
    user,
    login,
    logout,
    register,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
