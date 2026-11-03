import { Link } from 'react-router-dom'

/**
 * Informa que la ruta solicitada no existe y ofrece volver al explorador de licitaciones.
 *
 * @returns {JSX.Element} Página de ruta no encontrada.
 */
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
