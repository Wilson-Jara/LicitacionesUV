import { jsPDF } from 'jspdf'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
} from '../licitacionUtils.js'

const PAGE_WIDTH_MM = 210
const MARGIN_MM = 20
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2

export function getLicitacionPdfFilename(id) {
  const identifier = String(id).replace(/^licitacion-/, '')
  return `licitacion-${identifier}.pdf`
}

function addDataRow(doc, y, label, value) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)

  const wrappedValue = doc.splitTextToSize(value, CONTENT_WIDTH_MM)
  const valueLines = wrappedValue.length

  doc.text(label.toUpperCase(), MARGIN_MM, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  for (let i = 0; i < valueLines; i += 1) {
    doc.text(wrappedValue[i], MARGIN_MM, y + 6 + i * 5.5)
  }

  return y + 12 + (valueLines - 1) * 5.5
}

export function buildLicitacionPdf(licitacion) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const { title, institution, amount, currency, closingDate, type, region, sourceUrl } = licitacion

  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH_MM)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(14, 27, 56)
  doc.text('Resumen de licitación', MARGIN_MM, 24)

  doc.setFontSize(15)
  doc.setTextColor(14, 27, 56)
  let y = 36
  for (let i = 0; i < titleLines.length; i += 1) {
    doc.text(titleLines[i], MARGIN_MM, y)
    y += 7
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text(institution, MARGIN_MM, y + 2)
  y += 14

  y = addDataRow(doc, y, 'Identificador', licitacion.id)
  y = addDataRow(doc, y, 'Organismo licitante', institution)
  y = addDataRow(doc, y, 'Cierre de postulación', formatLicitacionDate(closingDate))
  y = addDataRow(
    doc,
    y,
    'Presupuesto estimado',
    `${formatLicitacionAmount(amount, currency)} (${currency})`,
  )
  y = addDataRow(doc, y, 'Tipo', getTypeLabel(type))
  addDataRow(doc, y, 'Región', getRegionLabel(region))
  addDataRow(doc, y, 'Bases oficiales', sourceUrl)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(140, 140, 140)
  doc.text(
    'Resumen generado por LicitacionesUV. Consulte las bases oficiales para mayor detalle.',
    MARGIN_MM,
    doc.internal.pageSize.getHeight() - 15,
  )

  return doc
}

export function exportLicitacionPdf(licitacion) {
  const doc = buildLicitacionPdf(licitacion)
  doc.save(getLicitacionPdfFilename(licitacion.id))
}
