# API 2 — Detalle de una licitación

**Historia de usuario:** #44 Ver el detalle de una licitación.

```http
GET /api/licitaciones/{id}
```

Devuelve una licitación por su identificador, con todos los datos que necesita la vista de detalle.

## Parámetro de ruta

| Parámetro | Ejemplo          | Regla                                                                                                                             |
| --------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`      | `licitacion-002` | Coincidencia exacta, **distingue mayúsculas**. Puede venir codificado en la URL (`licitacion%2D002` equivale a `licitacion-002`). |

## Respuestas

### `200 OK`: licitación encontrada

```http
GET /api/licitaciones/licitacion-002
```

```json
{
  "id": "licitacion-002",
  "title": "Adquisición de equipamiento tecnológico",
  "amount": 8700000,
  "currency": "CLP",
  "institution": "Empresa privada de servicios",
  "closingDate": "2026-10-15",
  "type": "privada",
  "region": "metropolitana",
  "sourceUrl": "https://www.mercadopublico.cl/"
}
```

### Errores

| Código | Cuándo                                                                                          | Cuerpo                                            |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `404`  | No existe una licitación con ese `id`                                                           | `{ "error": "Licitación no encontrada" }`         |
| `400`  | El `id` tiene una codificación de URL inválida (ej. `%E0%A4%A`)                                 | `{ "error": "Parámetro de ruta mal codificado" }` |
| `404`  | La ruta no existe: barra final (`/api/licitaciones/licitacion-001/`) o método distinto de `GET` | `{ "error": "Ruta no encontrada" }`               |
| `500`  | Falla inesperada al obtener los datos                                                           | `{ "error": "Error interno del servidor" }`       |

## Trazabilidad con la historia de usuario #44

| Criterio de #44                                                                      | Cómo lo cubre la API                                                                                             | Casos de Thunder Client |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------- |
| CA1: información completa (título, institución, monto, moneda, cierre, tipo, región) | El detalle devuelve todos esos campos con su tipo                                                                | TC-D01, TC-D02          |
| CA2: enlace a la publicación oficial                                                 | Campo `sourceUrl`                                                                                                | TC-D02                  |
| CA3: marcar como "cerrada" si la fecha de cierre ya pasó                             | La API entrega `closingDate` en `YYYY-MM-DD`; el frontend la compara con la fecha actual (`isLicitacionCerrada`) | TC-D10                  |
| Licitación inexistente o enlace inválido                                             | `404` con mensaje claro, sin exponer detalles internos                                                           | TC-D05 a TC-D09         |

> Nota: la API no calcula el estado "cerrada"; entrega la fecha y la regla vive en el frontend. Si se quiere que el backend lo informe (por ejemplo, un campo `cerrada`), debe acordarse como cambio de contrato.

## Casos de prueba (colección API 2, 10 casos)

Todos son `GET` sobre `http://localhost:3000/api/licitaciones/{id}`.

| Caso   | Técnica      | `id`                            | Resultado esperado                                    |
| ------ | ------------ | ------------------------------- | ----------------------------------------------------- |
| TC-D01 | Éxito        | `licitacion-002`                | `200`, licitación con ese `id`                        |
| TC-D02 | Contrato     | `licitacion-002`                | `200`, monto, fecha de cierre y `sourceUrl` correctos |
| TC-D03 | Límite       | `licitacion-001` (primer id)    | `200`                                                 |
| TC-D04 | Límite       | `licitacion-006` (último id)    | `200`                                                 |
| TC-D05 | Límite       | `licitacion-000` (antes)        | `404`                                                 |
| TC-D06 | Límite       | `licitacion-007` (después)      | `404`                                                 |
| TC-D07 | Negocio      | `LICITACION-001` (mayúsculas)   | `404`                                                 |
| TC-D08 | Negocio      | `%E0%A4%A` (ver nota)           | `404`                                                 |
| TC-D09 | Equivalencia | `licitacion-001/` (barra final) | `404`, "Ruta no encontrada"                           |
| TC-D10 | Negocio      | `licitacion-005` (vencida)      | `200`, `closingDate` `2026-09-15`                     |

- **Éxito y contrato:** TC-D01 y TC-D02.
- **Valores límite:** primer y último id válidos (D03, D04) e ids justo fuera del rango (D05, D06).
- **Clases de equivalencia:** ruta con barra final (D09).
- **Reglas de negocio:** el id distingue mayúsculas (D07), un id con caracteres codificados que no existe (D08) y la licitación vencida entrega su fecha de cierre (D10).

> Nota sobre TC-D08: Thunder Client vuelve a codificar el `%` de la URL antes de enviarla, así que la API recibe el texto literal `%E0%A4%A` como `id`, que no existe, y responde `404`. La respuesta `400` ante una codificación realmente inválida (por ejemplo con `curl`) está cubierta por las pruebas automatizadas del backend.
