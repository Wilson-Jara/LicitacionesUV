import { useMemo } from 'react'
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
    <section className="estadisticas">
      <header className="estadisticas__header">
        <div>
          <span className="estadisticas__overline">Análisis · Tendencias</span>
          <h1 className="estadisticas__titulo">Panel de estadísticas y tendencias</h1>
          <p className="estadisticas__subtitulo">
            Distribución de las licitaciones vigentes según el conjunto filtrado en el explorador.
          </p>
        </div>
        <div className="estadisticas__contador" role="status" aria-live="polite">
          Mostrando <strong>{licitacionesFiltradas.length}</strong> de{' '}
          <strong>{Array.isArray(mockData) ? mockData.length : 0}</strong> licitaciones
        </div>
      </header>

      {sinResultados ? (
        <div className="estadisticas__vacio" role="status" aria-live="polite">
          <h2 className="estadisticas__vacio-titulo">Sin resultados con los filtros actuales</h2>
          <p className="estadisticas__vacio-texto">
            Ajusta o limpia los filtros del explorador para ver las distribuciones.
          </p>
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

      <p className="estadisticas__nota">
        Las categorías sin registros no se muestran. Cuando una licitación pudiera tener múltiples
        etiquetas, se cuenta en cada una; con el mock actual se asigna una categoría por licitación.
      </p>
    </section>
  )
}

export default PanelEstadisticasPage
