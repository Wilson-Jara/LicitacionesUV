import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import { AuthProvider } from './providers/AuthProvider.jsx'
import { FavoritosProvider } from './providers/FavoritosProvider.jsx'
import { UmbralesProvider } from './providers/UmbralesProvider.jsx'
import { ThemeProvider } from './providers/ThemeProvider.jsx'
import { LicitacionesProvider } from './providers/LicitacionesProvider.jsx'
import './App.css'

/**
 * Compone los proveedores de tema, sesión, favoritos, umbrales y catálogo de licitaciones
 * (cargado desde la API) con el enrutador principal.
 *
 * @returns {JSX.Element} Aplicación lista para mostrar sus rutas.
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritosProvider>
          <UmbralesProvider>
            <LicitacionesProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </LicitacionesProvider>
          </UmbralesProvider>
        </FavoritosProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
