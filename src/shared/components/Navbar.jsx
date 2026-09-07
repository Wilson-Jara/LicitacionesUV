import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import AuthModal from '../../features/auth/components/AuthModal'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="navbar">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-shield" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.13 8.78-7 9.88-3.87-1.1-7-5.34-7-9.88V6.3l7-3.12zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z" />
            </svg>
          </span>
          <div className="navbar__brand-text">
            <span className="navbar__brand-name">
              Licitaciones<span className="brand-uv-accent">UV</span>
            </span>
            <span className="navbar__brand-sub">Universidad de Valparaíso</span>
          </div>
        </Link>
        <nav className="navbar__links">
          <Link to="/licitaciones">Licitaciones</Link>
          <Link to="/favoritos">Favoritos</Link>
          {user ? (
            <div className="navbar__user">
              <img src={user.photoUrl} alt="User Avatar" className="navbar__avatar" />
              <div className="navbar__user-info">
                <span className="navbar__user-name">{user.name}</span>
              </div>
              <button onClick={logout} className="navbar__btn-logout">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button onClick={() => setIsModalOpen(true)} className="navbar__btn-login">
              Iniciar sesión
            </button>
          )}
        </nav>
      </header>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default Navbar
