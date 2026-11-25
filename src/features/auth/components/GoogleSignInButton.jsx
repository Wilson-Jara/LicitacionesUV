import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import { GOOGLE_CLIENT_ID, cargarGoogleIdentity } from '../services/googleIdentity.js'

/**
 * Botón oficial «Iniciar sesión con Google». Al elegir una cuenta, Google entrega un ID token
 * que se envía al backend con `loginWithGoogle`; si la API lo acepta, se llama `onComplete`.
 *
 * @param {object} props
 * @param {() => void} props.onComplete - Se llama cuando la sesión quedó iniciada.
 * @returns {import('react').JSX.Element}
 */
export default function GoogleSignInButton({ onComplete }) {
  const { loginWithGoogle } = useAuth()
  const contenedorRef = useRef(null)
  const [estado, setEstado] = useState('cargando')
  const [error, setError] = useState('')

  // Las funciones cambian en cada render; se guardan en una ref para que el callback de Google
  // (registrado una sola vez) use siempre las actuales.
  const accionesRef = useRef({ loginWithGoogle, onComplete })
  useEffect(() => {
    accionesRef.current = { loginWithGoogle, onComplete }
  })

  useEffect(() => {
    let activo = true
    cargarGoogleIdentity()
      .then((googleId) => {
        if (!activo || !contenedorRef.current) return
        googleId.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            setEstado('enviando')
            setError('')
            try {
              await accionesRef.current.loginWithGoogle(credential)
              accionesRef.current.onComplete()
            } catch (fallo) {
              setError(fallo.message || 'No se pudo iniciar sesión con Google.')
              setEstado('listo')
            }
          },
        })
        googleId.renderButton(contenedorRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          locale: 'es',
        })
        setEstado('listo')
      })
      .catch((fallo) => {
        if (!activo) return
        setError(fallo.message)
        setEstado('error')
      })
    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="auth-google">
      <div ref={contenedorRef} aria-busy={estado !== 'listo'} />
      <p className="auth-feedback" role="status">
        {estado === 'cargando' && 'Cargando inicio de sesión con Google…'}
        {estado === 'enviando' && 'Verificando tu cuenta de Google…'}
      </p>
      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
    </div>
  )
}

GoogleSignInButton.propTypes = {
  onComplete: PropTypes.func.isRequired,
}
