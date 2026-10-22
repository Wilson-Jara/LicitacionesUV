export const FAVORITOS_STORAGE_KEY = 'licitacionesuv-favoritos'

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
