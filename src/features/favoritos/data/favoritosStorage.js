/** Clave que separa los favoritos persistidos de otros datos de `localStorage`. */
export const FAVORITOS_STORAGE_KEY = 'licitacionesuv-favoritos'

/**
 * Obtiene la clave con la que se agrupan los favoritos de un usuario.
 * Prefiere el correo y usa el nombre cuando no hay correo disponible.
 *
 * @param {object|null} user - Usuario de la sesión, si existe.
 * @returns {string|null} Identificador del usuario o `null` si no puede identificarse.
 */
export function getUserId(user) {
  return user ? user.email || user.name || null : null
}

function normalizeFavorito(favorito) {
  if (!favorito || typeof favorito !== 'object') return null
  const { idLicitacion, fechaGuardado } = favorito
  if (typeof idLicitacion !== 'string' || idLicitacion.trim() === '') return null
  return {
    idLicitacion,
    fechaGuardado: typeof fechaGuardado === 'string' ? fechaGuardado : null,
  }
}

function normalizeFavoritos(lista) {
  if (!Array.isArray(lista)) return []
  const vistos = new Set()
  const normalizados = []
  for (const favorito of lista) {
    const normalizado = normalizeFavorito(favorito)
    if (!normalizado || vistos.has(normalizado.idLicitacion)) continue
    vistos.add(normalizado.idLicitacion)
    normalizados.push(normalizado)
  }
  return normalizados
}

/**
 * Recupera los favoritos por usuario y normaliza entradas inválidas o repetidas.
 * Si el almacenamiento no está disponible o contiene datos corruptos, parte con un almacén vacío.
 *
 * @param {Storage|null} storage - Almacenamiento local disponible en el navegador.
 * @returns {Record<string, Array<object>>} Favoritos normalizados, agrupados por usuario.
 */
export function readFavoritosStore(storage) {
  if (!storage) return {}
  try {
    const raw = storage.getItem(FAVORITOS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const store = {}
    for (const [userId, lista] of Object.entries(parsed)) {
      if (!userId) continue
      store[userId] = normalizeFavoritos(lista)
    }
    return store
  } catch {
    // localStorage bloqueado o corrupto: se parte sin favoritos
    return {}
  }
}

/**
 * Persiste los favoritos por usuario cuando `localStorage` está disponible.
 * Si la escritura falla, el estado de favoritos permanece en memoria durante la sesión.
 *
 * @param {Storage|null} storage - Almacenamiento local disponible en el navegador.
 * @param {Record<string, Array<object>>} store - Favoritos agrupados por usuario.
 * @returns {void}
 */
export function writeFavoritosStore(storage, store) {
  if (!storage) return
  try {
    storage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // sin persistencia disponible, los favoritos solo viven en memoria
  }
}

/**
 * Consulta únicamente los favoritos del usuario indicado.
 *
 * @param {Record<string, Array<object>>} store - Favoritos agrupados por usuario.
 * @param {string|null} userId - Identificador del usuario actual.
 * @returns {Array<object>} Favoritos del usuario, o una lista vacía si no hay sesión o registros.
 */
export function getFavoritos(store, userId) {
  return userId ? (store[userId] ?? []) : []
}

/**
 * Agrega una licitación a los favoritos de un usuario sin duplicarla.
 * Conserva el almacén original si falta un identificador o la licitación ya estaba guardada.
 *
 * @param {Record<string, Array<object>>} store - Favoritos agrupados por usuario.
 * @param {string|null} userId - Identificador del usuario que guarda la licitación.
 * @param {string} idLicitacion - Identificador de la licitación.
 * @param {string} fechaGuardado - Fecha de guardado en formato ISO.
 * @returns {Record<string, Array<object>>} Almacén actualizado, o el original si no hubo cambios.
 */
export function addFavorito(store, userId, idLicitacion, fechaGuardado) {
  if (!userId || !idLicitacion) return store
  const actuales = store[userId] ?? []
  if (actuales.some((f) => f.idLicitacion === idLicitacion)) return store
  return {
    ...store,
    [userId]: [...actuales, { idLicitacion, fechaGuardado }],
  }
}

/**
 * Quita una licitación de los favoritos del usuario indicado sin afectar a otros usuarios.
 * Si no hay usuario identificado, conserva el almacén original.
 *
 * @param {Record<string, Array<object>>} store - Favoritos agrupados por usuario.
 * @param {string|null} userId - Identificador del usuario actual.
 * @param {string} idLicitacion - Identificador de la licitación que se quita.
 * @returns {Record<string, Array<object>>} Almacén con los favoritos restantes.
 */
export function removeFavorito(store, userId, idLicitacion) {
  if (!userId) return store
  const actuales = store[userId] ?? []
  return {
    ...store,
    [userId]: actuales.filter((f) => f.idLicitacion !== idLicitacion),
  }
}
