# Requisitos Extrafuncionales — LicitacionesUV

Catálogo de requisitos no funcionales del sistema, clasificados según **ISO 25010** y tipo de restricción.

**Prioridad:** Alta · Media · Baja

---

## 1. Resumen de priorización

| Prioridad | REF                              | Enfoque                                                                                                                                                               |
| --------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 Alta   | REF-01 a REF-04, REF-14 a REF-16 | Condiciones críticas del producto: rendimiento, seguridad, disponibilidad y flujo de aprobaciones. **Abordados explícitamente en** [Arquitectura.md](Arquitectura.md) |
| 🟡 Media  | REF-05 a REF-11                  | Forma de construir: calidad del código, stack tecnológico y reproducibilidad del proyecto                                                                             |
| 🟢 Baja   | REF-12 a REF-13                  | Mejoras de experiencia y accesibilidad que no bloquean la línea base                                                                                                  |

---

## 2. Catálogo por prioridad

### Prioridad Alta — condiciones críticas del producto

| ID     | Tipo (ISO 25010)                     | Descripción                                                                                                                                                                               |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REF-01 | Calidad de servicio (Rendimiento)    | El explorador de licitaciones debe mostrar los resultados filtrados en menos de 2 segundos desde la interacción del usuario                                                               |
| REF-02 | Calidad de servicio (Seguridad)      | Las acciones privadas (guardar favoritos, gestionar perfil) requieren sesión de usuario iniciada (autenticación obligatoria)                                                              |
| REF-03 | Calidad de servicio (Seguridad)      | Credenciales y secretos nunca se versionan: variables de entorno documentadas en `.env.example` y excluidas del repositorio por `.gitignore` (incluye `*.pem`, `*.key`, `*.p12`, `*.pfx`) |
| REF-04 | Calidad de servicio (Disponibilidad) | El sistema debe estar disponible al menos el 99% del tiempo en horario laboral (08:00–20:00)                                                                                              |
| REF-14 | Calidad de servicio (Mantenibilidad) | Los umbrales y niveles de aprobación se modifican mediante configuración, sin cambios de código                                                                                           |
| REF-15 | Calidad de servicio (Confiabilidad)  | Toda decisión de aprobación queda registrada con aprobador efectivo, nivel, fecha y calidad (titular o subrogante)                                                                        |
| REF-16 | Calidad de servicio (Fiabilidad)     | La resolución del aprobador efectivo considera delegaciones vigentes por fecha                                                                                                            |

### Prioridad Media — calidad de construcción

| ID     | Tipo (ISO 25010)                     | Descripción                                                                                                                                                                                     |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REF-05 | Calidad de servicio (Usabilidad)     | Interfaz responsive utilizable en escritorio y móvil, con estados de carga, vacío y error visibles para el usuario                                                                              |
| REF-06 | Calidad de servicio (Mantenibilidad) | El código se organiza por módulos de dominio (Feature-Driven) con responsabilidad única y bajo acoplamiento, verificado mediante análisis estático (ESLint)                                     |
| REF-07 | Calidad de servicio (Fiabilidad)     | Cualquier integrante debe poder levantar y validar el proyecto con un único comando (`npm run verify`), usando dependencias fijadas con SemVer explícito y `package-lock.json`                  |
| REF-08 | Calidad de servicio (Portabilidad)   | El sistema debe funcionar como SPA en navegadores modernos (Chrome, Firefox, Edge y Safari, últimas 2 versiones)                                                                                |
| REF-09 | Restricción técnica                  | El frontend debe desarrollarse en React 19 + Vite 8 (JavaScript), con el estado de los filtros sincronizado con la URL mediante `useSearchParams`                                               |
| REF-10 | Restricción técnica                  | Los datos se sirven inicialmente desde mocks (`licitaciones.mock.json`) con contratos de datos compatibles para ser reemplazados por el scraper/API real en la Fase 2 sin rediseñar los módulos |
| REF-11 | Restricción de proyecto              | Equipo de 5 integrantes; flujo Git con ramas por issue y Pull Requests con al menos un revisor distinto del autor antes del merge; fechas de entrega del curso                                  |

### Prioridad Baja — mejoras de experiencia

| ID     | Tipo (ISO 25010)                    | Descripción                                                                                                    |
| ------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| REF-12 | Otros no funcionales                | Interfaz íntegramente en español, con montos formateados en CLP y fechas en formato local chileno (API `Intl`) |
| REF-13 | Calidad de servicio (Accesibilidad) | Componentes con HTML semántico, contraste de color adecuado y navegación por teclado en los flujos principales |

---

## 3. Abordaje en el diseño

Los REF de prioridad **Alta** quedan explícitamente abordados en las decisiones de diseño arquitectónico documentadas en [Arquitectura.md](Arquitectura.md) (secciones "Justificación basada en REF priorizados" y "Decisiones de Diseño").

Los REF de prioridad **Media** son verificables con las herramientas del repositorio (ESLint, Prettier, `npm run verify`). Los de prioridad **Baja** mejoran la experiencia sin condicionar la línea base.
