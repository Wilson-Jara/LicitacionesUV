import './LicitacionCard.css'

export function LicitacionCard({ licitacion }) {
  const { title, amount, currency, institution, closingDate, type } = licitacion

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

  return (
    <article className="licitacion-card">
      <header className="licitacion-card-header">
        <span className={`licitacion-badge ${isPublica ? 'publica' : 'privada'}`}>
          {isPublica ? 'Pública' : 'Privada'}
        </span>
        <h3 className="licitacion-title">{title}</h3>
      </header>

      <div className="licitacion-details">
        <div className="licitacion-detail-item">
          <span className="licitacion-detail-label">Institución</span>
          <span className="licitacion-detail-value">{institution}</span>
        </div>

        <div className="licitacion-detail-item">
          <span className="licitacion-detail-label">Cierre</span>
          <span className="licitacion-detail-value">{formattedDate}</span>
        </div>

        <div className="licitacion-detail-item">
          <span className="licitacion-detail-label">Monto</span>
          <span className="licitacion-detail-value amount">{formattedAmount}</span>
        </div>
      </div>
    </article>
  )
}
