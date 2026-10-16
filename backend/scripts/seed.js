import { config } from '../src/config/env.js'
import { loadMockLicitaciones } from '../src/data/mockLicitaciones.js'
import { runWithClient } from '../src/db/pool.js'
import { seedLicitaciones } from '../src/db/seed.js'

await runWithClient(config.databaseUrl, async (client) => {
  const total = await seedLicitaciones(client, loadMockLicitaciones())
  console.log(`Seed cargado: ${total} licitaciones`)
})
