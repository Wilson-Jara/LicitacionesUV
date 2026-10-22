import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
// Fuente única de datos de ejemplo: el mock del frontend (REF-10)
export const mockPath = resolve(
  currentDir,
  '../../../src/features/licitaciones/data/licitaciones.mock.json',
)

export function loadMockLicitaciones() {
  try {
    return JSON.parse(readFileSync(mockPath, 'utf8'))
  } catch (error) {
    throw new Error(`No se pudo cargar el mock de licitaciones (${mockPath}): ${error.message}`, {
      cause: error,
    })
  }
}
