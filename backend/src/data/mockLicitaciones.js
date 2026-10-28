import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
/**
 * Ruta al mock de licitaciones del frontend. Es la fuente única de datos de
 * ejemplo del backend (REF-10): así la API y el frontend usan los mismos datos.
 */
export const mockPath = resolve(
  currentDir,
  '../../../src/features/licitaciones/data/licitaciones.mock.json',
)

/**
 * Lee y devuelve las licitaciones del mock del frontend.
 *
 * @returns {Array<object>} Licitaciones con el contrato de datos (REF-10).
 * @throws {Error} Si el archivo no se puede leer o no es JSON válido; el mensaje
 *   incluye la ruta y la causa original queda en `cause`.
 */
export function loadMockLicitaciones() {
  try {
    return JSON.parse(readFileSync(mockPath, 'utf8'))
  } catch (error) {
    throw new Error(`No se pudo cargar el mock de licitaciones (${mockPath}): ${error.message}`, {
      cause: error,
    })
  }
}
