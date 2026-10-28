import { umbralesIniciales } from './umbralesIniciales.js'
import {
  NIVELES_APROBADOR,
  TIPOS_UNIDAD,
  generarIdUmbral,
  generarIdUnidad,
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
  if (!storage) return getUmbralesIniciales()
  try {
    const raw = storage.getItem(UMBRALES_STORAGE_KEY)
    if (!raw) return getUmbralesIniciales()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return getUmbralesIniciales()
    }
    if (!Array.isArray(parsed.unidades)) return getUmbralesIniciales()
    const unidades = normalizeUnidades(parsed.unidades)
    // Una lista vacía guardada es una configuración válida («sin unidades»):
    // solo se vuelve a la semilla si había datos pero ninguno era utilizable.
    if (unidades.length === 0 && parsed.unidades.length > 0) return getUmbralesIniciales()
    const actualizadoEn = typeof parsed.actualizadoEn === 'string' ? parsed.actualizadoEn : null
    return { actualizadoEn, unidades }
  } catch {
    // localStorage bloqueado o corrupto: se parte de la configuración inicial
    return getUmbralesIniciales()
  }
}

/**
 * Persiste la configuración de umbrales en `localStorage`.
 *
 * @param {Storage|null} storage - Almacenamiento de destino (puede ser `null`).
 * @param {{ actualizadoEn: string|null, unidades: Array<object> }} store - Configuración a guardar.
 * @returns {void}
 */
export function writeUmbralesStore(storage, store) {
  if (!storage) return
  try {
    storage.setItem(UMBRALES_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // sin persistencia disponible, la configuración solo vive en memoria
  }
}

function conUnidades(store, unidades, actualizadoEn) {
  return { actualizadoEn, unidades }
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
 * @returns {object} Configuración nueva (o la misma si la unidad no existe).
 */
export function agregarUmbral(store, idUnidad, datos, actualizadoEn) {
  const unidad = store.unidades.find((u) => u.id === idUnidad)
  if (!unidad) return store
  const id = generarIdUmbral(store.unidades.map((u) => u.umbrales))
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
 * @returns {object} Configuración nueva (o la misma si el umbral no existe).
 */
export function actualizarUmbral(store, idUnidad, idUmbral, datos, actualizadoEn) {
  const unidad = store.unidades.find((u) => u.id === idUnidad)
  if (!unidad || !unidad.umbrales.some((u) => u.id === idUmbral)) return store
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
 * @returns {object} Configuración nueva.
 */
export function agregarUnidad(store, datos, actualizadoEn) {
  const id = generarIdUnidad(store.unidades)
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
