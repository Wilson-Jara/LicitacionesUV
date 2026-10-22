import { Outlet } from 'react-router-dom'
import Navbar from '../../shared/components/Navbar.jsx'
import AuthModal from '../../features/auth/components/AuthModal.jsx'
import { useAuth } from '../../features/auth/hooks/useAuth'

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
