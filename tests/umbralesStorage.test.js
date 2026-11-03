import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  UMBRALES_STORAGE_KEY,
  actualizarUmbral,
  agregarUmbral,
  agregarUnidad,
  eliminarUmbral,
  eliminarUnidad,
  getUmbralesIniciales,
  readUmbralesStore,
  writeUmbralesStore,
} from '../src/features/aprobaciones/data/umbralesStorage.js'

function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}

function umbralesDe(store, idUnidad) {
  return store.unidades.find((unidad) => unidad.id === idUnidad).umbrales
}

describe('umbralesStorage · lectura', () => {
  it('parte de la configuración inicial cuando no hay datos o el storage no está disponible', () => {
    const inicial = getUmbralesIniciales()
    assert.equal(inicial.unidades.length, 3)
    assert.equal(inicial.actualizadoEn, null)

    assert.deepEqual(readUmbralesStore(null), inicial)
    assert.deepEqual(readUmbralesStore(createMemoryStorage()), inicial)
  })

  it('tolera datos corruptos o con formato inesperado', () => {
    assert.deepEqual(
      readUmbralesStore(createMemoryStorage({ [UMBRALES_STORAGE_KEY]: '{no-json' })),
      getUmbralesIniciales(),
    )
    assert.deepEqual(
      readUmbralesStore(createMemoryStorage({ [UMBRALES_STORAGE_KEY]: '[1,2]' })),
      getUmbralesIniciales(),
    )
    assert.deepEqual(
      readUmbralesStore(createMemoryStorage({ [UMBRALES_STORAGE_KEY]: '{"unidades":[null]}' })),
      getUmbralesIniciales(),
    )
    assert.deepEqual(
      readUmbralesStore(createMemoryStorage({ [UMBRALES_STORAGE_KEY]: '{"actualizadoEn":null}' })),
      getUmbralesIniciales(),
    )
  })

  it('distingue entre no haber configuración guardada y una configuración vacía', () => {
    const vacia = createMemoryStorage({
      [UMBRALES_STORAGE_KEY]: JSON.stringify({ actualizadoEn: null, unidades: [] }),
    })

    assert.deepEqual(readUmbralesStore(vacia), { actualizadoEn: null, unidades: [] })
  })

  it('normaliza la configuración y descarta unidades y umbrales inválidos', () => {
    const storage = createMemoryStorage({
      [UMBRALES_STORAGE_KEY]: JSON.stringify({
        actualizadoEn: '2026-10-18T10:00:00.000Z',
        unidades: [
          {
            id: 'unidad-1',
            nombre: 'Facultad de Ingeniería',
            tipo: 'facultad',
            umbrales: [
              {
                id: 'umbral-1',
                montoMinimo: 0,
                montoMaximo: 10000001,
                nivelAprobador: 'jefe_unidad',
              },
              { id: 'umbral-2', montoMinimo: 100, montoMaximo: 50, nivelAprobador: 'rectoria' },
              { id: 'umbral-3', montoMinimo: 0, montoMaximo: null, nivelAprobador: 'inventado' },
              { id: '   ', montoMinimo: 0, montoMaximo: null, nivelAprobador: 'rectoria' },
              { id: 'umbral-5', montoMinimo: -1, montoMaximo: null, nivelAprobador: 'rectoria' },
              null,
            ],
          },
          { id: 'unidad-2', nombre: '', tipo: 'facultad', umbrales: [] },
          { id: 'unidad-3', nombre: 'Dirección', tipo: 'tipo-invalido', umbrales: [] },
          'texto',
        ],
      }),
    })

    const store = readUmbralesStore(storage)

    assert.equal(store.actualizadoEn, '2026-10-18T10:00:00.000Z')
    assert.equal(store.unidades.length, 1)
    assert.deepEqual(umbralesDe(store, 'unidad-1'), [
      {
        id: 'umbral-1',
        idUnidad: 'unidad-1',
        montoMinimo: 0,
        montoMaximo: 10000001,
        nivelAprobador: 'jefe_unidad',
      },
    ])
  })

  it('persiste y vuelve a leer la configuración completa', () => {
    const storage = createMemoryStorage()
    const store = agregarUmbral(
      getUmbralesIniciales(),
      'unidad-1',
      { montoMinimo: 100000000, montoMaximo: null, nivelAprobador: 'rectoria' },
      '2026-10-18T10:00:00.000Z',
    )

    writeUmbralesStore(storage, store)

    assert.deepEqual(readUmbralesStore(storage), store)
  })
})

describe('umbralesStorage · operaciones sobre umbrales', () => {
  it('agrega un umbral generando su id y la marca de actualización', () => {
    const inicial = getUmbralesIniciales()
    const nuevo = agregarUmbral(
      inicial,
      'unidad-1',
      { montoMinimo: 100000000, montoMaximo: null, nivelAprobador: 'rectoria' },
      '2026-10-18T10:00:00.000Z',
    )

    const umbrales = umbralesDe(nuevo, 'unidad-1')
    assert.equal(umbrales.length, 4)
    assert.deepEqual(umbrales[3], {
      id: 'umbral-10',
      idUnidad: 'unidad-1',
      montoMinimo: 100000000,
      montoMaximo: null,
      nivelAprobador: 'rectoria',
    })
    assert.equal(nuevo.actualizadoEn, '2026-10-18T10:00:00.000Z')
    assert.equal(umbralesDe(inicial, 'unidad-1').length, 3, 'no muta el store original')
  })

  it('ignora el alta cuando la unidad no existe', () => {
    const store = getUmbralesIniciales()
    const resultado = agregarUmbral(store, 'unidad-inexistente', {}, 'x')
    assert.equal(resultado, store)
  })

  it('actualiza un umbral existente y conserva los demás', () => {
    const store = getUmbralesIniciales()
    const actualizado = actualizarUmbral(
      store,
      'unidad-1',
      'umbral-1',
      { montoMinimo: 0, montoMaximo: 20000001, nivelAprobador: 'direccion_economica' },
      '2026-10-18T11:00:00.000Z',
    )

    assert.deepEqual(umbralesDe(actualizado, 'unidad-1')[0], {
      id: 'umbral-1',
      idUnidad: 'unidad-1',
      montoMinimo: 0,
      montoMaximo: 20000001,
      nivelAprobador: 'direccion_economica',
    })
    assert.equal(umbralesDe(actualizado, 'unidad-1')[1].id, 'umbral-2')
    assert.equal(umbralesDe(actualizado, 'unidad-1').length, 3)
    assert.equal(actualizado.actualizadoEn, '2026-10-18T11:00:00.000Z')
  })

  it('ignora la actualización cuando el umbral no existe', () => {
    const store = getUmbralesIniciales()
    const resultado = actualizarUmbral(store, 'unidad-1', 'umbral-99', {}, 'x')
    assert.equal(resultado, store)
  })

  it('elimina un umbral sin afectar a los demás', () => {
    const store = getUmbralesIniciales()
    const resultado = eliminarUmbral(store, 'unidad-1', 'umbral-2', '2026-10-18T12:00:00.000Z')

    const umbrales = umbralesDe(resultado, 'unidad-1')
    assert.equal(umbrales.length, 2)
    assert.equal(
      umbrales.some((umbral) => umbral.id === 'umbral-2'),
      false,
    )
    assert.equal(umbralesDe(store, 'unidad-1').length, 3, 'no muta el store original')
  })

  it('ignora la eliminación cuando el umbral no existe', () => {
    const store = getUmbralesIniciales()
    assert.equal(eliminarUmbral(store, 'unidad-1', 'umbral-99', 'x'), store)
  })
})

describe('umbralesStorage · operaciones sobre unidades', () => {
  it('agrega una unidad vacía con id nuevo', () => {
    const store = getUmbralesIniciales()
    const resultado = agregarUnidad(
      store,
      { nombre: 'Facultad de Arte', tipo: 'facultad' },
      '2026-10-18T13:00:00.000Z',
    )

    assert.equal(resultado.unidades.length, 4)
    assert.deepEqual(resultado.unidades[3], {
      id: 'unidad-4',
      nombre: 'Facultad de Arte',
      tipo: 'facultad',
      umbrales: [],
    })
  })

  it('elimina una unidad junto con sus umbrales', () => {
    const store = getUmbralesIniciales()
    const resultado = eliminarUnidad(store, 'unidad-2', '2026-10-18T14:00:00.000Z')

    assert.equal(resultado.unidades.length, 2)
    assert.equal(
      resultado.unidades.some((unidad) => unidad.id === 'unidad-2'),
      false,
    )
    assert.equal(resultado.actualizadoEn, '2026-10-18T14:00:00.000Z')
  })

  it('ignora la eliminación cuando la unidad no existe', () => {
    const store = getUmbralesIniciales()
    assert.equal(eliminarUnidad(store, 'unidad-inexistente', 'x'), store)
  })

  it('conserva la eliminación de todas las unidades tras recargar', () => {
    const storage = createMemoryStorage()
    let store = getUmbralesIniciales()
    for (const unidad of store.unidades) {
      store = eliminarUnidad(store, unidad.id, '2026-10-18T15:00:00.000Z')
    }

    assert.equal(store.unidades.length, 0)

    writeUmbralesStore(storage, store)

    const releido = readUmbralesStore(storage)
    assert.deepEqual(releido, store)
    assert.equal(releido.unidades.length, 0)
  })
})
