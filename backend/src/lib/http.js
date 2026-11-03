/**
 * Error con código HTTP. Las rutas y helpers lo lanzan para responder un error
 * controlado (400, 404, 413); `createApp` lo traduce a `{ error: mensaje }` con
 * ese código. Cualquier otro error se responde como 500 genérico.
 */
export class HttpError extends Error {
  /**
   * @param {number} status - Código HTTP de la respuesta.
   * @param {string} message - Mensaje que verá el cliente.
   */
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * Envía una respuesta JSON en UTF-8 con su `Content-Length`, y la cierra.
 *
 * @param {import('node:http').ServerResponse} res - Respuesta HTTP.
 * @param {number} status - Código HTTP.
 * @param {*} data - Valor que se serializa con `JSON.stringify`.
 * @returns {void}
 */
export function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

const MAX_BODY_BYTES = 1024 * 1024

/**
 * Lee y parsea el cuerpo JSON de una solicitud, con un límite de 1 MB.
 * Un cuerpo vacío se interpreta como `{}`.
 *
 * Decisión no evidente: si el cuerpo supera el límite, el resto se sigue leyendo
 * pero se descarta (no se acumula en memoria); cortar la conexión a mitad de
 * lectura impediría entregar la respuesta 413.
 *
 * @param {import('node:http').IncomingMessage} req - Solicitud HTTP.
 * @returns {Promise<*>} El cuerpo parseado, o `{}` si viene vacío.
 * @throws {HttpError} 413 si supera 1 MB; 400 si no es JSON válido.
 */
export async function readJsonBody(req) {
  const chunks = []
  let size = 0
  // Al superar el límite se descarta el resto sin acumularlo, para poder responder 413.
  for await (const chunk of req) {
    size += chunk.length
    if (size <= MAX_BODY_BYTES) chunks.push(chunk)
  }
  if (size > MAX_BODY_BYTES) throw new HttpError(413, 'El cuerpo de la solicitud supera 1 MB')
  if (chunks.length === 0) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'Cuerpo JSON inválido')
  }
}
