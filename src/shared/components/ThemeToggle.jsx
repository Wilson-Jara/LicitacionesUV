import { useTheme } from '../hooks/useTheme'
import './ThemeToggle.css'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      aria-pressed={isDark}
      title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path
              d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5h.01L12 5m0 14v3m-9-9H0m24 0h-3M4.99 4.99l2.12 2.12M16.89 16.89l2.12 2.12M4.99 19.01l2.12-2.12M16.89 7.11l2.12-2.12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
    </button>
  )
}

export default ThemeToggle
