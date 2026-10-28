import { Outlet } from 'react-router-dom'
import Navbar from '../../shared/components/Navbar.jsx'
import AuthModal from '../../features/auth/components/AuthModal.jsx'
import { useAuth } from '../../features/auth/hooks/useAuth'

/**
 * Mantiene la navegación y el modal de acceso alrededor de la página pública activa.
 * El estado del modal proviene del contexto de autenticación para abrirlo desde otras páginas.
 *
 * @returns {JSX.Element} Estructura compartida de las rutas públicas.
 */
function PublicLayout() {
  const { isAuthModalOpen, closeAuthModal } = useAuth()

  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  )
}

export default PublicLayout
