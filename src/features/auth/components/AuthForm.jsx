import { useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'

const demoEmail = 'demo@ejemplo.cl'

export default function AuthForm({ onComplete, inDialog = false }) {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [notice, setNotice] = useState('')
  const formRef = useRef(null)
  const id = useId()
  const Heading = inDialog ? 'h2' : 'h1'

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const email = values.get('email').trim()
    if (!isLogin && !values.get('name').trim()) {
      form.elements.name.value = ''
      form.reportValidity()
      return
    }
    if (!isLogin && values.get('password') !== values.get('confirmPassword')) {
      setPasswordError('Las contraseñas no coinciden.')
      form.elements.confirmPassword.focus()
      return
    }
    const cuenta = { email, name: isLogin ? email.split('@')[0] : values.get('name').trim() }
    if (isLogin) login(cuenta)
    else register(cuenta)
    onComplete()
  }

  function useExample() {
    const { elements } = formRef.current
    elements.email.value = demoEmail
    elements.password.value = 'acceso-demo'
    if (!isLogin) {
      elements.name.value = 'Cuenta de prueba'
      elements.confirmPassword.value = elements.password.value
    }
    setPasswordError('')
    setNotice('Datos de ejemplo listos.')
  }

  function simulateProvider(provider) {
    login({ name: 'Usuario ' + provider, email: 'usuario@' + provider.toLowerCase() + '.com' })
    onComplete()
  }

  return (
    <div className="auth-form-panel">
      <Heading className="page-heading auth-title">
        {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
      </Heading>
      <p className="auth-note" id={id + '-note'}>
        <strong>Sesión simulada.</strong> Usa datos de ejemplo para probar el acceso.
      </p>
      <form
        ref={formRef}
        className="auth-form"
        onSubmit={handleSubmit}
        aria-describedby={id + '-note'}
      >
        {!isLogin && (
          <label>
            Nombre
            <input name="name" autoComplete="name" required />
          </label>
        )}
        <label>
          Correo electrónico
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder={demoEmail}
            required
          />
        </label>
        <div>
          <label htmlFor={id + '-password'}>Contraseña</label>
          <div className="auth-password">
            <input
              id={id + '-password'}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              onChange={() => setPasswordError('')}
              required
            />
            <button
              type="button"
              className="text-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            </button>
          </div>
        </div>
        {!isLogin && (
          <label>
            Confirmar contraseña
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? id + '-error' : undefined}
              onChange={() => setPasswordError('')}
              required
            />
            {passwordError && (
              <span role="alert" className="auth-error" id={id + '-error'}>
                {passwordError}
              </span>
            )}
          </label>
        )}
        <button type="submit" className="button button--primary">
          {isLogin ? 'Iniciar sesión de prueba' : 'Crear cuenta de prueba'}
        </button>
        <button type="button" className="text-button" onClick={useExample}>
          Rellenar con datos de ejemplo
        </button>
        <p className="auth-feedback" role="status">
          {notice}
        </p>
      </form>
      <div className="auth-alternatives">
        <p>Acceso simulado con</p>
        <div className="auth-social">
          <button type="button" className="button" onClick={() => simulateProvider('Google')}>
            Google
          </button>
          <button type="button" className="button" onClick={() => simulateProvider('GitHub')}>
            GitHub
          </button>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setIsLogin(!isLogin)
            setPasswordError('')
            setNotice('')
          }}
        >
          {isLogin ? 'Crear una cuenta de prueba' : 'Volver al inicio de sesión'}
        </button>
      </div>
    </div>
  )
}

AuthForm.propTypes = {
  onComplete: PropTypes.func.isRequired,
  inDialog: PropTypes.bool,
}
