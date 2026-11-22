import { useContext } from 'react'
import { UmbralesContext } from '../../../app/providers/UmbralesProvider'

/**
 * Hook para acceder a la configuración y operaciones de umbrales de aprobación por unidad.
 *
 * Cada operación devuelve `true` si cambió la configuración y `false` si se
 * descartó (la unidad o el umbral ya no existe), para confirmar solo operaciones
 * aplicadas (#125).
 *
 * @returns {{
 *   unidades: Array<object>,
 *   actualizadoEn: string|null,
 *   crearUmbral: (idUnidad: string, datos: object) => boolean,
 *   editarUmbral: (idUnidad: string, idUmbral: string, datos: object) => boolean,
 *   quitarUmbral: (idUnidad: string, idUmbral: string) => boolean,
 *   crearUnidad: (datos: object) => boolean,
 *   quitarUnidad: (idUnidad: string) => boolean
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
