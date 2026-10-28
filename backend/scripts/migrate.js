import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '../src/config/env.js'
import { runMigrations } from '../src/db/migrator.js'
import { runWithClient } from '../src/db/pool.js'

const migrationsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../migrations')

await runWithClient(config.databaseUrl, async (client) => {
  const aplicadas = await runMigrations(client, migrationsDir)
  console.log(
    aplicadas.length
      ? `Migraciones aplicadas: ${aplicadas.join(', ')}`
      : 'No hay migraciones pendientes',
  )
})
