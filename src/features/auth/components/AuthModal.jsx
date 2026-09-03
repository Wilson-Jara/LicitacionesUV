import { useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import './AuthModal.css'

function AuthModal({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
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
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!isLoginMode && !formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio'
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
        // Simulated Login
        login({
          name: formData.email.split('@')[0],
          email: formData.email,
          photoUrl: `https://ui-avatars.com/api/?name=${formData.email.split('@')[0]}&background=random`,
        })
      } else {
        // Simulated Register
        register({
          name: formData.name,
          email: formData.email,
          photoUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
        })
      }
      onClose()
    }
  }

  const handleSocialLogin = (provider) => {
    login({
      name: `Usuario ${provider}`,
      email: `usuario@${provider.toLowerCase()}.com`,
      photoUrl: `https://ui-avatars.com/api/?name=Usuario+${provider}&background=random`,
    })
    onClose()
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="auth-modal-title">{isLoginMode ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          )}
          <button type="submit" className="btn-submit">
            {isLoginMode ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div className="social-login">
          <p>O continúa con</p>
          <div className="social-buttons">
            <button
              type="button"
              className="btn-social google"
              onClick={() => handleSocialLogin('Google')}
            >
              Google
            </button>
            <button
              type="button"
              className="btn-social github"
              onClick={() => handleSocialLogin('GitHub')}
            >
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
      </div>
    </div>
  )
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default AuthModal
