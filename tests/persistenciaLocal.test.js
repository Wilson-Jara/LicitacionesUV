import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  escribirJson,
  leerJson,
  obtenerAlmacenamientoLocal,
} from '../src/shared/lib/persistenciaLocal.js'

function almacenamiento(inicial = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    datos,
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
  }
}

const lanza = () => {
  throw new Error('SecurityError')
}

describe('persistenciaLocal · obtenerAlmacenamientoLocal', () => {
  const windowOriginal = globalThis.window
  afterEach(() => {
    if (windowOriginal === undefined) delete globalThis.window
    else globalThis.window = windowOriginal
  })

  it('devuelve null cuando no hay window (Node, prerenderizado)', () => {
    delete globalThis.window
    assert.equal(obtenerAlmacenamientoLocal(), null)
  })

  it('devuelve el localStorage del navegador cuando está disponible', () => {
    const storage = almacenamiento()
    globalThis.window = { localStorage: storage }
    assert.equal(obtenerAlmacenamientoLocal(), storage)
  })

  it('devuelve null cuando el navegador bloquea el acceso (SecurityError)', () => {
    globalThis.window = {}
    Object.defineProperty(globalThis.window, 'localStorage', { get: lanza })
    assert.equal(obtenerAlmacenamientoLocal(), null)
  })
})

describe('persistenciaLocal · leerJson', () => {
  it('lee el valor guardado, incluido null, sin validar su forma', () => {
    assert.deepEqual(leerJson(almacenamiento({ k: '{"a":1}' }), 'k'), { ok: true, valor: { a: 1 } })
    assert.deepEqual(leerJson(almacenamiento({ k: '[1,2]' }), 'k'), { ok: true, valor: [1, 2] })
    assert.deepEqual(leerJson(almacenamiento({ k: 'null' }), 'k'), { ok: true, valor: null })
  })

  it('informa no-disponible sin almacenamiento o si getItem lanza', () => {
    assert.deepEqual(leerJson(null, 'k'), { ok: false, motivo: 'no-disponible' })
    assert.deepEqual(leerJson({ getItem: lanza }, 'k'), { ok: false, motivo: 'no-disponible' })
  })

  it('informa ausente si no hay nada guardado o es una cadena vacía', () => {
    assert.deepEqual(leerJson(almacenamiento(), 'k'), { ok: false, motivo: 'ausente' })
    assert.deepEqual(leerJson(almacenamiento({ k: '' }), 'k'), { ok: false, motivo: 'ausente' })
  })

  it('informa ilegible si lo guardado no es JSON', () => {
    assert.deepEqual(leerJson(almacenamiento({ k: '{no-json' }), 'k'), {
      ok: false,
      motivo: 'ilegible',
    })
  })
})

describe('persistenciaLocal · escribirJson', () => {
  it('guarda el valor como JSON y confirma con true', () => {
    const storage = almacenamiento()
    assert.equal(escribirJson(storage, 'k', { a: [1, 2] }), true)
    assert.equal(storage.datos.get('k'), '{"a":[1,2]}')
  })

  it('devuelve false sin almacenamiento, si está bloqueado o sin cuota', () => {
    assert.equal(escribirJson(null, 'k', {}), false)
    assert.equal(escribirJson({ setItem: lanza }, 'k', {}), false)
  })

  it('devuelve false sin lanzar si el valor no se puede serializar', () => {
    const circular = {}
    circular.yo = circular
    const storage = almacenamiento()
    assert.equal(escribirJson(storage, 'k', circular), false)
    assert.equal(storage.datos.has('k'), false)
  })
})
