import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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
  const { pathname } = useLocation()
  const main = useRef(null)
  const previousPath = useRef(pathname)

  useEffect(() => {
    const heading = main.current.querySelector('h1')
    if (heading) document.title = heading.textContent + ' · Licitaciones UV'
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      window.scrollTo(0, 0)
      main.current.focus({ preventScroll: true })
    }
  }, [pathname])

  return (
    <div className="public-layout">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Navbar />
      <main ref={main} className="public-layout__main" id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  )
}

export default PublicLayout
