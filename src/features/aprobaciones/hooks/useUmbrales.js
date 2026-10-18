import { useContext } from 'react'
import { UmbralesContext } from '../../../app/providers/UmbralesProvider'

export const useUmbrales = () => {
  const context = useContext(UmbralesContext)

  if (!context) {
    throw new Error('useUmbrales must be used within a UmbralesProvider')
  }

  return context
}
