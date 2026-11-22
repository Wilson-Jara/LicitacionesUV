const SESSION_KEY = 'licitacionesuv-sesion-demo'
const PROFILE_KEY_PREFIX = 'licitacionesuv-perfil:'

function readUser(browser, storageName, key) {
  try {
    const user = JSON.parse(browser[storageName].getItem(key))
    if (
      typeof user?.name === 'string' &&
      user.name &&
      typeof user.email === 'string' &&
      user.email
    ) {
      return { name: user.name, email: user.email }
    }
  } catch {
    // El almacenamiento puede estar bloqueado o contener datos corruptos.
  }
  return null
}

function writeUser(browser, storageName, key, user) {
  try {
    browser[storageName].setItem(key, JSON.stringify(user))
    return true
  } catch {
    return false
  }
}

function withProfile(user, browser) {
  const profile = readUser(browser, 'localStorage', PROFILE_KEY_PREFIX + user.email)
  return { ...user, name: profile?.name ?? user.name, contactEmail: profile?.email ?? user.email }
}

export function restoreDemoSession(browser = globalThis.window) {
  const user = readUser(browser, 'sessionStorage', SESSION_KEY)
  return user ? withProfile(user, browser) : null
}

export function startDemoSession(user, browser = globalThis.window) {
  writeUser(browser, 'sessionStorage', SESSION_KEY, { name: user.name, email: user.email })
  return withProfile(user, browser)
}

export function endDemoSession(browser = globalThis.window) {
  try {
    browser.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // La sesión en memoria se cierra aunque el almacenamiento esté bloqueado.
  }
}

export function saveProfile(accountEmail, profile, browser = globalThis.window) {
  return writeUser(browser, 'localStorage', PROFILE_KEY_PREFIX + accountEmail, profile)
}
