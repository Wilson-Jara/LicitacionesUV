import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isLicitacionCerrada } from '../src/features/licitaciones/licitacionUtils.js'

describe('licitacionUtils', () => {
  it('considera vigente la licitación durante su fecha de cierre', () => {
    assert.equal(isLicitacionCerrada('2026-09-30', new Date(2026, 8, 30)), false)
  })

  it('considera cerrada una licitación después de su fecha de cierre', () => {
    assert.equal(isLicitacionCerrada('2026-09-30', new Date(2026, 9, 1)), true)
  })

  it('considera cerrada una licitación con fecha anterior', () => {
    assert.equal(isLicitacionCerrada('2026-09-15', new Date(2026, 8, 23)), true)
  })
})
