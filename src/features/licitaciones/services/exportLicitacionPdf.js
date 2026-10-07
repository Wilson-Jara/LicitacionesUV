import ExportWorker from './exportLicitacionPdf.worker.js?worker'
import { getLicitacionPdfFilename } from './licitacionPdfFilename.js'

const EXPORT_TIMEOUT_MS = 30000

function descargarBlob(buffer, fileName) {
  const blob = new Blob([buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Genera el PDF en un Web Worker para no bloquear el hilo principal (CA6) y
 * descarga el archivo `licitacion-<id>.pdf` cuando el worker lo termina (CA3).
 */
export function exportLicitacionPdf(licitacion) {
  return new Promise((resolve, reject) => {
    let worker
    try {
      worker = new ExportWorker()
    } catch {
      // Respaldo: sin Web Workers, se genera en el hilo principal para no perder la función.
      import('./buildLicitacionPdf.js')
        .then(({ buildLicitacionPdf }) => {
          buildLicitacionPdf(licitacion).save(getLicitacionPdfFilename(licitacion.id))
          resolve()
        })
        .catch(reject)
      return
    }

    const timeout = setTimeout(() => {
      worker.terminate()
      reject(new Error('Tiempo de espera agotado al generar el PDF'))
    }, EXPORT_TIMEOUT_MS)

    worker.onmessage = (event) => {
      const { buffer, fileName, error } = event.data
      clearTimeout(timeout)
      worker.terminate()

      if (error) {
        reject(new Error(error))
        return
      }

      try {
        descargarBlob(buffer, fileName)
        resolve()
      } catch (downloadError) {
        reject(downloadError)
      }
    }

    worker.onerror = (event) => {
      clearTimeout(timeout)
      worker.terminate()
      reject(new Error(event.message || 'Error al generar el PDF'))
    }

    worker.postMessage(licitacion)
  })
}
