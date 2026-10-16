import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from '../src/app.js'
import { createPgLicitacionesRepository } from '../src/data/licitaciones.repository.js'
import { loadMockLicitaciones } from '../src/data/mockLicitaciones.js'
import { runMigrations } from '../src/db/migrator.js'
import { seedLicitaciones } from '../src/db/seed.js'

// Pruebas contra PostgreSQL real. Se omiten si no hay DATABASE_URL_TEST
// (en CI la define el servicio postgres del workflow).
const connectionString = process.env.DATABASE_URL_TEST
const migrationsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../migrations')
const mock = loadMockLicitaciones()

function motivoParaOmitir() {
  if (!connectionString) return 'DATABASE_URL_TEST no definida'
  const nombre = new URL(connectionString).pathname.slice(1)
  // Protección: estas pruebas borran el esquema, nunca deben tocar otra base
  if (!nombre.endsWith('_test')) return `la base "${nombre}" no termina en _test`
  return false
}

const skip = motivoParaOmitir()

describe('PostgreSQL (integración)', { skip }, () => {
  let pool
  let server
  let baseUrl

  before(async () => {
    const { createPool } = await import('../src/db/pool.js')
    pool = createPool(connectionString)
    await pool.query('DROP SCHEMA public CASCADE')
    await pool.query('CREATE SCHEMA public')
  })

  after(async () => {
    if (server) await new Promise((resolveClose) => server.close(resolveClose))
    await pool?.end()
  })

  it('aplica todas las migraciones y no repite las ya aplicadas', async () => {
    const client = await pool.connect()
    try {
      const primera = await runMigrations(client, migrationsDir)
      assert.ok(primera.length >= 2)
      assert.deepEqual(await runMigrations(client, migrationsDir), [])
    } finally {
      client.release()
    }
  })

  it('carga el seed de forma idempotente', async () => {
    const client = await pool.connect()
    try {
      await seedLicitaciones(client, mock)
      await seedLicitaciones(client, mock)
    } finally {
      client.release()
    }
    const { rows } = await pool.query('SELECT count(*)::int AS total FROM licitaciones')
    assert.equal(rows[0].total, mock.length)
  })

  it('devuelve las licitaciones con el contrato exacto del mock', async () => {
    const repo = createPgLicitacionesRepository(pool)
    assert.deepEqual(await repo.list(), mock)
    assert.deepEqual(await repo.findById(mock[1].id), mock[1])
    assert.equal(await repo.findById('no-existe'), null)
  })

  it('filtra por palabra clave, región y tipo como el repositorio en memoria', async () => {
    const repo = createPgLicitacionesRepository(pool)
    const software = await repo.list({ keyword: 'SOFTWARE' })
    assert.deepEqual(
      software.map((l) => l.id),
      ['licitacion-005'],
    )
    const combinadas = await repo.list({ region: 'VALPARAISO', tipo: 'Publica' })
    assert.equal(combinadas.length, 2)
    assert.ok(combinadas.every((l) => l.region === 'valparaiso' && l.type === 'publica'))
    assert.deepEqual(await repo.list({ keyword: '%' }), [])
  })

  it('responde la API HTTP leyendo desde la base', async () => {
    server = createServer(
      createApp({ licitacionesRepository: createPgLicitacionesRepository(pool) }),
    )
    await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
    baseUrl = `http://127.0.0.1:${server.address().port}`
    const response = await fetch(`${baseUrl}/api/licitaciones/licitacion-002`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), mock[1])
  })

  it('aplica las restricciones del modelo', async () => {
    await assert.rejects(
      pool.query(
        "INSERT INTO favoritos (usuario_id, licitacion_id) VALUES (gen_random_uuid(), 'licitacion-001')",
      ),
      /foreign key/,
    )
    const { rows } = await pool.query(
      "INSERT INTO unidades (nombre, tipo) VALUES ('Facultad de Prueba', 'facultad') RETURNING id",
    )
    await assert.rejects(
      pool.query(
        'INSERT INTO umbrales_aprobacion (unidad_id, monto_minimo, monto_maximo, nivel_aprobador) VALUES ($1, 100, 100, 1)',
        [rows[0].id],
      ),
      /check constraint/,
    )
    await assert.rejects(
      pool.query(
        "INSERT INTO usuarios (nombre, email) VALUES ('A', 'dup@uv.cl'), ('B', 'DUP@uv.cl')",
      ),
      /duplicate key/,
    )
  })
})
