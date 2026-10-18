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
| CA3: marcar como "cerrada" si la fecha de cierre ya pasó                             | La API entrega `closingDate` en `YYYY-MM-DD`; el frontend la compara con la fecha actual (`isLicitacionCerrada`) | TC-D13                  |
| Licitación inexistente o enlace inválido                                             | `404` o `400` con mensaje claro, sin exponer detalles internos                                                   | TC-D05 a TC-D12         |

> Nota: la API no calcula el estado "cerrada"; entrega la fecha y la regla vive en el frontend. Si se quiere que el backend lo informe (por ejemplo, un campo `cerrada`), debe acordarse como cambio de contrato.

## Diseño de las pruebas (colección API 2, 13 casos)

- **Éxito y contrato:** TC-D01 y TC-D02.
- **Valores límite:** primer y último id válidos (D03, D04), ids justo fuera del rango (D05, D06) e id muy largo (D10).
- **Clases de equivalencia:** id codificado válido (D08) y ruta con barra final (D11).
- **Reglas de negocio:** el id distingue mayúsculas (D07) y la licitación vencida entrega su fecha de cierre (D13).
- **Errores:** id mal codificado (D09) y método no soportado (D12).
