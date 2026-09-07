import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

function LoginPage() {
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
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      navigate('/licitaciones')
    }
  }

  const handleSocialLogin = (provider) => {
    login({
      name: `Usuario ${provider}`,
      email: `usuario@${provider.toLowerCase()}.com`,
      photoUrl: `https://ui-avatars.com/api/?name=Usuario+${provider}&background=0E1B38&color=ffffff`,
    })
    navigate('/licitaciones')
  }

  return (
    <div className="login-page">
      {/* Columna Izquierda: Identidad Institucional (Figma Wireframe) */}
      <div className="login-brand-panel">
        <div className="login-brand-header">
          <Link to="/" className="login-brand-badge" title="Ir al inicio">
            <div className="login-shield" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.13 8.78-7 9.88-3.87-1.1-7-5.34-7-9.88V6.3l7-3.12zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z" />
              </svg>
            </div>
            <div className="login-brand-titles">
              <span className="login-republic">REPÚBLICA DE CHILE</span>
              <span className="login-institution">UNIVERSIDAD DE VALPARAÍSO</span>
            </div>
          </Link>
        </div>

        <div className="login-gold-bar" aria-hidden="true"></div>

        <div className="login-brand-main">
          <h1 className="login-title">
            Sistema de
            <span>Gestión de</span>
            <span>Licitaciones</span>
          </h1>
          <p className="login-description">
            Plataforma centralizada para la consulta, seguimiento y postulación a procesos de compra
            universitaria.
          </p>
        </div>

        <div className="login-metrics">
          <div className="metric-box">
            <span className="metric-number">100%</span>
            <span className="metric-label">En línea</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">24/7</span>
            <span className="metric-label">Disponibilidad</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">OFICIAL</span>
            <span className="metric-label">Transparencia</span>
          </div>
        </div>

        <div className="login-brand-footer">
          <span>© 2026 Universidad de Valparaíso · Todos los derechos reservados</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Acceso */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <span className="login-overline">MÓDULO DE ACCESO</span>
            <h2 className="login-heading">
              {isLoginMode ? 'Bienvenido al sistema' : 'Crear cuenta institucional'}
            </h2>
            <p className="login-subheading">
              {isLoginMode
                ? 'Ingrese sus credenciales institucionales para continuar'
                : 'Complete sus datos para solicitar una cuenta en el sistema'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {!isLoginMode && (
              <div className="form-field">
                <label htmlFor="page-name">NOMBRE COMPLETO</label>
                <input
                  type="text"
                  id="page-name"
                  name="name"
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'field-error' : ''}
                />
                {errors.name && <span className="field-error-msg">{errors.name}</span>}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="page-email">CORREO ELECTRÓNICO</label>
              <input
                type="email"
                id="page-email"
                name="email"
                placeholder="usuario@uv.cl"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'field-error' : ''}
                autoComplete="email"
              />
              {errors.email && <span className="field-error-msg">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="page-password">CONTRASEÑA</label>
              <div className="field-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="page-password"
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'field-error' : ''}
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="field-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="field-error-msg">{errors.password}</span>}
            </div>

            {!isLoginMode && (
              <div className="form-field">
                <label htmlFor="page-confirmPassword">CONFIRMAR CONTRASEÑA</label>
                <input
                  type="password"
                  id="page-confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'field-error' : ''}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <span className="field-error-msg">{errors.confirmPassword}</span>
                )}
              </div>
            )}

            {isLoginMode && (
              <div className="field-forgot-link">
                <button
                  type="button"
                  className="btn-link-forgot"
                  onClick={() =>
                    alert(
                      'Para restablecer su contraseña institucional, comuníquese con el soporte TI.',
                    )
                  }
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
            )}

            <button type="submit" className="login-submit-btn">
              {isLoginMode ? 'Ingresar' : 'Registrarse'}
            </button>
          </form>

          {/* Aviso Institucional */}
          <div className="login-notice-card">
            <div className="notice-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <p className="notice-card-text">
              Para acceder debe contar con una cuenta institucional activa. Si presenta problemas
              para ingresar, contacte a soporte técnico.
            </p>
          </div>

          {/* Inicio con Proveedores */}
          <div className="login-social-section">
            <p className="social-divider">O continúa con</p>
            <div className="social-group">
              <button
                type="button"
                className="btn-social-item google"
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
                className="btn-social-item github"
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

          <div className="login-mode-switch">
            <p>
              {isLoginMode ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button
                type="button"
                className="btn-switch-action"
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

          <div className="login-bottom-bar">
            <span className="bottom-links">Términos y Condiciones · Privacidad</span>
            <span className="bottom-status">
              <span className="dot-green"></span>
              Sistema Operativo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
