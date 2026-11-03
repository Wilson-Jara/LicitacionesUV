# Perfil de calidad y medidas del producto

**Asignatura:** ISF225 — Fundamentos de Ingeniería de Software  
**Modelo de calidad:** ISO/IEC 25010  
**Medición:** ISO/IEC 25023  
**Evaluación:** ISO/IEC 25040  
**Equipo:** LicitacionesUV — equipo de cinco integrantes  
**Sistema:** Plataforma web para buscar, filtrar y consultar licitaciones, y guardar convocatorias favoritas.

## Alcance de esta ficha

Este perfil define la calidad esperada para la versión cliente actual de LicitacionesUV: aplicación React con datos mock, búsqueda y filtros, detalle de licitaciones y favoritos con autenticación simulada. No se presentan como medidas obtenidas los valores que todavía no se han medido en una ejecución controlada.

**Cómo leer `*`:** indica un umbral o tamaño de muestra propuesto por el equipo, todavía pendiente de acuerdo o validación. Los valores `A` y `B` de la medición actual se completan al ejecutar la prueba; no se inventan resultados.

## 1. Perfil de calidad

Máximo tres características críticas (`C`) y al menos una no aplicable (`N`), según la ficha entregada en clases.

| Característica           | Nivel | Motivo / relación con el proyecto                                                                                                                                      |
| ------------------------ | :---: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adecuación funcional     |   C   | La búsqueda, los filtros, el detalle, la fuente oficial y los favoritos deben cumplir sus criterios de aceptación.                                                     |
| Eficiencia de desempeño  |   C   | La respuesta del filtro es central al producto; REF-01 establece menos de 2 segundos.                                                                                  |
| Compatibilidad           |   R   | La SPA debe funcionar en navegadores modernos, de acuerdo con REF-08.                                                                                                  |
| Capacidad de interacción |   R   | La interfaz debe ser utilizable, accesible y mostrar estados claros, de acuerdo con REF-05 y REF-13.                                                                   |
| Fiabilidad               |   R   | La aplicación debe funcionar de forma estable y poder verificarse con el flujo documentado; relacionado con REF-04 y REF-07.                                           |
| Seguridad                |   C   | Las acciones privadas requieren sesión y los secretos no deben publicarse, de acuerdo con REF-02 y REF-03. En esta versión la autenticación es simulada en el cliente. |
| Mantenibilidad           |   R   | El código debe mantenerse modular y verificable; relacionado con REF-06 y, para CR-302, REF-14.                                                                        |
| Flexibilidad             |   R   | Los datos mock deben poder reemplazarse por una API sin rehacer los módulos, de acuerdo con REF-10.                                                                    |
| Protección               |   N   | El sistema es una aplicación web informativa y no controla equipos ni procesos que puedan causar daño físico.                                                          |

## 2. Medidas para las características críticas

En cada medida, `A` es el número de casos que cumplen el criterio y `B` el total de casos ejecutados; por eso `A` debe ser un subconjunto de `B`. En estas tres medidas, un valor mayor de `X` representa mejor calidad.

| Subcaracterística                                 | Qué mide                                                                                                          | A (se cuenta)                                  | B (sobre el total de)                                                                                                  | Fórmula     | Criterio de decisión                                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Adecuación funcional — completitud/corrección     | Porcentaje de escenarios críticos de aceptación que producen el resultado esperado.                               | Escenarios críticos que pasan todos sus pasos. | Total de escenarios críticos acordados y ejecutados para la versión.                                                   | `X = A / B` | Aceptar si `X = 1.00` (100%)*. Si un escenario crítico falla, corregir antes de aceptar la versión.                            |
| Eficiencia de desempeño — comportamiento temporal | Porcentaje de interacciones de búsqueda/filtro cuyo resultado aparece en menos de 2 segundos.                     | Interacciones medidas que terminan en `< 2 s`. | Total de interacciones medidas; ejecutar al menos 30 interacciones* y registrar el navegador y el tamaño del catálogo. | `X = A / B` | Aceptar si `X = 1.00` y cada interacción medida tarda menos de 2 segundos (REF-01). Si no, investigar y repetir tras corregir. |
| Seguridad — autenticidad/control de acceso        | Porcentaje de intentos sin sesión en acciones privadas que se bloquean correctamente y no revelan datos privados. | Intentos sin sesión correctamente bloqueados.  | Total de acciones privadas disponibles que se probaron sin sesión.                                                     | `X = A / B` | Aceptar si `X = 1.00` (100%)*: ningún intento sin sesión debe completar una acción privada (REF-02).                           |

### Escenarios para armar el conjunto `B`

- **Adecuación funcional:** buscar por título; combinar palabra clave, región y tipo; mostrar el estado sin resultados; abrir el detalle correcto; mostrar la fuente oficial; impedir agregar a favoritos una licitación cerrada; guardar y quitar favoritos con sesión.
- **Desempeño:** repetir búsquedas y cambios de filtro en el catálogo de prueba. Anotar cada duración, navegador, equipo y cantidad de licitaciones usadas. La muestra de 30 es una propuesta (`*`), no una medición ya realizada.
- **Seguridad:** intentar guardar un favorito sin sesión y abrir `/favoritos` sin sesión; agregar los demás flujos privados que estén implementados en la versión evaluada. La prueba mide las restricciones de la interfaz cliente; no equivale a una auditoría de autorización de backend.

## 3. Evidencia: fuente, responsable y fecha

| Medida                  | De dónde sale la evidencia                                                                                                                                                                      | Responsable y fecha                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Adecuación funcional    | Issues/criterios de aceptación y resultados de pruebas manuales de los flujos listados en la sección anterior; registrar el resultado de cada escenario y el `A/B`.                             | Mauricio Henríquez (`@StelleC`), rol QA. Fecha: pendiente de la primera ejecución de la ficha; registrar al completar. |
| Eficiencia de desempeño | Mediciones en el navegador con DevTools/Performance o cronómetro de alta resolución; guardar navegador, equipo, tamaño del catálogo, duración de cada interacción y el `A/B`.                   | Mauricio Henríquez (`@StelleC`), rol QA. Fecha: pendiente de la primera ejecución de la ficha; registrar al completar. |
| Seguridad               | Pruebas manuales de acceso sin sesión a cada acción privada disponible, junto con el resultado observado y el `A/B`. Los flujos protegidos definidos para la interfaz se contrastan con REF-02. | Mauricio Henríquez (`@StelleC`), rol QA. Fecha: pendiente de la primera ejecución de la ficha; registrar al completar. |

## Registro de mediciones

No se encontraron resultados medidos para esta ficha en el repositorio al prepararla. Completar esta tabla en cada entrega; adjuntar o enlazar la evidencia de las pruebas.

| Fecha     | Versión/commit | Medida                  |   A |   B |   X | Resultado y evidencia |
| --------- | -------------- | ----------------------- | --: | --: | --: | --------------------- |
| Pendiente | Pendiente      | Adecuación funcional    |   — |   — |   — | Sin ejecutar todavía. |
| Pendiente | Pendiente      | Eficiencia de desempeño |   — |   — |   — | Sin ejecutar todavía. |
| Pendiente | Pendiente      | Seguridad               |   — |   — |   — | Sin ejecutar todavía. |

## Referencias del proyecto

- Catálogo de requisitos: [`ReqExtrafuncionales.md`](ReqExtrafuncionales.md).
- Criterios de aceptación: [`CriteriosAceptacion.md`](CriteriosAceptacion.md).
- Diseño arquitectónico: [`Arquitectura.md`](Arquitectura.md).
- Pruebas automatizadas actuales: `tests/` y comando `npm run verify`.
