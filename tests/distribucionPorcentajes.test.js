import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Caracterización del cálculo de porcentajes de `DistribucionPanel.jsx` (#134).
 *
 * Antes de la intervención, la regla está escrita dos veces dentro del JSX (barras y
 * tabla accesible) y no se puede importar desde una prueba. Esta copia literal fija
 * el comportamiento observable para comprobar que la refactorización lo conserva.
 */
function totalActual(datos) {
  return Array.isArray(datos)
    ? datos.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)
    : 0
}

function porcentajesActuales(datos) {
  const total = totalActual(datos)
  return datos.map((item) => {
    const cantidad = Number(item.cantidad) || 0
    return total > 0 ? Math.round((cantidad / total) * 100) : 0
  })
}

const conCantidades = (...cantidades) =>
  cantidades.map((cantidad, i) => ({ clave: `c${i}`, etiqueta: `Categoría ${i}`, cantidad }))

/** Casos base: conjunto normal, límites de redondeo y total sin datos. */
const CASOS_PORCENTAJES = [
  {
    nombre: 'conjunto normal (6 licitaciones)',
    datos: conCantidades(2, 2, 1, 1),
    total: 6,
    porcentajes: [33, 33, 17, 17],
  },
  { nombre: 'una sola categoría', datos: conCantidades(5), total: 5, porcentajes: [100] },
  {
    nombre: 'tercios: la suma visible da 99',
    datos: conCantidades(1, 1, 1),
    total: 3,
    porcentajes: [33, 33, 33],
  },
  { nombre: '1 de 3 y 2 de 3', datos: conCantidades(1, 2), total: 3, porcentajes: [33, 67] },
  {
    nombre: 'medios exactos redondean hacia arriba: la suma da 101',
    datos: conCantidades(1, 7),
    total: 8,
    porcentajes: [13, 88],
  },
  { nombre: 'total sin datos', datos: [], total: 0, porcentajes: [] },
  { nombre: 'categoría con cantidad cero', datos: conCantidades(0), total: 0, porcentajes: [0] },
  {
    nombre: 'cantidad no numérica cuenta como cero',
    datos: conCantidades('x', null, 4),
    total: 4,
    porcentajes: [0, 0, 100],
  },
]

describe('caracterización · porcentajes de DistribucionPanel (antes de #134)', () => {
  for (const caso of CASOS_PORCENTAJES) {
    it(caso.nombre, () => {
      assert.equal(totalActual(caso.datos), caso.total)
      assert.deepEqual(porcentajesActuales(caso.datos), caso.porcentajes)
    })
  }
})
