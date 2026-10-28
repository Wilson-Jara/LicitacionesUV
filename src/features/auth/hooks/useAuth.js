import { useContext } from 'react'
import { AuthContext } from '../../../app/providers/AuthProvider'

/**
 * Hook para acceder al contexto global de autenticación y control del modal de acceso.
 *
 * @returns {{
 *   user: {name: string, email: string, photoUrl?: string} | null,
 *   login: (userData: {name: string, email: string, photoUrl?: string}) => void,
 *   logout: () => void,
 *   register: (userData: {name: string, email: string, photoUrl?: string}) => void,
 *   isAuthModalOpen: boolean,
 *   openAuthModal: () => void,
 *   closeAuthModal: () => void
 * }} Estado actual del usuario y funciones para manipular la sesión y el modal.
 * @throws {Error} Si se consume fuera del árbol de un `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
