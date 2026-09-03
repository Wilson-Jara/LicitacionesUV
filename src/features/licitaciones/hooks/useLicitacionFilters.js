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
      const newParams = new URLSearchParams(prevParams)
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
      return newParams
    })
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  return { filters, setFilter, clearFilters }
}
