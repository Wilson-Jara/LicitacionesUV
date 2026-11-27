# ISF225 — Guion de demo y matriz de coordinación

## Versión que se debe fijar

- Rama evaluable: `develop` después de fusionar los cuatro PR de modelado y el
  despliegue aprobado.
- Flujo principal propuesto: **Buscar licitaciones** (#43).
- Backend: `LicitacionesUV-backend`, con la API HTTP y su catálogo/PostgreSQL
  independientes.
- Frontend: SPA React con `LicitacionesProvider` y `VITE_API_BASE_URL`.
- Estado: las URLs públicas y el commit final deben ser confirmados por el equipo;
  no se inventan aquí.

## Recorrido de 15 minutos

| Tiempo      | Responsable    | Acción                                                                | Evidencia que debe mostrarse                   |
| ----------- | -------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| 0:00–0:30   | Wilson         | Presentar problema, objetivo y alcance de Entrega 3.                  | README y propósito del sistema.                |
| 0:30–2:30   | Wilson         | Explicar actores, caso **Buscar licitaciones** y límites del sistema. | Diagrama de casos de uso #129.                 |
| 2:30–5:00   | Wilson         | Seguir `Licitación` por el modelo de dominio.                         | Diagrama de clases #123.                       |
| 5:00–8:30   | Vicente García | Explicar mensajes de carga, filtros, error y respuesta vacía.         | Diagrama de secuencia #154.                    |
| 8:30–11:00  | Vicente Saa    | Ejecutar búsqueda, filtros y navegación desde la SPA.                 | Explorador publicado y URL con parámetros.     |
| 11:00–12:30 | Benjamin       | Explicar API, repositorio en memoria/PostgreSQL y contrato.           | Diagrama de componentes #153 y backend.        |
| 12:30–14:00 | Mauricio       | Revisar coherencia, prueba y manejo de error.                         | CI, caso de ID inexistente o lista vacía.      |
| 14:00–15:00 | Wilson         | Cerrar con limitaciones y trabajo futuro.                             | Separación #113 y conexión actual documentada. |

## Caso principal

1. Abrir la URL pública del frontend.
2. Entrar a `/licitaciones` y esperar el estado listo del catálogo.
3. Buscar `software` o una palabra equivalente del catálogo ficticio.
4. Aplicar filtros de sector, etiqueta, región y tipo; comprobar que se combinan
   mediante AND y que la URL se actualiza.
5. Abrir el detalle de una licitación y verificar que conserva el mismo objeto
   `Licitación` del modelo.
6. Explicar que `LicitacionesProvider` usa `licitacionesApi.js`, que la API
   responde el contrato y que el repositorio selecciona memoria/PostgreSQL.

## Fallo reproducible

Abrir `/licitaciones/no-existe` o solicitar un identificador inexistente en la
API. Mostrar el estado vacío/404 y la respuesta controlada, sin presentar logs
ni datos sensibles. Como segundo caso, aplicar filtros sin coincidencias y
mostrar el mensaje de resultados vacíos.

## Matriz previa al cierre

| Comprobación                                    | Estado                                         | Responsable de confirmar  |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------- |
| PR #129, casos de uso, fusionado y con revisión | Pendiente                                      | Autor + QA                |
| PR #123, clases, fusionado y con revisión       | Fusionado según GitHub; confirmar en `develop` | QA                        |
| PR #154, secuencia, fusionado y con revisión    | Fusionado según GitHub; confirmar en `develop` | QA                        |
| PR #153, componentes actualizado tras #151      | Pendiente de merge/revisión                    | Autor + QA                |
| Frontend publicado y URL estable                | Pendiente de confirmar                         | Responsable de despliegue |
| Backend publicado y `CORS_ORIGIN` coincidente   | Pendiente de confirmar                         | Backend/Integraciones     |
| CI del commit evaluable                         | Pendiente del commit final                     | QA                        |
| Ensayo cronometrado de 15 minutos               | Pendiente de ejecutar                          | Equipo                    |
| PDF de presentación y evaluación de pares       | Pendiente de entregar                          | Equipo                    |

Esta matriz distingue trabajo preparado de verificaciones humanas todavía no
ejecutadas, para no afirmar como evidencia una demo, ensayo o despliegue que no
conste en el repositorio.
