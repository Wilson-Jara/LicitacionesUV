import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  FAVORITOS_STORAGE_KEY,
  addFavorito,
  getFavoritos,
  getUserId,
  readFavoritosStore,
  removeFavorito,
  writeFavoritosStore,
} from '../src/features/favoritos/data/favoritosStorage.js'

function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}

describe('favoritosStorage', () => {
  it('resuelve el id de usuario por email y usa el nombre como respaldo', () => {
    assert.equal(getUserId({ email: 'proveedor@uv.cl', name: 'Proveedor' }), 'proveedor@uv.cl')
    assert.equal(getUserId({ name: 'Solo Nombre' }), 'Solo Nombre')
    assert.equal(getUserId(null), null)
  })

  it('agrega un favorito con fechaGuardado y no duplica', () => {
    const inicial = {}
    const conUno = addFavorito(inicial, 'u1', 'licitacion-001', '2026-09-22T10:00:00.000Z')

    assert.deepEqual(conUno.u1, [
      { idLicitacion: 'licitacion-001', fechaGuardado: '2026-09-22T10:00:00.000Z' },
    ])

    const duplicado = addFavorito(conUno, 'u1', 'licitacion-001', '2026-09-22T11:00:00.000Z')
    assert.equal(duplicado, conUno, 'no debe cambiar el store si ya existe')
  })

  it('ignora el guardado cuando no hay usuario o identificación de licitación', () => {
    assert.deepEqual(addFavorito({}, null, 'licitacion-001', 'x'), {})
    assert.deepEqual(addFavorito({}, 'u1', undefined, 'x'), {})
  })

  it('quita un favorito sin afectar a otros usuarios', () => {
    const store = {
      u1: [{ idLicitacion: 'a', fechaGuardado: 'x' }],
      u2: [{ idLicitacion: 'a', fechaGuardado: 'y' }],
    }
    const resultado = removeFavorito(store, 'u1', 'a')

    assert.deepEqual(resultado.u1, [])
    assert.deepEqual(resultado.u2, store.u2)
  })

  it('devuelve arreglo vacío cuando no hay sesión', () => {
    assert.deepEqual(getFavoritos({ u1: [{ idLicitacion: 'a' }] }, null), [])
    assert.deepEqual(getFavoritos({ u1: [{ idLicitacion: 'a' }] }, 'u1'), [{ idLicitacion: 'a' }])
  })

  it('tolera storage ausente, corrupto o con formato inesperado', () => {
    assert.deepEqual(readFavoritosStore(null), {})
    assert.deepEqual(
      readFavoritosStore(createMemoryStorage({ [FAVORITOS_STORAGE_KEY]: '{no-json' })),
      {},
    )
    assert.deepEqual(
      readFavoritosStore(createMemoryStorage({ [FAVORITOS_STORAGE_KEY]: '[1,2]' })),
      {},
    )
  })

  it('descarta registros corruptos y normaliza solo favoritos con idLicitacion válida', () => {
    const storage = createMemoryStorage({
      [FAVORITOS_STORAGE_KEY]: JSON.stringify({
        u1: [
          { idLicitacion: 'licitacion-001', fechaGuardado: '2026-09-22T10:00:00.000Z' },
          { idLicitacion: '', fechaGuardado: 'x' },
          { idLicitacion: '   ', fechaGuardado: 'x' },
          { idLicitacion: 42, fechaGuardado: 'x' },
          { fechaGuardado: 'x' },
          null,
          'texto',
          { idLicitacion: 'licitacion-002' },
          { idLicitacion: 'licitacion-001', fechaGuardado: 'duplicado' },
        ],
      }),
    })

    assert.deepEqual(readFavoritosStore(storage), {
      u1: [
        { idLicitacion: 'licitacion-001', fechaGuardado: '2026-09-22T10:00:00.000Z' },
        { idLicitacion: 'licitacion-002', fechaGuardado: null },
      ],
    })
  })

  it('persiste y vuelve a leer el store completo', () => {
    const storage = createMemoryStorage()
    const store = { u1: [{ idLicitacion: 'a', fechaGuardado: '2026-09-22T10:00:00.000Z' }] }

    writeFavoritosStore(storage, store)

    assert.deepEqual(readFavoritosStore(storage), store)
  })
})
