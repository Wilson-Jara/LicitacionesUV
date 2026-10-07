export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

const MAX_BODY_BYTES = 1024 * 1024

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
