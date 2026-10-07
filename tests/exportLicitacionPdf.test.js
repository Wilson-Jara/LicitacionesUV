import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import {
  buildLicitacionPdf,
  getLicitacionPdfFilename,
} from '../src/features/licitaciones/services/buildLicitacionPdf.js'
import { exportLicitacionPdfEnWorker } from '../src/features/licitaciones/services/exportLicitacionPdfCore.js'

const licitacionBase = {
  id: 'licitacion-001',
  title: 'Servicio de mantenimiento de infraestructura',
  institution: 'Universidad de Valparaíso',
  amount: 12500000,
  currency: 'CLP',
  closingDate: '2026-09-30',
  type: 'publica',
  region: 'valparaiso',
  sourceUrl: 'https://www.mercadopublico.cl/',
}

function pdfText(licitacion) {
  const doc = buildLicitacionPdf(licitacion)
  return Buffer.from(doc.output('arraybuffer')).toString('latin1')
}

describe('exportLicitacionPdf', () => {
  it('genera un nombre de archivo estable basado en el identificador', () => {
    assert.equal(getLicitacionPdfFilename('licitacion-001'), 'licitacion-001.pdf')
    assert.equal(getLicitacionPdfFilename('otro-id'), 'licitacion-otro-id.pdf')
  })

  it('genera un PDF válido con cabecera %PDF', () => {
    const doc = buildLicitacionPdf(licitacionBase)
    const header = Buffer.from(doc.output('arraybuffer').slice(0, 5)).toString('latin1')
    assert.equal(header, '%PDF-')
  })

  it('incluye los datos principales de la licitación en español y formato chileno', () => {
    const text = pdfText(licitacionBase)

    assert.ok(text.includes('Resumen de licitación'))
    assert.ok(text.includes('Servicio de mantenimiento de infraestructura'))
    assert.ok(text.includes('Universidad de Valparaíso'))
    assert.ok(text.includes('30 de septiembre de 2026'))
    assert.ok(text.includes('$12.500.000'))
    assert.ok(text.includes('CLP'))
    assert.ok(text.includes('Licitación pública'))
    assert.ok(text.includes('Valparaíso'))
    assert.ok(text.includes('mercadopublico.cl'))
    assert.ok(text.includes('IDENTIFICADOR'))
    assert.ok(text.includes('ORGANISMO LICITANTE'))
    assert.ok(text.includes('BASES OFICIALES'))
  })

  it('usa solo los datos de la licitación seleccionada', () => {
    const otra = {
      ...licitacionBase,
      id: 'licitacion-002',
      title: 'Adquisición de equipamiento tecnológico',
      institution: 'Otra institución',
    }
    const text = pdfText(otra)

    assert.ok(text.includes('Adquisición de equipamiento tecnológico'))
    assert.ok(!text.includes('Servicio de mantenimiento de infraestructura'))
  })

  it('el worker genera el PDF fuera del hilo principal y lo entrega como ArrayBuffer', async () => {
    const recibidos = []
    globalThis.self = {
      postMessage(message, transfer) {
        recibidos.push({ message, transfer })
      },
    }

    await import('../src/features/licitaciones/services/exportLicitacionPdf.worker.js')
    globalThis.self.onmessage({ data: licitacionBase })

    delete globalThis.self

    assert.equal(recibidos.length, 1)
    const { message, transfer } = recibidos[0]
    assert.equal(message.fileName, 'licitacion-001.pdf')
    assert.ok(message.buffer instanceof ArrayBuffer)
    assert.ok(transfer.includes(message.buffer))

    const text = Buffer.from(message.buffer).toString('latin1')
    assert.ok(text.includes('Servicio de mantenimiento de infraestructura'))
    assert.ok(text.includes('Universidad de Valparaíso'))
  })
})

describe('exportLicitacionPdfEnWorker (orquestación)', () => {
  it('rechaza sin bloquear si no hay Web Workers disponibles', async () => {
    await assert.rejects(
      exportLicitacionPdfEnWorker(licitacionBase, () => {
        throw new Error('Worker no soportado')
      }),
      /Web Workers/,
    )
  })

  it('muestra un error visible si el worker falla al generar', async () => {
    const worker = { postMessage() {}, terminate() {}, onmessage: null, onerror: null }
    const promise = exportLicitacionPdfEnWorker(licitacionBase, () => worker)

    worker.onmessage({ data: { error: 'fallo interno de jsPDF' } })

    await assert.rejects(promise, /Error al generar el PDF/)
  })

  it('rechaza si el worker no responde dentro del tiempo límite', async () => {
    const worker = { postMessage() {}, terminate() {}, onmessage: null, onerror: null }
    const promise = exportLicitacionPdfEnWorker(licitacionBase, () => worker, { timeoutMs: 20 })

    await assert.rejects(promise, /Tiempo de espera agotado/)
  })

  it('descarga el PDF con nombre estable cuando el worker entrega el buffer', async () => {
    const urlOriginal = globalThis.URL
    const descargas = []
    globalThis.document = {
      createElement: () => {
        const el = {
          style: {},
          click() {
            el.clicked = true
          },
        }
        Object.defineProperty(el, 'href', {
          set: (value) => {
            el.hrefValue = value
          },
        })
        Object.defineProperty(el, 'download', {
          set: (value) => {
            el.downloadValue = value
            descargas.push(el)
          },
        })
        return el
      },
      body: { appendChild() {}, removeChild() {} },
    }
    globalThis.URL = class {
      static createObjectURL() {
        return 'blob:pdf'
      }

      static revokeObjectURL() {}
    }

    try {
      const worker = { postMessage() {}, terminate() {}, onmessage: null, onerror: null }
      const promise = exportLicitacionPdfEnWorker(licitacionBase, () => worker, { timeoutMs: 1000 })

      worker.onmessage({
        data: {
          buffer: new Uint8Array([37, 80, 68, 70, 45]).buffer,
          fileName: 'licitacion-001.pdf',
        },
      })

      await promise

      assert.equal(descargas.length, 1)
      assert.equal(descargas[0].downloadValue, 'licitacion-001.pdf')
      assert.equal(descargas[0].hrefValue, 'blob:pdf')
      assert.equal(descargas[0].clicked, true)
    } finally {
      delete globalThis.document
      globalThis.URL = urlOriginal
    }
  })
})
