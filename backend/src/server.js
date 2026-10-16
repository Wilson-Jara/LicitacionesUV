import { createServer } from 'node:http'
import { createApp } from './app.js'
import { config } from './config/env.js'
import { createPgLicitacionesRepository } from './data/licitaciones.repository.js'

async function createLicitacionesRepository() {
  if (!config.databaseUrl) {
    console.warn('DATABASE_URL no definida: la API usa los datos mock en memoria')
    return { repository: undefined, close: async () => {} }
  }
  // Carga diferida: pg solo se necesita cuando hay base de datos
  const { createPool } = await import('./db/pool.js')
  const pool = createPool(config.databaseUrl)
  return { repository: createPgLicitacionesRepository(pool), close: () => pool.end() }
}

const { repository, close } = await createLicitacionesRepository()
const server = createServer(createApp({ licitacionesRepository: repository }))

server.listen(config.port, () => {
  console.log(`API LicitacionesUV escuchando en http://localhost:${config.port}`)
})

function shutdown() {
  server.close(() => {
    close().finally(() => process.exit(0))
  })
  // Cierra también las conexiones keep-alive para que close() termine de inmediato.
  server.closeAllConnections()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
