import { useContext } from 'react'
import { UmbralesContext } from '../../../app/providers/UmbralesProvider'

/**
 * Hook para acceder a la configuración y operaciones de umbrales de aprobación por unidad.
 *
 * Cada operación devuelve una promesa con `true` si cambió la configuración y `false` si se
 * descartó (la unidad o el umbral ya no existe, o el cambio dejó de ser compatible
 * con lo que guardó otra pestaña), para confirmar solo operaciones aplicadas
 * (#125, #124).
 *
 * @returns {{
 *   unidades: Array<object>,
 *   actualizadoEn: string|null,
 *   cambiosDeOtraPestana: boolean,
 *   problemaAlmacenamiento: null|'bloqueado'|'sin-espacio',
 *   crearUmbral: (idUnidad: string, datos: object) => Promise<boolean>,
 *   editarUmbral: (idUnidad: string, idUmbral: string, datos: object, esperado?: object) => Promise<boolean>,
 *   quitarUmbral: (idUnidad: string, idUmbral: string) => Promise<boolean>,
 *   crearUnidad: (datos: object) => Promise<boolean>,
 *   quitarUnidad: (idUnidad: string) => Promise<boolean>
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
