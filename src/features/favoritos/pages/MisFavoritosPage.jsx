import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { LicitacionCard } from '../../licitaciones/components/LicitacionCard'
import { useFavoritos } from '../hooks/useFavoritos'
import { useAuth } from '../../auth/hooks/useAuth'
import mockData from '../../licitaciones/data/licitaciones.mock.json'
import './MisFavoritosPage.css'

function MisFavoritosPage() {
  const { user, openAuthModal } = useAuth()
  const { favoritos } = useFavoritos()
  const heading = useRef(null)
  const licitaciones = favoritos
    .map((favorito) => mockData.find((item) => item.id === favorito.idLicitacion))
    .filter(Boolean)

  return (
    <section className="frame mis-favoritos" aria-labelledby="favoritos-title">
      <h1 id="favoritos-title" ref={heading} tabIndex={-1}>
        Mis favoritos
      </h1>
      {user && (
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
      {user && licitaciones.length === 0 && (
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
