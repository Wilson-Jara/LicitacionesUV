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
  it('lista todas las licitaciones del seed', async () => {
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

  it('combina filtros de región y tipo', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones?region=valparaiso&tipo=publica`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.length, 2)
    assert.ok(body.every((l) => l.region === 'valparaiso' && l.type === 'publica'))
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
