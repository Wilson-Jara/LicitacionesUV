import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createApp } from '../src/app.js'

let server
let baseUrl

before(async () => {
  server = createServer(createApp())
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
})

describe('GET /api/licitaciones', () => {
  it('lista todas las licitaciones del mock', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.length, 6)
  })

  it('mantiene el contrato de datos del frontend', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones`)
    const [licitacion] = await response.json()
    for (const campo of [
      'id',
      'title',
      'amount',
      'currency',
      'institution',
      'closingDate',
      'type',
      'region',
      'sourceUrl',
    ]) {
      assert.ok(campo in licitacion, `falta el campo ${campo}`)
    }
  })

  it('filtra por palabra clave sin distinguir mayúsculas', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones?keyword=SOFTWARE`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.length, 1)
    assert.equal(body[0].id, 'licitacion-005')
  })

  it('busca la palabra clave solo en el título, no en la institución', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones?keyword=Banco`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), [])
  })

  it('ignora los espacios alrededor de la palabra clave', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones?keyword=%20%20software%20`)
    const body = await response.json()
    assert.deepEqual(
      body.map((l) => l.id),
      ['licitacion-005'],
    )
  })

  it('trata una palabra clave con solo espacios como búsqueda vacía', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones?keyword=%20%20%20`)
    assert.equal((await response.json()).length, 6)
  })

  it('combina filtros de región y tipo', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones?region=valparaiso&tipo=publica`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.length, 2)
    assert.ok(body.every((l) => l.region === 'valparaiso' && l.type === 'publica'))
  })

  it('compara región y tipo sin distinguir mayúsculas', async () => {
    const esperado = await fetch(`${baseUrl}/api/licitaciones?region=valparaiso&tipo=publica`)
    const response = await fetch(`${baseUrl}/api/licitaciones?region=VALPARAISO&tipo=Publica`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), await esperado.json())
  })

  it('responde 200 con una lista vacía cuando los filtros no tienen resultados', async () => {
    for (const query of ['keyword=zzz-sin-coincidencias', 'region=no-existe', 'tipo=no-existe']) {
      const response = await fetch(`${baseUrl}/api/licitaciones?${query}`)
      assert.equal(response.status, 200, query)
      assert.deepEqual(await response.json(), [], query)
    }
  })
})

describe('GET /api/licitaciones/:id', () => {
  it('responde con el detalle cuando el id existe', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones/licitacion-002`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.id, 'licitacion-002')
  })

  it('responde 404 cuando el id no existe', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones/no-existe`)
    assert.equal(response.status, 404)
    const body = await response.json()
    assert.equal(body.error, 'Licitación no encontrada')
  })
})

describe('rutas no registradas', () => {
  it('responde 404 con mensaje de error', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`)
    assert.equal(response.status, 404)
    const body = await response.json()
    assert.equal(body.error, 'Ruta no encontrada')
  })
})
