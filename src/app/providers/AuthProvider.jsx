/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  endDemoSession,
  restoreDemoSession,
  saveProfile,
  startDemoSession,
  withProfile,
} from '../../features/auth/data/profileStorage.js'
import {
  borrarSesionGoogle,
  guardarSesionGoogle,
  leerSesionGoogle,
  obtenerAlmacenamientoSesion,
} from '../../features/auth/data/sesionGoogle.js'
import {
  cerrarSesionRemota,
  iniciarSesionConGoogle,
  obtenerUsuarioActual,
} from '../../features/auth/services/authApi.js'
import { GOOGLE_CLIENT_ID } from '../../features/auth/services/googleIdentity.js'

/**
 * Contexto de React para compartir el estado de usuario y la apertura del modal de autenticación.
 */
export const AuthContext = createContext(null)

// Reutiliza el perfil editable de la cuenta (guardado por correo) también para Google.
const conPerfil = (user) => withProfile(user)

function restaurarSesion() {
  const google = leerSesionGoogle(obtenerAlmacenamientoSesion())
  if (google) return { user: conPerfil(google.user), token: google.token }
  return { user: restoreDemoSession(), token: null }
}

/**
 * Proveedor de contexto que administra el estado global de autenticación del usuario
 * y la visibilidad del modal de acceso (`AuthModal`).
 *
 * Hay dos tipos de sesión:
 * - **Google** (real): el backend entrega un token que se guarda en `sessionStorage` y se valida
 *   con `GET /api/auth/me` al recargar. Solo existe si `VITE_GOOGLE_CLIENT_ID` está configurado.
 * - **Demostración** (simulada): el formulario de correo y contraseña, sin backend.
 *
 * @param {object} props - Propiedades del componente.
 * @param {import('react').ReactNode} props.children - Nodos hijos que tendrán acceso al contexto.
 * @returns {import('react').JSX.Element} Componente proveedor de contexto de autenticación.
 */
export const AuthProvider = ({ children }) => {
  const [inicial] = useState(restaurarSesion)
  const [user, setUser] = useState(inicial.user)
  const [token, setToken] = useState(inicial.token)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Al recargar con una sesión de Google guardada, se confirma con la API que siga vigente.
  useEffect(() => {
    if (!inicial.token) return
    let activo = true
    obtenerUsuarioActual(inicial.token)
      .then((actual) => {
        if (activo) setUser(conPerfil(actual))
      })
      .catch((error) => {
        // Solo un 401 cierra la sesión; si la API está dormida (Render) se mantiene la guardada.
        if (!activo || error.status !== 401) return
        borrarSesionGoogle(obtenerAlmacenamientoSesion())
        setToken(null)
        setUser(null)
      })
    return () => {
      activo = false
    }
  }, [inicial.token])

  const login = (userData) => {
    setUser(startDemoSession(userData))
    setIsAuthModalOpen(false)
  }

  const loginWithGoogle = async (credential) => {
    const sesion = await iniciarSesionConGoogle(credential)
    guardarSesionGoogle(obtenerAlmacenamientoSesion(), sesion)
    endDemoSession()
    setToken(sesion.token)
    setUser(conPerfil(sesion.user))
    setIsAuthModalOpen(false)
  }

  const logout = () => {
    if (token) {
      cerrarSesionRemota(token)
      borrarSesionGoogle(obtenerAlmacenamientoSesion())
      setToken(null)
    }
    endDemoSession()
    setUser(null)
  }

  const updateProfile = ({ name, email }) => {
    if (!user || !saveProfile(user.email, { name, email })) return false

    // El correo de acceso sigue identificando los favoritos de la cuenta.
    setUser({ ...user, name, contactEmail: email })
    return true
  }

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  const value = {
    user,
    token,
    isGoogleLoginEnabled: Boolean(GOOGLE_CLIENT_ID),
    login,
    loginWithGoogle,
    logout,
    register: login,
    updateProfile,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
