import { LicitacionList } from '../components/LicitacionList';
import mockData from '../data/licitaciones.mock.json';
import './LicitacionesExplorerPage.css';

function LicitacionesExplorerPage() {
  return (
    <section className="licitaciones-explorer">
      <header className="licitaciones-header">
        <h1>Explorar licitaciones</h1>
        <p>Descubre y participa en las últimas licitaciones públicas y privadas.</p>
      </header>
      
      <div className="licitaciones-content">
        <LicitacionList licitaciones={mockData} />
      </div>
    </section>
  )
}

export default LicitacionesExplorerPage
