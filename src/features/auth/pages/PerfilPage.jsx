import { useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth.js'
import './PerfilPage.css'

function PerfilForm({ user, updateProfile }) {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const { nombre, correo } = event.currentTarget.elements
    const name = nombre.value.trim()
    const email = correo.value.trim()
    const nextErrors = {}

    if (!name) nextErrors.name = 'Ingresa tu nombre.'
    if (!email) nextErrors.email = 'Ingresa tu correo de contacto.'
    else if (correo.validity.typeMismatch) nextErrors.email = 'Ingresa un correo válido.'

    setErrors(nextErrors)
    setStatus('')
    if (nextErrors.name || nextErrors.email) {
      const invalidField = nextErrors.name ? nombre : correo
      invalidField.focus()
      return
    }

    if (!updateProfile({ name, email })) {
      setErrors({
        storage:
          'No pudimos guardar el perfil. Revisa el almacenamiento del navegador e inténtalo de nuevo.',
      })
      return
    }

    nombre.value = name
    correo.value = email
    setStatus('Perfil guardado.')
  }

  return (
    <form
      className="perfil__panel perfil__form"
      noValidate
      onSubmit={handleSubmit}
      onChange={() => {
        setStatus('')
        setErrors({})
      }}
    >
      <div className="perfil__field">
        <label htmlFor="perfil-nombre">Nombre</label>
        <input
          id="perfil-nombre"
          name="nombre"
          autoComplete="name"
          defaultValue={user.name}
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'perfil-nombre-error' : undefined}
        />
        {errors.name && (
          <p role="alert" id="perfil-nombre-error" className="perfil__error">
            {errors.name}
          </p>
        )}
      </div>
      <div className="perfil__field">
        <label htmlFor="perfil-correo">Correo de contacto</label>
        <input
          id="perfil-correo"
          name="correo"
          type="email"
          autoComplete="email"
          defaultValue={user.contactEmail}
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? 'perfil-correo-error perfil-correo-ayuda' : 'perfil-correo-ayuda'
          }
        />
        {errors.email && (
          <p role="alert" id="perfil-correo-error" className="perfil__error">
            {errors.email}
          </p>
        )}
        <p id="perfil-correo-ayuda" className="perfil__hint">
          Para volver a entrar con tu cuenta de prueba, usa {user.email}.
        </p>
      </div>
      {errors.storage && (
        <p role="alert" className="perfil__error">
          {errors.storage}
        </p>
      )}
      <div className="perfil__actions">
        <button type="submit" className="button button--primary">
          Guardar cambios
        </button>
        <p role="status" className="perfil__status">
          {status}
        </p>
      </div>
    </form>
  )
}

PerfilForm.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    contactEmail: PropTypes.string.isRequired,
  }).isRequired,
  updateProfile: PropTypes.func.isRequired,
}

export default function PerfilPage() {
  const { user, updateProfile, openAuthModal } = useAuth()

  return (
    <section className="frame perfil" aria-labelledby="perfil-title">
      <h1 id="perfil-title">Mi perfil</h1>
      {user ? (
        <>
          <p className="perfil__intro">
            Edita el nombre y el correo de contacto de tu cuenta de prueba.
          </p>
          <PerfilForm key={user.email} user={user} updateProfile={updateProfile} />
        </>
      ) : (
        <div className="perfil__panel">
          <p className="perfil__guest">Inicia sesión para editar tu perfil en este navegador.</p>
          <button type="button" className="button button--primary" onClick={openAuthModal}>
            Iniciar sesión
          </button>
        </div>
      )}
    </section>
  )
}
