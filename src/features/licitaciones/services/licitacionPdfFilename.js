/**
 * Construye un nombre de archivo estable `licitacion-<id>.pdf` a partir del id,
 * sin duplicar el prefijo si ya lo incluye.
 *
 * @param {string} id - Identificador de la licitación.
 * @returns {string} Nombre de archivo del PDF.
 */
export function getLicitacionPdfFilename(id) {
  const identifier = String(id).replace(/^licitacion-/, '')
  return `licitacion-${identifier}.pdf`
}
