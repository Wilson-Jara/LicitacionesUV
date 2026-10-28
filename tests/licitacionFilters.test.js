import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  VALID_REGIONES,
  VALID_TIPOS,
  VALID_SORTS,
  countActiveFilters,
  filterLicitaciones,
  sanitizeFilterParams,
  sortLicitaciones,
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

const licitacionesOrdenables = [
  {
    id: 'a',
    title: 'Servicio de aseo',
    region: 'valparaiso',
    type: 'publica',
    closingDate: '2026-11-15',
    amount: 1500000,
  },
  {
    id: 'b',
    title: 'Compra de equipos',
    region: 'metropolitana',
    type: 'privada',
    closingDate: '2026-10-30',
    amount: 900000,
  },
  {
    id: 'c',
    title: 'Servicio de vigilancia',
    region: 'biobio',
    type: 'publica',
    closingDate: '2026-12-05',
    amount: 2200000,
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
      sort: '',
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
      sort: '',
    })
  })

  it('sanea parámetros desde una instancia de URLSearchParams', () => {
    const params = new URLSearchParams('keyword=transporte&region=biobio&tipo=privada&extra=xyz')
    const sanea = sanitizeFilterParams(params)

    assert.deepEqual(sanea, {
      keyword: 'transporte',
      region: 'biobio',
      tipo: 'privada',
      sort: '',
    })
  })

  it('maneja valores no textuales o nulos de manera defensiva', () => {
    assert.deepEqual(sanitizeFilterParams(null), {
      keyword: '',
      region: '',
      tipo: '',
      sort: '',
    })
    assert.deepEqual(sanitizeFilterParams(undefined), {
      keyword: '',
      region: '',
      tipo: '',
      sort: '',
    })
    assert.deepEqual(sanitizeFilterParams({ keyword: 123, region: {}, tipo: [] }), {
      keyword: '',
      region: '',
      tipo: '',
      sort: '',
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

describe('sanitizeFilterParams - orden', () => {
  it('expone los criterios de orden válidos', () => {
    assert.deepEqual(VALID_SORTS, ['fecha-asc', 'fecha-desc', 'monto-asc', 'monto-desc'])
  })

  it('acepta un criterio válido y lo normaliza sin importar mayúsculas ni espacios', () => {
    const sanea = sanitizeFilterParams({ sort: '  MONTO-DESC  ' })
    assert.equal(sanea.sort, 'monto-desc')
  })

  it('descarta criterios de orden inválidos o desconocidos', () => {
    assert.equal(sanitizeFilterParams({ sort: 'precio' }).sort, '')
    assert.equal(sanitizeFilterParams({ sort: 'monto' }).sort, '')
    assert.equal(sanitizeFilterParams({ sort: 123 }).sort, '')
  })

  it('sanea el orden desde una instancia de URLSearchParams junto a los filtros', () => {
    const params = new URLSearchParams('keyword=aseo&region=biobio&sort=fecha-asc')
    const sanea = sanitizeFilterParams(params)

    assert.deepEqual(sanea, {
      keyword: 'aseo',
      region: 'biobio',
      tipo: '',
      sort: 'fecha-asc',
    })
  })

  it('resuelve ?sort=fecha-asc&sort=monto-desc -> sort=monto-desc', () => {
    const params = new URLSearchParams('sort=fecha-asc&sort=monto-desc')
    assert.equal(sanitizeFilterParams(params).sort, 'monto-desc')
  })

  it('conserva el último valor válido si el último repetido es inválido', () => {
    const params = new URLSearchParams('sort=monto-asc&sort=invalido')
    assert.equal(sanitizeFilterParams(params).sort, 'monto-asc')
  })
})

describe('sortLicitaciones', () => {
  it('ordena por fecha de cierre ascendente', () => {
    const resultado = sortLicitaciones(licitacionesOrdenables, 'fecha-asc')
    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['b', 'a', 'c'],
    )
  })

  it('ordena por fecha de cierre descendente', () => {
    const resultado = sortLicitaciones(licitacionesOrdenables, 'fecha-desc')
    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['c', 'a', 'b'],
    )
  })

  it('ordena por monto ascendente', () => {
    const resultado = sortLicitaciones(licitacionesOrdenables, 'monto-asc')
    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['b', 'a', 'c'],
    )
  })

  it('ordena por monto descendente', () => {
    const resultado = sortLicitaciones(licitacionesOrdenables, 'monto-desc')
    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['c', 'a', 'b'],
    )
  })

  it('mantiene el orden original si el criterio está ausente o es inválido', () => {
    const sinOrden = sortLicitaciones(licitacionesOrdenables, '')
    const criterioInvalido = sortLicitaciones(licitacionesOrdenables, 'precio-asc')

    assert.deepEqual(
      sinOrden.map(({ id }) => id),
      ['a', 'b', 'c'],
    )
    assert.deepEqual(
      criterioInvalido.map(({ id }) => id),
      ['a', 'b', 'c'],
    )
  })

  it('no muta la lista original', () => {
    const original = licitacionesOrdenables.map((licitacion) => licitacion.id)
    sortLicitaciones(licitacionesOrdenables, 'monto-desc')
    assert.deepEqual(
      licitacionesOrdenables.map(({ id }) => id),
      original,
    )
  })

  it('ubica al final los elementos sin fecha o monto válidos en ambas direcciones', () => {
    const catalogo = [
      { id: 'sin-datos', title: 'Sin datos' },
      { id: 'valida-1', title: 'Válida 1', closingDate: '2026-11-01', amount: 500 },
      { id: 'fecha-invalida', title: 'Fecha inválida', closingDate: 'no-es-fecha', amount: 100 },
      { id: 'valida-2', title: 'Válida 2', closingDate: '2026-10-01', amount: 900 },
    ]

    const fechas = sortLicitaciones(catalogo, 'fecha-asc').map(({ id }) => id)
    const fechasDesc = sortLicitaciones(catalogo, 'fecha-desc').map(({ id }) => id)
    const montos = sortLicitaciones(catalogo, 'monto-asc').map(({ id }) => id)
    const montosDesc = sortLicitaciones(catalogo, 'monto-desc').map(({ id }) => id)

    assert.deepEqual(fechas, ['valida-2', 'valida-1', 'sin-datos', 'fecha-invalida'])
    assert.deepEqual(fechasDesc, ['valida-1', 'valida-2', 'sin-datos', 'fecha-invalida'])
    assert.deepEqual(montos, ['fecha-invalida', 'valida-1', 'valida-2', 'sin-datos'])
    assert.deepEqual(montosDesc, ['valida-2', 'valida-1', 'fecha-invalida', 'sin-datos'])
  })

  it('trata montos vacíos o no numéricos como datos ausentes', () => {
    const catalogo = [
      { id: 'vacio', title: 'Monto vacío', amount: '' },
      { id: 'texto', title: 'Monto no numérico', amount: 'no-es-numero' },
      { id: 'valido', title: 'Monto válido', amount: 1000 },
    ]

    assert.deepEqual(
      sortLicitaciones(catalogo, 'monto-asc').map(({ id }) => id),
      ['valido', 'vacio', 'texto'],
    )
  })

  it('combina el orden con los filtros activos sin perderlos', () => {
    const filtradas = filterLicitaciones(licitacionesOrdenables, {
      keyword: 'servicio',
      region: '',
      tipo: 'publica',
    })
    const resultado = sortLicitaciones(filtradas, 'monto-desc')

    assert.deepEqual(
      resultado.map(({ id }) => id),
      ['c', 'a'],
    )
  })

  it('desempata por id cuando los valores son iguales', () => {
    const catalogo = [
      { id: 'b', title: 'B', closingDate: '2026-11-01', amount: 1000 },
      { id: 'a', title: 'A', closingDate: '2026-11-01', amount: 1000 },
      { id: 'c', title: 'C', closingDate: '2026-11-01', amount: 1000 },
    ]

    assert.deepEqual(
      sortLicitaciones(catalogo, 'fecha-asc').map(({ id }) => id),
      ['a', 'b', 'c'],
    )
    assert.deepEqual(
      sortLicitaciones(catalogo, 'monto-desc').map(({ id }) => id),
      ['a', 'b', 'c'],
    )
  })

  it('responde defensivamente si la lista no es un arreglo', () => {
    assert.deepEqual(sortLicitaciones(null, 'fecha-asc'), [])
    assert.deepEqual(sortLicitaciones(undefined, 'monto-asc'), [])
    assert.deepEqual(sortLicitaciones('no-es-arreglo', 'monto-asc'), [])
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

  it('no contabiliza el criterio de orden como filtro activo', () => {
    assert.equal(countActiveFilters({ keyword: '', region: '', tipo: '', sort: 'monto-desc' }), 0)
    assert.equal(
      countActiveFilters({ keyword: 'aseo', region: '', tipo: '', sort: 'fecha-asc' }),
      1,
    )
  })
})
