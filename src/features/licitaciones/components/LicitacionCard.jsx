import PropTypes from 'prop-types'
import './LicitacionCard.css'

const REGION_NAMES = {
  valparaiso: 'Valparaíso',
  metropolitana: 'Metropolitana',
  biobio: 'Biobío',
  antofagasta: 'Antofagasta',
}

export function LicitacionCard({ licitacion }) {
  const { title, amount, currency, institution, closingDate, type, region } = licitacion

  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency || 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)

  // Parsing the date as UTC to avoid local timezone offset issues shifting it by a day
  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${closingDate}T00:00:00Z`))

  const isPublica = type === 'publica'
  const regionLabel = REGION_NAMES[region] || region

  return (
    <article className="licitacion-card">
      <header className="licitacion-card-header">
        <div className="licitacion-badges-row">
          <span className={`licitacion-badge ${isPublica ? 'publica' : 'privada'}`}>
            <span className="badge-dot" aria-hidden="true"></span>
            {isPublica ? 'Licitación Pública' : 'Licitación Privada'}
          </span>
          {regionLabel && <span className="licitacion-region-badge">{regionLabel}</span>}
        </div>
        <h3 className="licitacion-title">{title}</h3>
      </header>

      <div className="licitacion-details">
        <div className="licitacion-detail-item">
          <span className="licitacion-detail-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
            </svg>
            Institución
          </span>
          <span className="licitacion-detail-value">{institution}</span>
        </div>

        <div className="licitacion-detail-item">
          <span className="licitacion-detail-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
            </svg>
            Fecha de Cierre
          </span>
          <span className="licitacion-detail-value">{formattedDate}</span>
        </div>

        <div className="licitacion-detail-item">
          <span className="licitacion-detail-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
            Monto Estimado
          </span>
          <span className="licitacion-detail-value amount">{formattedAmount}</span>
        </div>
      </div>

      <div className="licitacion-card-footer">
        <button
          type="button"
          className="btn-card-action"
          onClick={() => alert(`Consultando bases de la licitación: ${title}`)}
        >
          <span>Consultar bases</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>
      </div>
    </article>
  )
}

LicitacionCard.propTypes = {
  licitacion: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    institution: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    region: PropTypes.string,
  }).isRequired,
}
