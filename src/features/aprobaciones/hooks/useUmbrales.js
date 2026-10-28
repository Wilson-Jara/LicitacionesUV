import { useContext } from 'react'
import { UmbralesContext } from '../../../app/providers/UmbralesProvider'

/**
 * Hook para acceder a la configuración y operaciones de umbrales de aprobación por unidad.
 *
 * @returns {{
 *   unidades: Array<object>,
 *   ultimaActualizacion: string|null,
 *   crearUmbral: (idUnidad: string, datos: object) => void,
 *   editarUmbral: (idUnidad: string, idUmbral: string, datos: object) => void,
 *   quitarUmbral: (idUnidad: string, idUmbral: string) => void,
 *   crearUnidad: (datos: object) => void,
 *   quitarUnidad: (idUnidad: string) => void,
 *   restablecerDefecto: () => void
 * }} Objeto con el catálogo de unidades/umbrales y sus métodos de gestión.
 * @throws {Error} Si se utiliza fuera del árbol de un `UmbralesProvider`.
 */
export const useUmbrales = () => {
  const context = useContext(UmbralesContext)

  if (!context) {
    throw new Error('useUmbrales must be used within a UmbralesProvider')
  }

  return context
}
