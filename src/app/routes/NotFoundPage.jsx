import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe o fue movida.</p>
      <Link to="/licitaciones">Volver al inicio</Link>
    </section>
  )
}

export default NotFoundPage
