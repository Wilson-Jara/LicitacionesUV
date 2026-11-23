/**
 * Validación del contrato de datos del catálogo de licitaciones (#94).
 *
 * El contrato exige los campos históricos del mock y agrega `sector` (texto
 * opcional; ausente, `undefined` o `null` si no aplica) y `etiquetas` (lista
 * obligatoria de textos; se permite una lista vacía). El mock debe guardar
 * claves normalizadas; los filtros toleran tildes y mayúsculas al recibir
 * parámetros externos.
 */

import { VALID_ETIQUETAS, VALID_SECTORES, normalizarCategoria } from './categorias.js'
import { VALID_REGIONES, VALID_TIPOS } from './licitacionFilters.js'

/** Campos de texto obligatorios en cada licitación. */
export const CAMPOS_TEXTO_REQUERIDOS = [
  'id',
  'title',
  'institution',
  'currency',
  'closingDate',
  'type',
  'region',
  'sourceUrl',
]

function esTextoNoVacio(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function validarFechaIso(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validarUrl(value) {
  if (!esTextoNoVacio(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Valida una licitación contra el contrato de datos.
 *
 * @param {unknown} licitacion - Elemento a validar.
 * @param {number} [indice=0] - Posición usada para identificar el error.
 * @returns {Array<string>} Lista de errores; vacía si la licitación es válida.
 */
export function validarContratoLicitacion(licitacion, indice = 0) {
  const prefijo = `licitación[${indice}]`
  if (!licitacion || typeof licitacion !== 'object' || Array.isArray(licitacion)) {
    return [`${prefijo}: debe ser un objeto.`]
  }

  const errores = []

  for (const campo of CAMPOS_TEXTO_REQUERIDOS) {
    if (!esTextoNoVacio(licitacion[campo])) {
      errores.push(`${prefijo}.${campo}: debe ser texto no vacío.`)
    }
  }

  if (!Number.isFinite(licitacion.amount)) {
    errores.push(`${prefijo}.amount: debe ser un número finito.`)
  }

  if (esTextoNoVacio(licitacion.currency) && !/^[A-Z]{3}$/.test(licitacion.currency)) {
    errores.push(`${prefijo}.currency: debe ser un código ISO de tres letras mayúsculas.`)
  }

  if (esTextoNoVacio(licitacion.closingDate) && !validarFechaIso(licitacion.closingDate)) {
    errores.push(`${prefijo}.closingDate: debe ser una fecha ISO válida (YYYY-MM-DD).`)
  }

  if (esTextoNoVacio(licitacion.type) && !VALID_TIPOS.includes(licitacion.type)) {
    errores.push(`${prefijo}.type: valor no permitido (${licitacion.type}).`)
  }

  if (esTextoNoVacio(licitacion.region) && !VALID_REGIONES.includes(licitacion.region)) {
    errores.push(`${prefijo}.region: valor no permitido (${licitacion.region}).`)
  }

  if (esTextoNoVacio(licitacion.sourceUrl) && !validarUrl(licitacion.sourceUrl)) {
    errores.push(`${prefijo}.sourceUrl: debe ser una URL HTTP(S) válida.`)
  }

  if (licitacion.sector !== undefined && licitacion.sector !== null) {
    const sector = licitacion.sector
    if (!esTextoNoVacio(sector)) {
      errores.push(`${prefijo}.sector: si existe, debe ser texto no vacío.`)
    } else {
      if (normalizarCategoria(sector) !== sector) {
        errores.push(`${prefijo}.sector: debe estar normalizado (minúsculas y sin tildes).`)
      }
      if (!VALID_SECTORES.includes(sector)) {
        errores.push(`${prefijo}.sector: valor fuera del catálogo (${sector}).`)
      }
    }
  }

  if (!Array.isArray(licitacion.etiquetas)) {
    errores.push(`${prefijo}.etiquetas: debe ser una lista de textos.`)
  } else {
    const vistas = new Set()
    licitacion.etiquetas.forEach((etiqueta, posicion) => {
      const ruta = `${prefijo}.etiquetas[${posicion}]`
      if (!esTextoNoVacio(etiqueta)) {
        errores.push(`${ruta}: debe ser texto no vacío.`)
        return
      }
      if (normalizarCategoria(etiqueta) !== etiqueta) {
        errores.push(`${ruta}: debe estar normalizada (minúsculas y sin tildes).`)
      }
      if (!VALID_ETIQUETAS.includes(etiqueta)) {
        errores.push(`${ruta}: valor fuera del catálogo (${etiqueta}).`)
      }
      const clave = normalizarCategoria(etiqueta)
      if (vistas.has(clave)) {
        errores.push(`${ruta}: etiqueta duplicada (${etiqueta}).`)
      }
      vistas.add(clave)
    })
  }

  return errores
}

/**
 * Valida el catálogo completo, incluyendo la unicidad de los identificadores.
 *
 * @param {unknown} licitaciones - Catálogo a validar.
 * @returns {Array<string>} Lista de errores; vacía si todo el catálogo cumple.
 */
export function validarContratoLicitaciones(licitaciones) {
  if (!Array.isArray(licitaciones)) {
    return ['El catálogo debe ser un arreglo de licitaciones.']
  }

  const errores = []
  const ids = new Map()

  licitaciones.forEach((licitacion, indice) => {
    errores.push(...validarContratoLicitacion(licitacion, indice))

    if (esTextoNoVacio(licitacion?.id)) {
      const id = licitacion.id.trim()
      if (ids.has(id)) {
        errores.push(
          `licitación[${indice}].id: identificador duplicado (${licitacion.id}), ya usado en [${ids.get(id)}].`,
        )
      } else {
        ids.set(id, indice)
      }
    }
  })

  return errores
}
