import { jsPDF } from 'jspdf'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
} from '../licitacionUtils.js'
import { getLicitacionPdfFilename } from './licitacionPdfFilename.js'

export { getLicitacionPdfFilename }

const PAGE_WIDTH_MM = 210
const MARGIN_MM = 20
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2

/**
 * Separaciones verticales del resumen, en milímetros. Se exportan para que las
 * pruebas deriven la separación mínima entre filas en vez de usar un número
 * mágico.
 */
export const PDF_LAYOUT_MM = {
  valueOffset: 6,
  lineHeight: 5.5,
  rowGap: 6,
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
    doc.text(
      wrappedValue[i],
      MARGIN_MM,
      y + PDF_LAYOUT_MM.valueOffset + i * PDF_LAYOUT_MM.lineHeight,
    )
  }

  return (
    y +
    PDF_LAYOUT_MM.valueOffset +
    (valueLines - 1) * PDF_LAYOUT_MM.lineHeight +
    PDF_LAYOUT_MM.rowGap
  )
}

/**
 * Genera el PDF de resumen de una licitación con jsPDF en A4 y milímetros.
 * Incluye identificación, organismo, fecha de cierre, presupuesto en CLP, tipo,
 * región y enlace a las bases oficiales, con formato local chileno (REF-12).
 *
 * @param {object} licitacion - Licitación con el contrato de datos del mock (REF-10).
 * @returns {object} Documento `jsPDF` listo para serializar o descargar.
 */
export function buildLicitacionPdf(licitacion) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const { title, institution, amount, currency, closingDate, type, region, sourceUrl } = licitacion

  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH_MM)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(96, 52, 137)
  doc.text('Resumen de licitación', MARGIN_MM, 24)

  doc.setFontSize(15)
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
  y = addDataRow(doc, y, 'Fecha de cierre', formatLicitacionDate(closingDate))
  y = addDataRow(
    doc,
    y,
    'Presupuesto estimado',
    `${formatLicitacionAmount(amount, currency)} (${currency})`,
  )
  y = addDataRow(doc, y, 'Tipo', getTypeLabel(type))
  y = addDataRow(doc, y, 'Región', getRegionLabel(region))
  y = addDataRow(doc, y, 'Bases oficiales', sourceUrl)

  // El pie conserva su posición habitual, pero baja si el contenido crece
  // (por ejemplo, un enlace envuelto en muchas líneas) para no superponerse.
  const pageHeight = doc.internal.pageSize.getHeight()
  const footerY = Math.min(Math.max(y + PDF_LAYOUT_MM.rowGap, pageHeight - 15), pageHeight - 10)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(97, 89, 100)
  doc.text(
    'Resumen generado por Licitaciones UV. Consulte las bases oficiales para mayor detalle.',
    MARGIN_MM,
    footerY,
  )

  return doc
}
