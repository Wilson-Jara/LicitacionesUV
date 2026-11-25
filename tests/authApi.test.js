import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  cerrarSesionRemota,
  iniciarSesionConGoogle,
  normalizarUsuario,
  obtenerUsuarioActual,
} from '../src/features/auth/services/authApi.js'
import { ApiError } from '../src/features/licitaciones/services/licitacionesApi.js'

const BASE = 'http://api.test/api'

const USUARIO_API = {
  id: 'google:1234',
  name: 'Ana Pérez',
  email: 'ana@gmail.com',
  picture: 'https://lh3.googleusercontent.com/foto',
}

const USUARIO = {
  id: 'google:1234',
  name: 'Ana Pérez',
  email: 'ana@gmail.com',
  photoUrl: 'https://lh3.googleusercontent.com/foto',
}

/** Doble de `fetch` que registra cada llamada y responde lo indicado. */
function createFakeFetch({ status = 200, body = null, falla = false, sinJson = false } = {}) {
  const llamadas = []
  const fakeFetch = async (url, opciones) => {
    llamadas.push({ url, opciones })
    if (falla) throw new TypeError('Failed to fetch')
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (sinJson) throw new SyntaxError('Unexpected token')
        return body
      },
    }
  }
  return { fakeFetch, llamadas }
}

describe('normalizarUsuario', () => {
  it('convierte el usuario de la API a la forma del AuthProvider', () => {
    assert.deepEqual(normalizarUsuario(USUARIO_API), USUARIO)
  })

  it('deja photoUrl en null si no hay foto y id vacío si no viene', () => {
    assert.deepEqual(normalizarUsuario({ name: 'Ana', email: 'ana@gmail.com', picture: null }), {
      id: '',
      name: 'Ana',
      email: 'ana@gmail.com',
      photoUrl: null,
    })
  })

  it('rechaza un usuario sin nombre o sin correo', () => {
    assert.equal(normalizarUsuario({ email: 'ana@gmail.com' }), null)
    assert.equal(normalizarUsuario({ name: 'Ana', email: '' }), null)
    assert.equal(normalizarUsuario(null), null)
  })
})

describe('iniciarSesionConGoogle', () => {
  it('envía la credencial por POST y devuelve token, vencimiento y usuario', async () => {
    const { fakeFetch, llamadas } = createFakeFetch({
      body: { token: 'tok', expiresAt: '2026-11-25T18:00:00.000Z', user: USUARIO_API },
    })
    const sesion = await iniciarSesionConGoogle('id-token', { baseUrl: BASE, fetchImpl: fakeFetch })

    assert.deepEqual(sesion, { token: 'tok', expiresAt: '2026-11-25T18:00:00.000Z', user: USUARIO })
    assert.equal(llamadas[0].url, `${BASE}/auth/google`)
    assert.equal(llamadas[0].opciones.method, 'POST')
    assert.equal(llamadas[0].opciones.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(llamadas[0].opciones.body), { credential: 'id-token' })
  })

  it('usa el mensaje de error de la API cuando la credencial es inválida (401)', async () => {
    const { fakeFetch } = createFakeFetch({
      status: 401,
      body: { error: 'Credencial de Google inválida' },
    })
    await assert.rejects(iniciarSesionConGoogle('malo', { baseUrl: BASE, fetchImpl: fakeFetch }), {
      name: 'ApiError',
      status: 401,
      message: 'Credencial de Google inválida',
    })
  })

  it('usa un mensaje genérico si el error no trae JSON', async () => {
    const { fakeFetch } = createFakeFetch({ status: 502, sinJson: true })
    await assert.rejects(iniciarSesionConGoogle('x', { baseUrl: BASE, fetchImpl: fakeFetch }), {
      status: 502,
      message: 'El servidor respondió con el código 502.',
    })
  })

  it('lanza ApiError con status 0 si la red falla', async () => {
    const { fakeFetch } = createFakeFetch({ falla: true })
    await assert.rejects(
      iniciarSesionConGoogle('x', { baseUrl: BASE, fetchImpl: fakeFetch }),
      (error) => error instanceof ApiError && error.status === 0,
    )
  })

  it('rechaza una respuesta 200 sin token o sin usuario válido', async () => {
    const sinToken = createFakeFetch({
      body: { expiresAt: '2026-11-25T18:00:00Z', user: USUARIO_API },
    })
    await assert.rejects(
      iniciarSesionConGoogle('x', { baseUrl: BASE, fetchImpl: sinToken.fakeFetch }),
      { message: 'El servidor devolvió una sesión con formato inesperado.' },
    )
    const sinUsuario = createFakeFetch({ body: { token: 't', expiresAt: '2026-11-25T18:00:00Z' } })
    await assert.rejects(
      iniciarSesionConGoogle('x', { baseUrl: BASE, fetchImpl: sinUsuario.fakeFetch }),
      { name: 'ApiError' },
    )
  })
})

describe('obtenerUsuarioActual', () => {
  it('envía el token en Authorization y devuelve el usuario', async () => {
    const { fakeFetch, llamadas } = createFakeFetch({ body: { user: USUARIO_API } })
    const usuario = await obtenerUsuarioActual('tok', { baseUrl: BASE, fetchImpl: fakeFetch })

    assert.deepEqual(usuario, USUARIO)
    assert.equal(llamadas[0].url, `${BASE}/auth/me`)
    assert.equal(llamadas[0].opciones.headers.Authorization, 'Bearer tok')
  })

  it('propaga el 401 cuando la sesión expiró', async () => {
    const { fakeFetch } = createFakeFetch({
      status: 401,
      body: { error: 'Sesión inválida o expirada' },
    })
    await assert.rejects(obtenerUsuarioActual('viejo', { baseUrl: BASE, fetchImpl: fakeFetch }), {
      status: 401,
      message: 'Sesión inválida o expirada',
    })
  })

  it('rechaza una respuesta sin usuario válido', async () => {
    const { fakeFetch } = createFakeFetch({ body: {} })
    await assert.rejects(obtenerUsuarioActual('tok', { baseUrl: BASE, fetchImpl: fakeFetch }), {
      message: 'El servidor devolvió un usuario con formato inesperado.',
    })
  })
})

describe('cerrarSesionRemota', () => {
  it('hace POST a /auth/logout con el token y devuelve true con 204', async () => {
    const { fakeFetch, llamadas } = createFakeFetch({ status: 204 })
    assert.equal(await cerrarSesionRemota('tok', { baseUrl: BASE, fetchImpl: fakeFetch }), true)
    assert.equal(llamadas[0].url, `${BASE}/auth/logout`)
    assert.equal(llamadas[0].opciones.method, 'POST')
    assert.equal(llamadas[0].opciones.headers.Authorization, 'Bearer tok')
  })

  it('nunca lanza: devuelve false si la red o la API fallan', async () => {
    const red = createFakeFetch({ falla: true })
    assert.equal(
      await cerrarSesionRemota('tok', { baseUrl: BASE, fetchImpl: red.fakeFetch }),
      false,
    )
    const api = createFakeFetch({ status: 503, body: { error: 'Login con Google no configurado' } })
    assert.equal(
      await cerrarSesionRemota('tok', { baseUrl: BASE, fetchImpl: api.fakeFetch }),
      false,
    )
  })
})
