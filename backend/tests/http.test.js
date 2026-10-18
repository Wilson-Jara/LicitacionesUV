import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createApp } from '../src/app.js'
import { config } from '../src/config/env.js'

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

function postJson(body) {
  return fetch(`${baseUrl}/api/licitaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}

describe('cuerpo de la solicitud', () => {
  it('responde 400 cuando el JSON es inválido', async () => {
    const response = await postJson('{"title": ')
    assert.equal(response.status, 400)
    const body = await response.json()
    assert.equal(body.error, 'Cuerpo JSON inválido')
  })

  it('responde 413 cuando el cuerpo supera 1 MB', async () => {
    const response = await postJson(JSON.stringify({ relleno: 'a'.repeat(1024 * 1024) }))
    assert.equal(response.status, 413)
    const body = await response.json()
    assert.equal(body.error, 'El cuerpo de la solicitud supera 1 MB')
  })
})

describe('CORS', () => {
  it('responde el preflight OPTIONS con 204 y las cabeceras CORS', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones`, {
      method: 'OPTIONS',
      headers: {
        Origin: config.corsOrigin,
        'Access-Control-Request-Method': 'GET',
      },
    })
    assert.equal(response.status, 204)
    assert.equal(response.headers.get('access-control-allow-origin'), config.corsOrigin)
    assert.match(response.headers.get('access-control-allow-methods'), /GET/)
    assert.match(response.headers.get('access-control-allow-headers'), /Content-Type/)
    assert.equal(await response.text(), '')
  })

  it('incluye la cabecera de origen permitido en las respuestas normales', async () => {
    const response = await fetch(`${baseUrl}/api/health`)
    assert.equal(response.headers.get('access-control-allow-origin'), config.corsOrigin)
  })
})

describe('parámetros de ruta', () => {
  it('responde 400 cuando el :id está mal codificado', async () => {
    const response = await fetch(`${baseUrl}/api/licitaciones/%E0%A4%A`)
    assert.equal(response.status, 400)
    const body = await response.json()
    assert.equal(body.error, 'Parámetro de ruta mal codificado')
  })
})
