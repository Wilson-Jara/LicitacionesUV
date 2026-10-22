import { getLicitacionPdfFilename } from './licitacionPdfFilename.js'

const EXPORT_TIMEOUT_MS = 30000

export function descargarBlob(buffer, fileName) {
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
 * descarga el archivo `licitacion-<id>.pdf` cuando el worker termina (CA3).
 * `crearWorker` se inyecta para poder probar la orquestación sin navegador.
 */
export function exportLicitacionPdfEnWorker(
  licitacion,
  crearWorker,
  { timeoutMs = EXPORT_TIMEOUT_MS } = {},
) {
  return new Promise((resolve, reject) => {
    let worker
    try {
      worker = crearWorker()
    } catch {
      // Sin Web Workers no hay forma de generar fuera del hilo principal (CA6);
      // se rechaza y se muestra el error para no bloquear la interfaz (CA5).
      reject(new Error('La exportación a PDF requiere Web Workers en este navegador.'))
      return
    }

    const timeout = setTimeout(() => {
      worker.terminate()
      reject(new Error('Tiempo de espera agotado al generar el PDF'))
    }, timeoutMs)

    worker.onmessage = (event) => {
      const { buffer, fileName, error } = event.data
      clearTimeout(timeout)
      worker.terminate()

      if (error) {
        console.error('Error al generar el PDF en el worker:', error)
        reject(new Error('Error al generar el PDF'))
        return
      }

      try {
        descargarBlob(buffer, fileName || getLicitacionPdfFilename(licitacion.id))
        resolve()
      } catch (downloadError) {
        reject(downloadError)
      }
    }

    worker.onerror = () => {
      clearTimeout(timeout)
      worker.terminate()
      reject(new Error('Error al generar el PDF'))
    }

    worker.postMessage(licitacion)
  })
}
