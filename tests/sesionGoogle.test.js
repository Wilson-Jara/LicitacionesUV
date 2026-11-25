import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  SESION_GOOGLE_KEY,
  borrarSesionGoogle,
  guardarSesionGoogle,
  leerSesionGoogle,
  obtenerAlmacenamientoSesion,
} from '../src/features/auth/data/sesionGoogle.js'
import {
  GOOGLE_IDENTITY_SRC,
  cargarGoogleIdentity,
  resolveGoogleClientId,
} from '../src/features/auth/services/googleIdentity.js'

const AHORA = new Date('2026-11-25T12:00:00.000Z')

const SESION = {
  token: 'tok',
  expiresAt: '2026-11-25T18:00:00.000Z',
  user: { id: 'google:1', name: 'Ana', email: 'ana@gmail.com', photoUrl: null },
}

function createStorage(inicial = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
    removeItem: (k) => datos.delete(k),
    datos,
  }
}

const bloqueado = {
  getItem() {
    throw new Error('SecurityError')
  },
  setItem() {
    throw new Error('SecurityError')
  },
  removeItem() {
    throw new Error('SecurityError')
  },
}

describe('sesionGoogle', () => {
  it('guarda la sesión y la vuelve a leer mientras está vigente', () => {
    const storage = createStorage()
    assert.equal(guardarSesionGoogle(storage, SESION), true)
    assert.deepEqual(leerSesionGoogle(storage, AHORA), SESION)
  })

  it('descarta una sesión vencida', () => {
    const storage = createStorage()
    guardarSesionGoogle(storage, { ...SESION, expiresAt: '2026-11-25T11:59:59.000Z' })
    assert.equal(leerSesionGoogle(storage, AHORA), null)
  })

  it('descarta datos incompletos, corruptos o con fecha inválida', () => {
    assert.equal(leerSesionGoogle(createStorage(), AHORA), null)
    assert.equal(leerSesionGoogle(createStorage({ [SESION_GOOGLE_KEY]: '{roto' }), AHORA), null)
    const sinToken = createStorage({
      [SESION_GOOGLE_KEY]: JSON.stringify({ ...SESION, token: '' }),
    })
    assert.equal(leerSesionGoogle(sinToken, AHORA), null)
    const sinCorreo = createStorage({
      [SESION_GOOGLE_KEY]: JSON.stringify({ ...SESION, user: { name: 'Ana' } }),
    })
    assert.equal(leerSesionGoogle(sinCorreo, AHORA), null)
    const fechaMala = createStorage({
      [SESION_GOOGLE_KEY]: JSON.stringify({ ...SESION, expiresAt: 'mañana' }),
    })
    assert.equal(leerSesionGoogle(fechaMala, AHORA), null)
  })

  it('borra la sesión guardada', () => {
    const storage = createStorage()
    guardarSesionGoogle(storage, SESION)
    borrarSesionGoogle(storage)
    assert.equal(storage.datos.has(SESION_GOOGLE_KEY), false)
  })

  it('no lanza si el almacenamiento está bloqueado o no existe', () => {
    assert.equal(guardarSesionGoogle(bloqueado, SESION), false)
    assert.equal(leerSesionGoogle(bloqueado, AHORA), null)
    assert.doesNotThrow(() => borrarSesionGoogle(bloqueado))
    assert.doesNotThrow(() => borrarSesionGoogle(null))
    assert.equal(leerSesionGoogle(null, AHORA), null)
  })

  it('obtiene sessionStorage del navegador o null si falta o lanza', () => {
    const storage = createStorage()
    assert.equal(obtenerAlmacenamientoSesion({ sessionStorage: storage }), storage)
    assert.equal(obtenerAlmacenamientoSesion(undefined), null)
    const lanza = {
      get sessionStorage() {
        throw new Error('SecurityError')
      },
    }
    assert.equal(obtenerAlmacenamientoSesion(lanza), null)
  })
})

describe('googleIdentity', () => {
  it('normaliza el Client ID configurado', () => {
    assert.equal(
      resolveGoogleClientId('  abc.apps.googleusercontent.com '),
      'abc.apps.googleusercontent.com',
    )
    assert.equal(resolveGoogleClientId(undefined), '')
  })

  it('devuelve google.accounts.id sin insertar el script si ya está cargado', async () => {
    const id = { initialize() {} }
    const documento = { defaultView: { google: { accounts: { id } } } }
    assert.equal(await cargarGoogleIdentity(documento), id)
  })

  function createDocumento() {
    const scripts = []
    const ventana = {}
    const documento = {
      defaultView: ventana,
      createElement: () => ({}),
      head: { appendChild: (script) => scripts.push(script) },
    }
    return { documento, scripts, ventana }
  }

  it('inserta el script una sola vez y resuelve cuando carga', async () => {
    const { documento, scripts, ventana } = createDocumento()
    const primera = cargarGoogleIdentity(documento)
    const segunda = cargarGoogleIdentity(documento)
    assert.equal(scripts.length, 1)
    assert.equal(scripts[0].src, GOOGLE_IDENTITY_SRC)
    const id = { initialize() {} }
    ventana.google = { accounts: { id } }
    scripts[0].onload()
    assert.equal(await primera, id)
    assert.equal(await segunda, id)
  })

  it('rechaza si el script no carga y permite reintentar', async () => {
    const { documento, scripts } = createDocumento()
    const intento = cargarGoogleIdentity(documento)
    scripts[0].onerror()
    await assert.rejects(intento, { message: 'No se pudo cargar el inicio de sesión de Google.' })

    const reintento = cargarGoogleIdentity(documento)
    assert.equal(scripts.length, 2)
    scripts[1].onload()
    await assert.rejects(reintento, { message: 'Google Identity Services no quedó disponible.' })
  })
})
