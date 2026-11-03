import pg from 'pg'

/**
 * Crea el pool de conexiones a PostgreSQL. Este módulo es el único que importa
 * `pg`, así la API puede funcionar con los datos en memoria sin cargar el driver.
 *
 * @param {string} connectionString - Cadena de conexión (`DATABASE_URL`).
 * @returns {import('pg').Pool} Pool de conexiones.
 * @throws {Error} Si la cadena de conexión está vacía; el mensaje indica dónde configurarla.
 */
export function createPool(connectionString) {
  if (!connectionString) {
    throw new Error('Falta DATABASE_URL: configúrala en backend/.env (ver backend/.env.example)')
  }
  return new pg.Pool({ connectionString })
}

/**
 * Abre una conexión, ejecuta la tarea con un cliente y cierra todo al terminar.
 * Lo usan los scripts `db:migrate` y `db:seed`.
 *
 * Decisión no evidente: no relanza los errores. Los muestra con `console.error`
 * (solo el mensaje, sin traza) y deja `process.exitCode = 1`, para que el script
 * termine con un mensaje legible y un código de salida de error.
 *
 * @param {string} connectionString - Cadena de conexión (`DATABASE_URL`).
 * @param {(client: import('pg').PoolClient) => Promise<*>} task - Trabajo a ejecutar con el cliente.
 * @returns {Promise<*>} Lo que devuelva la tarea, o `undefined` si falló.
 */
export async function runWithClient(connectionString, task) {
  let pool
  try {
    pool = createPool(connectionString)
    const client = await pool.connect()
    try {
      return await task(client)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  } finally {
    await pool?.end()
  }
}
