import PropTypes from 'prop-types'
import { motion as Motion } from 'motion/react'
import { Star } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useFavoritos } from '../../favoritos/hooks/useFavoritos'
import { isLicitacionCerrada } from '../licitacionUtils.js'

export default function FavoritoButton({ licitacion, compact = false, onRemove }) {
  const { user, openAuthModal } = useAuth()
  const { isFavorito, agregarFavorito, quitarFavorito } = useFavoritos()
  const guardado = isFavorito(licitacion.id)
  const disabled = !guardado && isLicitacionCerrada(licitacion.closingDate)
  const accion = guardado ? 'Quitar' : 'Guardar'

  function toggle() {
    if (!user) openAuthModal()
    else if (guardado) {
      quitarFavorito(licitacion.id)
      onRemove?.()
    } else agregarFavorito(licitacion)
  }

  return (
    <button
      type="button"
      className="button favorito-button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={guardado}
      aria-label={accion + ' favorito: ' + licitacion.title}
    >
      <Motion.span
        key={guardado ? 'saved' : 'unsaved'}
        style={{ display: 'inline-flex' }}
        initial={guardado ? { scale: 0.7, rotate: -18 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 22 }}
        aria-hidden="true"
      >
        <Star size={17} fill={guardado ? 'currentColor' : 'none'} />
      </Motion.span>
      <span>{compact ? accion : accion + ' favorito'}</span>
    </button>
  )
}

FavoritoButton.propTypes = {
  licitacion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
  }).isRequired,
  compact: PropTypes.bool,
  onRemove: PropTypes.func,
}
