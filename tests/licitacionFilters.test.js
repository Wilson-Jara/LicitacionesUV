import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { filterLicitaciones } from '../src/features/licitaciones/licitacionFilters.js'

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
})
