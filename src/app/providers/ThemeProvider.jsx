/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

/** Contexto con el tema actual y la función para alternarlo. Se consume con `useTheme`. */
export const ThemeContext = createContext(null)

const THEME_STORAGE_KEY = 'licitacionesuv-theme'
const VALID_THEMES = ['light', 'dark']

/**
 * Decide el tema al abrir la app: primero el guardado en `localStorage`, si es
 * válido; si no, la preferencia del sistema operativo. Si `localStorage` está
 * bloqueado (por ejemplo, en modo privado) no falla y usa la preferencia del sistema.
 *
 * @returns {'light'|'dark'} Tema inicial.
 */
function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (VALID_THEMES.includes(stored)) {
      return stored
    }
  } catch {
    // localStorage puede estar bloqueado; se usa la preferencia del sistema
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

/**
 * Proveedor del tema claro/oscuro de toda la aplicación. Aplica el tema con el
 * atributo `data-theme` en `<html>` (las variables CSS de `index.css` cambian
 * según ese atributo) y lo guarda en `localStorage` en cada cambio.
 *
 * El script inline de `index.html` aplica el mismo tema antes de que cargue
 * React, para evitar un parpadeo del tema equivocado al abrir la página.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido de la aplicación.
 * @returns {JSX.Element}
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // sin persistencia disponible, el tema solo vive en memoria
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = {
    theme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
