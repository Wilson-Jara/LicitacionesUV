import { Link, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../auth/hooks/useAuth'
import { useFavoritos } from '../../favoritos/hooks/useFavoritos'
import NotFoundPage from '../../../app/routes/NotFoundPage.jsx'
import mockData from '../data/licitaciones.mock.json'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
  isLicitacionCerrada,
} from '../licitacionUtils.js'
import './LicitacionDetailPage.css'

function LicitacionDetailPage() {
  const { id } = useParams()
  const licitacion = mockData.find((item) => item.id === id)

  if (!licitacion) return <NotFoundPage />

  return <LicitacionDetail licitacion={licitacion} />
}

function LicitacionDetail({ licitacion }) {
  const { user, openAuthModal } = useAuth()
  const { isFavorito, agregarFavorito, quitarFavorito } = useFavoritos()
  const guardado = isFavorito(licitacion.id)
  const cerrada = isLicitacionCerrada(licitacion.closingDate)

  const handleToggleFavorito = () => {
    if (cerrada && !guardado) return
    if (!user) {
      openAuthModal()
      return
    }
    if (guardado) {
      quitarFavorito(licitacion.id)
    } else {
      agregarFavorito(licitacion)
    }
  }

  return (
    <section className="licitacion-detail">
      <Link className="licitacion-detail-back" to="/licitaciones">
        ← Volver a licitaciones
      </Link>

      <article className="licitacion-detail-card">
        <header className="licitacion-detail-header">
          <div className="licitacion-detail-badges">
            <span className="licitacion-detail-type">{getTypeLabel(licitacion.type)}</span>
            <span className={`licitacion-detail-status ${cerrada ? 'is-closed' : 'is-open'}`}>
              {cerrada ? 'Cerrada' : 'Vigente'}
            </span>
          </div>
          <h1>{licitacion.title}</h1>
          <p>{licitacion.institution}</p>
        </header>

        <dl className="licitacion-detail-data">
          <div>
            <dt>Monto estimado</dt>
            <dd className="licitacion-detail-amount">
              {formatLicitacionAmount(licitacion.amount, licitacion.currency)}
            </dd>
          </div>
          <div>
            <dt>Moneda</dt>
            <dd>{licitacion.currency}</dd>
          </div>
          <div>
            <dt>Fecha de cierre</dt>
            <dd>{formatLicitacionDate(licitacion.closingDate)}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{getTypeLabel(licitacion.type)}</dd>
          </div>
          <div>
            <dt>Región</dt>
            <dd>{getRegionLabel(licitacion.region)}</dd>
          </div>
        </dl>

        <div className="licitacion-detail-actions">
          <button
            type="button"
            className={`licitacion-detail-favorite ${guardado ? 'is-saved' : ''}`}
            onClick={handleToggleFavorito}
            disabled={cerrada && !guardado}
            aria-pressed={guardado}
          >
            {cerrada && !guardado
              ? 'Licitación cerrada'
              : guardado
                ? 'Quitar favorito'
                : 'Guardar favorito'}
          </button>
          <a
            className="licitacion-detail-source"
            href={licitacion.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver fuente oficial ↗
          </a>
        </div>

        {cerrada && (
          <p className="licitacion-detail-notice" role="status">
            Esta licitación ya cerró y no puede guardarse como favorita.
          </p>
        )}
      </article>
    </section>
  )
}

LicitacionDetail.propTypes = {
  licitacion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    institution: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    region: PropTypes.string.isRequired,
    sourceUrl: PropTypes.string.isRequired,
  }).isRequired,
}

export default LicitacionDetailPage
