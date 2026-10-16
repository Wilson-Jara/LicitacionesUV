import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const MIGRATION_FILE = /^\d{3}_[a-z0-9_]+\.sql$/

export async function listMigrationFiles(dir) {
  const files = await readdir(dir)
  return files.filter((file) => MIGRATION_FILE.test(file)).sort()
}

// Aplica en orden las migraciones pendientes, cada una en su propia transacción,
// y registra las ejecutadas en schema_migrations. Devuelve los nombres aplicados.
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
