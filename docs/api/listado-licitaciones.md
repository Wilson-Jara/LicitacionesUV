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
| CA1: filtrar por coincidencia de la palabra clave en el título | `keyword` busca solo en el título, sin distinguir mayúsculas y sin espacios sobrantes; un término presente solo en la institución no coincide | TC-L02 a TC-L10         |
| CA2: la búsqueda se combina con los filtros de región y tipo   | `keyword`, `region` y `tipo` se combinan con Y lógico                                                                                         | TC-L11 a TC-L16         |
| CA3: sin coincidencias se informa "sin resultados"             | Lista vacía con `200 OK`                                                                                                                      | TC-L05, TC-L13, TC-L15  |
| Contrato de datos del mock (REF-10)                            | Cada elemento tiene los 9 campos con sus tipos                                                                                                | TC-L18                  |
| Respuesta en menos de 2 s (REF-01)                             | Aserción de tiempo de respuesta                                                                                                               | TC-L01                  |

## Diseño de las pruebas (colección API 1, 18 casos)

- **Éxito:** TC-L01.
- **Clases de equivalencia:** término en el título (L02), término presente solo en la institución, que no coincide (L03), sin coincidencias (L05), región válida (L11) e inexistente (L13), tipo válido (L14) y fuera del dominio (L15).
- **Valores límite:** término vacío (L06), de un carácter (L07) y solo espacios (L08).
- **Reglas de negocio:** sin distinguir mayúsculas (L04, L12), recorte de espacios (L09), `%` literal (L10), combinación con Y lógico (L16), parámetro desconocido ignorado (L17) y contrato de datos (L18).
