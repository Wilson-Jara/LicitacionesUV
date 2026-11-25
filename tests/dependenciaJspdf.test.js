import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { jsPDF } from 'jspdf'
import { buildLicitacionPdf } from '../src/features/licitaciones/services/buildLicitacionPdf.js'

// Revisión de la dependencia externa jsPDF (#135). Estas pruebas comprueban la
// versión declarada, un ejemplo mínimo con la API pública que usa el proyecto y
// la mitigación del riesgo de inyección de objetos PDF con datos de la API.

async function leerJson(ruta) {
  return JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'))
}

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

function analizarPdf(doc) {
  const texto = Buffer.from(doc.output('arraybuffer')).toString('latin1')
  const objetos = (texto.match(/^\d+ 0 obj$/gm) ?? []).length
  // Quita las cadenas literales de PDF «(...)», respetando los escapes, para
  // revisar solo la estructura del documento.
  const estructura = texto.replace(/\((?:\\.|[^\\)])*\)/g, '()')
  return { texto, objetos, estructura }
}

describe('dependencia externa jsPDF (#135)', () => {
  it('declara una versión exacta, igual a la instalada y con licencia MIT', async () => {
    const pkg = await leerJson('../package.json')
    const instalado = await leerJson('../node_modules/jspdf/package.json')

    assert.match(pkg.dependencies.jspdf, /^\d+\.\d+\.\d+$/, 'sin rangos ^ ni ~')
    assert.equal(instalado.version, pkg.dependencies.jspdf)
    assert.equal(instalado.license, 'MIT')
  })

  it('genera un PDF con la API pública que usa el proyecto (ejemplo mínimo)', () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(doc.splitTextToSize('LicitacionesUV · verificación de jsPDF', 180), 15, 20)

    const buffer = doc.output('arraybuffer')
    assert.equal(Buffer.from(buffer.slice(0, 5)).toString('latin1'), '%PDF-')
    assert.ok(buffer.byteLength > 1000, 'el PDF no puede venir vacío')
  })

  it('escapa los datos de la API: un texto malicioso no inyecta objetos ni JavaScript', () => {
    const carga = 'Banco) Tj ET >> /AA << /O << /S /JavaScript /JS (app.alert(1)) >> >> BT ('
    const normal = analizarPdf(buildLicitacionPdf(licitacionBase))
    const atacado = analizarPdf(
      buildLicitacionPdf({ ...licitacionBase, title: carga, institution: carga }),
    )

    assert.equal(atacado.objetos, normal.objetos, 'no aparecen objetos PDF nuevos')
    assert.ok(atacado.texto.includes('app.alert\\(1\\)'), 'los paréntesis quedan escapados')
    assert.doesNotMatch(atacado.estructura, /\/JavaScript/)
    assert.doesNotMatch(atacado.estructura, /\/AA\b/)
  })
})
