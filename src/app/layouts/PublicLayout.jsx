import { Outlet } from 'react-router-dom'
import Navbar from '../../shared/components/Navbar.jsx'

function PublicLayout() {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-layout__main">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
