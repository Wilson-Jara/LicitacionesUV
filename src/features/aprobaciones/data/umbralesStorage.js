import { escribirJson, leerJson } from '../../../shared/lib/persistenciaLocal.js'
import { umbralesIniciales } from './umbralesIniciales.js'
import {
  NIVELES_APROBADOR,
  TIPOS_UNIDAD,
  esValido,
  generarIdUmbral,
  generarIdUnidad,
  mayorNumeroDeId,
  mismosValoresUmbral,
  validarUmbral,
  validarUnidad,
} from '../umbralesUtils.js'

/**
 * Clave empleada para persistir la configuración editable de umbrales en `localStorage`.
 * @type {string}
 */
export const UMBRALES_STORAGE_KEY = 'licitacionesuv-umbrales'

function normalizeUmbral(umbral, idUnidad) {
  if (!umbral || typeof umbral !== 'object') return null
  const { id, montoMinimo, montoMaximo, nivelAprobador } = umbral
  if (typeof id !== 'string' || id.trim() === '') return null
  if (!Number.isFinite(montoMinimo) || montoMinimo < 0) return null
  if (!NIVELES_APROBADOR[nivelAprobador]) return null

  let maximo = null
  if (montoMaximo !== null && montoMaximo !== undefined) {
    if (!Number.isFinite(montoMaximo) || montoMaximo <= montoMinimo) return null
    maximo = montoMaximo
  }

  return { id, idUnidad, montoMinimo, montoMaximo: maximo, nivelAprobador }
}

function normalizeUnidad(unidad) {
  if (!unidad || typeof unidad !== 'object') return null
  const { id, nombre, tipo } = unidad
  if (typeof id !== 'string' || id.trim() === '') return null
  if (typeof nombre !== 'string' || nombre.trim() === '') return null
  if (!TIPOS_UNIDAD[tipo]) return null

  const umbrales = Array.isArray(unidad.umbrales)
    ? unidad.umbrales.map((umbral) => normalizeUmbral(umbral, id)).filter(Boolean)
    : []

  return { id, nombre, tipo, umbrales }
}

function normalizeUnidades(unidades) {
  if (!Array.isArray(unidades)) return []
  const vistos = new Set()
  const normalizadas = []
  for (const unidad of unidades) {
    const normalizada = normalizeUnidad(unidad)
    if (!normalizada || vistos.has(normalizada.id)) continue
    vistos.add(normalizada.id)
    normalizadas.push(normalizada)
  }
  return normalizadas
}

/**
 * Construye una copia de la configuración inicial de umbrales.
 *
 * @returns {{ actualizadoEn: string|null, unidades: Array<object> }} Configuración inicial.
 */
export function getUmbralesIniciales() {
  return { actualizadoEn: null, unidades: normalizeUnidades(umbralesIniciales) }
}

/**
 * Lee la configuración de umbrales desde `localStorage`.
 *
 * CA2 (REF-14): los umbrales son datos configurables. Solo se recurre a la
 * configuración inicial cuando no hay nada guardado o los datos son ilegibles;
 * una configuración guardada vacía («sin unidades») se respeta tal cual, para
 * que la eliminación de todas las unidades sobreviva a una recarga.
 *
 * @param {Storage|null} storage - Almacenamiento a leer (puede ser `null`).
 * @returns {{ actualizadoEn: string|null, unidades: Array<object> }} Configuración vigente.
 */
export function readUmbralesStore(storage) {
  return desdeLectura(leerJson(storage, UMBRALES_STORAGE_KEY))
}

// Sin almacenamiento, bloqueado, sin datos o corrupto: configuración inicial.
function desdeLectura(lectura) {
  return lectura.ok ? interpretarUmbrales(lectura.valor) : getUmbralesIniciales()
}

function interpretarUmbrales(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return getUmbralesIniciales()
  }
  if (!Array.isArray(parsed.unidades)) return getUmbralesIniciales()
  const unidades = normalizeUnidades(parsed.unidades)
  // Una lista vacía guardada es una configuración válida («sin unidades»):
  // solo se vuelve a la semilla si había datos pero ninguno era utilizable.
  if (unidades.length === 0 && parsed.unidades.length > 0) return getUmbralesIniciales()
  const actualizadoEn = typeof parsed.actualizadoEn === 'string' ? parsed.actualizadoEn : null
  const ultimosIds = normalizeUltimosIds(parsed.ultimosIds)
  // Las configuraciones guardadas antes de #124 no traen `ultimosIds` y se leen igual.
  return ultimosIds ? { actualizadoEn, unidades, ultimosIds } : { actualizadoEn, unidades }
}

function normalizeUltimosIds(valor) {
  if (!valor || typeof valor !== 'object') return null
  const { unidad, umbral } = valor
  if (!Number.isSafeInteger(unidad) || unidad < 0) return null
  if (!Number.isSafeInteger(umbral) || umbral < 0) return null
  return { unidad, umbral }
}

function mayorNumeroUnidad(unidades) {
  return mayorNumeroDeId(
    unidades.map((unidad) => unidad.id),
    'unidad',
  )
}

function mayorNumeroUmbral(unidades) {
  return mayorNumeroDeId(
    unidades.flatMap((unidad) => unidad.umbrales.map((umbral) => umbral.id)),
    'umbral',
  )
}

/**
 * Persiste la configuración de umbrales en `localStorage`.
 *
 * @param {Storage|null} storage - Almacenamiento de destino (puede ser `null`).
 * @param {{ actualizadoEn: string|null, unidades: Array<object> }} store - Configuración a guardar.
 * @returns {void}
 */
export function writeUmbralesStore(storage, store) {
  // Sin persistencia disponible, la configuración solo vive en memoria.
  escribirJson(storage, UMBRALES_STORAGE_KEY, store)
}

/**
 * Aplica una operación sobre la configuración vigente y la guarda en un solo paso (#124).
 *
 * Con varias pestañas abiertas, la copia en memoria de una pestaña puede estar
 * desactualizada. Por eso, antes de aplicar la operación se vuelve a leer
 * `localStorage`: los cambios de otras pestañas se conservan (por ejemplo, dos
 * unidades distintas creadas a la vez) y las operaciones de `umbralesStorage`
 * descartan lo que ya no es compatible con lo vigente (un umbral que se eliminó,
 * un rango que ahora se solapa o un nombre de unidad repetido), en vez de
 * sobrescribirlo en silencio. Para evitar que dos pestañas lean la misma base a
 * la vez, quien llama debe ejecutar esta función con `conBloqueoEntrePestanas`.
 *
 * Si el almacenamiento se puede leer pero la escritura falla (por ejemplo, cuota
 * llena), la operación se rechaza: conservarla solo en memoria dejaría cambios
 * sin guardar que otra pestaña podría pisar, o que esta pisaría al recargar.
 * Solo cuando el almacenamiento está bloqueado (no se puede ni leer) se trabaja
 * sobre la copia en memoria; en ese caso ninguna pestaña del sitio puede guardar.
 *
 * @param {Storage|null} storage - Almacenamiento compartido entre pestañas.
 * @param {{ actualizadoEn: string|null, unidades: Array<object> }} enMemoria - Configuración
 *   que muestra esta pestaña; base solo si el almacenamiento está bloqueado.
 * @param {(store: object, actualizadoEn: string) => object} operacion - Operación pura
 *   (`agregarUmbral`, `eliminarUnidad`, etc.) que devuelve el mismo objeto si se descarta.
 * @param {string} actualizadoEn - Marca de tiempo ISO del cambio.
 * @returns {{ store: object, aplicado: boolean, problema: null|'bloqueado'|'sin-espacio' }}
 *   La configuración que debe mostrar la pestaña, si la operación se aplicó y el
 *   problema de almacenamiento, si hubo: `'bloqueado'` (se aplicó solo en memoria)
 *   o `'sin-espacio'` (no se pudo escribir y la operación se rechazó). Si se
 *   rechazó, `store` es la configuración vigente.
 */
export function guardarUmbrales(storage, enMemoria, operacion, actualizadoEn) {
  const lectura = leerJson(storage, UMBRALES_STORAGE_KEY)
  if (!lectura.ok && lectura.motivo === 'no-disponible') {
    const siguiente = operacion(enMemoria, actualizadoEn)
    return { store: siguiente, aplicado: siguiente !== enMemoria, problema: 'bloqueado' }
  }
  const vigente = desdeLectura(lectura)
  const siguiente = operacion(vigente, actualizadoEn)
  if (siguiente === vigente) return { store: vigente, aplicado: false, problema: null }
  if (!escribirJson(storage, UMBRALES_STORAGE_KEY, siguiente)) {
    return { store: vigente, aplicado: false, problema: 'sin-espacio' }
  }
  return { store: siguiente, aplicado: true, problema: null }
}

// #124: los ids se generan como «mayor + 1». Para que eliminar la unidad o el
// umbral de número más alto no libere ese número (y una operación pendiente en
// otra pestaña no termine aplicada sobre un registro nuevo con el mismo id), la
// configuración recuerda el mayor número usado en `ultimosIds`.
function conUnidades(store, unidades, actualizadoEn) {
  const ultimosIds = {
    unidad: Math.max(
      store.ultimosIds?.unidad ?? 0,
      mayorNumeroUnidad(store.unidades),
      mayorNumeroUnidad(unidades),
    ),
    umbral: Math.max(
      store.ultimosIds?.umbral ?? 0,
      mayorNumeroUmbral(store.unidades),
      mayorNumeroUmbral(unidades),
    ),
  }
  return { actualizadoEn, unidades, ultimosIds }
}

function agregarUmbralA(unidad, umbral) {
  return { ...unidad, umbrales: [...unidad.umbrales, umbral] }
}

function eliminarUmbralDe(unidad, idUmbral) {
  const umbrales = unidad.umbrales.filter((umbral) => umbral.id !== idUmbral)
  return { ...unidad, umbrales }
}

function actualizarUmbralDe(unidad, idUmbral, datos) {
  const umbrales = unidad.umbrales.map((umbral) => {
    if (umbral.id !== idUmbral) return umbral
    return {
      ...umbral,
      montoMinimo: datos.montoMinimo,
      montoMaximo: datos.montoMaximo ?? null,
      nivelAprobador: datos.nivelAprobador,
    }
  })
  return { ...unidad, umbrales }
}

/**
 * Agrega un umbral a una unidad, generando su identificador.
 *
 * @param {object} store - Configuración vigente.
 * @param {string} idUnidad - Unidad destino.
 * @param {object} datos - Umbral con `montoMinimo`, `montoMaximo` y `nivelAprobador`.
 * @param {string} actualizadoEn - Marca de tiempo ISO del cambio.
 * @returns {object} Configuración nueva (o la misma si la unidad no existe o el
 *   umbral no es válido o se solapa con otro de la unidad).
 */
export function agregarUmbral(store, idUnidad, datos, actualizadoEn) {
  const unidad = store.unidades.find((u) => u.id === idUnidad)
  if (!unidad) return store
  // #124: se valida contra la configuración vigente, que puede traer umbrales
  // guardados desde otra pestaña después de que el formulario validó.
  if (!esValido(validarUmbral(datos, unidad.umbrales))) return store
  const id = generarIdUmbral(
    store.unidades.map((u) => u.umbrales),
    store.ultimosIds?.umbral ?? 0,
  )
  const umbral = {
    id,
    idUnidad,
    montoMinimo: datos.montoMinimo,
    montoMaximo: datos.montoMaximo ?? null,
    nivelAprobador: datos.nivelAprobador,
  }
  const unidades = store.unidades.map((u) => (u.id === idUnidad ? agregarUmbralA(u, umbral) : u))
  return conUnidades(store, unidades, actualizadoEn)
}

/**
 * Actualiza un umbral existente de una unidad.
 *
 * @param {object} store - Configuración vigente.
 * @param {string} idUnidad - Unidad del umbral.
 * @param {string} idUmbral - Umbral a actualizar.
 * @param {object} datos - Valores nuevos del umbral.
 * @param {string} actualizadoEn - Marca de tiempo ISO del cambio.
 * @param {object} [esperado] - Versión del umbral que se abrió para editar. Si se
 *   indica y el umbral vigente ya no tiene esos valores (otra pestaña lo cambió),
 *   la actualización se descarta en vez de pisar ese cambio (#124).
 * @returns {object} Configuración nueva (o la misma si el umbral no existe, si
 *   cambió desde que se abrió el editor, o si los valores nuevos no son válidos o
 *   se solapan con otro umbral de la unidad).
 */
export function actualizarUmbral(store, idUnidad, idUmbral, datos, actualizadoEn, esperado) {
  const unidad = store.unidades.find((u) => u.id === idUnidad)
  const actual = unidad?.umbrales.find((u) => u.id === idUmbral)
  if (!actual) return store
  if (esperado && !mismosValoresUmbral(actual, esperado)) return store
  const otros = unidad.umbrales.filter((umbral) => umbral.id !== idUmbral)
  if (!esValido(validarUmbral(datos, otros))) return store
  const unidades = store.unidades.map((u) =>
    u.id === idUnidad ? actualizarUmbralDe(u, idUmbral, datos) : u,
  )
  return conUnidades(store, unidades, actualizadoEn)
}

/**
 * Elimina un umbral de una unidad.
 *
 * @param {object} store - Configuración vigente.
 * @param {string} idUnidad - Unidad del umbral.
 * @param {string} idUmbral - Umbral a eliminar.
 * @param {string} actualizadoEn - Marca de tiempo ISO del cambio.
 * @returns {object} Configuración nueva (o la misma si el umbral no existe).
 */
export function eliminarUmbral(store, idUnidad, idUmbral, actualizadoEn) {
  const unidad = store.unidades.find((u) => u.id === idUnidad)
  if (!unidad || !unidad.umbrales.some((u) => u.id === idUmbral)) return store
  const unidades = store.unidades.map((u) =>
    u.id === idUnidad ? eliminarUmbralDe(u, idUmbral) : u,
  )
  return conUnidades(store, unidades, actualizadoEn)
}

/**
 * Agrega una unidad sin umbrales a la configuración.
 *
 * @param {object} store - Configuración vigente.
 * @param {{ nombre: string, tipo: string }} datos - Datos de la unidad.
 * @param {string} actualizadoEn - Marca de tiempo ISO del cambio.
 * @returns {object} Configuración nueva (o la misma si los datos no son válidos o
 *   ya existe una unidad con ese nombre, por ejemplo creada en otra pestaña).
 */
export function agregarUnidad(store, datos, actualizadoEn) {
  if (!esValido(validarUnidad(datos, store.unidades))) return store
  const id = generarIdUnidad(store.unidades, store.ultimosIds?.unidad ?? 0)
  const unidad = { id, nombre: datos.nombre, tipo: datos.tipo, umbrales: [] }
  return conUnidades(store, [...store.unidades, unidad], actualizadoEn)
}

/**
 * Elimina una unidad junto con todos sus umbrales.
 *
 * @param {object} store - Configuración vigente.
 * @param {string} idUnidad - Unidad a eliminar.
 * @param {string} actualizadoEn - Marca de tiempo ISO del cambio.
 * @returns {object} Configuración nueva (o la misma si la unidad no existe).
 */
export function eliminarUnidad(store, idUnidad, actualizadoEn) {
  if (!store.unidades.some((u) => u.id === idUnidad)) return store
  const unidades = store.unidades.filter((u) => u.id !== idUnidad)
  return conUnidades(store, unidades, actualizadoEn)
}
