import { useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import './AuthModal.css'

/**
 * Modal de autenticación institucional basado en el diseño split-screen de Figma.
 *
 * Presenta un panel izquierdo con la identidad institucional de la Universidad de Valparaíso
 * y un panel derecho con el formulario interactivo para alternar entre inicio de sesión
 * y registro de cuenta, validación de credenciales, alternancia de visibilidad de contraseña
 * y acceso social simulado (Google / GitHub).
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal se encuentra abierto y visible.
 * @param {() => void} props.onClose - Callback para cerrar el modal.
 * @returns {import('react').JSX.Element | null} Diálogo modal accesible o null si está cerrado.
 */
function AuthModal({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const { login, register } = useAuth()

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!isLoginMode && !formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!formData.email.trim()) newErrors.email = 'El correo electrónico es obligatorio'
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria'
    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      if (isLoginMode) {
        login({
          name: formData.email.split('@')[0],
          email: formData.email,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.email.split('@')[0])}&background=0E1B38&color=ffffff`,
        })
      } else {
        register({
          name: formData.name,
          email: formData.email,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0E1B38&color=ffffff`,
        })
      }
      onClose()
    }
  }

  const handleSocialLogin = (provider) => {
    login({
      name: `Usuario ${provider}`,
      email: `usuario@${provider.toLowerCase()}.com`,
      photoUrl: `https://ui-avatars.com/api/?name=Usuario+${provider}&background=0E1B38&color=ffffff`,
    })
    onClose()
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>

        {/* Columna Izquierda: Identidad Institucional (Wireframe Figma) */}
        <div className="auth-modal-brand">
          <div className="brand-header">
            <div className="brand-shield" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.13 8.78-7 9.88-3.87-1.1-7-5.34-7-9.88V6.3l7-3.12zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z" />
              </svg>
            </div>
            <div className="brand-header-text">
              <span className="brand-republic">REPÚBLICA DE CHILE</span>
              <span className="brand-institution">UNIVERSIDAD DE VALPARAÍSO</span>
            </div>
          </div>

          <div className="brand-gold-bar" aria-hidden="true"></div>

          <div className="brand-main">
            <h1 className="brand-title">
              Sistema de
              <span>Gestión de</span>
              <span>Licitaciones</span>
            </h1>
            <p className="brand-description">
              Plataforma centralizada para la consulta, seguimiento y postulación a procesos de
              compra universitaria.
            </p>
          </div>

          <div className="brand-metrics">
            <div className="metric-item">
              <span className="metric-val">100%</span>
              <span className="metric-lbl">En línea</span>
            </div>
            <div className="metric-item">
              <span className="metric-val">24/7</span>
              <span className="metric-lbl">Disponibilidad</span>
            </div>
            <div className="metric-item">
              <span className="metric-val">OFICIAL</span>
              <span className="metric-lbl">Transparencia</span>
            </div>
          </div>

          <div className="brand-footer">
            <span>© 2026 Universidad de Valparaíso · Todos los derechos reservados</span>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Acceso */}
        <div className="auth-modal-body">
          <div className="auth-form-header">
            <span className="auth-overline">MÓDULO DE ACCESO</span>
            <h2 className="auth-modal-title">
              {isLoginMode ? 'Bienvenido al sistema' : 'Crear cuenta'}
            </h2>
            <p className="auth-subtitle">
              {isLoginMode
                ? 'Ingrese sus credenciales institucionales para continuar'
                : 'Complete el formulario para solicitar acceso a la plataforma'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-modal-form" noValidate>
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="modal-name">NOMBRE COMPLETO</label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="modal-email">CORREO ELECTRÓNICO</label>
              <input
                type="email"
                id="modal-email"
                name="email"
                placeholder="usuario@uv.cl"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="modal-password">CONTRASEÑA</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="modal-password"
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="modal-confirmPassword">CONFIRMAR CONTRASEÑA</label>
                <input
                  type="password"
                  id="modal-confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            )}

            {isLoginMode && (
              <div className="forgot-password-link">
                <button
                  type="button"
                  className="btn-forgot-password"
                  onClick={() =>
                    alert(
                      'Para restablecer su contraseña institucional, comuníquese con soporte TI.',
                    )
                  }
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
            )}

            <button type="submit" className="btn-submit">
              {isLoginMode ? 'Ingresar' : 'Registrarse'}
            </button>
          </form>

          {/* Caja de Aviso Institucional de Figma */}
          <div className="institutional-notice">
            <div className="notice-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <p className="notice-text">
              Para acceder debe contar con una cuenta institucional activa. Si presenta problemas
              para ingresar, contacte a soporte técnico.
            </p>
          </div>

          {/* Métodos Alternativos / Sociales preservados */}
          <div className="social-login">
            <p>O continúa con</p>
            <div className="social-buttons">
              <button
                type="button"
                className="btn-social google"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M21.35 11.1h-9.17v2.98h5.26c-.23 1.25-.94 2.3-1.99 3.01v2.5h3.22c1.88-1.73 2.97-4.28 2.97-7.29 0-.42-.04-.81-.1-1.2h-.19z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12.18 21c2.7 0 4.96-.9 6.62-2.42l-3.22-2.5c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.25v2.58C4.9 18.77 8.27 21 12.18 21z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.57 12.91c-.2-.6-.32-1.24-.32-1.91s.12-1.31.32-1.91V6.51H3.25C2.58 7.84 2.2 9.38 2.2 11s.38 3.16 1.05 4.49l3.32-2.58z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.18 4.96c1.47 0 2.79.51 3.82 1.5l2.87-2.87C17.14 2.02 14.88 1 12.18 1 8.27 1 4.9 3.23 3.25 6.51l3.32 2.58c.79-2.37 3-4.13 5.61-4.13z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="btn-social github"
                onClick={() => handleSocialLogin('GitHub')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="auth-modal-footer">
            <p>
              {isLoginMode ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                type="button"
                className="btn-toggle-mode"
                onClick={() => {
                  setIsLoginMode(!isLoginMode)
                  setErrors({})
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' })
                }}
              >
                {isLoginMode ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </p>
          </div>

          <div className="auth-system-status">
            <span className="status-links">Términos · Privacidad</span>
            <span className="status-indicator">
              <span className="status-dot"></span>
              Sistema Operativo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default AuthModal
