import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const MIGRATION_FILE = /^\d{3}_[a-z0-9_]+\.sql$/

/**
 * Lista las migraciones de una carpeta en el orden en que deben aplicarse.
 * Solo considera archivos con el formato `NNN_nombre.sql` (por ejemplo
 * `001_esquema_inicial.sql`); el orden lo da el número inicial.
 *
 * @param {string} dir - Carpeta de migraciones.
 * @returns {Promise<Array<string>>} Nombres de archivo ordenados.
 */
export async function listMigrationFiles(dir) {
  const files = await readdir(dir)
  return files.filter((file) => MIGRATION_FILE.test(file)).sort()
}

/**
 * Aplica en orden las migraciones pendientes y registra cada una en la tabla
 * `schema_migrations` (que crea si no existe). Una migración ya registrada no
 * se vuelve a ejecutar, así que llamarla dos veces es seguro.
 *
 * Cada migración corre en su propia transacción: si falla, se revierte solo esa
 * y no se aplican las siguientes.
 *
 * @param {{query: Function}} client - Cliente de PostgreSQL (o un doble en las pruebas).
 * @param {string} dir - Carpeta de migraciones.
 * @returns {Promise<Array<string>>} Nombres de las migraciones aplicadas en esta llamada.
 * @throws {Error} Si una migración falla; el mensaje nombra el archivo y la causa queda en `cause`.
 */
export async function runMigrations(client, dir) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre TEXT PRIMARY KEY,
      aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  const { rows } = await client.query('SELECT nombre FROM schema_migrations')
  const aplicadas = new Set(rows.map((row) => row.nombre))
  const pendientes = (await listMigrationFiles(dir)).filter((file) => !aplicadas.has(file))

  for (const file of pendientes) {
    const sql = await readFile(join(dir, file), 'utf8')
    await client.query('BEGIN')
    try {
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [file])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error(`Falló la migración ${file}: ${error.message}`, { cause: error })
    }
  }
  return pendientes
}
