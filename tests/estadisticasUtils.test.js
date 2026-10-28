import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcularDistribuciones,
  derivarSector,
  formatearConteo,
  generarAlternativaTextual,
  obtenerLicitacionesFiltradas,
} from '../src/features/estadisticas/estadisticasUtils.js'

const licitaciones = [
  {
    id: '1',
    title: 'Servicio',
    region: 'valparaiso',
    type: 'publica',
    institution: 'Universidad de Valparaíso',
  },
  {
    id: '2',
    title: 'Compra',
    region: 'metropolitana',
    type: 'privada',
    institution: 'Empresa privada de servicios',
  },
  {
    id: '3',
    title: 'Consultoría',
    region: 'valparaiso',
    type: 'publica',
    institution: 'Municipalidad de Viña del Mar',
  },
]

describe('estadisticasUtils · derivarSector', () => {
  it('deriva el sector desde la institución con una categoría por licitación', () => {
    assert.equal(derivarSector({ institution: 'Universidad de Valparaíso' }), 'universidad')
    assert.equal(derivarSector({ institution: 'Municipalidad de Viña del Mar' }), 'municipalidad')
    assert.equal(derivarSector({ institution: 'Ministerio del Interior' }), 'ministerio')
    assert.equal(derivarSector({ institution: 'Banco Internacional' }), 'banco')
    assert.equal(derivarSector({ institution: 'Empresa privada de servicios' }), 'empresa')
    assert.equal(derivarSector({ institution: null }), 'otro')
  })
})

describe('estadisticasUtils · calcularDistribuciones', () => {
  it('calcula las tres distribuciones sin inventar categorías sin registros', () => {
    const dist = calcularDistribuciones(licitaciones)

    assert.deepEqual(
      dist.porRegion.map((d) => ({ clave: d.clave, cantidad: d.cantidad })),
      [
        { clave: 'valparaiso', cantidad: 2 },
        { clave: 'metropolitana', cantidad: 1 },
      ],
    )
    assert.deepEqual(
      dist.porTipo.map((d) => ({ clave: d.clave, cantidad: d.cantidad })),
      [
        { clave: 'publica', cantidad: 2 },
        { clave: 'privada', cantidad: 1 },
      ],
    )
    assert.deepEqual(
      dist.porSector.map((d) => ({ clave: d.clave, cantidad: d.cantidad })),
      [
        { clave: 'empresa', cantidad: 1 },
        { clave: 'municipalidad', cantidad: 1 },
        { clave: 'universidad', cantidad: 1 },
      ],
    )
  })

  it('devuelve distribuciones vacías cuando no hay datos', () => {
    assert.deepEqual(calcularDistribuciones([]), { porRegion: [], porTipo: [], porSector: [] })
    assert.deepEqual(calcularDistribuciones(null), { porRegion: [], porTipo: [], porSector: [] })
  })

  it('ignora elementos inválidos sin fallar', () => {
    const dist = calcularDistribuciones([
      null,
      { region: 'valparaiso', type: 'publica', institution: 'X' },
    ])
    assert.equal(dist.porRegion.length, 1)
    assert.equal(dist.porRegion[0].cantidad, 1)
  })
})

describe('estadisticasUtils · filtros coherentes', () => {
  it('reutiliza filterLicitaciones para recalcular con filtros activos', () => {
    const filtradas = obtenerLicitacionesFiltradas(licitaciones, {
      region: 'valparaiso',
      tipo: '',
      keyword: '',
    })
    assert.deepEqual(
      filtradas.map((l) => l.id),
      ['1', '3'],
    )

    const dist = calcularDistribuciones(filtradas)
    assert.equal(dist.porRegion.length, 1)
    assert.equal(dist.porRegion[0].clave, 'valparaiso')
    assert.equal(dist.porRegion[0].cantidad, 2)
  })
})

describe('estadisticasUtils · accesibilidad y formato', () => {
  it('genera una alternativa textual accesible con dimensión, categorías y valores', () => {
    const texto = generarAlternativaTextual('región', [
      { etiqueta: 'Valparaíso', cantidad: 2 },
      { etiqueta: 'Metropolitana', cantidad: 1 },
    ])
    assert.match(texto, /Distribución por región/)
    assert.match(texto, /total 3/)
    assert.match(texto, /Valparaíso: 2/)
    assert.match(texto, /Metropolitana: 1/)
  })

  it('informa sin datos en la alternativa textual', () => {
    assert.match(generarAlternativaTextual('tipo', []), /sin datos disponibles/)
  })

  it('formatea conteos en formato local chileno', () => {
    assert.equal(formatearConteo(1234), '1.234')
    assert.equal(formatearConteo(0), '0')
    assert.equal(formatearConteo(null), '0')
  })
})
