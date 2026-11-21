import PropTypes from 'prop-types'
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
      aria-label={accion + ' favorito: ' + licitacion.title}
    >
      {compact ? accion : accion + ' favorito'}
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
