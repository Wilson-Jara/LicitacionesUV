import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

function Navbar() {
  const { user, logout, openAuthModal } = useAuth()
  const { pathname, search } = useLocation()
  const isLoginPage = pathname === '/login'
  const carryFilters = pathname === '/licitaciones' || pathname === '/estadisticas'

  return (
    <header className="navbar">
      <div className="frame navbar__inner">
        <Link to="/licitaciones" className="navbar__brand">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M9 10h14M9 16h14M9 22h8" stroke="var(--primary-contrast)" strokeWidth="2" />
          </svg>
          Licitaciones UV
        </Link>
        <nav className="navbar__links" aria-label="Navegación principal">
          <NavLink to={{ pathname: '/licitaciones', search: carryFilters ? search : '' }}>
            Explorar
          </NavLink>
          <NavLink to="/favoritos">Favoritos</NavLink>
          <NavLink to={{ pathname: '/estadisticas', search: carryFilters ? search : '' }}>
            Estadísticas
          </NavLink>
          <NavLink to="/configuracion/umbrales">Umbrales</NavLink>
        </nav>
        <div className="navbar__actions">
          <ThemeToggle />
          {user ? (
            <button type="button" className="text-button" onClick={logout}>
              Cerrar sesión
            </button>
          ) : (
            !isLoginPage && (
              <button type="button" className="text-button" onClick={openAuthModal}>
                Iniciar sesión
              </button>
            )
          )}
        </div>
        {user && <span className="navbar__user">{user.name}</span>}
      </div>
    </header>
  )
}

export default Navbar
