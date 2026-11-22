import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { Archive, ArrowRight, Building2, CheckCircle2, MapPin } from 'lucide-react'
import FavoritoButton from './FavoritoButton.jsx'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
  isLicitacionCerrada,
} from '../licitacionUtils.js'
import './LicitacionCard.css'

export function LicitacionCard({ licitacion, onRemove }) {
  const { id, title, amount, currency, institution, closingDate, type, region } = licitacion
  const { pathname, search } = useLocation()
  const cerrada = isLicitacionCerrada(closingDate)
  const detailState = { explorerSearch: pathname === '/licitaciones' ? search : '' }

  return (
    <article className="licitacion-card" data-closed={cerrada}>
      <span className="licitacion-card__accent" data-closed={cerrada} aria-hidden="true" />

      <div className="licitacion-card__body">
        <div className="licitacion-card__heading">
          <div className="licitacion-card__badges">
            <span className="licitacion-status" data-closed={cerrada}>
              {cerrada ? (
                <Archive size={16} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={16} aria-hidden="true" />
              )}
              <span>{cerrada ? 'Cerrada' : 'Vigente'}</span>
            </span>
            <span className="licitacion-card__type">{getTypeLabel(type)}</span>
          </div>

          <h3>
            <Link to={'/licitaciones/' + id} state={detailState}>
              {title}
            </Link>
          </h3>

          <div className="licitacion-card__meta">
            <span className="licitacion-meta-item">
              <Building2 size={16} aria-hidden="true" />
              <span>{institution}</span>
            </span>
            <span className="licitacion-meta-item">
              <MapPin size={16} aria-hidden="true" />
              <span>{getRegionLabel(region)}</span>
            </span>
          </div>
        </div>

        <div className="licitacion-card__budget">
          <span className="licitacion-card__budget-label">Presupuesto</span>
          <strong className="licitacion-card__budget-value">
            {formatLicitacionAmount(amount, currency)}
          </strong>
        </div>
      </div>

      <footer className="licitacion-card__footer">
        <p className="licitacion-card__closing">
          Cierra: <time dateTime={closingDate}>{formatLicitacionDate(closingDate)}</time>
        </p>
        <div className="licitacion-card-actions">
          <FavoritoButton licitacion={licitacion} compact onRemove={onRemove} />
          <Link
            to={'/licitaciones/' + id}
            state={detailState}
            className="button button--primary licitacion-card__detail-btn"
          >
            <span>Ver detalle</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </article>
  )
}

LicitacionCard.propTypes = {
  licitacion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    institution: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    region: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func,
}
