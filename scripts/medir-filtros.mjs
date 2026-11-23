/*
 * Medición reproducible del filtrado por sector y etiqueta (HU #94, REF-01).
 *
 * Uso: npm.cmd run bench:filtros
 *
 * Mide la función pura `filterLicitaciones` sobre el catálogo mock y sobre una
 * réplica de 10.000 registros. No incluye el pintado del navegador. Falla con
 * código 1 si alguna medición supera el objetivo de 2 segundos de REF-01.
 */

import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { filterLicitaciones } from '../src/features/licitaciones/licitacionFilters.js'

const REPETICIONES = 10000
const REPETICIONES_ESTRES = 100
const REGISTROS_ESTRES = 10000
const LIMITE_MS = 2000

const mock = JSON.parse(
  readFileSync(
    new URL('../src/features/licitaciones/data/licitaciones.mock.json', import.meta.url),
  ),
)
const filtros = {
  keyword: '',
  region: 'valparaiso',
  tipo: '',
  sector: 'tecnologia',
  etiqueta: 'software',
}
const catalogoEstres = Array.from(
  { length: REGISTROS_ESTRES },
  (_, indice) => mock[indice % mock.length],
)

function medir(catalogo, repeticiones) {
  const inicio = performance.now()
  for (let i = 0; i < repeticiones; i += 1) {
    filterLicitaciones(catalogo, filtros)
  }
  const total = performance.now() - inicio
  return { total, promedio: total / repeticiones }
}

const base = medir(mock, REPETICIONES)
const estres = medir(catalogoEstres, REPETICIONES_ESTRES)

console.log(`Entorno: Node.js ${process.version} en ${process.platform}/${process.arch}`)
console.log(`Catálogo mock: ${mock.length} licitaciones × ${REPETICIONES} repeticiones`)
console.log(`  Total: ${base.total.toFixed(4)} ms | Promedio: ${base.promedio.toFixed(5)} ms`)
console.log(`Estrés: ${catalogoEstres.length} licitaciones × ${REPETICIONES_ESTRES} repeticiones`)
console.log(`  Total: ${estres.total.toFixed(4)} ms | Promedio: ${estres.promedio.toFixed(4)} ms`)

const excedido = [base, estres].filter(({ total }) => total > LIMITE_MS)
if (excedido.length > 0) {
  console.error(`REF-01 excedido: ${excedido.length} medición(es) sobre ${LIMITE_MS} ms.`)
  process.exitCode = 1
} else {
  console.log(`Resultado: ambas mediciones están bajo el objetivo de ${LIMITE_MS} ms.`)
}
