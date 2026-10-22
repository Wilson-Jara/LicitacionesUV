import pg from 'pg'

export function createPool(connectionString) {
  if (!connectionString) {
    throw new Error('Falta DATABASE_URL: configúrala en backend/.env (ver backend/.env.example)')
  }
  return new pg.Pool({ connectionString })
}

// Abre un cliente, ejecuta la tarea y cierra la conexión; usado por los scripts de BD.
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
