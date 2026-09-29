import { useSearchParams } from 'react-router-dom'

export function useLicitacionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    keyword: searchParams.get('keyword') || '',
    region: searchParams.get('region') || '',
    tipo: searchParams.get('tipo') || '',
  }

  const setFilter = (key, value) => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams)
      if (!value) {
        nextParams.delete(key)
        return nextParams
      }
      nextParams.set(key, value)
      return nextParams
    })
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  return { filters, setFilter, clearFilters }
}
