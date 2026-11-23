import { useTheme } from '../hooks/useTheme'
import './ThemeToggle.css'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="button theme-toggle"
      onClick={toggleTheme}
      aria-label="Tema oscuro"
      aria-pressed={theme === 'dark'}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M20.9 13.4A9 9 0 0 1 10.6 3.1a9 9 0 1 0 10.3 10.3Z" />
      </svg>
      <span>Tema oscuro</span>
    </button>
  )
}

export default ThemeToggle
