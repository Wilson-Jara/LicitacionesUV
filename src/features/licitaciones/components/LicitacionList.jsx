import { LicitacionCard } from './LicitacionCard'
import './LicitacionList.css'

export function LicitacionList({ licitaciones }) {
  if (!licitaciones || licitaciones.length === 0) {
    return (
      <div className="licitaciones-empty">
        <h2>No hay licitaciones disponibles</h2>
        <p>
          Actualmente no se encontraron licitaciones que coincidan con tu búsqueda. Por favor,
          intenta más tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="licitaciones-grid">
      {licitaciones.map((licitacion) => (
        <LicitacionCard key={licitacion.id} licitacion={licitacion} />
      ))}
    </div>
  )
}
