import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLicitacionFilters } from '../../licitaciones/hooks/useLicitacionFilters'
import mockData from '../../licitaciones/data/licitaciones.mock.json'
import { calcularDistribuciones, obtenerLicitacionesFiltradas } from '../estadisticasUtils.js'
import { DistribucionPanel } from '../components/DistribucionPanel'
import './PanelEstadisticasPage.css'

/**
 * Panel de estadísticas y tendencias (HU #95).
 *
 * CA2: se recalcula con los filtros del explorador (keyword/region/tipo).
 * CA3: alternativas textuales accesibles para cada distribución.
 * CA4: no bloquea el explorador, solo lectura.
 */
function PanelEstadisticasPage() {
  const { filters } = useLicitacionFilters()
  const { search } = useLocation()

  const licitacionesFiltradas = useMemo(
    () => obtenerLicitacionesFiltradas(mockData, filters),
    [filters],
  )

  const distribuciones = useMemo(
    () => calcularDistribuciones(licitacionesFiltradas),
    [licitacionesFiltradas],
  )

  const sinResultados = licitacionesFiltradas.length === 0

  return (
    <section className="frame estadisticas" aria-labelledby="estadisticas-title">
      <header className="estadisticas__header">
        <h1 id="estadisticas-title">Estadísticas</h1>
        <p className="estadisticas__subtitulo">
          Distribución por región, tipo y sector en el catálogo de demostración.
        </p>
        <p className="estadisticas__contador" role="status">
          Mostrando <strong>{licitacionesFiltradas.length}</strong> de{' '}
          <strong>{Array.isArray(mockData) ? mockData.length : 0}</strong> licitaciones
        </p>
        <Link to={{ pathname: '/licitaciones', search }}>Ajustar filtros en el explorador</Link>
      </header>

      {sinResultados ? (
        <div className="estadisticas__vacio" role="status" aria-live="polite">
          <h2>Sin resultados con los filtros actuales</h2>
          <p>Ajusta o limpia los filtros del explorador para ver las distribuciones.</p>
        </div>
      ) : (
        <div className="estadisticas__grid">
          <DistribucionPanel
            titulo="Por región"
            dimension="región"
            datos={distribuciones.porRegion}
          />
          <DistribucionPanel titulo="Por tipo" dimension="tipo" datos={distribuciones.porTipo} />
          <DistribucionPanel
            titulo="Por sector"
            dimension="sector"
            datos={distribuciones.porSector}
          />
        </div>
      )}

      <p className="estadisticas__nota">El sector se infiere del organismo de cada licitación.</p>
    </section>
  )
}

export default PanelEstadisticasPage
