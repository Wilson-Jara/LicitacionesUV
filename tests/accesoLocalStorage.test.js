// Pruebas de caracterización del acceso a localStorage (#124, intervención ISF224).
//
// Fijan el comportamiento observable de la persistencia de umbrales y favoritos
// en los tres casos que importan en el navegador: almacenamiento disponible,
// ausente (sin `window` o sin permiso) y bloqueado (getItem/setItem lanzan, por
// ejemplo SecurityError en modo privado o QuotaExceededError con la cuota llena).
// Deben pasar igual antes y después de extraer el acceso a un módulo compartido.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  UMBRALES_STORAGE_KEY,
  getUmbralesIniciales,
  readUmbralesStore,
  writeUmbralesStore,
} from '../src/features/aprobaciones/data/umbralesStorage.js'
import {
  FAVORITOS_STORAGE_KEY,
  readFavoritosStore,
  writeFavoritosStore,
} from '../src/features/favoritos/data/favoritosStorage.js'

function almacenamientoDisponible(inicial = {}) {
  const datos = new Map(Object.entries(inicial))
  return {
    datos,
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
  }
}

function almacenamientoBloqueado() {
  return {
    getItem: () => {
      throw new Error('SecurityError: el acceso a localStorage está bloqueado')
    },
    setItem: () => {
      throw new Error('SecurityError: el acceso a localStorage está bloqueado')
    },
  }
}

function almacenamientoSinCuota(inicial = {}) {
  const disponible = almacenamientoDisponible(inicial)
  return {
    ...disponible,
    setItem: () => {
      throw new Error('QuotaExceededError: no queda espacio')
    },
  }
}

const UMBRALES = {
  actualizadoEn: '2026-11-21T20:00:00.000Z',
  unidades: [
    {
      id: 'unidad-1',
      nombre: 'Rectoría',
      tipo: 'rectoria',
      umbrales: [
        {
          id: 'umbral-1',
          idUnidad: 'unidad-1',
          montoMinimo: 0,
          montoMaximo: null,
          nivelAprobador: 'rectoria',
        },
      ],
    },
  ],
}

const FAVORITOS = {
  'ana@uv.cl': [{ idLicitacion: 'licitacion-001', fechaGuardado: '2026-11-21T20:00:00.000Z' }],
}

describe('caracterización · acceso a localStorage de umbrales', () => {
  it('disponible: escribe JSON en su clave y lo vuelve a leer igual', () => {
    const storage = almacenamientoDisponible()
    assert.equal(writeUmbralesStore(storage, UMBRALES), undefined)
    assert.equal(storage.datos.get(UMBRALES_STORAGE_KEY), JSON.stringify(UMBRALES))
    assert.deepEqual(readUmbralesStore(storage), UMBRALES)
  })

  it('disponible sin datos guardados: parte de la configuración inicial', () => {
    assert.deepEqual(readUmbralesStore(almacenamientoDisponible()), getUmbralesIniciales())
  })

  it('ausente: lee la configuración inicial y escribir no hace nada', () => {
    assert.deepEqual(readUmbralesStore(null), getUmbralesIniciales())
    assert.doesNotThrow(() => writeUmbralesStore(null, UMBRALES))
  })

  it('bloqueado: lee la configuración inicial y escribir no lanza', () => {
    const storage = almacenamientoBloqueado()
    assert.deepEqual(readUmbralesStore(storage), getUmbralesIniciales())
    assert.doesNotThrow(() => writeUmbralesStore(storage, UMBRALES))
  })

  it('sin cuota: escribir no lanza y conserva lo que ya estaba guardado', () => {
    const storage = almacenamientoSinCuota({ [UMBRALES_STORAGE_KEY]: JSON.stringify(UMBRALES) })
    assert.doesNotThrow(() => writeUmbralesStore(storage, getUmbralesIniciales()))
    assert.deepEqual(readUmbralesStore(storage), UMBRALES)
  })
})

describe('caracterización · acceso a localStorage de favoritos', () => {
  it('disponible: escribe JSON en su clave y lo vuelve a leer igual', () => {
    const storage = almacenamientoDisponible()
    assert.equal(writeFavoritosStore(storage, FAVORITOS), undefined)
    assert.equal(storage.datos.get(FAVORITOS_STORAGE_KEY), JSON.stringify(FAVORITOS))
    assert.deepEqual(readFavoritosStore(storage), FAVORITOS)
  })

  it('disponible sin datos guardados: parte sin favoritos', () => {
    assert.deepEqual(readFavoritosStore(almacenamientoDisponible()), {})
  })

  it('ausente: lee sin favoritos y escribir no hace nada', () => {
    assert.deepEqual(readFavoritosStore(null), {})
    assert.doesNotThrow(() => writeFavoritosStore(null, FAVORITOS))
  })

  it('bloqueado: lee sin favoritos y escribir no lanza', () => {
    const storage = almacenamientoBloqueado()
    assert.deepEqual(readFavoritosStore(storage), {})
    assert.doesNotThrow(() => writeFavoritosStore(storage, FAVORITOS))
  })

  it('sin cuota: escribir no lanza y conserva lo que ya estaba guardado', () => {
    const storage = almacenamientoSinCuota({ [FAVORITOS_STORAGE_KEY]: JSON.stringify(FAVORITOS) })
    assert.doesNotThrow(() => writeFavoritosStore(storage, {}))
    assert.deepEqual(readFavoritosStore(storage), FAVORITOS)
  })
})
