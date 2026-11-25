/**
 * Cliente HTTP del login con Google (rutas `/api/auth/*` del backend).
 *
 * Sigue el contrato acordado con el backend: el navegador obtiene un ID token de Google
 * (`credential`) y la API lo cambia por un token de sesión propio, que luego se envía en el
 * header `Authorization: Bearer <token>`. Igual que `licitacionesApi.js`, cada función acepta
 * `baseUrl` y `fetchImpl` inyectables para probarla sin red.
 */
import { ApiError, resolveApiBaseUrl } from '../../licitaciones/services/licitacionesApi.js'

const API_BASE_URL = resolveApiBaseUrl(import.meta.env?.VITE_API_BASE_URL)

/**
 * Convierte el usuario de la API (`{ id, name, email, picture }`) a la forma que usa el
 * `AuthProvider` (`{ id, name, email, photoUrl }`).
 *
 * @param {unknown} usuario - Objeto `user` recibido de la API.
 * @returns {{id: string, name: string, email: string, photoUrl: string | null} | null}
 *   El usuario normalizado, o `null` si le falta el nombre o el correo.
 */
export function normalizarUsuario(usuario) {
  if (
    typeof usuario?.name !== 'string' ||
    !usuario.name ||
    typeof usuario.email !== 'string' ||
    !usuario.email
  ) {
    return null
  }
  return {
    id: typeof usuario.id === 'string' ? usuario.id : '',
    name: usuario.name,
    email: usuario.email,
    photoUrl: typeof usuario.picture === 'string' && usuario.picture ? usuario.picture : null,
  }
}

async function pedir(url, opciones, fetchImpl) {
  let response
  try {
    response = await fetchImpl(url, opciones)
  } catch {
    throw new ApiError('No se pudo conectar con el servidor de inicio de sesión.', 0)
  }
  if (response.status === 204) return null
  let cuerpo = null
  try {
    cuerpo = await response.json()
  } catch {
    // Una respuesta sin JSON se trata con el mensaje genérico de abajo.
  }
  if (!response.ok) {
    const mensaje =
      typeof cuerpo?.error === 'string' && cuerpo.error
        ? cuerpo.error
        : `El servidor respondió con el código ${response.status}.`
    throw new ApiError(mensaje, response.status)
  }
  return cuerpo
}

/**
 * Cambia el ID token de Google por una sesión de la API (`POST /api/auth/google`).
 *
 * @param {string} credential - ID token entregado por Google Identity Services.
 * @param {object} [options]
 * @param {string} [options.baseUrl] - URL base de la API; por defecto la configurada.
 * @param {typeof fetch} [options.fetchImpl] - Implementación de `fetch` (inyectable en pruebas).
 * @returns {Promise<{token: string, expiresAt: string, user: {id: string, name: string, email: string, photoUrl: string | null}}>}
 *   Token de sesión, su vencimiento y el usuario normalizado.
 * @throws {ApiError} Si la red falla, la API responde un error (400, 401, 503) o el cuerpo no
 *   trae token, vencimiento y usuario válidos.
 */
export async function iniciarSesionConGoogle(
  credential,
  { baseUrl = API_BASE_URL, fetchImpl = fetch } = {},
) {
  const cuerpo = await pedir(
    `${baseUrl}/auth/google`,
    {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    },
    fetchImpl,
  )
  const user = normalizarUsuario(cuerpo?.user)
  if (typeof cuerpo?.token !== 'string' || !cuerpo.token || !user || !cuerpo.expiresAt) {
    throw new ApiError('El servidor devolvió una sesión con formato inesperado.', 200)
  }
  return { token: cuerpo.token, expiresAt: cuerpo.expiresAt, user }
}

/**
 * Obtiene el usuario de la sesión actual (`GET /api/auth/me`).
 *
 * @param {string} token - Token de sesión emitido por la API.
 * @param {object} [options]
 * @param {string} [options.baseUrl] - URL base de la API; por defecto la configurada.
 * @param {typeof fetch} [options.fetchImpl] - Implementación de `fetch` (inyectable en pruebas).
 * @returns {Promise<{id: string, name: string, email: string, photoUrl: string | null}>}
 *   El usuario normalizado.
 * @throws {ApiError} Con `status` 401 si la sesión es inválida o expiró; con otro código si la
 *   red o la API fallan, o si el cuerpo no trae un usuario válido.
 */
export async function obtenerUsuarioActual(
  token,
  { baseUrl = API_BASE_URL, fetchImpl = fetch } = {},
) {
  const cuerpo = await pedir(
    `${baseUrl}/auth/me`,
    { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } },
    fetchImpl,
  )
  const user = normalizarUsuario(cuerpo?.user)
  if (!user) throw new ApiError('El servidor devolvió un usuario con formato inesperado.', 200)
  return user
}

/**
 * Avisa a la API que la sesión terminó (`POST /api/auth/logout`). Nunca lanza: el cierre de
 * sesión local debe completarse aunque la API no responda.
 *
 * @param {string} token - Token de sesión emitido por la API.
 * @param {object} [options]
 * @param {string} [options.baseUrl] - URL base de la API; por defecto la configurada.
 * @param {typeof fetch} [options.fetchImpl] - Implementación de `fetch` (inyectable en pruebas).
 * @returns {Promise<boolean>} `true` si la API confirmó el cierre; `false` si falló.
 */
export async function cerrarSesionRemota(
  token,
  { baseUrl = API_BASE_URL, fetchImpl = fetch } = {},
) {
  try {
    await pedir(
      `${baseUrl}/auth/logout`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      fetchImpl,
    )
    return true
  } catch {
    return false
  }
}
