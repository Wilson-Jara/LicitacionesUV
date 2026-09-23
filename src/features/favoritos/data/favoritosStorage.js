export const FAVORITOS_STORAGE_KEY = 'licitacionesuv-favoritos'

export function getUserId(user) {
  return user ? user.email || user.name || null : null
}

export function readFavoritosStore(storage) {
  if (!storage) return {}
  try {
    const raw = storage.getItem(FAVORITOS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    // localStorage bloqueado o corrupto: se parte sin favoritos
    return {}
  }
}

export function writeFavoritosStore(storage, store) {
  if (!storage) return
  try {
    storage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // sin persistencia disponible, los favoritos solo viven en memoria
  }
}

export function getFavoritos(store, userId) {
  return userId ? (store[userId] ?? []) : []
}

export function addFavorito(store, userId, idLicitacion, fechaGuardado) {
  if (!userId || !idLicitacion) return store
  const actuales = store[userId] ?? []
  if (actuales.some((f) => f.idLicitacion === idLicitacion)) return store
  return {
    ...store,
    [userId]: [...actuales, { idLicitacion, fechaGuardado }],
  }
}

export function removeFavorito(store, userId, idLicitacion) {
  if (!userId) return store
  const actuales = store[userId] ?? []
  return {
    ...store,
    [userId]: actuales.filter((f) => f.idLicitacion !== idLicitacion),
  }
}
