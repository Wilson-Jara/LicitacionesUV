# Ejercicio 2.2 · Construcción para la verificación

Este documento registra los contratos implementados de tres operaciones: filtrar
licitaciones, consultar su detalle y agregar un favorito. Las comprobaciones usan
el catálogo mock del proyecto y un usuario de prueba; no requieren PostgreSQL.

Una **precondición** describe la entrada o el estado que necesita una operación;
una **postcondición**, el resultado que garantiza cuando termina correctamente;
una **invariante**, la regla que debe conservar. La validación defensiva controla
entradas externas inválidas; una aserción comprueba un supuesto interno.

## Ficha de operación 1 · Filtrar licitaciones

| Elemento                            | Registro de la operación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Funcionalidad y operación**       | Buscar por título, región y tipo. `src/features/licitaciones/licitacionFilters.js`: `filterLicitaciones(licitaciones, filters)`, utilizada desde `LicitacionesExplorerPage.jsx`.                                                                                                                                                                                                                                                                                                                                                          |
| **Propósito**                       | Devolver al explorador las licitaciones que cumplen simultáneamente los filtros activos.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Precondiciones**                  | El catálogo normal es un arreglo de licitaciones con `title`, `region` y `type` de texto. Los filtros son un objeto o `URLSearchParams`, con valores opcionales. Las regiones y tipos admitidos están en `VALID_REGIONES` y `VALID_TIPOS`. La operación define además una salida controlada para un catálogo que no sea un arreglo y sanea los filtros antes de utilizarlos.                                                                                                                                                              |
| **Postcondiciones**                 | Devuelve un arreglo nuevo, conserva el orden relativo del catálogo y solo aplica los filtros válidos activos. La palabra clave busca exclusivamente en `title`, sin distinguir mayúsculas y quitando espacios externos. Sin coincidencias devuelve `[]`; sin filtros válidos devuelve todos los elementos del catálogo en un arreglo nuevo.                                                                                                                                                                                               |
| **Invariante**                      | No modifica el catálogo ni los filtros recibidos. Cada elemento del resultado pertenece al catálogo original y satisface todos los filtros válidos activos.                                                                                                                                                                                                                                                                                                                                                                               |
| **Validación defensiva y frontera** | Los filtros externos llegan desde la URL mediante `useLicitacionFilters`; `sanitizeFilterParams` descarta parámetros desconocidos, valores no textuales y regiones o tipos no admitidos. `filterLicitaciones` vuelve a sanear sus argumentos. Si el catálogo es `null` o no es un arreglo, devuelve `[]`. Si recibe `{ keyword: 123, region: 'marte' }`, ambos filtros se descartan y no restringen el catálogo. No se lanzan excepciones en estos dos casos. Los parámetros repetidos de región y tipo conservan el último valor válido. |
| **Dependencia explícita**           | Recibe catálogo y filtros como argumentos. Es una función pura, sin servicio externo ni almacenamiento. La dependencia colaboradora reemplazable del ejercicio se demuestra en la ficha 2 mediante el repositorio.                                                                                                                                                                                                                                                                                                                        |
| **Evidencia de ejecución**          | Comprobaciones ejecutadas el 27 de octubre de 2026. Caso válido: buscar `' software '` devuelve `licitacion-005`. Inválido 1: catálogo `null` devuelve `[]`. Inválido 2: palabra clave numérica y región no admitida devuelven las 6 licitaciones. También se comprobó que las entradas no cambian y la salida es un arreglo nuevo. La salida y el comando completo están más abajo. Las pruebas relacionadas están en `tests/licitacionFilters.test.js`.                                                                                 |

### Evidencia de la operación 1

```text
OPERACION 1: filterLicitaciones
Valido: ["licitacion-005"]
Invalido 1 (catalogo null): []
Invalido 2: {"keyword":"","region":"","tipo":"","sort":""} -> 6 de 6
Invariantes: catalogo y filtros sin cambios; arreglo de salida nuevo
```

Esta ficha corrige la versión anterior, que describía excepciones que el código
no lanza. El resultado controlado permite seguir mostrando la interfaz ante
entradas inválidas. La búsqueda solo compara el título, de acuerdo con los
criterios de las historias #43 y #47.

## Ficha de operación 2 · Consultar el detalle de una licitación

| Elemento                            | Registro de la operación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Funcionalidad y operación**       | `GET /api/licitaciones/:id`, registrado por `registerLicitacionesRoutes(router, repository)` en `backend/src/routes/licitaciones.routes.js`.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Propósito**                       | Entregar los datos de la licitación solicitada o una respuesta de error coherente cuando no puede consultarse.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Precondiciones**                  | La petición utiliza GET y la ruta de detalle. Para consultar el repositorio, `:id` debe poder decodificarse con `decodeURIComponent`. El colaborador debe implementar `findById(id)` de forma asíncrona y devolver una licitación con el contrato del catálogo o `null` cuando no existe. No se presupone que cualquier identificador enviado por el cliente exista.                                                                                                                                                                                            |
| **Postcondiciones**                 | Si existe, responde `200` con el objeto de licitación y el mismo identificador solicitado. El contrato del repositorio contiene `id`, `title`, `amount`, `currency`, `institution`, `closingDate`, `type`, `region` y `sourceUrl`; la ruta comprueba el identificador, sin realizar una validación completa de ese esquema. Si no existe, responde `404` con `Licitación no encontrada`. Si el identificador está mal codificado, responde `400` con `Parámetro de ruta mal codificado`. Los errores internos responden `500` con `Error interno del servidor`. |
| **Invariante y aserción**           | Un repositorio que devuelve un resultado debe devolver la licitación que se pidió. Se comprueba mediante `assert.equal(licitacion.id, req.params.id)`, después del control de existencia y antes de responder. Una diferencia de identificadores es un defecto interno del colaborador, no una entrada incorrecta del cliente.                                                                                                                                                                                                                                  |
| **Validación defensiva y frontera** | `decodeParam` en `backend/src/lib/router.js` captura la codificación inválida de la URL y lanza `HttpError(400, ...)`. El endpoint comprueba la ausencia de resultado y lanza `HttpError(404, ...)`. `createApp` traduce esos errores a JSON; una aserción fallida se registra internamente y produce un 500 genérico, sin enviar al cliente los detalles de la aserción. La aserción complementa estas validaciones, no las reemplaza.                                                                                                                         |
| **Dependencia explícita**           | `createApp({ licitacionesRepository })` recibe el repositorio y lo entrega al registrador de rutas. Puede reemplazarse por el repositorio de PostgreSQL, el de memoria o un doble de prueba. La prueba de invariante inyecta uno cuyo `findById` devuelve `{ id: 'otra-licitacion' }` y comprueba el 500 y el cuerpo genérico completo.                                                                                                                                                                                                                         |
| **Evidencia de ejecución**          | Comprobaciones ejecutadas el 27 de octubre de 2026 con un servidor HTTP temporal que usa el mock. Caso válido: `licitacion-002` responde 200. Inválido 1: `licitacion-999` responde 404. Inválido 2: `%E0%A4%A` responde 400. La prueba adicional del repositorio incorrecto está en `backend/tests/licitaciones.test.js`; el caso de URL mal codificada está en `backend/tests/http.test.js`.                                                                                                                                                                  |

### Evidencia de la operación 2

```text
OPERACION 2: GET /api/licitaciones/:id
licitacion-002 -> 200 {"id":"licitacion-002","title":"Adquisición de equipamiento tecnológico"}
licitacion-999 -> 404 {"error":"Licitación no encontrada"}
%E0%A4%A -> 400 {"error":"Parámetro de ruta mal codificado"}
```

La línea del caso 200 muestra solamente `id` y `title` para facilitar la lectura;
el comando comprueba que el cuerpo completo coincide con la licitación del mock.

## Ficha de operación 3 · Agregar una licitación a favoritos

| Elemento                            | Registro de la operación                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Funcionalidad y operación**       | `src/features/favoritos/data/favoritosStorage.js`: `addFavorito(store, userId, idLicitacion, fechaGuardado)`, utilizada por `FavoritosProvider`.                                                                                                                                                                                                                                                                                                                          |
| **Propósito**                       | Incorporar una licitación a los favoritos del usuario conservando el estado anterior y evitando duplicados.                                                                                                                                                                                                                                                                                                                                                               |
| **Precondiciones**                  | `store` es un objeto normalizado de usuarios y arreglos de favoritos; `userId` identifica al usuario y `idLicitacion` a la licitación. El llamador aporta una fecha de guardado, normalmente ISO generada por `FavoritosProvider`. La función presupone ese estado normalizado; no valida cualquier objeto arbitrario, la identidad del usuario ni el formato de la fecha.                                                                                                |
| **Postcondiciones**                 | Para una alta válida devuelve un objeto nuevo con un nuevo arreglo del usuario y el registro `{ idLicitacion, fechaGuardado }`. Conserva los favoritos anteriores y los datos de otros usuarios. Si falta un identificador o el favorito ya existe, devuelve exactamente el mismo objeto recibido, sin cambios.                                                                                                                                                           |
| **Invariante**                      | Partiendo de una lista sin duplicados, agregar un favorito no crea dos registros con el mismo `idLicitacion` para el usuario. No modifica el objeto ni los arreglos de entrada. Un intento duplicado conserva también la fecha original.                                                                                                                                                                                                                                  |
| **Validación defensiva y frontera** | `addFavorito` comprueba que `userId` e `idLicitacion` sean valores verdaderos y comprueba si el identificador ya existe. En la frontera de almacenamiento, `readFavoritosStore(storage)` captura JSON corrupto y errores de lectura, descarta registros inválidos y normaliza duplicados antes de entregar el estado. La autenticación y la regla de licitación cerrada se controlan en el proveedor o en los componentes que llaman a esta función, no en `addFavorito`. |
| **Dependencia explícita**           | `addFavorito` es pura: recibe el estado, no `localStorage`. Las funciones colaboradoras `readFavoritosStore(storage)` y `writeFavoritosStore(storage, store)` reciben el almacenamiento por parámetro. La evidencia sustituye el almacenamiento del navegador por un objeto en memoria con `getItem` y `setItem`, y comprueba que la escritura seguida de lectura conserva el estado.                                                                                     |
| **Evidencia de ejecución**          | Comprobaciones ejecutadas el 27 de octubre de 2026. Caso válido: agregar `licitacion-002` a `usuario-prueba`. Inválido 1: usuario `null`, mismo objeto sin cambios. Inválido 2: identificador vacío, mismo objeto sin cambios. Se comprobó además que un duplicado conserva el estado y su fecha original, y que el almacenamiento se puede reemplazar por un doble en memoria. Las pruebas relacionadas están en `tests/favoritosStorage.test.js`.                       |

### Evidencia de la operación 3

```text
OPERACION 3: addFavorito
Valido: {"usuario-prueba":[{"idLicitacion":"licitacion-002","fechaGuardado":"2026-10-27T12:00:00.000Z"}]} | original: {}
Invalido 1 (sin usuario): mismo estado = true
Invalido 2 (id vacio): mismo estado = true
Duplicado: mismo estado = true; mantiene fecha original
Dependencia reemplazada: lectura/escritura con almacenamiento en memoria = OK
```

La fecha del ejemplo es un dato fijo para reproducir el resultado; no es una
medición del reloj de ejecución. Estas comprobaciones de la función pura no
representan una prueba de autenticación ni del bloqueo de licitaciones cerradas
en la interfaz.

## Reproducir la evidencia

Desde la raíz del repositorio, pegar el siguiente bloque en PowerShell. Ejecuta
el código mediante la entrada estándar de Node, sin crear un script en el
repositorio. El servidor usa un puerto libre de la interfaz local y se cierra al
terminar; no es necesario iniciar `npm start` en otra terminal.

```powershell
@'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { filterLicitaciones, sanitizeFilterParams } from './src/features/licitaciones/licitacionFilters.js'
import { addFavorito, readFavoritosStore, writeFavoritosStore } from './src/features/favoritos/data/favoritosStorage.js'
import { createApp } from './backend/src/app.js'
const catalogo = JSON.parse(readFileSync('./src/features/licitaciones/data/licitaciones.mock.json', 'utf8'))
const original = JSON.stringify(catalogo)
console.log('OPERACION 1: filterLicitaciones')
const filtros = { keyword: ' software ', region: '', tipo: '' }
const filtrosOriginales = JSON.stringify(filtros)
const valido = filterLicitaciones(catalogo, filtros).map(l => l.id)
assert.deepEqual(valido, ['licitacion-005'])
console.log('Valido:', JSON.stringify(valido))
const invalido1 = filterLicitaciones(null)
assert.deepEqual(invalido1, [])
console.log('Invalido 1 (catalogo null):', JSON.stringify(invalido1))
const filtrosInvalidos = { keyword: 123, region: 'marte' }
const invalido2 = filterLicitaciones(catalogo, filtrosInvalidos)
assert.deepEqual(invalido2, catalogo)
console.log('Invalido 2:', JSON.stringify(sanitizeFilterParams(filtrosInvalidos)), '->', invalido2.length, 'de', catalogo.length)
assert.equal(JSON.stringify(catalogo), original)
assert.equal(JSON.stringify(filtros), filtrosOriginales)
assert.notEqual(filterLicitaciones(catalogo, filtros), catalogo)
console.log('Invariantes: catalogo y filtros sin cambios; arreglo de salida nuevo')
console.log('\nOPERACION 2: GET /api/licitaciones/:id')
const servidor = createServer(createApp())
await new Promise(resolve => servidor.listen(0, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:' + servidor.address().port
try {
  for (const [id, esperado, errorEsperado] of [
    ['licitacion-002', 200],
    ['licitacion-999', 404, 'Licitacion no encontrada'],
    ['%E0%A4%A', 400, 'Parametro de ruta mal codificado'],
  ]) {
    const respuesta = await fetch(base + '/api/licitaciones/' + id)
    const cuerpo = await respuesta.json()
    assert.equal(respuesta.status, esperado)
    if (esperado === 200) assert.deepEqual(cuerpo, catalogo.find(l => l.id === id))
    else assert.equal(cuerpo.error.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), errorEsperado)
    console.log(id, '->', respuesta.status, JSON.stringify(esperado === 200 ? { id: cuerpo.id, title: cuerpo.title } : cuerpo))
  }
} finally {
  await new Promise(resolve => servidor.close(resolve))
}
console.log('\nOPERACION 3: addFavorito')
const inicial = {}
const fecha = '2026-10-27T12:00:00.000Z'
const guardado = addFavorito(inicial, 'usuario-prueba', 'licitacion-002', fecha)
assert.deepEqual(guardado, { 'usuario-prueba': [{ idLicitacion: 'licitacion-002', fechaGuardado: fecha }] })
assert.deepEqual(inicial, {})
console.log('Valido:', JSON.stringify(guardado), '| original:', JSON.stringify(inicial))
assert.equal(addFavorito(guardado, null, 'licitacion-003', fecha), guardado)
console.log('Invalido 1 (sin usuario): mismo estado = true')
assert.equal(addFavorito(guardado, 'usuario-prueba', '', fecha), guardado)
console.log('Invalido 2 (id vacio): mismo estado = true')
assert.equal(addFavorito(guardado, 'usuario-prueba', 'licitacion-002', 'otra-fecha'), guardado)
console.log('Duplicado: mismo estado = true; mantiene fecha original')
const datos = new Map()
const storage = { getItem: key => datos.get(key) ?? null, setItem: (key, valor) => datos.set(key, String(valor)) }
writeFavoritosStore(storage, guardado)
assert.deepEqual(readFavoritosStore(storage), guardado)
console.log('Dependencia reemplazada: lectura/escritura con almacenamiento en memoria = OK')
console.log('\nRESULTADO: todas las comprobaciones pasaron')
'@ | node --input-type=module
```

Si una comprobación falla, `assert` provoca una salida con error. En la ejecución
registrada el proceso terminó con código 0 y el mensaje:

```text
RESULTADO: todas las comprobaciones pasaron
```

## Pruebas automatizadas relacionadas

```powershell
node --test tests/licitacionFilters.test.js tests/favoritosStorage.test.js backend/tests/licitaciones.test.js backend/tests/http.test.js
```

Resultado de la ejecución del 27 de octubre de 2026: **68 pruebas aprobadas en
14 suites, 0 fallos y 0 pruebas omitidas**.

La prueba `responde 500 genérico si el repositorio rompe la invariante del id`
comprueba por separado el supuesto interno de la operación 2. Los errores 400 y
404 corresponden a las entradas externas; el 500 corresponde al fallo del
repositorio inyectado.

## Validación final de la entrega

Validación local realizada el 27 de octubre de 2026 con Node.js 24.22.1 y npm
11.19.1:

| Comprobación                    | Resultado                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                | Correcto: limpieza, lint, formato, 117 pruebas aprobadas y compilación. ESLint conserva una advertencia preexistente de dependencias de `useMemo` en el explorador, sin errores.                                    |
| `npm run test:coverage`         | Correcto: 97,08 % de líneas, 90,94 % de ramas y 98,84 % de funciones. Supera los umbrales configurados. La medición corresponde a los módulos JavaScript cargados por las pruebas y no incluye los componentes JSX. |
| `npm run test:coverage:critico` | Correcto: 20 pruebas aprobadas y 100 % de líneas, ramas y funciones en `licitacionUtils.js`.                                                                                                                        |
| Aserción desactivada en memoria | La prueba nueva falla con `200 !== 500`, como se esperaba. Con la aserción original vuelve a pasar. El archivo del endpoint conserva su hash SHA-256.                                                               |
| Evidencia de contratos          | El comando incluido en este documento se ejecutó correctamente y su salida coincide con los casos registrados en las tres fichas.                                                                                   |

La desactivación temporal de la aserción se hizo mediante un hook de carga de
Node, sin guardar una versión incorrecta del endpoint en el repositorio.

Las ejecuciones generales se realizaron con `DATABASE_URL_TEST` vacío en el
entorno del proceso de prueba para omitir la suite de integración que elimina y
recrea el esquema de PostgreSQL. Estas comprobaciones locales no validan la base
real; esa suite está configurada en CI con una base de pruebas desechable.

Registros de las ejecuciones:

- [Salida de los casos de contrato](evidencia/contratos/evidencia-contratos.txt).
- [Resultados de validación y cobertura](evidencia/contratos/validacion-final.txt).

## Documentos de apoyo

La ficha de operación 1 también está disponible en PDF y Word, sincronizados con
su contrato y evidencia actuales. Las tres fichas y el comando de reproducción
conjunto se mantienen en este Markdown.

- [Ficha de operación 1 en PDF](Ejercicio_2_2_Ficha_Operacion_1.pdf)
- [Ficha de operación 1 editable en DOCX](Ejercicio_2_2_Ficha_Operacion_1.docx)
