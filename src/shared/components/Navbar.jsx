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
          LicitacionesUV
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
