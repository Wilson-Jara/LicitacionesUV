import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CAMPOS_TEXTO_REQUERIDOS,
  validarContratoLicitacion,
  validarContratoLicitaciones,
} from '../src/features/licitaciones/contratoLicitaciones.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mock = JSON.parse(
  readFileSync(
    path.join(root, 'src', 'features', 'licitaciones', 'data', 'licitaciones.mock.json'),
    'utf8',
  ),
)

function clonarPrimera() {
  return JSON.parse(JSON.stringify(mock[0]))
}

// CA3 adaptado: el seed histórico `backend/src/data/licitaciones.seed.json`
// se retiró al separar la API. El contrato se valida sobre el mock del cliente;
// el repositorio backend mantiene su propio mock y sus propias pruebas.
describe('contrato de datos de licitaciones (#94)', () => {
  it('el mock del cliente cumple el contrato completo', () => {
    assert.deepEqual(validarContratoLicitaciones(mock), [])
  })

  it('declara todos los campos obligatorios y los campos nuevos', () => {
    const campos = new Set(mock.flatMap((licitacion) => Object.keys(licitacion)))

    for (const campo of [...CAMPOS_TEXTO_REQUERIDOS, 'amount', 'sector', 'etiquetas']) {
      assert.ok(campos.has(campo), `falta el campo ${campo}`)
    }
  })

  it('acepta un sector opcional ausente', () => {
    const licitacion = clonarPrimera()
    delete licitacion.sector

    assert.deepEqual(validarContratoLicitacion(licitacion), [])
  })

  it('detecta campos obligatorios ausentes o vacíos', () => {
    const licitacion = clonarPrimera()
    delete licitacion.title
    licitacion.institution = '   '

    const errores = validarContratoLicitacion(licitacion)
    assert.ok(errores.some((error) => error.includes('.title')))
    assert.ok(errores.some((error) => error.includes('.institution')))
  })

  it('detecta tipos incorrectos en monto y etiquetas', () => {
    const licitacion = clonarPrimera()
    licitacion.amount = '12500000'
    licitacion.etiquetas = 'mantenimiento'

    const errores = validarContratoLicitacion(licitacion)
    assert.ok(errores.some((error) => error.includes('.amount')))
    assert.ok(errores.some((error) => error.includes('.etiquetas')))
  })

  it('detecta sector no normalizado o fuera del catálogo', () => {
    const conTilde = clonarPrimera()
    conTilde.sector = 'Tecnología'
    assert.ok(validarContratoLicitacion(conTilde).some((error) => error.includes('normalizado')))

    const fueraDeCatalogo = clonarPrimera()
    fueraDeCatalogo.sector = 'salud'
    assert.ok(
      validarContratoLicitacion(fueraDeCatalogo).some((error) =>
        error.includes('fuera del catálogo'),
      ),
    )
  })

  it('detecta etiquetas no normalizadas, duplicadas o fuera del catálogo', () => {
    const licitacion = clonarPrimera()
    licitacion.etiquetas = ['Mantenimiento', 'mantenimiento', 'salud']

    const errores = validarContratoLicitacion(licitacion)
    assert.ok(errores.some((error) => error.includes('normalizada')))
    assert.ok(errores.some((error) => error.includes('duplicada')))
    assert.ok(errores.some((error) => error.includes('fuera del catálogo')))
  })

  it('detecta identificadores duplicados en el catálogo', () => {
    const duplicado = clonarPrimera()
    const errores = validarContratoLicitaciones([mock[0], duplicado])

    assert.ok(errores.some((error) => error.includes('identificador duplicado')))
  })
})
