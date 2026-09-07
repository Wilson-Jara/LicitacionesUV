import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

describe('Linea base reproducible (smoke tests)', () => {
  it('declara versiones exactas SemVer en todas las dependencias', () => {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    assert.ok(Object.keys(deps).length > 0, 'no hay dependencias declaradas')
    for (const [name, version] of Object.entries(deps)) {
      assert.match(
        version,
        /^\d+\.\d+\.\d+$/,
        `${name} debe usar version exacta SemVer (sin ^ o ~), recibido: ${version}`,
      )
    }
  })

  it('declara engines con versiones minimas de Node.js y npm', () => {
    assert.match(pkg.engines?.node ?? '', /^>=20\.\d+\.\d+$/, 'falta engines.node (>=20.19)')
    assert.match(pkg.engines?.npm ?? '', /^>=\d+\.\d+\.\d+$/, 'falta engines.npm')
  })

  it('expone el comando unico verify (clean + lint + format:check + test + build)', () => {
    for (const script of ['clean', 'lint', 'test', 'build', 'format', 'format:check', 'verify']) {
      assert.ok(pkg.scripts?.[script], `falta el script "${script}"`)
    }
    assert.match(pkg.scripts.verify, /clean/)
    assert.match(pkg.scripts.verify, /lint/)
    assert.match(pkg.scripts.verify, /format:check/)
    assert.match(pkg.scripts.verify, /test/)
    assert.match(pkg.scripts.verify, /build/)
  })

  it('el punto de entrada index.html referencia src/main.jsx', () => {
    assert.ok(existsSync(path.join(root, 'index.html')), 'no existe index.html')
    const index = readFileSync(path.join(root, 'index.html'), 'utf8')
    assert.match(index, /src\/main\.jsx/)
    assert.ok(existsSync(path.join(root, 'src', 'main.jsx')), 'no existe src/main.jsx')
  })
})
