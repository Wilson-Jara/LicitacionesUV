const REGION_NAMES = {
  valparaiso: 'Valparaíso',
  metropolitana: 'Metropolitana',
  biobio: 'Biobío',
  antofagasta: 'Antofagasta',
}

const TYPE_NAMES = {
  publica: 'Licitación pública',
  privada: 'Licitación privada',
}

/**
 * Formatea un monto como moneda local de Chile (CLP por defecto), sin decimales.
 *
 * @param {number} amount - Monto a formatear. Debe ser un número finito.
 * @param {string} [currency='CLP'] - Código ISO 4217 de la moneda a mostrar.
 * @returns {string} Representación del monto con símbolo de moneda según la
 *   configuración regional `es-CL`. Ejemplo: `$1.234.567`.
 * @throws {RangeError} Si `currency` no es un código de moneda válido para `Intl.NumberFormat`.
 */
export function formatLicitacionAmount(amount, currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea una fecha de cierre como texto legible en español de Chile.
 *
 * @param {string} closingDate - Fecha en formato ISO `YYYY-MM-DD`. Un valor nulo
 *   o vacío produce el texto estándar de ausencia; un valor no parseable se
 *   devuelve sin transformar.
 * @returns {string} Fecha larga en `es-CL` (ej. `30 de septiembre de 2026`),
 *   la cadena original si no es parseable como fecha, o `Fecha no disponible`
 *   si no se entrega valor.
 */
export function formatLicitacionDate(closingDate) {
  if (!closingDate) return 'Fecha no disponible'

  const date = new Date(`${closingDate}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return closingDate

  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatDateAsIso(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Determina si una licitación ya cerró, comparando su fecha de cierre con una
 * fecha de referencia. La licitación se considera vigente durante su propio día
 * de cierre y cerrada a partir del día siguiente.
 *
 * @param {string} closingDate - Fecha de cierre en formato ISO `YYYY-MM-DD`.
 * @param {Date} [referenceDate=new Date()] - Fecha contra la que se compara la
 *   fecha de cierre. Se interpreta en hora local.
 * @returns {boolean} `true` si la fecha de cierre es anterior al día de la fecha
 *   de referencia; `false` si sigue vigente o si `closingDate` no es una cadena
 *   o `referenceDate` es una fecha inválida.
 */
export function isLicitacionCerrada(closingDate, referenceDate = new Date()) {
  if (typeof closingDate !== 'string') return false
  if (Number.isNaN(referenceDate.getTime())) return false

  return closingDate < formatDateAsIso(referenceDate)
}

/**
 * Resuelve la etiqueta legible en español para una clave interna de región.
 *
 * @param {string} region - Clave interna de región (ej. `valparaiso`).
 * @returns {string} Etiqueta conocida de la región (ej. `Valparaíso`) o la
 *   clave original sin modificar si no está registrada en el catálogo.
 */
export function getRegionLabel(region) {
  return REGION_NAMES[region] || region
}

/**
 * Resuelve la etiqueta legible en español para una clave interna de modalidad.
 *
 * @param {string} type - Clave interna de modalidad de licitación (ej. `publica`).
 * @returns {string} Etiqueta conocida de la modalidad (ej. `Licitación pública`)
 *   o la clave original sin modificar si no está registrada en el catálogo.
 */
export function getTypeLabel(type) {
  return TYPE_NAMES[type] || type
}
