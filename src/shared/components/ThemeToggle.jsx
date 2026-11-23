import { AnimatePresence, motion as Motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import './ThemeToggle.css'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="button theme-toggle"
      onClick={toggleTheme}
      aria-label="Tema oscuro"
      aria-pressed={isDark}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.span
            key={theme}
            className="theme-toggle__glyph"
            initial={{ opacity: 0, rotate: -35, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 35, scale: 0.75 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Motion.span>
        </AnimatePresence>
      </span>
      <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
    </button>
  )
}

export default ThemeToggle
