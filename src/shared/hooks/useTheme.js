import { useContext } from 'react'
import { ThemeContext } from '../../app/providers/ThemeProvider'

/**
 * Entrega el tema visual actual y la función para alternarlo.
 *
 * @returns {{theme: 'light'|'dark', toggleTheme: Function}} Tema actual y
 *   función que cambia entre claro y oscuro.
 * @throws {Error} Si se usa fuera de un `ThemeProvider`.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
