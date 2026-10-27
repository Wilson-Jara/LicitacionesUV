import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
  isLicitacionCerrada,
} from '../src/features/licitaciones/licitacionUtils.js'

describe('licitacionUtils', () => {
  describe('isLicitacionCerrada', () => {
    it('considera vigente la licitación el día anterior a su cierre', () => {
      assert.equal(isLicitacionCerrada('2026-09-30', new Date(2026, 8, 29)), false)
    })

    it('considera vigente la licitación durante su fecha de cierre', () => {
      assert.equal(isLicitacionCerrada('2026-09-30', new Date(2026, 8, 30)), false)
    })

    it('considera cerrada una licitación después de su fecha de cierre', () => {
      assert.equal(isLicitacionCerrada('2026-09-30', new Date(2026, 9, 1)), true)
    })

    it('considera cerrada una licitación con fecha anterior', () => {
      assert.equal(isLicitacionCerrada('2026-09-15', new Date(2026, 8, 23)), true)
    })

    it('no marca como cerrada una licitación sin fecha de cierre en texto', () => {
      assert.equal(isLicitacionCerrada(null, new Date(2026, 8, 30)), false)
      assert.equal(isLicitacionCerrada(20260930, new Date(2026, 8, 30)), false)
    })

    it('no marca como cerrada una licitación si la fecha de referencia es inválida', () => {
      assert.equal(isLicitacionCerrada('2026-09-30', new Date('fecha-invalida')), false)
    })
  })

  describe('formatLicitacionAmount', () => {
    it('formatea un monto en pesos chilenos con separador de miles', () => {
      assert.equal(formatLicitacionAmount(8700000, 'CLP'), '$8.700.000')
    })

    it('usa CLP cuando no se indica la moneda', () => {
      assert.equal(formatLicitacionAmount(8700000), '$8.700.000')
    })

    it('formatea el monto cero como $0', () => {
      assert.equal(formatLicitacionAmount(0, 'CLP'), '$0')
    })

    it('redondea los decimales porque no muestra fracciones', () => {
      assert.equal(formatLicitacionAmount(1234.6, 'CLP'), '$1.235')
    })

    it('muestra el monto en otra moneda válida sin usar el símbolo de CLP', () => {
      const resultado = formatLicitacionAmount(1500, 'USD')
      assert.match(resultado, /1\.500/)
      assert.notEqual(resultado, '$1.500')
    })

    it('rechaza un código de moneda inválido con RangeError', () => {
      assert.throws(() => formatLicitacionAmount(1000, 'PESOS'), RangeError)
    })
  })

  describe('formatLicitacionDate', () => {
    it('formatea una fecha ISO como texto largo en español de Chile', () => {
      assert.equal(formatLicitacionDate('2026-09-30'), '30 de septiembre de 2026')
    })

    it('conserva el primer día del año sin correrse al año anterior', () => {
      assert.equal(formatLicitacionDate('2026-01-01'), '1 de enero de 2026')
    })

    it('muestra "Fecha no disponible" cuando no hay fecha', () => {
      assert.equal(formatLicitacionDate(null), 'Fecha no disponible')
      assert.equal(formatLicitacionDate(undefined), 'Fecha no disponible')
      assert.equal(formatLicitacionDate(''), 'Fecha no disponible')
    })

    it('devuelve el texto original cuando la fecha no se puede interpretar', () => {
      assert.equal(formatLicitacionDate('no-es-fecha'), 'no-es-fecha')
    })
  })

  describe('getRegionLabel', () => {
    it('traduce una clave de región conocida a su nombre con tildes', () => {
      assert.equal(getRegionLabel('valparaiso'), 'Valparaíso')
      assert.equal(getRegionLabel('biobio'), 'Biobío')
    })

    it('devuelve la clave sin cambios si la región no está registrada', () => {
      assert.equal(getRegionLabel('atacama'), 'atacama')
    })
  })

  describe('getTypeLabel', () => {
    it('traduce el tipo de licitación a su etiqueta legible', () => {
      assert.equal(getTypeLabel('publica'), 'Licitación pública')
      assert.equal(getTypeLabel('privada'), 'Licitación privada')
    })

    it('devuelve la clave sin cambios si el tipo no está registrado', () => {
      assert.equal(getTypeLabel('mixta'), 'mixta')
    })
  })
})
