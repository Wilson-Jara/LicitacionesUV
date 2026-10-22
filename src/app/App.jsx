import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import { AuthProvider } from './providers/AuthProvider.jsx'
import { FavoritosProvider } from './providers/FavoritosProvider.jsx'
import { ThemeProvider } from './providers/ThemeProvider.jsx'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritosProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </FavoritosProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
