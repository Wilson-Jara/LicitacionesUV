import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildListQuery,
  createMemoryLicitacionesRepository,
  createPgLicitacionesRepository,
  mapLicitacionRow,
} from '../src/data/licitaciones.repository.js'
import { loadMockLicitaciones } from '../src/data/mockLicitaciones.js'

const mock = loadMockLicitaciones()

function contrato(licitacion) {
  return Object.fromEntries(
    Object.keys(licitacion)
      .sort()
      .map((campo) => [campo, typeof licitacion[campo]]),
  )
}

// Fila tal como la devuelve pg: BIGINT como texto y la fecha ya formateada en SQL
function filaDesde(licitacion) {
  return {
    id: licitacion.id,
    titulo: licitacion.title,
    institucion: licitacion.institution,
    monto: String(licitacion.amount),
    moneda: licitacion.currency,
    fecha_cierre: licitacion.closingDate,
    tipo: licitacion.type,
    region_id: licitacion.region,
    url_fuente: licitacion.sourceUrl,
  }
}

describe('mapLicitacionRow', () => {
  it('devuelve exactamente el contrato del mock del frontend', () => {
    for (const licitacion of mock) {
      const mapeada = mapLicitacionRow(filaDesde(licitacion))
      assert.deepEqual(mapeada, licitacion)
      assert.deepEqual(contrato(mapeada), contrato(mock[0]))
    }
  })
})

describe('buildListQuery', () => {
  it('sin filtros consulta todo ordenado por id', () => {
    const { text, values } = buildListQuery()
    assert.doesNotMatch(text, /WHERE/)
    assert.match(text, /ORDER BY id$/)
    assert.deepEqual(values, [])
  })

  it('combina filtros con parámetros numerados, sin interpolar valores', () => {
    const { text, values } = buildListQuery({
      keyword: "software'; DROP TABLE licitaciones;--",
      region: 'VALPARAISO',
      tipo: 'Publica',
    })
    assert.match(text, /\(titulo ILIKE \$1 OR institucion ILIKE \$1\)/)
    assert.match(text, /lower\(region_id\) = lower\(\$2\)/)
    assert.match(text, /lower\(tipo\) = lower\(\$3\)/)
    assert.doesNotMatch(text, /DROP TABLE/)
    assert.deepEqual(values, ["%software'; DROP TABLE licitaciones;--%", 'VALPARAISO', 'Publica'])
  })

  it('escapa los comodines de LIKE en la palabra clave', () => {
    assert.deepEqual(buildListQuery({ keyword: String.raw`50%_a\b` }).values, [
      String.raw`%50\%\_a\\b%`,
    ])
  })
})

describe('createPgLicitacionesRepository', () => {
  function fakeDb(rows) {
    const consultas = []
    return {
      consultas,
      async query(consulta) {
        consultas.push(consulta)
        return { rows }
      },
    }
  }

  it('list mapea las filas al contrato', async () => {
    const db = fakeDb(mock.map(filaDesde))
    assert.deepEqual(await createPgLicitacionesRepository(db).list({ tipo: 'publica' }), mock)
    assert.deepEqual(db.consultas[0].values, ['publica'])
  })

  it('findById devuelve null cuando no hay filas', async () => {
    const db = fakeDb([])
    assert.equal(await createPgLicitacionesRepository(db).findById('no-existe'), null)
    assert.deepEqual(db.consultas[0].values, ['no-existe'])
  })
})

describe('createMemoryLicitacionesRepository', () => {
  it('filtra igual que la API (sin distinguir mayúsculas)', async () => {
    const repo = createMemoryLicitacionesRepository(mock)
    const resultado = await repo.list({ region: 'VALPARAISO', tipo: 'PUBLICA' })
    assert.ok(resultado.length > 0)
    assert.ok(resultado.every((l) => l.region === 'valparaiso' && l.type === 'publica'))
    assert.equal(await repo.findById('no-existe'), null)
  })
})
