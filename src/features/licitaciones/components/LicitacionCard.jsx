import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import FavoritoButton from './FavoritoButton.jsx'
import { getEtiquetaLabel, getSectorLabel } from '../categorias.js'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
  isLicitacionCerrada,
} from '../licitacionUtils.js'
import './LicitacionCard.css'

export function LicitacionCard({ licitacion, onRemove }) {
  const { id, title, amount, currency, institution, closingDate, type, region, sector } = licitacion
  const etiquetas = Array.isArray(licitacion.etiquetas) ? licitacion.etiquetas : []
  const { pathname, search } = useLocation()
  const cerrada = isLicitacionCerrada(closingDate)

  return (
    <article className="licitacion-card">
      <div className="licitacion-card-heading">
        <p className="licitacion-card-meta">
          <strong>{getTypeLabel(type)}</strong>
          <span>{getRegionLabel(region)}</span>
          {sector && <span>{getSectorLabel(sector)}</span>}
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
        {etiquetas.length > 0 && (
          <ul className="licitacion-tags" aria-label="Etiquetas">
            {etiquetas.map((etiqueta) => (
              <li key={etiqueta}>{getEtiquetaLabel(etiqueta)}</li>
            ))}
          </ul>
        )}
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
    sector: PropTypes.string,
    etiquetas: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onRemove: PropTypes.func,
}
