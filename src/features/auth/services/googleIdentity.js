/**
 * Carga Google Identity Services (GIS), el script oficial que dibuja el botón
 * «Iniciar sesión con Google» y entrega el ID token (`credential`) al hacer clic.
 *
 * El Client ID sale de `VITE_GOOGLE_CLIENT_ID` (ver `.env.example`). Si no está definido,
 * el login con Google queda desactivado y la app mantiene el acceso simulado.
 */

export const GOOGLE_IDENTITY_SRC = 'https://accounts.google.com/gsi/client'

/**
 * Normaliza el Client ID configurado.
 *
 * @param {string | undefined} value - Valor de `VITE_GOOGLE_CLIENT_ID`.
 * @returns {string} El Client ID sin espacios, o `''` si no está configurado.
 */
export function resolveGoogleClientId(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/** Client ID configurado para este despliegue (vacío si el login con Google está desactivado). */
export const GOOGLE_CLIENT_ID = resolveGoogleClientId(import.meta.env?.VITE_GOOGLE_CLIENT_ID)

// Una carga por documento: evita insertar el script dos veces si se montan dos botones.
const cargas = new WeakMap()

/**
 * Inserta el script de GIS una sola vez y espera a que `google.accounts.id` exista.
 *
 * @param {Document} [documento] - Documento donde insertar el script (inyectable en pruebas).
 * @returns {Promise<object>} El objeto `google.accounts.id`.
 * @throws {Error} Si el script no se pudo descargar (sin red o bloqueado por el navegador).
 */
export function cargarGoogleIdentity(documento = globalThis.document) {
  const disponible = () => documento?.defaultView?.google?.accounts?.id
  if (disponible()) return Promise.resolve(disponible())
  if (cargas.has(documento)) return cargas.get(documento)

  const carga = new Promise((resolve, reject) => {
    const script = documento.createElement('script')
    script.src = GOOGLE_IDENTITY_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (disponible()) resolve(disponible())
      else reject(new Error('Google Identity Services no quedó disponible.'))
    }
    script.onerror = () => reject(new Error('No se pudo cargar el inicio de sesión de Google.'))
    documento.head.appendChild(script)
  }).catch((error) => {
    cargas.delete(documento)
    throw error
  })
  cargas.set(documento, carga)
  return carga
}
