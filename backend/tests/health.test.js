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

describe('GET /api/health', () => {
  it('responde 200 con estado ok', async () => {
    const response = await fetch(`${baseUrl}/api/health`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.status, 'ok')
    assert.equal(body.service, 'licitacionesuv-backend')
    assert.ok(body.timestamp)
  })
})
