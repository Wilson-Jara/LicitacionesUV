# API 1 — Buscar y filtrar licitaciones

**Historia de usuario:** #43 Buscar licitaciones por palabra clave.

```http
GET /api/licitaciones?keyword={texto}&region={region}&tipo={tipo}
```

Devuelve las licitaciones que cumplen **todos** los filtros indicados. Sin filtros devuelve el catálogo completo.

## Parámetros de consulta

Todos son opcionales. Un parámetro ausente o vacío no restringe el resultado.

| Parámetro | Ejemplo      | Regla                                                                                                                                                                                                                 |
| --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyword` | `software`   | Busca el texto **solo dentro de `title`** (CA1 de #43, igual que el buscador del frontend), sin distinguir mayúsculas. Se ignoran los espacios al inicio y al final. Los caracteres `%` y `_` se buscan literalmente. |
| `region`  | `valparaiso` | Coincidencia exacta con la clave de región, sin distinguir mayúsculas.                                                                                                                                                |
| `tipo`    | `publica`    | Coincidencia exacta con la modalidad (`publica` o `privada`), sin distinguir mayúsculas.                                                                                                                              |

Los parámetros desconocidos se ignoran.

## Respuestas

### `200 OK`: lista de licitaciones

```http
GET /api/licitaciones?keyword=software
```

```json
[
  {
    "id": "licitacion-005",
    "title": "Renovación de licencias de software",
    "amount": 3200000,
    "currency": "CLP",
    "institution": "Municipalidad de Viña del Mar",
    "closingDate": "2026-09-15",
    "type": "publica",
    "region": "valparaiso",
    "sourceUrl": "https://www.mercadopublico.cl/"
  }
]
```

### `200 OK`: sin coincidencias

Cuando ningún registro cumple los filtros, la respuesta es una lista vacía, no un error. El cliente decide cómo mostrar el estado "sin resultados" (CA3 de #43).

```json
[]
```

### Errores

| Código | Cuándo                                | Cuerpo                                      |
| ------ | ------------------------------------- | ------------------------------------------- |
| `500`  | Falla inesperada al obtener los datos | `{ "error": "Error interno del servidor" }` |

## Trazabilidad con la historia de usuario #43

| Criterio de #43                                                | Cómo lo cubre la API                                                                                                                          | Casos de Thunder Client |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| CA1: filtrar por coincidencia de la palabra clave en el título | `keyword` busca solo en el título, sin distinguir mayúsculas y sin espacios sobrantes; un término presente solo en la institución no coincide | TC-L02 a TC-L08         |
| CA2: la búsqueda se combina con los filtros de región y tipo   | `keyword`, `region` y `tipo` se combinan con Y lógico                                                                                         | TC-L09, TC-L10          |
| CA3: sin coincidencias se informa "sin resultados"             | Lista vacía con `200 OK`                                                                                                                      | TC-L03, TC-L05, TC-L09  |
| Catálogo completo sin filtros                                  | Sin parámetros devuelve todas las licitaciones                                                                                                | TC-L01                  |

El contrato de datos (los 9 campos y sus tipos) se verifica en las pruebas automatizadas del backend (`npm run verify`). El tiempo de respuesta (REF-01, menos de 2 s) se observa en el campo **Time** de cada respuesta en Thunder Client.

## Casos de prueba (colección API 1, 10 casos)

Todos son `GET` sobre `http://localhost:3000/api/licitaciones`.

| Caso   | Técnica      | Parámetros                                     | Resultado esperado                     |
| ------ | ------------ | ---------------------------------------------- | -------------------------------------- |
| TC-L01 | Éxito        | (ninguno)                                      | `200`, 6 licitaciones                  |
| TC-L02 | Equivalencia | `keyword=software` (en el título)              | `200`, 1 licitación (`licitacion-005`) |
| TC-L03 | Equivalencia | `keyword=Banco` (solo en una institución)      | `200`, `[]`                            |
| TC-L04 | Negocio      | `keyword=SOFTWARE` (mayúsculas)                | `200`, 1 licitación                    |
| TC-L05 | Equivalencia | `keyword=zzz` (sin coincidencias)              | `200`, `[]`                            |
| TC-L06 | Límite       | `keyword=` (vacío)                             | `200`, 6 licitaciones                  |
| TC-L07 | Límite       | `keyword=w` (un carácter)                      | `200`, 1 licitación                    |
| TC-L08 | Límite       | `keyword=%20%20%20` (solo espacios)            | `200`, 6 licitaciones                  |
| TC-L09 | Equivalencia | `region=atacama` (región inexistente)          | `200`, `[]`                            |
| TC-L10 | Negocio      | `keyword=de&region=metropolitana&tipo=publica` | `200`, 1 licitación (`licitacion-003`) |

- **Éxito:** TC-L01.
- **Clases de equivalencia:** término en el título (L02), término presente solo en la institución, que no coincide (L03), sin coincidencias (L05) y región inexistente (L09).
- **Valores límite:** término vacío (L06), de un carácter (L07) y solo espacios (L08).
- **Reglas de negocio:** sin distinguir mayúsculas (L04) y combinación de filtros con Y lógico (L10).
