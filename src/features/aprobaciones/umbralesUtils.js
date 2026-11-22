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

/**
 * Diccionario con los niveles de autoridad de aprobación permitidos y sus etiquetas legibles.
 * @type {Record<string, string>}
 */
export const NIVELES_APROBADOR = {
  jefe_unidad: 'Jefe de unidad',
  direccion_economica: 'Dirección económica',
  rectoria: 'Rectoría',
}

/**
 * Diccionario con las clasificaciones válidas de unidad organizacional y sus etiquetas.
 * @type {Record<string, string>}
 */
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

function formatMontoExacto(monto) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 2,
  }).format(monto)
}

/**
 * Indica si un umbral guardado tiene montos que no son pesos enteros seguros.
 *
 * Antes de #125 la validación aceptaba decimales; esos registros se siguen
 * leyendo para no perder configuración, pero se marcan para corregirlos.
 *
 * @param {{ montoMinimo: number, montoMaximo: number|null }} umbral - Umbral a revisar.
 * @returns {boolean} `true` si el mínimo o el máximo no es un entero seguro.
 */
export function tieneMontosNoEnteros(umbral) {
  const { montoMinimo, montoMaximo } = umbral ?? {}
  const maximoValido =
    montoMaximo === null || montoMaximo === undefined || Number.isSafeInteger(montoMaximo)
  return !Number.isSafeInteger(montoMinimo) || !maximoValido
}

/**
 * Describe el rango de montos de un umbral en texto legible.
 *
 * Un umbral con decimales guardado antes de #125 se describe con sus montos
 * exactos («desde $0 hasta antes de $0,5»), en lugar de restar un peso al máximo
 * y mostrar un rango imposible como «$0 – $-1».
 *
 * @param {{ montoMinimo: number, montoMaximo: number|null }} umbral - Umbral a describir.
 * @returns {string} Rango legible (ej. `$0 – $10.000.000` o `$50.000.001 o más`).
 */
export function formatRangoUmbral(umbral) {
  const sinTope = umbral.montoMaximo === null || umbral.montoMaximo === undefined
  if (tieneMontosNoEnteros(umbral)) {
    const desde = formatMontoExacto(umbral.montoMinimo)
    return sinTope
      ? `${desde} o más`
      : `desde ${desde} hasta antes de ${formatMontoExacto(umbral.montoMaximo)}`
  }
  const desde = formatUmbralMonto(umbral.montoMinimo)
  if (sinTope) return `${desde} o más`
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

/**
 * Convierte el texto de un campo de monto en pesos chilenos a número.
 *
 * Solo acepta dígitos (con espacios alrededor): rechaza signos, separadores de
 * miles, decimales y notación científica, para que `1.000.000` o `0,5` no se
 * interpreten en silencio como otro monto. La precisión la comprueba
 * `validarUmbral`, que exige enteros seguros.
 *
 * @param {string} texto - Valor escrito en el campo.
 * @returns {number|null} `null` si el campo está vacío, `NaN` si el formato no es
 *   un entero sin signo, o el número leído en otro caso.
 */
export function parseMontoClp(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return null
  const limpio = texto.trim()
  if (!/^\d+$/.test(limpio)) return Number.NaN
  return Number(limpio)
}

/**
 * Comprueba que la unidad elegida siga disponible en la configuración vigente.
 *
 * El formulario conserva la selección en su estado; si la unidad se elimina, la
 * selección no debe apuntar a una unidad que ya no existe ni cambiar en silencio
 * a otra, porque el umbral se guardaría en la unidad equivocada (#125).
 *
 * @param {Array<{ id: string }>} unidades - Unidades configuradas.
 * @param {string} idUnidad - Unidad seleccionada.
 * @returns {string} El mismo `idUnidad` si existe, o `''` para pedir una selección nueva.
 */
export function idUnidadVigente(unidades, idUnidad) {
  if (!Array.isArray(unidades) || typeof idUnidad !== 'string') return ''
  return unidades.some((unidad) => unidad?.id === idUnidad) ? idUnidad : ''
}

/**
 * Indica si dos versiones de un umbral tienen los mismos valores editables.
 *
 * Se usa para detectar que otra pestaña cambió un umbral mientras se editaba:
 * se compara el umbral vigente con la versión que se abrió en el editor (#124).
 *
 * @param {{ montoMinimo: number, montoMaximo: number|null, nivelAprobador: string }} a
 * @param {{ montoMinimo: number, montoMaximo: number|null, nivelAprobador: string }} b
 * @returns {boolean} `true` si mínimo, máximo (vacío equivale a sin tope) y nivel coinciden.
 */
export function mismosValoresUmbral(a, b) {
  if (!a || !b) return false
  return (
    a.montoMinimo === b.montoMinimo &&
    (a.montoMaximo ?? null) === (b.montoMaximo ?? null) &&
    a.nivelAprobador === b.nivelAprobador
  )
}

function seSolapan(a, b) {
  const finA = a.montoMaximo === null ? Infinity : a.montoMaximo
  const finB = b.montoMaximo === null ? Infinity : b.montoMaximo
  return a.montoMinimo < finB && b.montoMinimo < finA
}

/**
 * Valida un umbral contra el resto de los umbrales de su unidad.
 *
 * Verifica que los montos sean pesos enteros representables con precisión
 * (`Number.isSafeInteger`), que sean coherentes (mínimo >= 0, máximo mayor que
 * el mínimo y exclusivo) y que el rango no se solape con otro umbral existente.
 *
 * @param {object} umbral - Candidato con `montoMinimo`, `montoMaximo` y `nivelAprobador`.
 * @param {Array<object>} [otrosUmbrales=[]] - Umbrales de la misma unidad con los
 *   que no debe haber solapamiento. Al editar, se excluye el propio umbral.
 * @returns {Record<string, string>} Errores por campo; objeto vacío si es válido.
 */
export function validarUmbral(umbral, otrosUmbrales = []) {
  const errores = {}
  const { montoMinimo, montoMaximo, nivelAprobador } = umbral ?? {}

  if (!Number.isSafeInteger(montoMinimo) || montoMinimo < 0) {
    errores.montoMinimo =
      'Ingresa un monto mínimo en pesos enteros, igual o mayor que 0 (solo dígitos, sin puntos ni decimales).'
  }

  if (montoMaximo !== null && montoMaximo !== undefined) {
    if (!Number.isSafeInteger(montoMaximo)) {
      errores.montoMaximo =
        'El monto máximo debe ser un entero en pesos (solo dígitos, sin puntos ni decimales) o quedar vacío (sin tope).'
    } else if (Number.isSafeInteger(montoMinimo) && montoMaximo <= montoMinimo) {
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

/**
 * Devuelve el mayor número usado en ids con la forma `<prefijo>-<n>`.
 *
 * @param {Array<string>} ids - Identificadores a revisar.
 * @param {string} prefijo - Prefijo del id (`unidad` o `umbral`).
 * @returns {number} El mayor `n` encontrado, o 0 si no hay ninguno.
 */
export function mayorNumeroDeId(ids, prefijo) {
  let mayor = 0
  for (const id of ids) {
    if (typeof id !== 'string' || !id.startsWith(`${prefijo}-`)) continue
    const numero = Number.parseInt(id.slice(prefijo.length + 1), 10)
    if (Number.isInteger(numero) && numero > mayor) mayor = numero
  }
  return mayor
}

/**
 * Genera un identificador único de umbral a partir de los umbrales existentes.
 *
 * @param {Array<Array<{ id: string }>>} umbralesPorUnidad - Umbrales agrupados por unidad.
 * @param {number} [ultimo=0] - Mayor número ya usado, aunque su umbral se haya
 *   eliminado; así un id no se reutiliza (#124).
 * @returns {string} Identificador nuevo (ej. `umbral-10`).
 */
export function generarIdUmbral(umbralesPorUnidad = [], ultimo = 0) {
  const ids = umbralesPorUnidad.flat().map((umbral) => umbral?.id)
  return `umbral-${Math.max(mayorNumeroDeId(ids, 'umbral'), ultimo) + 1}`
}

/**
 * Genera un identificador único de unidad a partir de las unidades existentes.
 *
 * @param {Array<{ id: string }>} [unidades=[]] - Unidades ya configuradas.
 * @param {number} [ultimo=0] - Mayor número ya usado, aunque su unidad se haya
 *   eliminado; así un id no se reutiliza (#124).
 * @returns {string} Identificador nuevo (ej. `unidad-4`).
 */
export function generarIdUnidad(unidades = [], ultimo = 0) {
  const ids = unidades.map((unidad) => unidad?.id)
  return `unidad-${Math.max(mayorNumeroDeId(ids, 'unidad'), ultimo) + 1}`
}
