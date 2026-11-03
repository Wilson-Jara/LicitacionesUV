# Cobertura y suite de regresión

## Herramienta

Se usa la cobertura **integrada en Node.js** (`node --test --experimental-test-coverage`).

- **Por qué:** el proyecto ya ejecuta sus pruebas con `node --test`, así que no hace falta agregar dependencias (Jest, Vitest o c8). El reporte entrega porcentaje de **líneas, ramas y funciones** por archivo y lista las líneas sin cubrir.
- **Instalación:** no requiere. Viene con Node.js **22.8 o superior** (necesario para los umbrales). El CI usa Node 22.22.0.

## Comandos

| Comando                         | Qué hace                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `npm run test`                  | Ejecuta toda la suite (frontend y backend).                                  |
| `npm run test:coverage`         | Ejecuta la suite con cobertura y **falla** si no alcanza 70 % / 70 % / 60 %. |
| `npm run test:coverage:critico` | Cobertura del módulo crítico; **falla** si no alcanza 80 % / 80 % / 70 %.    |

Los porcentajes están en el orden líneas / funciones / ramas. El reporte se imprime en la consola; no se genera la carpeta `coverage/` (de todas formas está en `.gitignore`).

## Qué se mide y qué no

Se mide el código propio en `src/**/*.js` y `backend/src/**/*.js`. Las pruebas (`tests/`, `backend/tests/`) no cuentan.

Node solo reporta los archivos que las pruebas cargan. Quedan fuera, con esta justificación:

| Archivos                                                                        | Motivo                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Componentes y páginas `.jsx`                                                    | Node no ejecuta JSX ni tiene DOM; probarlos exige otra herramienta (Vitest + Testing Library). Su lógica de negocio está extraída a funciones puras que sí se prueban (`licitacionFilters.js`, `licitacionUtils.js`, `favoritosStorage.js`). Se verifican con la demo y con `npm run build`. |
| Hooks `useAuth.js`, `useFavoritos.js`, `useTheme.js`, `useLicitacionFilters.js` | Solo leen un contexto de React o la URL; necesitan un componente montado. La regla que aplican (`sanitizeFilterParams`, persistencia de favoritos) está probada aparte.                                                                                                                      |
| `exportLicitacionPdf.js`                                                        | Punto de entrada del navegador: usa el import `?worker` de Vite, que no existe fuera del navegador. La orquestación real (`exportLicitacionPdfCore.js`) sí se prueba.                                                                                                                        |
| `backend/src/server.js`, `backend/src/db/pool.js`                               | Código de arranque: levanta el servidor y abre la conexión real a PostgreSQL. La app se prueba con `createApp()` y un repositorio en memoria.                                                                                                                                                |

## Módulo crítico

**`src/features/licitaciones/licitacionUtils.js`**

- **Por qué es riesgoso:** decide si una licitación está **cerrada** (regla que impide guardarla en favoritos) y cómo se muestran el monto y la fecha en el detalle y en el PDF. Un error aquí muestra datos falsos al usuario o le deja seguir una convocatoria vencida.
- **Comportamiento esperado:** una licitación sigue vigente durante su día de cierre y queda cerrada desde el día siguiente; los montos se muestran en formato chileno sin decimales; las fechas en texto largo en español.
- **Valores límite:** día anterior, día del cierre y día siguiente; monto `0`; montos con decimales; 1 de enero (cambio de año por zona horaria).
- **Casos de error:** fecha de cierre `null` o numérica, fecha de referencia inválida, moneda inválida (`RangeError`), fecha vacía o no interpretable.
- **Pruebas:** `tests/licitacionUtils.test.js` (20 casos).

| Momento | Líneas | Funciones | Ramas |
| ------- | ------ | --------- | ----- |
| Antes   | 78 %   | 33 %      | 60 %  |
| Después | 100 %  | 100 %     | 100 % |

**Zona sin cubrir encontrada:** el reporte marcaba sin ejecutar las líneas de `formatLicitacionAmount`, `formatLicitacionDate`, `getRegionLabel` y `getTypeLabel`, y las ramas de entrada inválida de `isLicitacionCerrada`.

**Riesgo reducido:** antes, un cambio en el formato de montos, un error de zona horaria que corriera el 1 de enero al año anterior o una fecha nula que marcara una licitación como cerrada podían pasar sin que ninguna prueba fallara. Ahora cada caso tiene una prueba que lo detecta.

## Prueba de regresión

- **Defecto original:** la búsqueda por palabra clave también comparaba con la institución, aunque la HU #43 exige buscar solo en el título. Se corrigió en el frontend (PR #71) y en la API (PR #88).
- **Pruebas que lo protegen:** `busca la palabra clave únicamente en el título` (`tests/licitacionFilters.test.js`) y `busca la palabra clave solo en el título, no en la institución` (`backend/tests/licitaciones.test.js`).
- Si alguien vuelve a buscar en la institución, la prueba falla y el CI queda en rojo.

## Integración continua

`.github/workflows/verify.yml` se ejecuta en cada Pull Request y push a `main` y `develop`: instala dependencias, ejecuta `npm run verify` (lint, formato, pruebas y build) y luego los dos comandos de cobertura. Si cualquier paso falla, el PR queda en rojo.

La prueba de integración con PostgreSQL se omite en local si no está definida `DATABASE_URL_TEST`; en el CI sí se ejecuta, porque el workflow levanta una base de datos de prueba.
