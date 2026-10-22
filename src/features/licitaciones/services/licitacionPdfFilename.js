export function getLicitacionPdfFilename(id) {
  const identifier = String(id).replace(/^licitacion-/, '')
  return `licitacion-${identifier}.pdf`
}
