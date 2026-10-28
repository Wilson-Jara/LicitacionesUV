/**
 * Utilidades puras para el panel de estadísticas de licitaciones (HU #95).
 *
 * CA1: distribuciones por región, por tipo (pública/privada) y por sector/etiqueta.
 * Si una licitación tuviera múltiples etiquetas, se contaría en cada una; en este
 * mock no existen tags, así que cada licitación se asigna a una única categoría.
 * Las categorías sin registros no se inventan.
 */

import { filterLicitaciones } from '../licitaciones/licitacionFilters.js'

export const VALID_REGIONES_LABEL = {
  valparaiso: 'Valparaíso',
  metropolitana: 'Metropolitana',
  biobio: 'Biobío',
  antofagasta: 'Antofagasta',
}

export const VALID_TIPOS_LABEL = {
  publica: 'Pública',
  privada: 'Privada',
}

function normalizarTexto(valor) {
  if (typeof valor !== 'string') return ''
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Deriva el sector desde la institución cuando no existe un campo explícito.
 * Regla acordada para el mock actual: una categoría por licitación.
 *
 * @param {object} licitacion
 * @returns {'universidad'|'municipalidad'|'ministerio'|'banco'|'empresa'|'otro'}
 */
export function derivarSector(licitacion) {
  const institucion = normalizarTexto(licitacion?.institution)
  if (!institucion) return 'otro'

  if (institucion.includes('universidad')) return 'universidad'
  if (institucion.includes('municipalidad') || institucion.includes('municipio'))
    return 'municipalidad'
  if (institucion.includes('ministerio') || institucion.includes('gobierno')) return 'ministerio'
  if (institucion.includes('banco')) return 'banco'
  if (institucion.includes('empresa') || institucion.includes('corporacion')) return 'empresa'

  return 'otro'
}

export const SECTOR_LABEL = {
  universidad: 'Universidad',
  municipalidad: 'Municipalidad',
  ministerio: 'Ministerio',
  banco: 'Banco',
  empresa: 'Empresa',
  otro: 'Otro',
}

function contarPorClave(lista, _obtenerClave, etiquetaPorClave) {
  const contador = new Map()

  for (const item of lista) {
    if (!Array.isArray(item)) continue
    const clave = item[1]
    if (!clave) continue
    contador.set(clave, (contador.get(clave) || 0) + 1)
  }

  const resultado = []
  for (const [clave, cantidad] of contador.entries()) {
    resultado.push({
      clave,
      etiqueta: etiquetaPorClave?.[clave] || clave,
      cantidad,
    })
  }

  resultado.sort((a, b) => {
    if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad
    return a.etiqueta.localeCompare(b.etiqueta)
  })

  return resultado
}

function agrupar(lista, obtenerClave) {
  const grupos = []
  for (const licitacion of lista) {
    if (!licitacion || typeof licitacion !== 'object') continue
    const clave = obtenerClave(licitacion)
    if (!clave) continue
    grupos.push([licitacion, clave])
  }
  return grupos
}

/**
 * Calcula las tres distribuciones para el conjunto de licitaciones.
 * Solo cuenta licitaciones válidas y no inventa categorías sin registros.
 *
 * @param {Array<object>} [licitaciones=[]]
 * @returns {{porRegion: Array, porTipo: Array, porSector: Array}}
 */
export function calcularDistribuciones(licitaciones = []) {
  if (!Array.isArray(licitaciones)) {
    return { porRegion: [], porTipo: [], porSector: [] }
  }

  const vigentes = licitaciones.filter((l) => l && typeof l === 'object')

  const porRegion = contarPorClave(
    agrupar(vigentes, (l) => l.region),
    null,
    VALID_REGIONES_LABEL,
  )
  // Normalizar etiquetas de región conocidas
  for (const item of porRegion) {
    if (VALID_REGIONES_LABEL[item.clave]) {
      item.etiqueta = VALID_REGIONES_LABEL[item.clave]
    }
  }

  const porTipo = contarPorClave(
    agrupar(vigentes, (l) => l.type),
    null,
    VALID_TIPOS_LABEL,
  )
  for (const item of porTipo) {
    if (VALID_TIPOS_LABEL[item.clave]) {
      item.etiqueta = VALID_TIPOS_LABEL[item.clave]
    }
  }

  const porSector = contarPorClave(
    agrupar(vigentes, (l) => derivarSector(l)),
    null,
    SECTOR_LABEL,
  )

  return { porRegion, porTipo, porSector }
}

/**
 * Obtiene las licitaciones filtradas según los filtros del explorador.
 * Reutiliza la lógica existente para garantizar coherencia (CA2).
 *
 * @param {Array<object>} licitaciones
 * @param {{keyword?: string, region?: string, tipo?: string, sort?: string}} filters
 * @returns {Array<object>}
 */
export function obtenerLicitacionesFiltradas(licitaciones, filters) {
  return filterLicitaciones(licitaciones, filters)
}

/**
 * Genera una alternativa textual accesible para una distribución (CA3).
 * Incluye dimensión, categorías y valores.
 *
 * @param {string} dimension
 * @param {Array<{etiqueta: string, cantidad: number}>} datos
 * @returns {string}
 */
export function generarAlternativaTextual(dimension, datos = []) {
  if (!Array.isArray(datos) || datos.length === 0) {
    return `Distribución por ${dimension}: sin datos disponibles.`
  }

  const total = datos.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0)
  const partes = datos.map((item) => `${item.etiqueta}: ${item.cantidad}`).join('; ')

  return `Distribución por ${dimension}, total ${total}. ${partes}.`
}

/**
 * Formatea un número como entero (conteo de licitaciones).
 *
 * @param {number} valor
 * @returns {string}
 */
export function formatearConteo(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return '0'
  return Math.trunc(numero).toLocaleString('es-CL')
}
