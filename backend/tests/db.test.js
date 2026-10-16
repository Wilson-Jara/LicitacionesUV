import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listMigrationFiles, runMigrations } from '../src/db/migrator.js'
import { seedLicitaciones } from '../src/db/seed.js'
import { loadMockLicitaciones } from '../src/data/mockLicitaciones.js'

const migrationsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../migrations')

// Cliente falso: registra las consultas y simula schema_migrations
function createFakeClient({ aplicadas = [], fallarCon } = {}) {
  const queries = []
  return {
    queries,
    async query(sql, params) {
      queries.push({ sql: sql.trim(), params })
      if (fallarCon && sql.includes(fallarCon)) throw new Error('error de sintaxis')
      if (sql.startsWith('SELECT nombre FROM schema_migrations')) {
        return { rows: aplicadas.map((nombre) => ({ nombre })) }
      }
      return { rows: [] }
    },
  }
}

describe('migraciones del repositorio', () => {
  it('usan nombres numerados y correlativos', async () => {
    const files = await listMigrationFiles(migrationsDir)
    assert.ok(files.length >= 2)
    files.forEach((file, index) => {
      assert.equal(file.slice(0, 3), String(index + 1).padStart(3, '0'), file)
    })
  })

  it('crean las 8 entidades del dominio', async () => {
    const sql = await readFile(join(migrationsDir, '001_esquema_inicial.sql'), 'utf8')
    for (const tabla of [
      'usuarios',
      'licitaciones',
      'favoritos',
      'regiones',
      'unidades',
      'aprobaciones',
      'delegaciones',
      'umbrales_aprobacion',
    ]) {
      assert.match(sql, new RegExp(`CREATE TABLE ${tabla} \\(`), `falta la tabla ${tabla}`)
    }
  })

  it('el catálogo de regiones cubre las regiones del mock', async () => {
    const sql = await readFile(join(migrationsDir, '002_catalogo_regiones.sql'), 'utf8')
    for (const region of new Set(loadMockLicitaciones().map((l) => l.region))) {
      assert.match(sql, new RegExp(`\\('${region}',`), `falta la región ${region}`)
    }
  })
})

describe('runMigrations', () => {
  let dir

  before(async () => {
    dir = await mkdtemp(join(tmpdir(), 'migraciones-'))
    await writeFile(join(dir, '002_segunda.sql'), 'SELECT 2;')
    await writeFile(join(dir, '001_primera.sql'), 'SELECT 1;')
    await writeFile(join(dir, 'notas.txt'), 'no es una migración')
  })

  after(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('aplica las pendientes en orden, cada una en su transacción', async () => {
    const client = createFakeClient()
    const aplicadas = await runMigrations(client, dir)
    assert.deepEqual(aplicadas, ['001_primera.sql', '002_segunda.sql'])
    const secuencia = client.queries.map((q) => q.sql).slice(2)
    assert.deepEqual(secuencia, [
      'BEGIN',
      'SELECT 1;',
      'INSERT INTO schema_migrations (nombre) VALUES ($1)',
      'COMMIT',
      'BEGIN',
      'SELECT 2;',
      'INSERT INTO schema_migrations (nombre) VALUES ($1)',
      'COMMIT',
    ])
  })

  it('omite las migraciones ya registradas', async () => {
    const client = createFakeClient({ aplicadas: ['001_primera.sql', '002_segunda.sql'] })
    assert.deepEqual(await runMigrations(client, dir), [])
    assert.ok(!client.queries.some((q) => q.sql === 'BEGIN'))
  })

  it('revierte y explica qué migración falló', async () => {
    const client = createFakeClient({ fallarCon: 'SELECT 2' })
    await assert.rejects(runMigrations(client, dir), /Falló la migración 002_segunda\.sql/)
    assert.equal(client.queries.at(-1).sql, 'ROLLBACK')
  })
})

describe('seedLicitaciones', () => {
  it('inserta cada licitación del mock con upsert dentro de una transacción', async () => {
    const client = createFakeClient()
    const mock = loadMockLicitaciones()
    assert.equal(await seedLicitaciones(client, mock), mock.length)
    const inserts = client.queries.filter((q) => q.sql.startsWith('INSERT INTO licitaciones'))
    assert.equal(inserts.length, mock.length)
    assert.match(inserts[0].sql, /ON CONFLICT \(id\) DO UPDATE/)
    assert.deepEqual(inserts[0].params, [
      mock[0].id,
      mock[0].title,
      mock[0].institution,
      mock[0].amount,
      mock[0].currency,
      mock[0].closingDate,
      mock[0].type,
      mock[0].region,
      mock[0].sourceUrl,
    ])
    assert.equal(client.queries[0].sql, 'BEGIN')
    assert.equal(client.queries.at(-1).sql, 'COMMIT')
  })

  it('revierte si falla una inserción', async () => {
    const client = createFakeClient({ fallarCon: 'INSERT INTO licitaciones' })
    await assert.rejects(
      seedLicitaciones(client, loadMockLicitaciones()),
      /Falló la carga del seed de licitaciones/,
    )
    assert.equal(client.queries.at(-1).sql, 'ROLLBACK')
  })
})
