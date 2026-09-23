import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import LicitacionesExplorerPage from '../../features/licitaciones/pages/LicitacionesExplorerPage.jsx'
import LicitacionDetailPage from '../../features/licitaciones/pages/LicitacionDetailPage.jsx'
import MisFavoritosPage from '../../features/favoritos/pages/MisFavoritosPage.jsx'
import LoginPage from '../../features/auth/pages/LoginPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/licitaciones" replace />} />
        <Route path="/licitaciones" element={<LicitacionesExplorerPage />} />
        <Route path="/licitaciones/:id" element={<LicitacionDetailPage />} />
        <Route path="/favoritos" element={<MisFavoritosPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
