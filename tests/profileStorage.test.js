import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  endDemoSession,
  restoreDemoSession,
  saveProfile,
  startDemoSession,
} from '../src/features/auth/data/profileStorage.js'
import { getUserId } from '../src/features/favoritos/data/favoritosStorage.js'

function createStorage() {
  const entries = new Map()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  }
}

function createBrowser() {
  return { localStorage: createStorage(), sessionStorage: createStorage() }
}

const account = { name: 'Cuenta de prueba', email: 'demo@ejemplo.cl' }
const edited = { name: 'Nombre editado', email: 'contacto@ejemplo.cl' }

describe('perfil y sesión simulada', () => {
  it('recupera el perfil al recargar y conserva la clave de favoritos anterior', () => {
    const browser = createBrowser()
    assert.equal(restoreDemoSession(browser), null)
    assert.deepEqual(startDemoSession(account, browser), {
      ...account,
      contactEmail: account.email,
    })
    assert.equal(saveProfile(account.email, edited, browser), true)

    const restored = restoreDemoSession(browser)
    assert.deepEqual(restored, { ...account, name: edited.name, contactEmail: edited.email })
    assert.equal(getUserId(restored), getUserId(account))
  })

  it('separa los perfiles de las cuentas y conserva los cambios al volver a entrar', () => {
    const browser = createBrowser()
    startDemoSession(account, browser)
    saveProfile(account.email, edited, browser)
    endDemoSession(browser)
    assert.equal(restoreDemoSession(browser), null)

    const other = { name: 'Otra cuenta', email: 'otra@ejemplo.cl' }
    assert.deepEqual(startDemoSession(other, browser), { ...other, contactEmail: other.email })
    assert.deepEqual(startDemoSession(account, browser), {
      ...account,
      name: edited.name,
      contactEmail: edited.email,
    })
  })

  it('usa los datos de acceso si el perfil es ilegible y reporta errores al guardar', () => {
    const browser = createBrowser()
    browser.localStorage.getItem = () => '{'
    browser.localStorage.setItem = () => {
      throw new Error('Almacenamiento lleno')
    }

    assert.deepEqual(startDemoSession(account, browser), {
      ...account,
      contactEmail: account.email,
    })
    assert.equal(saveProfile(account.email, edited, browser), false)
    assert.deepEqual(restoreDemoSession(browser), { ...account, contactEmail: account.email })
  })
})
