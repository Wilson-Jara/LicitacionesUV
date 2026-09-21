/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

export const ThemeContext = createContext(null)

const THEME_STORAGE_KEY = 'licitacionesuv-theme'
const VALID_THEMES = ['light', 'dark']

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
