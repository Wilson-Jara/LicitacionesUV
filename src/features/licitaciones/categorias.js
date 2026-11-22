/**
 * Catálogo de sectores y etiquetas usado por el explorador de licitaciones (#94).
 *
 * Las claves se guardan normalizadas (minúsculas, sin tildes y sin espacios
 * externos) para que la comparación sea exacta y estable. Las etiquetas son
 * solo la representación legible para la interfaz.
 */

/** Sectores disponibles en el catálogo de demostración. */
export const SECTORES = {
  finanzas: 'Finanzas',
  infraestructura: 'Infraestructura',
  tecnologia: 'Tecnología',
}

/** Etiquetas disponibles en el catálogo de demostración. */
export const ETIQUETAS = {
  auditoria: 'Auditoría',
  consultoria: 'Consultoría',
  desarrollo: 'Desarrollo',
  equipamiento: 'Equipamiento',
  finanzas: 'Finanzas',
  hardware: 'Hardware',
  instalaciones: 'Instalaciones',
  licencias: 'Licencias',
  mantenimiento: 'Mantenimiento',
  'seguridad-informatica': 'Seguridad informática',
  software: 'Software',
}

/** Claves de sector aceptadas por el contrato y los filtros. */
export const VALID_SECTORES = Object.keys(SECTORES)

/** Claves de etiqueta aceptadas por el contrato y los filtros. */
export const VALID_ETIQUETAS = Object.keys(ETIQUETAS)

/**
 * Normaliza un valor de sector o etiqueta para compararlo sin distinguir
 * mayúsculas, tildes ni espacios externos.
 *
 * @param {unknown} value - Valor a normalizar.
 * @returns {string} Clave normalizada, o cadena vacía si el valor no es texto.
 */
export function normalizarCategoria(value) {
  if (typeof value !== 'string') return ''

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Obtiene la etiqueta legible de un sector.
 *
 * @param {string} sector - Clave interna del sector (ej. `tecnologia`).
 * @returns {string} Etiqueta conocida (ej. `Tecnología`) o la clave original.
 */
export function getSectorLabel(sector) {
  return SECTORES[sector] || sector
}

/**
 * Obtiene la etiqueta legible de una etiqueta.
 *
 * @param {string} etiqueta - Clave interna de la etiqueta (ej. `software`).
 * @returns {string} Etiqueta conocida (ej. `Software`) o la clave original.
 */
export function getEtiquetaLabel(etiqueta) {
  return ETIQUETAS[etiqueta] || etiqueta
}
