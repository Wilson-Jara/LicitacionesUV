import { buildLicitacionPdf, getLicitacionPdfFilename } from './buildLicitacionPdf.js'

// En un Web Worker `self` es el ámbito global; `globalThis.self ?? globalThis`
// permite ejecutar este módulo también en Node (tests) sin referencias rotas.
const ctx = globalThis.self ?? globalThis

ctx.onmessage = (event) => {
  const licitacion = event.data
  try {
    const doc = buildLicitacionPdf(licitacion)
    const buffer = doc.output('arraybuffer')
    ctx.postMessage({ buffer, fileName: getLicitacionPdfFilename(licitacion.id) }, [buffer])
  } catch (error) {
    ctx.postMessage({ error: error instanceof Error ? error.message : 'Error generando PDF' })
  }
}
