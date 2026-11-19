import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
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

  return (
    <article className="licitacion-card">
      <div className="licitacion-card-heading">
        <p className="licitacion-card-meta">
          <strong>{getTypeLabel(type)}</strong>
          <span>{getRegionLabel(region)}</span>
        </p>
        <h3>
          <Link
            to={'/licitaciones/' + id}
            state={{ explorerSearch: pathname === '/licitaciones' ? search : '' }}
          >
            {title}
          </Link>
        </h3>
        <p className="licitacion-institution">{institution}</p>
      </div>
      <dl className="licitacion-card-data">
        <div>
          <dt>Cierre</dt>
          <dd>
            <time dateTime={closingDate}>{formatLicitacionDate(closingDate)}</time>
          </dd>
        </div>
        <div>
          <dt>Monto estimado</dt>
          <dd>{formatLicitacionAmount(amount, currency)}</dd>
        </div>
      </dl>
      <div className="licitacion-card-actions">
        <span className="licitacion-status" data-closed={cerrada}>
          {cerrada ? 'Cerrada' : 'Vigente'}
        </span>
        <FavoritoButton licitacion={licitacion} compact onRemove={onRemove} />
      </div>
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
