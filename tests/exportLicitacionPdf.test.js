import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import {
  buildLicitacionPdf,
  getLicitacionPdfFilename,
} from '../src/features/licitaciones/services/exportLicitacionPdf.js'

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
})
