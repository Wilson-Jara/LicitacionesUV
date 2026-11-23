import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { LicitacionCard } from '../../licitaciones/components/LicitacionCard'
import { useFavoritos } from '../hooks/useFavoritos'
import { useAuth } from '../../auth/hooks/useAuth'
import { useLicitaciones } from '../../licitaciones/hooks/useLicitaciones'
import { EstadoCatalogo } from '../../licitaciones/components/EstadoCatalogo'
import './MisFavoritosPage.css'

/**
 * Muestra las licitaciones favoritas del usuario dentro del catálogo que entrega la API.
 * Sin sesión invita a iniciar sesión; mientras el catálogo carga o si la API falla,
 * muestra ese estado en lugar de declarar los favoritos como no disponibles.
 *
 * @returns {JSX.Element} Página de favoritos.
 */
function MisFavoritosPage() {
  const { user, openAuthModal } = useAuth()
  const { favoritos } = useFavoritos()
  const { licitaciones: catalogo, estado, recargar } = useLicitaciones()
  const heading = useRef(null)
  const licitaciones = favoritos
    .map((favorito) => catalogo.find((item) => item.id === favorito.idLicitacion))
    .filter(Boolean)
  const esperandoCatalogo = user && favoritos.length > 0 && estado !== 'listo'

  return (
    <section className="frame mis-favoritos" aria-labelledby="favoritos-title">
      <h1 id="favoritos-title" ref={heading} tabIndex={-1}>
        Mis favoritos
      </h1>
      {esperandoCatalogo && <EstadoCatalogo estado={estado} onReintentar={recargar} />}
      {user && !esperandoCatalogo && (
        <p className="mis-favoritos__count" role="status">
          {licitaciones.length === 1
            ? '1 licitación guardada'
            : licitaciones.length + ' licitaciones guardadas'}
        </p>
      )}
      {!user && (
        <div className="mis-favoritos__empty">
          <p>Inicia sesión para ver y guardar tus licitaciones favoritas.</p>
          <button type="button" className="button button--primary" onClick={openAuthModal}>
            Iniciar sesión
          </button>
        </div>
      )}
      {user && !esperandoCatalogo && licitaciones.length === 0 && (
        <div className="mis-favoritos__empty">
          <h2>
            {favoritos.length === 0 ? 'Aún no tienes favoritos' : 'Licitaciones no disponibles'}
          </h2>
          <p>
            {favoritos.length === 0
              ? 'Guarda licitaciones desde el explorador para hacerles seguimiento.'
              : 'Las licitaciones que guardaste ya no están disponibles en el catálogo.'}
          </p>
          <Link to="/licitaciones" className="button button--primary">
            Explorar licitaciones
          </Link>
        </div>
      )}
      {user && licitaciones.length > 0 && (
        <ul className="licitaciones-list" role="list">
          {licitaciones.map((licitacion) => (
            <li key={licitacion.id}>
              <LicitacionCard licitacion={licitacion} onRemove={() => heading.current?.focus()} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default MisFavoritosPage
