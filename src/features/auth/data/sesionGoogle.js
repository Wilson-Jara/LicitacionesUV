/**
 * Guarda la sesión de Google (token de la API, vencimiento y usuario) en `sessionStorage`,
 * igual que la sesión de demostración: dura mientras la pestaña esté abierta.
 *
 * Usa `leerJson`/`escribirJson` de `persistenciaLocal.js`, así que nunca lanza aunque el
 * almacenamiento esté bloqueado, falte o tenga datos corruptos.
 */
import { escribirJson, leerJson } from '../../../shared/lib/persistenciaLocal.js'
import { normalizarUsuario } from '../services/authApi.js'

export const SESION_GOOGLE_KEY = 'licitacionesuv-sesion-google'

/**
 * Devuelve el `sessionStorage` del navegador, o `null` si no existe o está bloqueado.
 *
 * @param {object} [browser] - Objeto `window` (inyectable en pruebas).
 * @returns {Storage | null}
 */
export function obtenerAlmacenamientoSesion(browser = globalThis.window) {
  try {
    return browser?.sessionStorage ?? null
  } catch {
    return null
  }
}

/**
 * Lee la sesión guardada y la descarta si está incompleta o vencida.
 *
 * @param {Storage | null} storage - Almacenamiento donde se guardó la sesión.
 * @param {Date} [ahora] - Momento de referencia (inyectable en pruebas).
 * @returns {{token: string, expiresAt: string, user: object} | null} La sesión vigente, o `null`.
 */
export function leerSesionGoogle(storage, ahora = new Date()) {
  const lectura = leerJson(storage, SESION_GOOGLE_KEY)
  if (!lectura.ok) return null
  const { token, expiresAt, user: guardado } = lectura.valor ?? {}
  // Se guarda ya normalizado (`photoUrl`); se vuelve a validar por si el dato se alteró.
  const user = normalizarUsuario(guardado && { ...guardado, picture: guardado.photoUrl })
  const vence = Date.parse(expiresAt)
  if (typeof token !== 'string' || !token || !user || Number.isNaN(vence)) return null
  if (vence <= ahora.getTime()) return null
  return { token, expiresAt, user }
}

/**
 * Guarda la sesión recibida de la API.
 *
 * @param {Storage | null} storage - Almacenamiento destino.
 * @param {{token: string, expiresAt: string, user: object}} sesion - Sesión a guardar.
 * @returns {boolean} `true` si se guardó; `false` si el almacenamiento no está disponible.
 */
export function guardarSesionGoogle(storage, sesion) {
  return escribirJson(storage, SESION_GOOGLE_KEY, sesion)
}

/**
 * Borra la sesión guardada. Nunca lanza.
 *
 * @param {Storage | null} storage - Almacenamiento donde estaba la sesión.
 * @returns {void}
 */
export function borrarSesionGoogle(storage) {
  try {
    storage?.removeItem(SESION_GOOGLE_KEY)
  } catch {
    // La sesión en memoria se cierra aunque el almacenamiento esté bloqueado.
  }
}
