/**
 * Cliente HTTP de la API de licitaciones (repositorio LicitacionesUV-backend).
 *
 * La URL base sale de `VITE_API_BASE_URL` (ver `.env.example`); si no está definida se usa
 * la API local de desarrollo. Cada función acepta un `fetch` inyectable para poder probarla
 * sin red, igual que el backend recibe su repositorio por parámetro.
 */

/** URL de la API cuando `VITE_API_BASE_URL` no está definida (desarrollo local). */
export const DEFAULT_API_BASE_URL = 'http://localhost:3000/api'

/**
 * Normaliza la URL base de la API: usa la por defecto si viene vacía y quita la `/` final.
 *
 * @param {string | undefined} value - Valor configurado (por ejemplo `VITE_API_BASE_URL`).
 * @returns {string} URL base sin barra final.
 */
export function resolveApiBaseUrl(value) {
  const base = typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_API_BASE_URL
  return base.replace(/\/+$/, '')
}

const API_BASE_URL = resolveApiBaseUrl(import.meta.env?.VITE_API_BASE_URL)

/**
 * Error de la API con el código HTTP de la respuesta (0 si no hubo respuesta).
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Mensaje legible para mostrar o registrar.
   * @param {number} status - Código HTTP, o 0 si la red falló.
   */
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function requestJson(url, fetchImpl) {
  let response
  try {
    response = await fetchImpl(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new ApiError('No se pudo conectar con la API de licitaciones.', 0)
  }
  if (!response.ok) {
    throw new ApiError(`La API respondió con el código ${response.status}.`, response.status)
  }
  return response.json()
}

/**
 * Obtiene el catálogo completo de licitaciones (`GET /api/licitaciones`).
 *
 * @param {object} [options]
 * @param {string} [options.baseUrl] - URL base de la API; por defecto la configurada.
 * @param {typeof fetch} [options.fetchImpl] - Implementación de `fetch` (inyectable en pruebas).
 * @returns {Promise<Array<object>>} Licitaciones con la forma del contrato de la API.
 * @throws {ApiError} Si la red falla, la respuesta no es 2xx o el cuerpo no es una lista.
 */
export async function fetchLicitaciones({ baseUrl = API_BASE_URL, fetchImpl = fetch } = {}) {
  const data = await requestJson(`${baseUrl}/licitaciones`, fetchImpl)
  if (!Array.isArray(data)) {
    throw new ApiError('La API devolvió un formato inesperado.', 200)
  }
  return data
}

/**
 * Obtiene una licitación por su id (`GET /api/licitaciones/:id`).
 *
 * @param {string} id - Identificador de la licitación.
 * @param {object} [options]
 * @param {string} [options.baseUrl] - URL base de la API; por defecto la configurada.
 * @param {typeof fetch} [options.fetchImpl] - Implementación de `fetch` (inyectable en pruebas).
 * @returns {Promise<object | null>} La licitación, o `null` si la API responde 404.
 * @throws {ApiError} Si la red falla o la respuesta es un error distinto de 404.
 */
export async function fetchLicitacion(id, { baseUrl = API_BASE_URL, fetchImpl = fetch } = {}) {
  try {
    return await requestJson(`${baseUrl}/licitaciones/${encodeURIComponent(id)}`, fetchImpl)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
