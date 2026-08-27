import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import LicitacionesExplorerPage from '../../features/licitaciones/pages/LicitacionesExplorerPage.jsx'
import MisFavoritosPage from '../../features/favoritos/pages/MisFavoritosPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/licitaciones" replace />} />
        <Route path="/licitaciones" element={<LicitacionesExplorerPage />} />
        <Route path="/favoritos" element={<MisFavoritosPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
