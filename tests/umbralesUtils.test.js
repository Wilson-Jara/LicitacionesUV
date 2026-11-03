import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  NIVELES_APROBADOR,
  buscarUmbralParaMonto,
  esValido,
  formatRangoUmbral,
  formatUmbralMonto,
  formatUmbralTimestamp,
  generarIdUmbral,
  generarIdUnidad,
  getNivelAprobadorLabel,
  getTipoUnidadLabel,
  resolverNivelAprobador,
  validarUmbral,
  validarUnidad,
} from '../src/features/aprobaciones/umbralesUtils.js'

const UMBRAL_JEFE = { montoMinimo: 0, montoMaximo: 10000001, nivelAprobador: 'jefe_unidad' }
const UMBRAL_DIRECCION = {
  montoMinimo: 10000001,
  montoMaximo: 50000001,
  nivelAprobador: 'direccion_economica',
}
const UMBRAL_SIN_TOPE = { montoMinimo: 50000001, montoMaximo: null, nivelAprobador: 'rectoria' }

describe('umbralesUtils · etiquetas', () => {
  it('traduce niveles y tipos conocidos, y conserva claves desconocidas', () => {
    assert.equal(getNivelAprobadorLabel('rectoria'), NIVELES_APROBADOR.rectoria)
    assert.equal(getNivelAprobadorLabel('otro'), 'otro')
    assert.equal(getTipoUnidadLabel('facultad'), 'Facultad')
    assert.equal(getTipoUnidadLabel('otro'), 'otro')
  })
})

describe('umbralesUtils · formato', () => {
  it('formatea montos en CLP sin decimales', () => {
    assert.equal(formatUmbralMonto(10000000).replace(/[^\d]/g, ''), '10000000')
    assert.equal(formatUmbralMonto(0).startsWith('$'), true)
  })

  it('describe el rango con máximo exclusivo y el caso sin tope', () => {
    assert.equal(
      formatRangoUmbral(UMBRAL_JEFE),
      `${formatUmbralMonto(0)} – ${formatUmbralMonto(10000000)}`,
    )
    assert.equal(formatRangoUmbral(UMBRAL_SIN_TOPE), '$50.000.001 o más')
  })

  it('formatea la marca de actualización y tolera valores ausentes o inválidos', () => {
    assert.equal(formatUmbralTimestamp(null), 'sin cambios registrados')
    assert.equal(formatUmbralTimestamp('no-es-fecha'), 'no-es-fecha')
    assert.notEqual(formatUmbralTimestamp('2026-10-18T10:00:00.000Z'), 'sin cambios registrados')
  })
})

describe('umbralesUtils · validación de umbrales', () => {
  it('acepta un umbral bien formado con y sin tope', () => {
    assert.equal(esValido(validarUmbral(UMBRAL_JEFE, [])), true)
    assert.equal(esValido(validarUmbral(UMBRAL_SIN_TOPE, [])), true)
  })

  it('rechaza montos negativos, no numéricos y rangos invertidos', () => {
    assert.ok(validarUmbral({ ...UMBRAL_JEFE, montoMinimo: -1 }).montoMinimo)
    assert.ok(validarUmbral({ ...UMBRAL_JEFE, montoMinimo: null }).montoMinimo)
    assert.ok(validarUmbral({ ...UMBRAL_JEFE, montoMaximo: 0 }).montoMaximo)
    assert.ok(validarUmbral({ ...UMBRAL_JEFE, montoMaximo: Number.NaN }).montoMaximo)
  })

  it('rechaza niveles aprobadores desconocidos', () => {
    assert.ok(validarUmbral({ ...UMBRAL_JEFE, nivelAprobador: 'inventado' }).nivelAprobador)
    assert.ok(
      validarUmbral({ montoMinimo: 0, montoMaximo: null, nivelAprobador: '' }).nivelAprobador,
    )
  })

  it('detecta el solapamiento con otros umbrales de la unidad', () => {
    const solapado = { montoMinimo: 5000000, montoMaximo: 6000000, nivelAprobador: 'rectoria' }
    assert.ok(validarUmbral(solapado, [UMBRAL_JEFE]).montoMinimo)

    const contiguo = { montoMinimo: 10000001, montoMaximo: 20000001, nivelAprobador: 'rectoria' }
    assert.equal(esValido(validarUmbral(contiguo, [UMBRAL_JEFE])), true)
  })
})

describe('umbralesUtils · validación de unidades', () => {
  it('exige un nombre no vacío y un tipo válido', () => {
    assert.ok(validarUnidad({ nombre: '', tipo: 'facultad' }).nombre)
    assert.ok(validarUnidad({ nombre: '   ', tipo: 'facultad' }).nombre)
    assert.ok(validarUnidad({ nombre: 'Rectoría', tipo: 'otros' }).tipo)
    assert.ok(esValido(validarUnidad({ nombre: 'Facultad de Arte', tipo: 'facultad' }, [])))
  })

  it('rechaza nombres duplicados sin distinguir mayúsculas', () => {
    const existentes = [{ nombre: 'Rectoría' }]
    assert.ok(validarUnidad({ nombre: 'rectoría', tipo: 'rectoria' }, existentes).nombre)
    assert.ok(esValido(validarUnidad({ nombre: 'Rectoría General', tipo: 'rectoria' }, existentes)))
  })
})

describe('umbralesUtils · resolución del aprobador', () => {
  const umbrales = [UMBRAL_JEFE, UMBRAL_DIRECCION]

  it('respeta el mínimo inclusivo y el máximo exclusivo', () => {
    assert.equal(resolverNivelAprobador(umbrales, 0), 'jefe_unidad')
    assert.equal(resolverNivelAprobador(umbrales, 10000000), 'jefe_unidad')
    assert.equal(resolverNivelAprobador(umbrales, 10000001), 'direccion_economica')
    assert.equal(resolverNivelAprobador(umbrales, 50000000), 'direccion_economica')
    assert.equal(resolverNivelAprobador(umbrales, 50000001), null)
  })

  it('devuelve el umbral aplicable y tolera entradas inválidas', () => {
    assert.equal(buscarUmbralParaMonto(umbrales, 5000000)?.id ?? null, null)
    assert.equal(buscarUmbralParaMonto(umbrales, 5000000)?.nivelAprobador, 'jefe_unidad')
    assert.equal(buscarUmbralParaMonto(umbrales, Number.NaN), null)
    assert.equal(buscarUmbralParaMonto(null, 1000), null)
  })

  it('cubre montos sobre el último máximo cuando el rango no tiene tope', () => {
    const conTope = [
      UMBRAL_JEFE,
      { montoMinimo: 10000001, montoMaximo: null, nivelAprobador: 'rectoria' },
    ]
    assert.equal(resolverNivelAprobador(conTope, 999999999), 'rectoria')
  })
})

describe('umbralesUtils · generación de identificadores', () => {
  it('genera el siguiente id de umbral a partir de los existentes', () => {
    assert.equal(
      generarIdUmbral([[{ id: 'umbral-1' }, { id: 'umbral-9' }], [{ id: 'umbral-3' }]]),
      'umbral-10',
    )
    assert.equal(generarIdUmbral([]), 'umbral-1')
  })

  it('genera el siguiente id de unidad a partir de las existentes', () => {
    assert.equal(generarIdUnidad([{ id: 'unidad-1' }, { id: 'unidad-7' }]), 'unidad-8')
    assert.equal(generarIdUnidad([]), 'unidad-1')
  })
})
