import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion as Motion } from 'motion/react'
import { LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useFavoritos } from '../../features/favoritos/hooks/useFavoritos'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

const pillSpring = { type: 'spring', stiffness: 420, damping: 32 }

function Navbar() {
  const { user, logout, openAuthModal } = useAuth()
  const { favoritos } = useFavoritos()
  const { pathname, search } = useLocation()
  const isLoginPage = pathname === '/login'
  const carryFilters = pathname === '/licitaciones' || pathname === '/estadisticas'
  const navItems = [
    {
      key: 'explorar',
      to: { pathname: '/licitaciones', search: carryFilters ? search : '' },
      label: 'Explorar',
      active: pathname === '/licitaciones' || pathname.startsWith('/licitaciones/'),
    },
    {
      key: 'favoritos',
      to: '/favoritos',
      label: 'Favoritos',
      count: user ? favoritos.length : 0,
      active: pathname === '/favoritos',
    },
    {
      key: 'estadisticas',
      to: { pathname: '/estadisticas', search: carryFilters ? search : '' },
      label: 'Estadísticas',
      active: pathname === '/estadisticas',
    },
    {
      key: 'umbrales',
      to: '/configuracion/umbrales',
      label: 'Umbrales',
      active: pathname === '/configuracion/umbrales',
    },
  ]

  if (user) {
    navItems.push({
      key: 'perfil',
      to: '/perfil',
      label: 'Perfil',
      active: pathname === '/perfil',
    })
  }

  return (
    <header className="navbar">
      <div className="frame navbar__inner">
        <Link to="/licitaciones" className="navbar__brand">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path
              d="M9 10h14M9 16h10M9 22h12"
              stroke="var(--primary-contrast)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          Licitaciones UV
        </Link>
        <nav className="navbar__links" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink key={item.key} to={item.to} className="navbar__link">
              {item.active && (
                <Motion.span
                  layoutId="navbar-active-pill"
                  className="navbar__active-pill"
                  transition={pillSpring}
                  aria-hidden="true"
                />
              )}
              <span className="navbar__link-label">
                {item.label}
                {item.count > 0 && (
                  <Motion.span
                    key={item.count}
                    className="navbar__count"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={pillSpring}
                    aria-label={item.count + ' guardadas'}
                  >
                    {item.count}
                  </Motion.span>
                )}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="navbar__actions">
          <ThemeToggle />
          {user ? (
            <button type="button" className="text-button navbar__session-btn" onClick={logout}>
              <LogOut size={18} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          ) : (
            !isLoginPage && (
              <button
                type="button"
                className="button button--primary navbar__session-btn"
                onClick={openAuthModal}
              >
                <LogIn size={18} aria-hidden="true" />
                <span>Iniciar sesión</span>
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
