import ExportWorker from './exportLicitacionPdf.worker.js?worker'
import { exportLicitacionPdfEnWorker } from './exportLicitacionPdfCore.js'

/**
 * Exporta el resumen de una licitación a PDF. La generación ocurre en un
 * Web Worker (fuera del hilo principal); ver `exportLicitacionPdfCore.js`.
 */
export function exportLicitacionPdf(licitacion) {
  return exportLicitacionPdfEnWorker(licitacion, () => new ExportWorker())
}
