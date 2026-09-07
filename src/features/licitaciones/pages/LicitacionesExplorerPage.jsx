import { useMemo } from 'react'
import { LicitacionList } from '../components/LicitacionList'
import { FilterSidebar } from '../components/FilterSidebar'
import { useLicitacionFilters } from '../hooks/useLicitacionFilters'
import mockData from '../data/licitaciones.mock.json'
import './LicitacionesExplorerPage.css'

function LicitacionesExplorerPage() {
  const { filters } = useLicitacionFilters()

  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      const { keyword, region, tipo } = filters

      const keywordLower = keyword.toLowerCase()
      const matchesKeyword =
        !keywordLower ||
        item.title.toLowerCase().includes(keywordLower) ||
        item.institution.toLowerCase().includes(keywordLower)

      const matchesRegion = !region || item.region === region
      const matchesTipo = !tipo || item.type === tipo

      return matchesKeyword && matchesRegion && matchesTipo
    })
  }, [filters])

  return (
    <section className="licitaciones-explorer">
      <header className="licitaciones-header">
        <h1>Explorar licitaciones</h1>
        <p>Descubre y participa en las últimas licitaciones públicas y privadas.</p>
      </header>

      <div className="licitaciones-layout">
        <FilterSidebar />
        <div className="licitaciones-content">
          <LicitacionList licitaciones={filteredData} />
        </div>
      </div>
    </section>
  )
}

export default LicitacionesExplorerPage
