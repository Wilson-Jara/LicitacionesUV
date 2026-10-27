import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(currentDir, '../../.env')

if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key && !(key in process.env)) process.env[key] = value
  }
}

function readPort() {
  const port = Number(process.env.PORT)
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : 3000
}

/**
 * Configuración del backend leída de las variables de entorno. Al importar este
 * módulo se cargan las variables de `backend/.env`, si existe, sin sobrescribir
 * las que ya estén definidas en el entorno (estas tienen prioridad).
 *
 * @type {{port: number, corsOrigin: string, databaseUrl: string, jwtSecret: string}}
 * @property {number} port - Puerto HTTP (`PORT`); 3000 si falta o no es un entero entre 1 y 65535.
 * @property {string} corsOrigin - Origen permitido por CORS (`CORS_ORIGIN`); por defecto, el dev server de Vite.
 * @property {string} databaseUrl - Conexión a PostgreSQL (`DATABASE_URL`); vacía = se usan los datos en memoria.
 * @property {string} jwtSecret - Reservada para la autenticación (`JWT_SECRET`); hoy no se usa.
 */
export const config = {
  port: readPort(),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
}
