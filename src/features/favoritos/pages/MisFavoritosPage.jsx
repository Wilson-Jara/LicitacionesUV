import { useMemo } from 'react'
import { LicitacionCard } from '../../licitaciones/components/LicitacionCard'
import { useFavoritos } from '../hooks/useFavoritos'
import { useAuth } from '../../auth/hooks/useAuth'
import mockData from '../../licitaciones/data/licitaciones.mock.json'
import './MisFavoritosPage.css'

function MisFavoritosPage() {
  const { user, openAuthModal } = useAuth()
  const { favoritos } = useFavoritos()

  const licitaciones = useMemo(() => {
    return favoritos.map((f) => mockData.find((l) => l.id === f.idLicitacion)).filter(Boolean)
  }, [favoritos])

  if (!user) {
    return (
      <section className="mis-favoritos">
        <h1 className="mis-favoritos__title">Mis favoritos</h1>
        <div className="mis-favoritos__empty">
          <p>Inicia sesión para ver y guardar tus licitaciones favoritas.</p>
          <button type="button" className="mis-favoritos__btn" onClick={openAuthModal}>
            Iniciar sesión
          </button>
        </div>
      </section>
    )
  }

  const sinFavoritos = favoritos.length === 0

  return (
    <section className="mis-favoritos">
      <h1 className="mis-favoritos__title">Mis favoritos</h1>
      {licitaciones.length === 0 ? (
        <div className="mis-favoritos__empty">
          <h3>{sinFavoritos ? 'Aún no tienes favoritos' : 'Licitaciones no disponibles'}</h3>
          <p>
            {sinFavoritos
              ? 'Guarda licitaciones desde el explorador para hacerles seguimiento.'
              : 'Las licitaciones que guardaste ya no están disponibles en el catálogo.'}
          </p>
        </div>
      ) : (
        <div className="mis-favoritos__grid">
          {licitaciones.map((licitacion) => (
            <LicitacionCard key={licitacion.id} licitacion={licitacion} />
          ))}
        </div>
      )}
    </section>
  )
}

export default MisFavoritosPage
