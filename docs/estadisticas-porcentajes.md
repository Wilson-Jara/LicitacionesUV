# Cálculo único de porcentajes · `calcularFilasDistribucion`

> Intervención ISF224 asociada a #134 (seguimiento técnico de #95) · Responsable: Benjamin Lazo (@lazo1838k)

## Problema

El panel de estadísticas muestra cada distribución dos veces: como barras visuales y como tabla oculta para lectores de pantalla (CA3). El porcentaje de cada categoría se calculaba **por separado en cada una**, con la misma fórmula copiada dentro del JSX de `DistribucionPanel.jsx`. El total se sumaba otra vez en `generarAlternativaTextual`.

| Regla                                           | Dónde estaba repetida                                            |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| Porcentaje `Math.round(cantidad / total * 100)` | Barras y tabla accesible de `DistribucionPanel.jsx` (2 copias)   |
| Total de la distribución                        | `DistribucionPanel.jsx` y `generarAlternativaTextual` (2 copias) |

**Consecuencia:** cambiar el redondeo (por ejemplo, para que la suma visible dé 100 %) obligaba a editar varias copias y a mantenerlas iguales a mano. Si una se olvidaba, las barras y la tabla accesible mostraban cifras distintas, y una persona con lector de pantalla recibía otra información que una persona vidente. Además, la regla vivía dentro del JSX y no se podía probar con `node --test`.

**Prioridad:** media. No hay un error visible hoy, pero la regla toca la accesibilidad (CA3) y es la primera que habrá que cambiar si se corrige la suma de porcentajes.

## Indicadores antes y después

| Indicador                                              | Antes                                 | Después                                              |
| ------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------- |
| Copias de las reglas de porcentaje y total             | 4 (2 de porcentaje, 2 de total)       | 1 (`calcularFilasDistribucion`)                      |
| Archivos que hay que editar para cambiar el porcentaje | 1, en 2 lugares, y sin prueba posible | 1 (`src/features/estadisticas/estadisticasUtils.js`) |
| Pruebas unitarias que ejercen la regla de porcentaje   | 0                                     | 18 (`tests/distribucionPorcentajes.test.js`)         |

## Contrato

`calcularFilasDistribucion(datos)` en `src/features/estadisticas/estadisticasUtils.js`:

- **Entrada:** lista de `{ clave?, etiqueta, cantidad }`. Si no es lista, se trata como vacía.
- **Salida:** `{ total, filas }`, donde cada fila es `{ clave, etiqueta, cantidad, porcentaje }`.
- **Regla:** una cantidad no numérica cuenta como 0. El porcentaje es `Math.round(cantidad / total * 100)` y vale 0 si el total es 0. Cada porcentaje se redondea por separado, por eso la suma visible puede dar 99 o 101. Esto se conservó a propósito: la intervención no cambia el comportamiento.
- **Consumidores:** las barras y la tabla de `DistribucionPanel.jsx`, y `generarAlternativaTextual`.

## Casos base (antes y después)

`tests/distribucionPorcentajes.test.js` contiene una copia literal de la regla original y ejecuta los mismos casos contra ella y contra `calcularFilasDistribucion`:

| Caso                                  | Cantidades       | Total | Porcentajes    |
| ------------------------------------- | ---------------- | ----- | -------------- |
| Conjunto normal (6 licitaciones)      | 2, 2, 1, 1       | 6     | 33, 33, 17, 17 |
| Una sola categoría                    | 5                | 5     | 100            |
| Tercios (la suma visible da 99)       | 1, 1, 1          | 3     | 33, 33, 33     |
| 1 de 3 y 2 de 3                       | 1, 2             | 3     | 33, 67         |
| Medios exactos (la suma da 101)       | 1, 7             | 8     | 13, 88         |
| Total sin datos                       | —                | 0     | —              |
| Categoría con cantidad cero           | 0                | 0     | 0              |
| Cantidad no numérica cuenta como cero | `'x'`, `null`, 4 | 4     | 0, 0, 100      |

**Commits identificables:**

1. `test: caracterizar los porcentajes de DistribucionPanel (#134)`: fija el comportamiento antes de editar.
2. `refactor: unificar el cálculo de porcentajes de estadísticas (#134)`: commit estructural, sin cambio de comportamiento.

**Verificación en la interfaz:** en `/estadisticas`, con el catálogo de demostración, las barras y la tabla accesible muestran los mismos valores antes y después (región 33/33/17/17, tipo 50/50, sector 67/17/17).

## Caso inicial para que lo ejecute otro integrante

1. En la rama de este PR: `npm install` y luego `node --test tests/distribucionPorcentajes.test.js`. Tienen que pasar 18 pruebas.
2. `npm run dev` y abrir `/estadisticas`. Comprobar que «Por región» muestra 2 (33 %), 2 (33 %), 1 (17 %) y 1 (17 %).
3. Registrar en el PR quién lo ejecutó, la fecha y el resultado.
