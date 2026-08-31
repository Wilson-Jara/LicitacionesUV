import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        LicitacionesUV
      </Link>
      <nav className="navbar__links">
        <Link to="/licitaciones">Licitaciones</Link>
        <Link to="/favoritos">Favoritos</Link>
      </nav>
    </header>
  )
}

export default Navbar
