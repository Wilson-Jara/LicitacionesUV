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

export function formatLicitacionAmount(amount, currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

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

export function isLicitacionCerrada(closingDate, referenceDate = new Date()) {
  if (typeof closingDate !== 'string' || Number.isNaN(referenceDate.getTime())) return false

  const today = [
    referenceDate.getFullYear(),
    String(referenceDate.getMonth() + 1).padStart(2, '0'),
    String(referenceDate.getDate()).padStart(2, '0'),
  ].join('-')

  return closingDate < today
}

export function getRegionLabel(region) {
  return REGION_NAMES[region] || region
}

export function getTypeLabel(type) {
  return TYPE_NAMES[type] || type
}
