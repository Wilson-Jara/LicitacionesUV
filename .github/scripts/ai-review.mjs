/*
 * Revisor automático de Pull Requests e issues con la API de DeepSeek.
 *
 * - Revisión inicial al abrir o reabrir un PR/issue.
 * - Revisión bajo demanda cada vez que se agrega la etiqueta "ai-review":
 *   publica un comentario nuevo, así se puede pedir ayuda más de una vez.
 * - En PRs lee el cuerpo y el diff; en issues revisa la plantilla (DoR/DoD).
 * - En PRs consulta además el estado de CI del commit (check-runs) y el
 *   issue linkeado con "Closes #N", para no emitir juicios sin evidencia.
 * - Seguridad: no se incluyen logs ni salidas de jobs, solo nombres de
 *   checks y sus conclusiones; todo texto que entra al modelo o que se
 *   publica pasa antes por la redacción de secretos.
 * - Seguridad: omite archivos sensibles y redacta secretos antes de enviar
 *   el contenido al modelo y antes de publicar la respuesta.
 * No requiere dependencias: usa fetch nativo de Node 20+.
 *
 * Usa siempre el modelo DeepSeek-V4.1-Flash (deepseek-flash) en modo
 * thinking con effort "high".
 *
 * Variables de entorno requeridas:
 *   GITHUB_TOKEN        Token de Actions con permisos de escritura.
 *   GITHUB_REPOSITORY   owner/repo (lo entrega Actions).
 *   EVENT_NAME          "pull_request" o "issues" (lo entrega el workflow).
 *   ITEM_NUMBER         Número del PR o issue (lo entrega el workflow).
 *   DEEPSEEK_API_KEY    Clave de la API de DeepSeek (secret del repositorio).
 *
 * Opcionales:
 *   REQUESTED           "true" cuando la revisión se pidió con la etiqueta.
 *   REQUESTER           Usuario que agregó la etiqueta (para el prompt).
 *   DEEPSEEK_MODEL      Por defecto "deepseek-flash" (alternativa: "deepseek-v4-pro").
 *   DEEPSEEK_BASE_URL   Por defecto "https://api.deepseek.com".
 */

const MARKER = '<!-- deepseek-ai-review -->'
const MAX_PATCH_CHARS = 40000
// Archivos cuyo contenido nunca se envía al modelo.
const SENSITIVE_FILES =
  /(^|\/)(\.env(\..*)?|\.npmrc|\.netrc|id_rsa[\w.-]*|id_ed25519[\w.-]*|secrets?[\w.-]*|.*\.(pem|key|p12|pfx|jks|keystore))$/i
// Patrones que se redactan antes de enviar al modelo y antes de publicar.
const REDACTIONS = [
  [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    '[REDACTADO: clave privada]',
  ],
  [/\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}\b/g, '[REDACTADO: token de GitHub]'],
  [/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTADO: API key]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTADO: credencial de AWS]'],
  [/\bAIza[0-9A-Za-z_-]{30,}\b/g, '[REDACTADO: API key de Google]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[REDACTADO: JWT]'],
  [
    /^.*(?:API[_-]?KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|PRIVATE[_-]?KEY)\s*[:=]\s*\S.*$/gim,
    '[REDACTADO: variable sensible]',
  ],
]
const SYSTEM_PR =
  'Eres un revisor de Pull Requests riguroso pero amable. Respondes siempre en español. Nunca reproduces secretos, tokens, credenciales ni variables de entorno.'
const SYSTEM_ISSUE =
  'Eres un analista de requisitos riguroso pero amable. Respondes siempre en español. Nunca reproduces secretos, tokens, credenciales ni variables de entorno.'

const {
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  EVENT_NAME = 'pull_request',
  ITEM_NUMBER,
  REQUESTED = 'false',
  REQUESTER = '',
  DEEPSEEK_API_KEY,
  DEEPSEEK_MODEL = 'deepseek-flash',
  DEEPSEEK_BASE_URL = 'https://api.deepseek.com',
} = process.env

const requested = REQUESTED === 'true'
const requestNote = requested
  ? `\n\n--- SOLICITUD ---\nEl equipo pidió una nueva revisión${
      REQUESTER ? ` por @${REQUESTER}` : ''
    } agregando la etiqueta "ai-review". Analiza el estado actual y entrega la revisión completa.`
  : ''

function fail(message) {
  console.error(`[ai-review] ${message}`)
  process.exit(1)
}

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !ITEM_NUMBER) {
  fail('Faltan GITHUB_TOKEN, GITHUB_REPOSITORY o ITEM_NUMBER.')
}

if (!DEEPSEEK_API_KEY) {
  console.log('[ai-review] DEEPSEEK_API_KEY no configurada; se omite la revisión.')
  process.exit(0)
}

const [owner, repo] = GITHUB_REPOSITORY.split('/')
const baseUrl = DEEPSEEK_BASE_URL.replace(/\/$/, '')

const ghHeaders = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'licitacionesuv-ai-review',
}

async function ghRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...options,
    headers: { ...ghHeaders, ...(options.headers ?? {}) },
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`GitHub API ${response.status} en ${path}: ${detail}`)
  }
  return response.status === 204 ? null : response.json()
}

function truncate(text, max) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}\n... (truncado)` : text
}

function redact(text) {
  return REDACTIONS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text,
  )
}

function isSensitiveFile(filename) {
  return SENSITIVE_FILES.test(filename)
}

function extractLinkedIssueNumber(body) {
  const match = /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#(\d+)/i.exec(
    body ?? '',
  )
  return match ? Number(match[1]) : null
}

function formatChecks(checks) {
  const runs = checks?.check_runs ?? []
  if (runs.length === 0) return '(no se registraron ejecuciones de CI)'
  return runs
    .map(
      (run) =>
        `- ${run.name}: ${run.status}/${run.conclusion ?? 'sin conclusión'}${
          run.html_url ? ` (${run.html_url})` : ''
        }`,
    )
    .join('\n')
}

function buildDiff(files) {
  let total = 0
  const parts = []
  for (const file of files) {
    const header = `### ${file.filename} (${file.status}, +${file.additions}/-${file.deletions})`
    const patch = isSensitiveFile(file.filename)
      ? '(archivo sensible: contenido omitido por seguridad)'
      : file.patch
        ? truncate(redact(file.patch), MAX_PATCH_CHARS)
        : '(sin diff textual: binario o solo renombrado)'
    const block = `${header}\n\`\`\`diff\n${patch}\n\`\`\``
    if (total + block.length > MAX_PATCH_CHARS) {
      parts.push(`... (se omitieron más archivos: ${files.length - parts.length})`)
      break
    }
    total += block.length
    parts.push(block)
  }
  return parts.join('\n\n')
}

function buildPrPrompt(pr, files, checksSummary, issueInfo) {
  return [
    'Eres un revisor de código experto en React, Vite, testing y buenas prácticas de Git.',
    'Revisas Pull Requests de un proyecto académico llamado LicitacionesUV.',
    'Respondes SIEMPRE en español, de forma clara, constructiva y concisa.',
    '',
    'Debes entregar tu revisión con EXACTAMENTE estas secciones en Markdown:',
    '',
    '## ✅ Campos de la plantilla',
    'Evalúa si el autor completó cada campo de la plantilla del PR:',
    'Propósito, `Closes #`, Resumen de cambios, Cómo se verificó, Checklist y Evidencia.',
    'Marca cada uno como "Completo", "Incompleto" o "Falta", citando lo necesario.',
    '',
    '## 🔎 Revisión de código',
    'Señala problemas concretos o buenas prácticas, con referencia al archivo afectado.',
    '',
    '## 💡 Mejoras recomendadas',
    'Lista de sugerencias accionables y priorizadas (máximo 6).',
    '',
    '## ✅/⚠️ Veredicto',
    'Una frase final: si el PR está listo para revisión humana o qué debe corregir antes.',
    '',
    'Reglas:',
    '- No inventes archivos ni cambios que no estén en el diff.',
    '- Si el diff está vacío o es solo de documentación, dilo explícitamente.',
    '- Nunca muestres secretos, tokens, credenciales ni variables de entorno; si los detectas, avisa sin reproducirlos.',
    '- El estado real de CI está en la sección "ESTADO DE CI". Si el cuerpo del PR no muestra evidencia de verificación pero hay checks con conclusión "success" (por ejemplo el job `verify`), no digas que falta evidencia: indica que el CI está en verde y cita el nombre del check.',
    '- No reproduzcas logs, salidas de jobs ni valores de configuración: solo nombres de checks y sus conclusiones.',
    '- Si se incluye el issue linkeado, úsalo para validar trazabilidad; no reproduzcas datos sensibles de él.',
    '- Sé respetuoso; es un equipo de estudiantes.',
    '- No repitas el diff completo.',
    '',
    '--- DATOS DEL PR ---',
    `Título: ${redact(pr.title)}`,
    `Autor: ${pr.user.login}`,
    `Rama: ${pr.head.ref} → ${pr.base.ref}`,
    `Estado: ${pr.state}`,
    '',
    '--- CUERPO DEL PR (plantilla) ---',
    redact(pr.body?.trim() ? pr.body : '(el autor no escribió nada en la descripción)'),
    '',
    '--- ARCHIVOS Y DIFF ---',
    buildDiff(files),
    '',
    '--- ESTADO DE CI ---',
    checksSummary,
    issueInfo,
    requestNote,
  ].join('\n')
}

function buildIssuePrompt(issue) {
  const labels = issue.labels.map((l) => l.name).join(', ') || '(sin etiquetas)'
  return [
    'Eres un analista funcional revisando un issue (tarea, chore o historia de usuario)',
    'de un proyecto académico llamado LicitacionesUV.',
    'Respondes SIEMPRE en español, de forma clara, constructiva y concisa.',
    '',
    'Entrega tu revisión con EXACTAMENTE estas secciones en Markdown:',
    '',
    '## ✅ Campos de la plantilla',
    'Verifica si el issue incluye Objetivo, Tareas, Criterios de aceptación, DoR y DoD,',
    'o bien el formato de historia de usuario (Como... quiero... para...) con sus CA.',
    'Marca cada uno como "Completo", "Incompleto" o "Falta".',
    '',
    '## 🔎 Observaciones',
    'Ambigüedades, alcance poco claro, dependencias no mencionadas o criterios no verificables.',
    '',
    '## 💡 Mejoras recomendadas',
    'Sugerencias accionables y priorizadas (máximo 6).',
    '',
    '## ✅/⚠️ Veredicto',
    'Una frase: si el issue está listo (cumple DoR) o qué falta antes de empezar.',
    '',
    'Reglas:',
    '- Sé respetuoso; es un equipo de estudiantes.',
    '- Nunca muestres secretos, tokens, credenciales ni variables de entorno; si los detectas, avisa sin reproducirlos.',
    '- No inventes contexto que no esté en el issue.',
    '',
    '--- DATOS DEL ISSUE ---',
    `Título: ${redact(issue.title)}`,
    `Autor: ${issue.user.login}`,
    `Etiquetas: ${labels}`,
    `Estado: ${issue.state}`,
    '',
    '--- CUERPO DEL ISSUE ---',
    redact(issue.body?.trim() ? issue.body : '(el autor no escribió descripción)'),
    requestNote,
  ].join('\n')
}

async function callDeepSeek(systemPrompt, prompt) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      stream: false,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`DeepSeek API ${response.status}: ${detail}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('DeepSeek devolvió una respuesta vacía.')
  return redact(content)
}

async function postComment(body) {
  await ghRequest(`/issues/${ITEM_NUMBER}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
  console.log('[ai-review] Comentario publicado.')
}

async function upsertComment(body) {
  const comments = await ghRequest(`/issues/${ITEM_NUMBER}/comments?per_page=100`)
  const existing = comments.find((c) => typeof c.body === 'string' && c.body.includes(MARKER))

  if (!existing) {
    await postComment(body)
    return
  }

  await ghRequest(`/issues/comments/${existing.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
  console.log('[ai-review] Comentario existente actualizado.')
}

async function publish(body) {
  if (requested) {
    await postComment(body)
    return
  }
  await upsertComment(body)
}

async function reviewIssue() {
  const issue = await ghRequest(`/issues/${ITEM_NUMBER}`)
  const review = await callDeepSeek(SYSTEM_ISSUE, buildIssuePrompt(issue))
  const title = requested ? 'Revisión solicitada' : 'Revisión automática'
  const body = `${MARKER}\n### 🤖 ${title} de la tarea (DeepSeek)\n\n${review}\n\n---\n_Generado con \`${DEEPSEEK_MODEL}\`. La decisión final es humana._`
  await publish(body)
}

async function reviewPullRequest() {
  const [pr, files] = await Promise.all([
    ghRequest(`/pulls/${ITEM_NUMBER}`),
    ghRequest(`/pulls/${ITEM_NUMBER}/files?per_page=100`),
  ])

  let checksSummary = '(no se pudo consultar el estado de CI)'
  try {
    const checks = await ghRequest(`/commits/${pr.head.sha}/check-runs?per_page=100`)
    checksSummary = formatChecks(checks)
  } catch {
    // se conserva el mensaje por defecto
  }

  let issueInfo = ''
  const linkedIssue = extractLinkedIssueNumber(pr.body)
  if (linkedIssue) {
    try {
      const issue = await ghRequest(`/issues/${linkedIssue}`)
      issueInfo = `\n\n--- ISSUE LINKADO (#${linkedIssue}) ---\nTítulo: ${issue.title}\n\n${truncate(redact(issue.body ?? ''), 8000)}\n`
    } catch {
      issueInfo = `\n\n--- ISSUE LINKADO (#${linkedIssue}) ---\nNo se pudo leer el issue; validar la trazabilidad manualmente.\n`
    }
  }

  const review = await callDeepSeek(SYSTEM_PR, buildPrPrompt(pr, files, checksSummary, issueInfo))
  const title = requested ? 'Revisión solicitada' : 'Revisión automática'
  const body = `${MARKER}\n### 🤖 ${title} (DeepSeek)\n\n${review}\n\n---\n_Generado con \`${DEEPSEEK_MODEL}\`. Es una sugerencia automática: la revisión humana es obligatoria._`
  await publish(body)
}

async function main() {
  if (EVENT_NAME === 'issues') {
    await reviewIssue()
    return
  }
  await reviewPullRequest()
}

main().catch((error) => {
  console.error(`[ai-review] Error: ${error.message}`)
  process.exit(1)
})
