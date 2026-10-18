import { createServer } from 'node:http'
import { createApp } from './app.js'
import { config } from './config/env.js'

const server = createServer(createApp())

server.listen(config.port, () => {
  console.log(`API LicitacionesUV escuchando en http://localhost:${config.port}`)
})

function shutdown() {
  server.close(() => {
    process.exit(0)
  })
  // Cierra también las conexiones keep-alive para que close() termine de inmediato.
  server.closeAllConnections()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
