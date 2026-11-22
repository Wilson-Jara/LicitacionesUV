import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { motion as Motion } from 'motion/react'
import { X } from 'lucide-react'
import AuthForm from './AuthForm.jsx'
import AuthIntro from './AuthIntro.jsx'
import './AuthModal.css'

export default function AuthModal({ isOpen, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    const opener = document.activeElement
    if (!dialog.open) dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
      const fallback = document.getElementById('contenido')
      const focusTarget =
        opener instanceof HTMLElement && opener !== document.body && opener.isConnected
          ? opener
          : fallback
      focusTarget?.focus({ preventScroll: true })
    }
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className="auth-dialog"
      aria-label="Acceso simulado"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const elements = event.currentTarget.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), a[href]',
        )
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (event.shiftKey && event.target === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && event.target === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      {isOpen && (
        <Motion.div
          className="auth-layout"
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        >
          <button type="button" className="button auth-close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
            <span>Cerrar</span>
          </button>
          <AuthForm inDialog onComplete={onClose} />
          <AuthIntro />
        </Motion.div>
      )}
    </dialog>
  )
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
