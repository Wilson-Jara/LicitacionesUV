import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { buildDiff, formatChecks, isSensitiveFile, redact } from '../.github/scripts/ai-review.mjs'

const exec = promisify(execFile)
const script = fileURLToPath(new URL('../.github/scripts/ai-review.mjs', import.meta.url))
const workflow = readFileSync(resolve(dirname(script), '../workflows/ai-review.yml'), 'utf8')
const verifyWorkflow = readFileSync(resolve(dirname(script), '../workflows/verify.yml'), 'utf8')
const packageJson = JSON.parse(readFileSync(resolve(dirname(script), '../../package.json'), 'utf8'))

function indentedBlock(source, key, indent) {
  const lines = source.split('\n')
  const start = lines.findIndex(
    (line) => line.match(/^ */)[0].length === indent && line.trimStart().startsWith(`${key}:`),
  )
  assert.notEqual(start, -1, `no se encontró ${key} con indentación ${indent}`)
  const block = []
  for (const line of lines.slice(start + 1)) {
    if (line.trim() !== '' && line.match(/^ */)[0].length <= indent) break
    if (line.trim() !== '') block.push(line.trim())
  }
  return block
}

function versionAtLeast(version, minimum) {
  const [major, minor, patch] = version.split('.').map(Number)
  const [minMajor, minMinor, minPatch] = minimum.split('.').map(Number)
  if (major !== minMajor) return major > minMajor
  if (minor !== minMinor) return minor > minMinor
  return patch >= minPatch
}

describe('revisor IA: configuración de GitHub Actions', () => {
  it('limita los permisos de escritura al job que publica la revisión', () => {
    assert.deepEqual(indentedBlock(workflow, 'permissions', 0), ['contents: read'])

    const jobPermissions = indentedBlock(workflow, 'permissions', 4)
    assert.deepEqual(jobPermissions, [
      'contents: read',
      'checks: read',
      'pull-requests: write',
      'issues: write',
    ])

    const writeGrants = workflow
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^[a-z-]+:\s+write$/.test(line))
    assert.equal(writeGrants.length, 2)
    for (const grant of writeGrants) {
      assert.ok(jobPermissions.includes(grant), `${grant} debe estar dentro del job`)
    }
  })

  it('fija en CI una versión de Node compatible con engines y con verify.yml', () => {
    const minimum = /(\d+\.\d+\.\d+)/.exec(packageJson.engines.node)?.[1]
    assert.ok(minimum, 'engines.node debe declarar una versión mínima')

    const pinned = /node-version:\s*'([^']+)'/.exec(workflow)?.[1]
    const verifyPinned = /node-version:\s*'([^']+)'/.exec(verifyWorkflow)?.[1]
    assert.ok(pinned, 'ai-review.yml debe fijar node-version')
    assert.equal(pinned, verifyPinned)
    assert.ok(versionAtLeast(pinned, minimum), `${pinned} debe cumplir >=${minimum}`)
  })

  it('usa únicamente la rama base y no persiste credenciales del checkout', () => {
    assert.match(
      workflow,
      /ref:\s+\$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.sha \}\}/,
    )
    assert.match(workflow, /persist-credentials:\s+false/)
    assert.match(workflow, /hashFiles\('\.github\/scripts\/ai-review\.mjs'\)/)
  })

  it('omite drafts, forks y solicitudes de etiqueta que no sean ai-review', () => {
    assert.match(
      workflow,
      /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/,
    )
    assert.match(workflow, /!github\.event\.pull_request\.draft/)
    assert.match(workflow, /github\.event\.label\.name == 'ai-review'/)
  })
})

describe('revisor IA: protección del contenido', () => {
  it('redacta credenciales reconocibles antes de enviar o publicar texto', () => {
    const token = 'ghp_' + 'a'.repeat(30)
    const input = `Cambio de prueba ${token}\nPASSWORD=valor-ficticio\nTexto público`
    const output = redact(input)
    assert.equal(output.includes(token), false)
    assert.equal(output.includes('valor-ficticio'), false)
    assert.match(output, /Texto público/)
  })

  it('omite archivos de entorno y claves, incluidos los de carpetas anidadas', () => {
    for (const filename of ['.env', 'config/.env.local', 'secrets.json', 'cert/key.pem']) {
      assert.equal(isSensitiveFile(filename), true, filename)
    }
    assert.equal(isSensitiveFile('src/server.js'), false)
  })

  it('omite el contenido sensible aunque el archivo se renombre como documentación', () => {
    const diff = buildDiff([
      {
        filename: 'docs/ejemplo.md',
        previous_filename: '.env',
        status: 'renamed',
        additions: 1,
        deletions: 0,
        patch: '+contenido reservado de prueba',
      },
    ])
    assert.equal(diff.includes('contenido reservado de prueba'), false)
    assert.match(diff, /contenido omitido/)
  })

  it('lee cambios mayores al límite anterior sin superar el nuevo presupuesto', () => {
    const input = 'x'.repeat(50000) + '\nmarca-final-del-cambio'
    const diff = buildDiff([
      { filename: 'docs/publico.md', status: 'modified', additions: 1, deletions: 0, patch: input },
      {
        filename: 'docs/grande.md',
        status: 'modified',
        additions: 1,
        deletions: 0,
        patch: 'z'.repeat(120000),
      },
    ])
    assert.match(diff, /marca-final-del-cambio/)
    assert.match(diff, /se omitieron/)
    assert.ok(diff.length < 120200)
  })

  it('resume el CI sin reproducir su salida ni sus logs', () => {
    const summary = formatChecks({
      check_runs: [
        {
          name: 'verify',
          status: 'completed',
          conclusion: 'success',
          output: { text: 'salida privada de prueba' },
        },
      ],
    })
    assert.match(summary, /verify: completed\/success/)
    assert.equal(summary.includes('salida privada de prueba'), false)
  })
})

describe('revisor IA: ejecución sin llamadas externas', () => {
  it('omite la revisión cuando no hay clave, incluso sin datos de GitHub', async () => {
    const result = await exec(process.execPath, [script], {
      env: { SystemRoot: process.env.SystemRoot, PATH: process.env.PATH },
      timeout: 5000,
    })
    assert.match(result.stdout, /se omite la revisión/)
    assert.equal(result.stderr, '')
  })

  it('rechaza identificadores inválidos antes de llamar a GitHub o DeepSeek', async () => {
    await assert.rejects(
      exec(process.execPath, [script], {
        env: {
          SystemRoot: process.env.SystemRoot,
          PATH: process.env.PATH,
          DEEPSEEK_API_KEY: 'credencial-ficticia',
          GITHUB_TOKEN: 'token-ficticio',
          GITHUB_REPOSITORY: 'equipo/backend',
          ITEM_NUMBER: '../otra-ruta',
        },
        timeout: 5000,
      }),
      (error) => {
        assert.equal(error.code, 1)
        assert.match(error.stderr, /Faltan datos válidos/)
        const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`
        assert.equal(output.includes('credencial-ficticia'), false)
        assert.equal(output.includes('token-ficticio'), false)
        return true
      },
    )
  })
})
