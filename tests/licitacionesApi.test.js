import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ApiError,
  DEFAULT_API_BASE_URL,
  fetchLicitacion,
  fetchLicitaciones,
  resolveApiBaseUrl,
} from '../src/features/licitaciones/services/licitacionesApi.js'

const BASE = 'http://api.test/api'

const LICITACION = {
  id: 'licitacion-001',
  title: 'Servicio de mantenimiento de infraestructura',
  amount: 12500000,
  currency: 'CLP',
  institution: 'Universidad de Valparaíso',
  closingDate: '2026-09-30',
  type: 'publica',
  region: 'valparaiso',
  sourceUrl: 'https://www.mercadopublico.cl/',
}

/** Doble de `fetch` que registra las URL pedidas y responde lo indicado. */
function createFakeFetch({ status = 200, body = null, falla = false } = {}) {
  const llamadas = []
  const fakeFetch = async (url) => {
    llamadas.push(url)
    if (falla) throw new TypeError('Failed to fetch')
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  }
  return { fakeFetch, llamadas }
}

describe('resolveApiBaseUrl', () => {
  it('usa la URL por defecto si no hay valor configurado', () => {
    assert.equal(resolveApiBaseUrl(undefined), DEFAULT_API_BASE_URL)
    assert.equal(resolveApiBaseUrl('   '), DEFAULT_API_BASE_URL)
  })

  it('quita la barra final de la URL configurada', () => {
    assert.equal(resolveApiBaseUrl('https://api.ejemplo.cl/api/'), 'https://api.ejemplo.cl/api')
  })
})

describe('fetchLicitaciones', () => {
  it('pide GET /licitaciones y devuelve la lista', async () => {
    const { fakeFetch, llamadas } = createFakeFetch({ body: [LICITACION] })
    const data = await fetchLicitaciones({ baseUrl: BASE, fetchImpl: fakeFetch })
    assert.deepEqual(llamadas, [`${BASE}/licitaciones`])
    assert.deepEqual(data, [LICITACION])
  })

  it('lanza ApiError con status 0 si la red falla', async () => {
    const { fakeFetch } = createFakeFetch({ falla: true })
    await assert.rejects(fetchLicitaciones({ baseUrl: BASE, fetchImpl: fakeFetch }), (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.status, 0)
      return true
    })
  })

  it('lanza ApiError con el código si la API responde un error', async () => {
    const { fakeFetch } = createFakeFetch({ status: 500, body: { error: 'Error interno' } })
    await assert.rejects(fetchLicitaciones({ baseUrl: BASE, fetchImpl: fakeFetch }), {
      name: 'ApiError',
      status: 500,
    })
  })

  it('rechaza una respuesta que no es una lista', async () => {
    const { fakeFetch } = createFakeFetch({ body: { error: 'no es lista' } })
    await assert.rejects(fetchLicitaciones({ baseUrl: BASE, fetchImpl: fakeFetch }), ApiError)
  })
})

describe('fetchLicitacion', () => {
  it('pide GET /licitaciones/:id con el id codificado', async () => {
    const { fakeFetch, llamadas } = createFakeFetch({ body: LICITACION })
    const data = await fetchLicitacion('licitacion 001', { baseUrl: BASE, fetchImpl: fakeFetch })
    assert.deepEqual(llamadas, [`${BASE}/licitaciones/licitacion%20001`])
    assert.deepEqual(data, LICITACION)
  })

  it('devuelve null si la API responde 404', async () => {
    const { fakeFetch } = createFakeFetch({
      status: 404,
      body: { error: 'Licitación no encontrada' },
    })
    assert.equal(await fetchLicitacion('no-existe', { baseUrl: BASE, fetchImpl: fakeFetch }), null)
  })

  it('propaga otros errores de la API', async () => {
    const { fakeFetch } = createFakeFetch({ status: 400, body: { error: 'Id inválido' } })
    await assert.rejects(fetchLicitacion('%E0', { baseUrl: BASE, fetchImpl: fakeFetch }), {
      status: 400,
    })
  })
})
