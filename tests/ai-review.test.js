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

describe('revisor IA: configuración de GitHub Actions', () => {
  it('limita los permisos de escritura al job que publica la revisión', () => {
    assert.match(workflow, /permissions:\s+contents: read/)
    assert.match(workflow, /jobs:[\s\S]*permissions:\s+contents: read/)
    assert.match(workflow, /pull-requests: write/)
    assert.match(workflow, /issues: write/)
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
        assert.equal(error.stderr.includes('credencial-ficticia'), false)
        return true
      },
    )
  })
})
