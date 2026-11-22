/**
 * Acceso seguro a `localStorage`, compartido por la persistencia de umbrales y
 * de favoritos (#124, intervención ISF224).
 *
 * Reúne en un solo lugar tres reglas que antes se repetían en cuatro archivos:
 * cómo obtener el almacenamiento, cómo leer JSON y cómo escribirlo sin que la
 * app se caiga cuando el navegador lo bloquea (modo privado, permisos), cuando
 * se llena la cuota o cuando el texto guardado está corrupto. Ninguna de estas
 * funciones lanza errores: informan el resultado para que cada consumidor
 * decida su respaldo (configuración inicial, lista vacía, estado en memoria).
 *
 * Ejemplo (desde `umbralesStorage.js`):
 *
 *   const lectura = leerJson(storage, UMBRALES_STORAGE_KEY)
 *   if (!lectura.ok) return getUmbralesIniciales()
 *   // lectura.valor es el JSON guardado; su forma la valida quien llama
 */

/**
 * Devuelve el `localStorage` del navegador cuando se puede usar.
 *
 * @returns {Storage|null} El almacenamiento, o `null` si no hay `window` (pruebas
 *   en Node, prerenderizado) o si el navegador bloquea el acceso: en ese caso leer
 *   `window.localStorage` lanza un `SecurityError`, que aquí se captura.
 */
export function obtenerAlmacenamientoLocal() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Resultado de `leerJson`.
 *
 * @typedef {{ ok: true, valor: unknown }
 *   | { ok: false, motivo: 'no-disponible' | 'ausente' | 'ilegible' }} LecturaJson
 */

/**
 * Lee y convierte el JSON guardado en una clave.
 *
 * @param {Pick<Storage, 'getItem'>|null} storage - Almacenamiento a leer (puede ser `null`).
 * @param {string} clave - Clave de `localStorage`.
 * @returns {LecturaJson} `{ ok: true, valor }` con el valor tal como se guardó
 *   (puede ser `null`, un arreglo u otro tipo: validar su forma es tarea de quien
 *   llama), o `{ ok: false, motivo }` con:
 *   - `'no-disponible'`: no hay almacenamiento o `getItem` lanzó (bloqueado).
 *   - `'ausente'`: no hay nada guardado en la clave (o es una cadena vacía).
 *   - `'ilegible'`: lo guardado no es JSON válido.
 */
export function leerJson(storage, clave) {
  if (!storage) return { ok: false, motivo: 'no-disponible' }
  let texto
  try {
    texto = storage.getItem(clave)
  } catch {
    return { ok: false, motivo: 'no-disponible' }
  }
  if (!texto) return { ok: false, motivo: 'ausente' }
  try {
    return { ok: true, valor: JSON.parse(texto) }
  } catch {
    return { ok: false, motivo: 'ilegible' }
  }
}

/**
 * Guarda un valor como JSON en una clave.
 *
 * @param {Pick<Storage, 'setItem'>|null} storage - Almacenamiento de destino (puede ser `null`).
 * @param {string} clave - Clave de `localStorage`.
 * @param {unknown} valor - Valor serializable con `JSON.stringify`.
 * @returns {boolean} `true` si se guardó; `false` si no hay almacenamiento, si está
 *   bloqueado, si no queda cuota (`QuotaExceededError`) o si el valor no se puede
 *   serializar. En esos casos el estado solo vive en memoria.
 */
export function escribirJson(storage, clave, valor) {
  if (!storage) return false
  try {
    storage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}
