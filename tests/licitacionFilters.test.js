import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  VALID_REGIONES,
  VALID_TIPOS,
  countActiveFilters,
  filterLicitaciones,
  sanitizeFilterParams,
} from '../src/features/licitaciones/licitacionFilters.js'

const licitaciones = [
  {
    id: '1',
    title: 'Servicio de transporte',
    institution: 'Universidad de Valparaíso',
    region: 'valparaiso',
    type: 'publica',
  },
  {
    id: '2',
    title: 'Compra de computadores',
    institution: 'Empresa de transporte',
    region: 'metropolitana',
    type: 'privada',
  },
]

describe('filterLicitaciones', () => {
  it('busca la palabra clave únicamente en el título', () => {
    const resultado = filterLicitaciones(licitaciones, {
      keyword: 'transporte',
      region: '',
      tipo: '',
    })

    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['1'],
    )
  })

  it('no distingue mayúsculas ni minúsculas en la palabra clave', () => {
    const resultado = filterLicitaciones(licitaciones, {
      keyword: 'TRANSPORTE',
      region: '',
      tipo: '',
    })

    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['1'],
    )
  })

  it('quita espacios externos en la palabra clave (trim)', () => {
    const resultado = filterLicitaciones(licitaciones, {
      keyword: '   transporte   ',
      region: '',
      tipo: '',
    })

    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['1'],
    )
  })

  it('ignora palabra clave con solo espacios en blanco', () => {
    const resultado = filterLicitaciones(licitaciones, {
      keyword: '     ',
      region: '',
      tipo: '',
    })

    assert.equal(resultado.length, 2)
  })

  it('combina palabra clave, región y tipo', () => {
    const resultado = filterLicitaciones(licitaciones, {
      keyword: 'computadores',
      region: 'metropolitana',
      tipo: 'privada',
    })

    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['2'],
    )
  })

  it('devuelve una lista vacía cuando no hay coincidencias', () => {
    const resultado = filterLicitaciones(licitaciones, {
      keyword: 'hospital',
      region: '',
      tipo: '',
    })

    assert.deepEqual(resultado, [])
  })

  it('tolera una palabra clave ausente', () => {
    const resultado = filterLicitaciones(licitaciones, {
      region: '',
      tipo: '',
    })

    assert.equal(resultado.length, 2)
  })

  it('responde defensivamente devolviendo arreglo vacío si licitaciones no es arreglo', () => {
    assert.deepEqual(filterLicitaciones(null, { keyword: 'test' }), [])
    assert.deepEqual(filterLicitaciones(undefined, {}), [])
    assert.deepEqual(filterLicitaciones('no-es-arreglo', {}), [])
  })

  it('tolera filtros nulos o indefinidos devolviendo todas las licitaciones', () => {
    assert.equal(filterLicitaciones(licitaciones, null).length, 2)
    assert.equal(filterLicitaciones(licitaciones, undefined).length, 2)
  })

  it('tolera elementos del catálogo con campos ausentes o no textuales', () => {
    const catalogoIncompleto = [
      { id: '3', institution: 'Sin titulo', region: 'valparaiso', type: 'publica' },
      { id: '4', title: null, region: null, type: null },
    ]
    const resultado = filterLicitaciones(catalogoIncompleto, { keyword: 'test' })
    assert.deepEqual(resultado, [])
  })
})

describe('sanitizeFilterParams', () => {
  it('expone constantes de regiones y tipos válidos', () => {
    assert.ok(VALID_REGIONES.includes('valparaiso'))
    assert.ok(VALID_TIPOS.includes('publica'))
  })

  it('sanea parámetros desde un objeto plano descartando valores inválidos o desconocidos', () => {
    const sanea = sanitizeFilterParams({
      keyword: '  salud  ',
      region: 'marte',
      tipo: 'invalido',
      parametroDesconocido: '123',
    })

    assert.deepEqual(sanea, {
      keyword: '  salud  ',
      region: '',
      tipo: '',
    })
  })

  it('normaliza región y tipo válidos sin importar mayúsculas ni espacios', () => {
    const sanea = sanitizeFilterParams({
      region: '  Valparaiso  ',
      tipo: '  PUBLICA  ',
    })

    assert.deepEqual(sanea, {
      keyword: '',
      region: 'valparaiso',
      tipo: 'publica',
    })
  })

  it('sanea parámetros desde una instancia de URLSearchParams', () => {
    const params = new URLSearchParams('keyword=transporte&region=biobio&tipo=privada&extra=xyz')
    const sanea = sanitizeFilterParams(params)

    assert.deepEqual(sanea, {
      keyword: 'transporte',
      region: 'biobio',
      tipo: 'privada',
    })
  })

  it('maneja valores no textuales o nulos de manera defensiva', () => {
    assert.deepEqual(sanitizeFilterParams(null), { keyword: '', region: '', tipo: '' })
    assert.deepEqual(sanitizeFilterParams(undefined), { keyword: '', region: '', tipo: '' })
    assert.deepEqual(sanitizeFilterParams({ keyword: 123, region: {}, tipo: [] }), {
      keyword: '',
      region: '',
      tipo: '',
    })
  })
})

describe('sanitizeFilterParams - parámetros repetidos', () => {
  it('resuelve ?region=valparaiso&region=invalida -> region=valparaiso', () => {
    const params = new URLSearchParams('region=valparaiso&region=invalida')
    const sanea = sanitizeFilterParams(params)
    assert.equal(sanea.region, 'valparaiso')
  })

  it('resuelve ?region=invalida&region=otra -> quitar region', () => {
    const params = new URLSearchParams('region=invalida&region=otra')
    const sanea = sanitizeFilterParams(params)
    assert.equal(sanea.region, '')
  })

  it('resuelve ?region=biobio&region=valparaiso -> region=valparaiso', () => {
    const params = new URLSearchParams('region=biobio&region=valparaiso')
    const sanea = sanitizeFilterParams(params)
    assert.equal(sanea.region, 'valparaiso')
  })

  it('resuelve parámetros repetidos en objetos planos con arreglos', () => {
    const sanea = sanitizeFilterParams({
      region: ['valparaiso', 'invalida'],
      tipo: ['privada', 'invalido'],
    })
    assert.equal(sanea.region, 'valparaiso')
    assert.equal(sanea.tipo, 'privada')
  })

  it('resuelve el último valor válido para tipo repetido (?tipo=privada&tipo=publica)', () => {
    const params = new URLSearchParams('tipo=privada&tipo=publica')
    const sanea = sanitizeFilterParams(params)
    assert.equal(sanea.tipo, 'publica')
  })

  it('descarta tipo si todos los valores repetidos son inválidos', () => {
    const params = new URLSearchParams('tipo=invalido1&tipo=invalido2')
    const sanea = sanitizeFilterParams(params)
    assert.equal(sanea.tipo, '')
  })
})

describe('countActiveFilters', () => {
  it('cuenta correctamente los filtros activos', () => {
    assert.equal(countActiveFilters({ keyword: '', region: '', tipo: '' }), 0)
    assert.equal(countActiveFilters({ keyword: 'salud', region: '', tipo: '' }), 1)
    assert.equal(countActiveFilters({ keyword: 'salud', region: 'valparaiso', tipo: '' }), 2)
    assert.equal(countActiveFilters({ keyword: 'salud', region: 'valparaiso', tipo: 'publica' }), 3)
  })

  it('no contabiliza keyword si solo tiene espacios en blanco', () => {
    assert.equal(countActiveFilters({ keyword: '   ', region: '', tipo: '' }), 0)
    assert.equal(countActiveFilters({ keyword: '   ', region: 'valparaiso', tipo: '' }), 1)
  })

  it('tolera parámetros nulos o ausentes', () => {
    assert.equal(countActiveFilters(null), 0)
    assert.equal(countActiveFilters(undefined), 0)
    assert.equal(countActiveFilters({}), 0)
  })
})
