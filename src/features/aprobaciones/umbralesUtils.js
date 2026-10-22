/**
 * Lógica pura de la configuración de umbrales de aprobación (US-10, CR-302).
 *
 * Los umbrales son datos configurables (regla R4 / REF-14): viven en la
 * configuración editable y nunca como constantes del código. Este módulo no
 * depende de React ni del navegador, de modo que puede probarse de forma aislada.
 *
 * El rango de cada umbral es `[montoMinimo, montoMaximo)`: el mínimo es
 * inclusivo y el máximo es exclusivo. Un `montoMaximo` nulo significa «sin tope».
 */

export const NIVELES_APROBADOR = {
  jefe_unidad: 'Jefe de unidad',
  direccion_economica: 'Dirección económica',
  rectoria: 'Rectoría',
}

export const TIPOS_UNIDAD = {
  facultad: 'Facultad',
  direccion: 'Dirección',
  rectoria: 'Rectoría',
}

/**
 * Devuelve la etiqueta legible de un nivel aprobador.
 *
 * @param {string} nivel - Clave interna del nivel (ej. `jefe_unidad`).
 * @returns {string} Etiqueta conocida del nivel o la clave original sin modificar.
 */
export function getNivelAprobadorLabel(nivel) {
  return NIVELES_APROBADOR[nivel] || nivel
}

/**
 * Devuelve la etiqueta legible de un tipo de unidad.
 *
 * @param {string} tipo - Clave interna del tipo (ej. `facultad`).
 * @returns {string} Etiqueta conocida del tipo o la clave original sin modificar.
 */
export function getTipoUnidadLabel(tipo) {
  return TIPOS_UNIDAD[tipo] || tipo
}

/**
 * Formatea un monto en pesos chilenos, sin decimales (formato local es-CL).
 *
 * @param {number} monto - Monto a formatear.
 * @returns {string} Monto formateado (ej. `$10.000.000`).
 */
export function formatUmbralMonto(monto) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto)
}

/**
 * Describe el rango de montos de un umbral en texto legible.
 *
 * @param {{ montoMinimo: number, montoMaximo: number|null }} umbral - Umbral a describir.
 * @returns {string} Rango legible (ej. `$0 – $10.000.000` o `$50.000.001 o más`).
 */
export function formatRangoUmbral(umbral) {
  const desde = formatUmbralMonto(umbral.montoMinimo)
  if (umbral.montoMaximo === null || umbral.montoMaximo === undefined) {
    return `${desde} o más`
  }
  return `${desde} – ${formatUmbralMonto(umbral.montoMaximo - 1)}`
}

/**
 * Formatea la marca de tiempo del último cambio de configuración.
 *
 * @param {string|null} actualizadoEn - Marca de tiempo ISO o `null` si no hay cambios.
 * @returns {string} Fecha y hora legible (ej. `18-10-2026, 15:04`), `sin cambios registrados`
 *   cuando no hay marca, o la marca original si no es parseable.
 */
export function formatUmbralTimestamp(actualizadoEn) {
  if (!actualizadoEn) return 'sin cambios registrados'
  const fecha = new Date(actualizadoEn)
  if (Number.isNaN(fecha.getTime())) return actualizadoEn
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha)
}

function seSolapan(a, b) {
  const finA = a.montoMaximo === null ? Infinity : a.montoMaximo
  const finB = b.montoMaximo === null ? Infinity : b.montoMaximo
  return a.montoMinimo < finB && b.montoMinimo < finA
}

/**
 * Valida un umbral contra el resto de los umbrales de su unidad.
 *
 * Verifica que los montos sean coherentes (mínimo >= 0, máximo mayor que el
 * mínimo y exclusivo) y que el rango no se solape con otro umbral existente.
 *
 * @param {object} umbral - Candidato con `montoMinimo`, `montoMaximo` y `nivelAprobador`.
 * @param {Array<object>} [otrosUmbrales=[]] - Umbrales de la misma unidad con los
 *   que no debe haber solapamiento. Al editar, se excluye el propio umbral.
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válido.
 */
export function validarUmbral(umbral, otrosUmbrales = []) {
  const errores = {}
  const { montoMinimo, montoMaximo, nivelAprobador } = umbral ?? {}

  if (!Number.isFinite(montoMinimo) || montoMinimo < 0) {
    errores.montoMinimo = 'Ingresa un monto mínimo igual o mayor que 0.'
  }

  if (montoMaximo !== null && montoMaximo !== undefined) {
    if (!Number.isFinite(montoMaximo)) {
      errores.montoMaximo = 'El monto máximo debe ser un número o quedar vacío (sin tope).'
    } else if (Number.isFinite(montoMinimo) && montoMaximo <= montoMinimo) {
      errores.montoMaximo =
        'El monto máximo debe ser mayor que el mínimo (el máximo no se incluye).'
    }
  }

  if (!NIVELES_APROBADOR[nivelAprobador]) {
    errores.nivelAprobador = 'Selecciona un nivel aprobador válido.'
  }

  const solapa = otrosUmbrales.some((otro) => seSolapan(umbral, otro))
  if (!errores.montoMinimo && !errores.montoMaximo && solapa) {
    errores.montoMinimo = 'El rango se solapa con otro umbral ya configurado para la unidad.'
  }

  return errores
}

/**
 * Indica si una lista de errores de validación está vacía.
 *
 * @param {Record<string, string>} errores - Errores devueltos por `validarUmbral`.
 * @returns {boolean} `true` si no hay errores.
 */
export function esValido(errores) {
  return Object.keys(errores).length === 0
}

/**
 * Valida los datos de una unidad antes de crearla.
 *
 * @param {{ nombre?: string, tipo?: string }} unidad - Datos de la unidad.
 * @param {Array<{ nombre: string }>} [unidadesExistentes=[]] - Unidades ya configuradas.
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válida.
 */
export function validarUnidad(unidad, unidadesExistentes = []) {
  const errores = {}
  const nombre = typeof unidad?.nombre === 'string' ? unidad.nombre.trim() : ''

  if (nombre === '') {
    errores.nombre = 'Ingresa el nombre de la unidad.'
  } else {
    const duplicada = unidadesExistentes.some(
      (existente) => existente.nombre.toLowerCase() === nombre.toLowerCase(),
    )
    if (duplicada) errores.nombre = 'Ya existe una unidad con ese nombre.'
  }

  if (!TIPOS_UNIDAD[unidad?.tipo]) {
    errores.tipo = 'Selecciona un tipo de unidad válido.'
  }

  return errores
}

/**
 * Busca el umbral que corresponde a un monto dentro de una unidad.
 *
 * @param {Array<object>} umbrales - Umbrales configurados para la unidad.
 * @param {number} monto - Monto a clasificar.
 * @returns {object|null} El umbral que contiene el monto, o `null` si ninguno aplica.
 */
export function buscarUmbralParaMonto(umbrales, monto) {
  if (!Number.isFinite(monto) || !Array.isArray(umbrales)) return null
  const aplicable = umbrales.find((umbral) => {
    const sinTope = umbral.montoMaximo === null || umbral.montoMaximo === undefined
    return monto >= umbral.montoMinimo && (sinTope || monto < umbral.montoMaximo)
  })
  return aplicable ?? null
}

/**
 * Resuelve el nivel aprobador requerido para un monto en una unidad.
 *
 * @param {Array<object>} umbrales - Umbrales configurados para la unidad.
 * @param {number} monto - Monto a clasificar.
 * @returns {string|null} Clave del nivel aprobador, o `null` si no hay umbral aplicable.
 */
export function resolverNivelAprobador(umbrales, monto) {
  const umbral = buscarUmbralParaMonto(umbrales, monto)
  return umbral ? umbral.nivelAprobador : null
}

function siguienteNumero(ids, prefijo) {
  let mayor = 0
  for (const id of ids) {
    if (typeof id !== 'string' || !id.startsWith(`${prefijo}-`)) continue
    const numero = Number.parseInt(id.slice(prefijo.length + 1), 10)
    if (Number.isInteger(numero) && numero > mayor) mayor = numero
  }
  return mayor + 1
}

/**
 * Genera un identificador único de umbral a partir de los umbrales existentes.
 *
 * @param {Array<Array<{ id: string }>>} umbralesPorUnidad - Umbrales agrupados por unidad.
 * @returns {string} Identificador nuevo (ej. `umbral-10`).
 */
export function generarIdUmbral(umbralesPorUnidad = []) {
  const ids = umbralesPorUnidad.flat().map((umbral) => umbral?.id)
  return `umbral-${siguienteNumero(ids, 'umbral')}`
}

/**
 * Genera un identificador único de unidad a partir de las unidades existentes.
 *
 * @param {Array<{ id: string }>} [unidades=[]] - Unidades ya configuradas.
 * @returns {string} Identificador nuevo (ej. `unidad-4`).
 */
export function generarIdUnidad(unidades = []) {
  return `unidad-${siguienteNumero(
    unidades.map((unidad) => unidad?.id),
    'unidad',
  )}`
}
