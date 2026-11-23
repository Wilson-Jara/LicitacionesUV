// Regresión de #124: dos contextos de edición (dos pestañas) comparten el mismo
// localStorage. Cada contexto conserva su propia copia en memoria, que puede
// quedar desactualizada; guardarUmbrales debe partir siempre de lo vigente.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  actualizarUmbral,
  agregarUmbral,
  agregarUnidad,
  eliminarUmbral,
  eliminarUnidad,
  getUmbralesIniciales,
  guardarUmbrales,
  readUmbralesStore,
} from '../src/features/aprobaciones/data/umbralesStorage.js'

function almacenamientoCompartido() {
  const datos = new Map()
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, String(valor)),
  }
}

/** Simula una pestaña: carga la configuración al abrirse y guarda con guardarUmbrales. */
function abrirPestana(storage) {
  const pestana = {
    store: readUmbralesStore(storage),
    guardar(operacion) {
      const { store, aplicado } = guardarUmbrales(storage, pestana.store, operacion, 'ahora')
      pestana.store = store
      return aplicado
    },
  }
  return pestana
}

const nombres = (store) => store.unidades.map((unidad) => unidad.nombre)

describe('#124 · umbrales entre pestañas', () => {
  it('conserva las unidades creadas desde dos pestañas y siguen visibles al recargar', () => {
    const storage = almacenamientoCompartido()
    const a = abrirPestana(storage)
    const b = abrirPestana(storage)

    assert.equal(
      a.guardar((s, t) => agregarUnidad(s, { nombre: 'Facultad A', tipo: 'facultad' }, t)),
      true,
    )
    // b no se enteró del cambio de a: su copia en memoria sigue siendo la inicial
    assert.equal(
      b.guardar((s, t) => agregarUnidad(s, { nombre: 'Facultad B', tipo: 'facultad' }, t)),
      true,
    )

    const recargada = readUmbralesStore(storage)
    assert.deepEqual(nombres(recargada).slice(-2), ['Facultad A', 'Facultad B'])
    const ids = recargada.unidades.map((unidad) => unidad.id)
    assert.equal(new Set(ids).size, ids.length, 'sin ids repetidos')
  })

  it('no edita en silencio un umbral que otra pestaña eliminó y muestra lo vigente', () => {
    const storage = almacenamientoCompartido()
    const a = abrirPestana(storage)
    const b = abrirPestana(storage)

    a.guardar((s, t) => eliminarUmbral(s, 'unidad-1', 'umbral-1', t))
    const guardadoPorA = readUmbralesStore(storage)

    const datos = { montoMinimo: 0, montoMaximo: 9000000, nivelAprobador: 'rectoria' }
    const aplicado = b.guardar((s, t) => actualizarUmbral(s, 'unidad-1', 'umbral-1', datos, t))

    assert.equal(aplicado, false)
    assert.deepEqual(readUmbralesStore(storage), guardadoPorA, 'b no sobrescribió nada')
    assert.deepEqual(b.store, guardadoPorA, 'b pasa a mostrar la configuración vigente')
  })

  it('rechaza un rango que se solapa con uno guardado desde otra pestaña', () => {
    const storage = almacenamientoCompartido()
    const inicial = abrirPestana(storage)
    inicial.guardar((s, t) => agregarUnidad(s, { nombre: 'Compartida', tipo: 'direccion' }, t))
    const idUnidad = inicial.store.unidades.at(-1).id

    const a = abrirPestana(storage)
    const b = abrirPestana(storage)
    const tramoA = { montoMinimo: 0, montoMaximo: 1000, nivelAprobador: 'jefe_unidad' }
    const tramoB = { montoMinimo: 500, montoMaximo: 1500, nivelAprobador: 'rectoria' }

    assert.equal(
      a.guardar((s, t) => agregarUmbral(s, idUnidad, tramoA, t)),
      true,
    )
    assert.equal(
      b.guardar((s, t) => agregarUmbral(s, idUnidad, tramoB, t)),
      false,
    )

    const umbrales = readUmbralesStore(storage).unidades.find((u) => u.id === idUnidad).umbrales
    assert.deepEqual(
      umbrales.map((u) => [u.montoMinimo, u.montoMaximo]),
      [[0, 1000]],
    )
  })

  it('rechaza una unidad con el mismo nombre creada a la vez en otra pestaña', () => {
    const storage = almacenamientoCompartido()
    const a = abrirPestana(storage)
    const b = abrirPestana(storage)
    const crear = (s, t) => agregarUnidad(s, { nombre: 'Dirección TI', tipo: 'direccion' }, t)

    assert.equal(a.guardar(crear), true)
    assert.equal(b.guardar(crear), false)
    assert.equal(nombres(readUmbralesStore(storage)).filter((n) => n === 'Dirección TI').length, 1)
  })

  it('respeta una lista vacía guardada por otra pestaña en vez de volver a la semilla', () => {
    const storage = almacenamientoCompartido()
    const a = abrirPestana(storage)
    const b = abrirPestana(storage)

    for (const unidad of getUmbralesIniciales().unidades) {
      a.guardar((s, t) => eliminarUnidad(s, unidad.id, t))
    }
    assert.deepEqual(readUmbralesStore(storage).unidades, [])

    b.guardar((s, t) => agregarUnidad(s, { nombre: 'Única', tipo: 'rectoria' }, t))
    assert.deepEqual(nombres(readUmbralesStore(storage)), ['Única'])
  })

  it('no pisa una edición del mismo umbral guardada desde otra pestaña', () => {
    const storage = almacenamientoCompartido()
    const a = abrirPestana(storage)
    const b = abrirPestana(storage)
    // Las dos pestañas abren el editor con la misma versión del umbral
    const { montoMinimo, montoMaximo, nivelAprobador } = a.store.unidades[0].umbrales[0]
    const abierto = { montoMinimo, montoMaximo, nivelAprobador }

    const datosA = { montoMinimo: 0, montoMaximo: 9000000, nivelAprobador }
    const datosB = { montoMinimo: 0, montoMaximo: 8000000, nivelAprobador }
    assert.equal(
      a.guardar((s, t) => actualizarUmbral(s, 'unidad-1', 'umbral-1', datosA, t, abierto)),
      true,
    )
    assert.equal(
      b.guardar((s, t) => actualizarUmbral(s, 'unidad-1', 'umbral-1', datosB, t, abierto)),
      false,
    )

    const umbral = readUmbralesStore(storage).unidades[0].umbrales[0]
    assert.equal(umbral.montoMaximo, 9000000, 'se conserva la edición de a')
    assert.equal(b.store.unidades[0].umbrales[0].montoMaximo, 9000000, 'b ve lo vigente')
  })

  it('si no puede escribir (sin espacio), rechaza la operación en vez de dejarla solo en memoria', () => {
    const storage = almacenamientoCompartido()
    const crear = (nombre) => (s, t) => agregarUnidad(s, { nombre, tipo: 'facultad' }, t)
    guardarUmbrales(storage, getUmbralesIniciales(), crear('Guardada'), 't0')
    const guardado = readUmbralesStore(storage)
    const sinEspacio = {
      getItem: storage.getItem,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }

    const resultado = guardarUmbrales(sinEspacio, guardado, crear('Sin espacio'), 't1')
    assert.equal(resultado.aplicado, false)
    assert.equal(resultado.problema, 'sin-espacio')
    assert.deepEqual(resultado.store, guardado, 'la pestaña sigue mostrando lo guardado')
    assert.deepEqual(readUmbralesStore(storage), guardado, 'el almacenamiento no cambió')
  })

  it('informa sin problemas un cambio que sí llegó al almacenamiento', () => {
    const storage = almacenamientoCompartido()
    const crear = (s, t) => agregarUnidad(s, { nombre: 'Guardada', tipo: 'facultad' }, t)
    const resultado = guardarUmbrales(storage, getUmbralesIniciales(), crear, 't')
    assert.equal(resultado.aplicado, true)
    assert.equal(resultado.problema, null)
    assert.deepEqual(readUmbralesStore(storage), resultado.store)
  })

  it('no aplica una operación pendiente a una unidad nueva que reutilizaría el id de la eliminada', () => {
    const storage = almacenamientoCompartido()
    const a = abrirPestana(storage)
    const b = abrirPestana(storage)
    // a tiene elegida la última unidad (unidad-3); b la elimina y crea otra
    b.guardar((s, t) => eliminarUnidad(s, 'unidad-3', t))
    b.guardar((s, t) => agregarUnidad(s, { nombre: 'Reemplazo', tipo: 'direccion' }, t))
    assert.equal(b.store.unidades.at(-1).id, 'unidad-4', 'el id 3 no se reutiliza')

    const tramo = { montoMinimo: 0, montoMaximo: 1000, nivelAprobador: 'rectoria' }
    assert.equal(
      a.guardar((s, t) => agregarUmbral(s, 'unidad-3', tramo, t)),
      false,
    )
    assert.deepEqual(readUmbralesStore(storage).unidades.at(-1).umbrales, [])
  })

  it('usa la copia en memoria si el almacenamiento no está disponible o está bloqueado', () => {
    const enMemoria = agregarUnidad(
      getUmbralesIniciales(),
      { nombre: 'Solo en memoria', tipo: 'facultad' },
      'antes',
    )
    const crear = (s, t) => agregarUnidad(s, { nombre: 'Otra', tipo: 'facultad' }, t)
    const bloqueado = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
    }

    for (const storage of [null, bloqueado]) {
      const { store, aplicado, problema } = guardarUmbrales(storage, enMemoria, crear, 'ahora')
      assert.equal(aplicado, true)
      assert.equal(problema, 'bloqueado')
      assert.deepEqual(nombres(store).slice(-2), ['Solo en memoria', 'Otra'])
    }
  })
})
