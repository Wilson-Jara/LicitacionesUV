/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const register = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
