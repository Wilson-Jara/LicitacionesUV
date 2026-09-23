/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext(null)

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
