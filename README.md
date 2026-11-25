# 🏛️ LicitacionesUV: Plataforma de Filtrado y Centralización de Licitaciones

Plataforma web desarrollada en **React + Vite** diseñada para centralizar, filtrar y optimizar la búsqueda de oportunidades comerciales y licitaciones publicadas por empresas privadas, recopiladas de forma automatizada mediante técnicas de web scraping.

> 🤖 **Para asistentes de IA:** reglas obligatorias de trabajo en [`AGENTS.md`](AGENTS.md) y contexto técnico en [`docs/AI_context.md`](docs/AI_context.md).

Este repositorio contiene el frontend. La API y PostgreSQL viven en [LicitacionesUV-backend](https://github.com/Wilson-Jara/LicitacionesUV-backend). La separación y sus verificaciones están documentadas en [Separación del backend](docs/separacion-backend.md).

**Si es tu primera vez con el proyecto**, sigue este orden: [Requisitos previos](#️-requisitos-previos) → [Instalación](#️-instalación-y-puesta-en-marcha) → [Ejemplo de ejecución](#ejemplo-de-ejecución-y-resultado-esperado) → [Problemas frecuentes](#problemas-frecuentes) → [Cómo extender y probar un cambio](#cómo-extender-y-probar-un-cambio). Todas las evidencias están enlazadas en [Evidencias y documentación](#evidencias-y-documentación).

| Versión publicada         | URL                                                      |
| ------------------------- | -------------------------------------------------------- |
| Frontend (Vercel)         | <https://licitacionesuv.vercel.app>                      |
| API (Render, plan gratis) | <https://licitacionesuv-backend.onrender.com/api/health> |

---

## 📌 Descripción del sistema

### ¿Qué es?

Es una solución web que reúne en un único punto de acceso las licitaciones y oportunidades de contratación publicadas por diversas empresas privadas. El sistema procesa y categoriza los datos para que proveedores y organizaciones encuentren oportunidades relevantes de manera rápida, accediendo directamente a la fuente oficial de cada convocatoria.

### ¿Qué problema resuelve?

Actualmente, la información de compras y contrataciones privadas se encuentra dispersa en múltiples plataformas y sitios corporativos. Esto genera:

- Pérdida de tiempo en revisiones manuales diarias.
- Riesgo de omitir convocatorias estratégicas con fechas límite próximas.
- Sobrecarga de información no relevante para el rubro específico de cada empresa.

### ¿Cómo funciona?

1. **Recolección:** Un scraper extrae periódicamente los datos públicos de portales autorizados (empresa convocante, fechas de apertura y cierre, rubro, ubicación, bases y enlaces oficiales).
2. **Filtrado y Procesamiento:** La plataforma clasifica las licitaciones por sector, palabras clave, fechas y montos estimados.
3. **Visualización y Gestión:** A través de la interfaz web, el usuario filtra, prioriza y hace seguimiento de las convocatorias que se ajustan a su perfil de negocio.

---

## 🧭 Historias de Usuario

Todas las historias están registradas como GitHub Issues.

| ID    | Nombre                                                | Issue        |
| ----- | ----------------------------------------------------- | ------------ |
| US-01 | Registrarse en la plataforma                          | #16          |
| US-02 | Iniciar sesión                                        | #16          |
| US-03 | Explorar licitaciones publicadas                      | #17          |
| US-04 | Filtrar licitaciones por palabra clave, región y tipo | #18          |
| US-05 | Acceder a la fuente oficial de una licitación         | #17          |
| US-06 | Guardar licitaciones en favoritos                     | #42          |
| US-07 | Gestionar perfil de usuario                           | #89          |
| US-08 | Configurar alertas de nuevas licitaciones             | #48          |
| US-09 | Aprobar o rechazar una licitación según el monto      | #55 (CR-302) |
| US-10 | Configurar umbrales de aprobación por unidad          | #56 (CR-302) |
| US-11 | Gestionar subrogancias con vigencia                   | #57 (CR-302) |
| US-12 | Buscar licitaciones por palabra clave                 | #43          |
| US-13 | Ver el detalle de una licitación                      | #44          |
| US-14 | Asistente guiado de requerimientos de la licitación   | #45          |
| US-15 | Visualizar favoritas en vistas de calendario y lista  | #46          |
| US-16 | Mostrar todos los resultados de búsqueda y filtros    | #47          |
| US-17 | Exportar resumen y bases de licitación en PDF         | #49          |

> Cada issue mantiene el formato: `US-XX: [nombre]` + enunciado _Como [actor], quiero [acción], para [beneficio]_ + criterios de aceptación (CA1, CA2, ...).

> Los criterios de aceptación de las historias abiertas y su trazabilidad con los requisitos extrafuncionales (REF) están en [docs/CriteriosAceptacion.md](docs/CriteriosAceptacion.md).

---

## 🚦 Requisitos Extrafuncionales

Ver: [ReqExtrafuncionales.md](docs/ReqExtrafuncionales.md)

---

## 🧱 Entidades del Dominio

| Entidad              | Descripción                                                           | Atributos principales                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Licitación**       | Oportunidad de contratación publicada por un organismo o empresa      | `id`, `título`, `institución convocante`, `monto`, `moneda`, `fecha de cierre`, `tipo` (pública/privada), `región`, `unidad`, `url de la fuente oficial` |
| **Usuario**          | Persona registrada que consulta y sigue licitaciones                  | `id`, `nombre`, `email`, `proveedor de autenticación` (local, Google, GitHub)                                                                            |
| **Favorito**         | Licitación guardada por un usuario para seguimiento                   | `id usuario`, `id licitación`, `fecha de guardado`                                                                                                       |
| **Región**           | División territorial usada para filtrar y categorizar                 | `id`, `nombre`                                                                                                                                           |
| **Unidad**           | Unidad o facultad que agrupa licitaciones y umbrales de aprobación    | `id`, `nombre`, `tipo` (lista predefinida: facultad, dirección, rectoría)                                                                                |
| **Aprobación**       | Decisión de aprobación emitida sobre una licitación                   | `id`, `id licitación`, `id aprobador efectivo`, `nivel`, `decisión`, `comentario`, `fecha`                                                               |
| **Delegación**       | Subrogancia de un titular a un subrogante por un período determinado  | `id`, `id titular`, `id subrogante`, `fecha inicio`, `fecha término`                                                                                     |
| **UmbralAprobación** | Rango de monto que define el nivel de aprobación requerido por unidad | `id`, `id unidad`, `monto mínimo` (inclusivo), `monto máximo` (exclusivo), `nivel aprobador`                                                             |

**Relaciones:**

- Un **Usuario** guarda muchas **Licitaciones** como **Favoritos** (1:N a través de Favorito).
- Una **Licitación** pertenece a una **Región** (N:1).
- Un **Favorito** referencia exactamente a un **Usuario** y a una **Licitación**.
- Un **Usuario** aprueba muchas **Aprobaciones** (1:N).
- Una **Licitación** recibe muchas **Aprobaciones** (1:N).
- Una **Delegación** referencia a dos **Usuarios** (titular y subrogante).
- Un **UmbralAprobación** pertenece a una **Unidad** y define el nivel según rangos de monto.
- Una **Licitación** puede pertenecer a una **Unidad** (0..1): `unidad_id` admite nulo porque el catálogo actual no trae unidad.

```mermaid
erDiagram
    USUARIO ||--o{ FAVORITO : guarda
    LICITACION ||--o{ FAVORITO : "es guardada en"
    REGION ||--o{ LICITACION : agrupa
    UNIDAD |o--o{ LICITACION : agrupa
    UNIDAD ||--o{ UMBRAL_APROBACION : define
    USUARIO ||--o{ APROBACION : aprueba
    LICITACION ||--o{ APROBACION : recibe
    USUARIO ||--o{ DELEGACION : "es titular de"
    USUARIO ||--o{ DELEGACION : "es subrogante de"
    USUARIO {
        string id
        string nombre
        string email
        string proveedorAuth
    }
    LICITACION {
        string id
        string titulo
        string institucion
        number monto
        string moneda
        date fechaCierre
        string tipo
        string regionId
        string unidadId
        string urlFuente
    }
    FAVORITO {
        string idUsuario
        string idLicitacion
        date fechaGuardado
    }
    REGION {
        string id
        string nombre
    }
    UNIDAD {
        string id
        string nombre
        string tipo
    }
    APROBACION {
        string id
        string idLicitacion
        string idAprobadorEfectivo
        number nivel
        string decision
        string comentario
        date fecha
    }
    DELEGACION {
        string id
        string idTitular
        string idSubrogante
        date fechaInicio
        date fechaTermino
    }
    UMBRAL_APROBACION {
        string id
        string idUnidad
        number montoMinimo
        number montoMaximo
        number nivelAprobador
    }
```

---

## 🖼️ Mockups

La [referencia visual de Licitaciones UV](docs/mockups/frontend-redesign/README.md) documenta el explorador y el acceso en temas claro y oscuro. La [implementación en React](docs/mockups/frontend-redesign/implementacion.md) reúne capturas de todas las rutas y los resultados de verificación.

Los mockups de aprobaciones (CR-302) son prototipos HTML de baja fidelidad: se abren directamente en el navegador desde [`docs/mockups/`](docs/mockups/).

| Mockup                                      | Archivo                                                                                                        | Historia de usuario relacionada |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Explorador de licitaciones con tarjetas     | (Figma, por subir)                                                                                             | US-03, US-05                    |
| Panel de filtros lateral                    | (Figma, por subir)                                                                                             | US-04                           |
| Mis favoritos                               | (Figma, por subir)                                                                                             | US-06                           |
| Bandeja de aprobaciones pendientes (CR-302) | [`docs/mockups/CR-302-bandeja-aprobaciones.html`](docs/mockups/CR-302-bandeja-aprobaciones.html)               | US-09, US-11                    |
| Panel de umbrales y subrogancias (CR-302)   | [`docs/mockups/CR-302-panel-umbrales-subrogancias.html`](docs/mockups/CR-302-panel-umbrales-subrogancias.html) | US-10, US-11                    |

---

## 🏗️ Diseño Arquitectónico

Ver: [Arquitectura.md](docs/Arquitectura.md)

La aplicación se construye como una **SPA en React** organizada bajo el enfoque **Feature-Driven** (`src/features/{licitaciones, auth, favoritos}`), con módulos compartidos en `src/shared` y configuración central de rutas en `src/app`.

---

## 👥 Responsabilidades del Equipo

| Integrante                    | Rol                                  | Ítems de la rúbrica a cargo                                                         |
| ----------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Wilson Jara (@Wilson-Jara)    | Project Manager / Analista funcional | 1.1 Historias de Usuario (Issues), README.md, coordinación y trazabilidad           |
| Vicente Garcia (@Vixoooooo19) | Tech Lead / Arquitecto de software   | 2.1 Diseño Arquitectónico (Arquitectura.md), 2.2 Diagrama de Arquitectura           |
| Vicente Saa (@Reinald-Code)   | Frontend Developer / UI              | 2.3 Mockups (consistencia con HU)                                                   |
| Benjamin Lazo (@lazo1838k)    | Backend Developer / Integraciones    | 2.4 Entidades del dominio, 1.2 Requisitos Extrafuncionales (ReqExtrafuncionales.md) |
| Mauricio Henriquez (@StelleC) | QA Engineer / DevOps                 | Revisión de coherencia entre artefactos (HU ↔ REF ↔ módulos ↔ mockups)              |

---

## 🚀 Metas y Escalabilidad

- [x] **Fase 1 (Actual):** Interfaz cliente en React + Vite para visualización y filtrado de licitaciones iniciales.
- [ ] **Fase 2:** Integración completa de scrapers automatizados y categorización dinámica por etiquetas.
- [ ] **Fase 3:** Sistema de alertas automáticas por correo para convocatorias de alto interés.
- [ ] **Fase 4:** Panel de estadísticas sobre tendencias de compra por sector y región.

### ⚠️ Limitaciones

- La plataforma depende de la disponibilidad y estructura pública de las fuentes de origen.
- La herramienta centraliza y organiza información, pero no reemplaza la postulación formal en el portal del convocante.

---

## 🛠️ Requisitos Previos

Estas son las versiones con las que el proyecto se construye y se prueba. Si usas las mismas, deberías obtener exactamente los resultados descritos en este README.

| Herramienta | Versión verificada                   | Mínimo y notas                                                                                                                     |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Node.js     | **22.22.0** (la que usa el CI)       | 20.19 alcanza para `dev`, `build` y `test`; `npm run test:coverage` necesita **22.8 o superior** porque usa umbrales de cobertura. |
| npm         | 10.x                                 | Viene con Node.js 22.                                                                                                              |
| Git         | 2.x                                  | Con fines de línea LF (ver [Problemas frecuentes](#problemas-frecuentes)).                                                         |
| Navegador   | Chrome o Edge actualizado            | La app usa `sessionStorage` (sesión de prueba), `localStorage` (favoritos, umbrales) y Web Workers (PDF).                          |
| Sistema     | Windows 10/11 (equipo) y Ubuntu (CI) | Los comandos de este README funcionan en PowerShell y en bash.                                                                     |
| Backend     | Repositorio `LicitacionesUV-backend` | Necesario para ver licitaciones: el frontend pide el catálogo a la API.                                                            |
| Editor      | Visual Studio Code (recomendado)     | Con la extensión de Prettier, para formatear igual que el CI.                                                                      |

**Stack principal:** React 19, Vite 8, React Router 7, jsPDF 4, Motion 14, ESLint 10 y Prettier 3. Las versiones exactas están en `package.json` y `package-lock.json`. Pruebas con el runner nativo de Node (`node --test`).

### Wrapper y línea base reproducible

Al ser un proyecto Node.js, el equivalente al wrapper `./gradlew` de Gradle es el propio `npm`, complementado con los mecanismos de reproducibilidad del proyecto:

- **`package-lock.json`:** bloquea el árbol de dependencias para installs 100% reproducibles.
- **`engines` en `package.json`:** declara las versiones mínimas de Node.js y npm requeridas.
- **SemVer explícito:** las dependencias se declaran con versión exacta (`19.2.8`, sin rangos `^`/`~`), de modo que todos los entornos usan exactamente la misma versión.

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/Wilson-Jara/LicitacionesUV.git
cd LicitacionesUV
```

### 2. Validar versión de Node.js

```bash
node --version
npm --version
```

Debe mostrar `v22.x` (idealmente `v22.22.0`) y `10.x`. Si tu versión de Node.js es menor a la 22.8, actualízala antes de continuar: con una más antigua el proyecto arranca, pero `npm run test:coverage` falla.

### 3. Instalar dependencias

```bash
npm ci
```

`npm ci` instala exactamente las versiones de `package-lock.json`. Úsalo también **cada vez que hagas `git pull`**: si otra persona agregó una dependencia (por ejemplo `motion`), tu `node_modules` queda desactualizado y la app no arranca. `npm install` solo se usa cuando quieres agregar o actualizar una dependencia a propósito.

### 4. Comando único integrador

El proyecto expone un comando único que **limpia, verifica el formato, compila, prueba y empaqueta** (equivalente a `./gradlew clean build`):

```bash
npm run verify
```

Equivale a ejecutar en secuencia:

```bash
npm run clean        # elimina artefactos de build (dist/)
npm run lint         # análisis estático con ESLint
npm run format:check # verifica el formato unificado (falla si hay desviaciones, ideal para CI/CD)
npm run test         # pruebas con el runner nativo de Node
npm run build        # compilación y empaquetado con Vite
```

### 5. Ejecutar entorno de desarrollo

```bash
npm run dev
```

### Ejecutar frontend y backend por separado

Desde esta raíz, `npm ci` y `npm run dev` inician el frontend. Sus pruebas,
compilación y cobertura son independientes de la API y no requieren PostgreSQL.

Desde la raíz de `LicitacionesUV-backend`, `npm ci` y `npm start` sirven la API
con su catálogo propio en memoria. Para persistencia PostgreSQL, una persona
instala e inicia PostgreSQL 16 directamente, configura la conexión local y ejecuta
`npm run db:setup` antes del servidor. Consultar la
[guía del backend](https://github.com/Wilson-Jara/LicitacionesUV-backend).

El frontend obtiene el catálogo de la API en `VITE_API_BASE_URL` (por defecto
`http://localhost:3000/api`), así que para ver licitaciones en desarrollo la API
debe estar levantada; si no responde, cada pantalla muestra el error con un botón
«Reintentar». El backend permite por defecto el origen Vite
`http://localhost:5173` mediante `CORS_ORIGIN`. La integración con Mercado Público
tampoco forma parte de esta separación.

### Variables de entorno

El proyecto documenta sus variables en `.env.example`. Para configurar tu entorno local:

```bash
cp .env.example .env
```

- Cada variable está documentada con su **nombre**, **formato** y **obligatoriedad** dentro de `.env.example`.
- Los archivos `.env` reales nunca se suben al repositorio (excluidos por `.gitignore`), igual que certificados y llaves privadas (`*.pem`, `*.key`, `*.p12`, `*.pfx`).

### Despliegue del frontend (Vercel)

**URL pública:** <https://licitacionesuv.vercel.app>

El frontend se publica como sitio estático en Vercel. `vercel.json` fija el
framework (Vite), el comando `npm run build`, la carpeta `dist` y una reescritura
de todas las rutas a `index.html`, para que al recargar o abrir directamente
`/licitaciones/:id`, `/favoritos` u otra ruta de React Router no se responda 404.

```bash
npx vercel login       # una vez, con la cuenta de quien despliega
npx vercel             # despliegue de vista previa (pide vincular el proyecto la primera vez)
npx vercel --prod      # despliegue de producción
```

La CLI guarda el vínculo local en `.vercel/`, que está excluido de Git.

**Antes de desplegar, la API debe estar publicada.** El frontend obtiene el
catálogo de la API, y Vite incrusta `VITE_API_BASE_URL` al compilar. Si la
variable no está definida en el proyecto de Vercel (Settings → Environment
Variables), el sitio publicado llama a `http://localhost:3000/api`, que no existe
para los visitantes, y muestra el error con el botón «Reintentar». Por eso:

1. La API debe estar desplegada con una URL pública y su `CORS_ORIGIN` debe
   incluir `https://licitacionesuv.vercel.app`.
2. `VITE_API_BASE_URL` debe apuntar a esa API en el entorno _Production_ de
   Vercel.
3. Cambiar la variable no actualiza el sitio publicado: hay que volver a
   desplegar.

#### Quién vuelve a desplegar y cuándo

El proyecto `licitacionesuv` de Vercel pertenece a la cuenta de Vicente Saa
(@Reinald-Code) y **no está conectado a GitHub**, así que el sitio no se actualiza
solo con cada push o merge: si nadie despliega, la URL sigue mostrando la versión
anterior.

- **Responsable:** Vicente Saa (@Reinald-Code). Si no está disponible, otra persona
  puede publicar una copia con su propia cuenta (`npx vercel --prod`), pero obtendrá
  otra URL, que habría que actualizar aquí y en `CORS_ORIGIN` del backend.
- **Cuándo:** después de cada merge a `main`, antes de cada demo o presentación y
  cada vez que cambie `VITE_API_BASE_URL`.
- **Cómo:** desde una copia limpia y actualizada de la rama que se publica:

  ```bash
  git pull
  npm ci
  npm run verify
  npx vercel --prod
  ```

---

## Ejemplo de ejecución y resultado esperado

Recorrido completo en local, con dos terminales. Lo que aparece en «Resultado esperado» es lo que debes ver; si algo no coincide, revisa [Problemas frecuentes](#problemas-frecuentes).

**Terminal 1 · API** (desde la raíz de `LicitacionesUV-backend`):

```bash
npm ci
npm start
```

Resultado esperado:

```
DATABASE_URL no definida: la API usa el catálogo propio en memoria
API LicitacionesUV escuchando en http://localhost:3000
```

**Terminal 2 · Frontend** (desde la raíz de este repositorio):

```bash
npm ci
npm run dev
```

Resultado esperado: Vite muestra `Local: http://localhost:5173/`.

**En el navegador:**

| Paso | Acción                                                    | Resultado esperado                                                                                                                            |
| ---- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Abrir <http://localhost:3000/api/health>                  | `{"status":"ok","service":"licitacionesuv-backend",...}`                                                                                      |
| 2    | Abrir <http://localhost:5173/licitaciones>                | El contador dice **«6 de 6 convocatorias visibles»**.                                                                                         |
| 3    | Escribir `software` en el buscador                        | Queda **1** resultado: «Renovación de licencias de software» (`licitacion-005`). La URL incluye `?keyword=software`.                          |
| 4    | Abrir <http://localhost:5173/licitaciones/licitacion-999> | Se muestra la página «no encontrada», porque la API responde `404 {"error":"Licitación no encontrada"}`.                                      |
| 5    | Detener la API (Ctrl+C en la terminal 1) y recargar       | Aparece **«No se pudo cargar el catálogo»** con el botón **«Reintentar»**. Al volver a levantar la API y pulsar «Reintentar», carga de nuevo. |

**Verificación completa** (desde este repositorio):

```bash
npm run verify
npm run test:coverage
```

Resultado esperado: `verify` termina sin errores (ESLint y Prettier no informan problemas, el resumen de pruebas termina en `# fail 0` y Vite muestra `✓ built in ...`), y `test:coverage` imprime la tabla de cobertura sin el mensaje `does not meet threshold`. Qué mide y por qué está en [docs/cobertura.md](docs/cobertura.md).

---

## Problemas frecuentes

| Síntoma                                                                                                          | Causa                                                                                                                                                                                                                                                                      | Solución                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite muestra un error del tipo `Failed to resolve import "motion/react"` y la app no carga.                      | `node_modules` desactualizado: hiciste `git pull` y alguien agregó una dependencia.                                                                                                                                                                                        | Ejecutar `npm ci` y volver a iniciar `npm run dev`.                                                                                                                                          |
| El backend se detiene con `Cannot find package 'pg' imported from .../src/db/pool.js`.                           | Lo mismo en el repositorio del backend: falta instalar sus dependencias.                                                                                                                                                                                                   | En la raíz de `LicitacionesUV-backend`, ejecutar `npm ci`.                                                                                                                                   |
| En local aparece «No se pudo cargar el catálogo».                                                                | La API no está levantada o `VITE_API_BASE_URL` apunta a otra dirección.                                                                                                                                                                                                    | Levantar la API (`npm start` en el backend), comprobar <http://localhost:3000/api/health> y pulsar «Reintentar». Si cambiaste `.env`, reiniciar `npm run dev`.                               |
| En <https://licitacionesuv.vercel.app> aparece «No se pudo cargar el catálogo», sobre todo en la primera visita. | **Render dormido:** en el plan gratuito, la API se suspende tras un rato sin visitas. La primera petición responde `503` (`SERVICE WAKING UP`) mientras arranca, y tarda alrededor de un minuto.                                                                           | Abrir <https://licitacionesuv-backend.onrender.com/api/health>, esperar a que responda `{"status":"ok",...}` y pulsar «Reintentar». Antes de una demo, hacerlo unos minutos antes.           |
| La consola del navegador dice `blocked by CORS policy`.                                                          | La API acepta un solo origen (`CORS_ORIGIN`, por defecto `http://localhost:5173`). Si el puerto 5173 estaba ocupado, Vite abre la app en `5174` y la API la rechaza. Tampoco se puede usar la API de Render desde `localhost`, porque su origen permitido es el de Vercel. | Cerrar la otra instancia de Vite para que vuelva a `5173`, o poner la URL que muestra Vite en `CORS_ORIGIN` del `.env` del backend y reiniciarlo. En desarrollo, usar la API local.          |
| `npm run format:check` marca con `[warn]` archivos que no modificaste (Windows).                                 | **Fines de línea CRLF:** Git o el editor guardaron los archivos con `CRLF`, y Prettier exige `LF` (`.gitattributes` fija `eol=lf`).                                                                                                                                        | Ejecutar `npm run format` y comprobar con `git status` que solo cambian los fines de línea. Para que no vuelva a pasar: `git config core.autocrlf false` y, en VS Code, `"files.eol": "\n"`. |
| `npm run test:coverage` termina con `bad option: --test-coverage-lines`.                                         | Node.js anterior a 22.8: los umbrales de cobertura no existen en esa versión.                                                                                                                                                                                              | Instalar Node.js 22 LTS (`node --version` debe mostrar `v22.x`).                                                                                                                             |
| La API no arranca: `listen EADDRINUSE: address already in use 0.0.0.0:3000`.                                     | Ya hay otra API (u otro programa) usando el puerto 3000.                                                                                                                                                                                                                   | Cerrar la otra terminal, o usar `PORT=3001` en el `.env` del backend y `VITE_API_BASE_URL=http://localhost:3001/api` en el `.env` del frontend.                                              |
| PowerShell responde que `test:coverage` (o `verify`) no se reconoce como comando.                                | Son scripts de `package.json`, no programas instalados.                                                                                                                                                                                                                    | Anteponer `npm run`: `npm run test:coverage`.                                                                                                                                                |

---

## Cómo extender y probar un cambio

### Dónde va cada cosa

El frontend está organizado por funcionalidad (`src/features/<funcionalidad>/`). Dentro de cada una, las reglas de negocio viven en funciones puras (`.js`) separadas de los componentes (`.jsx`), porque así se pueden probar con `node --test` sin navegador.

| Si quieres cambiar…                             | Edita                                                                                                           | Y prueba en                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Una regla de búsqueda, filtro u orden           | `src/features/licitaciones/licitacionFilters.js`                                                                | `tests/licitacionFilters.test.js`                                                                    |
| Formatos de monto o fecha, o la regla de cierre | `src/features/licitaciones/licitacionUtils.js`                                                                  | `tests/licitacionUtils.test.js`                                                                      |
| Cómo se llama a la API                          | `src/features/licitaciones/services/licitacionesApi.js`                                                         | `tests/licitacionesApi.test.js` (usa un `fetch` falso, no necesita la API levantada)                 |
| Los campos de una licitación (si cambia la API) | `src/features/licitaciones/contratoLicitaciones.js` y el backend                                                | `tests/licitacionesDataContract.test.js`                                                             |
| Favoritos o umbrales guardados en el navegador  | `src/features/favoritos/data/` o `src/features/aprobaciones/data/`, sobre `src/shared/lib/persistenciaLocal.js` | `tests/favoritosStorage.test.js`, `tests/umbralesStorage.test.js`, `tests/persistenciaLocal.test.js` |
| Una pantalla o un componente                    | El `.jsx` de la carpeta de la funcionalidad y su `.css`                                                         | A mano con `npm run dev` y `npm run build`                                                           |
| Una ruta nueva                                  | `src/app/routes/AppRoutes.jsx` (y el enlace en `src/shared/components/Navbar.jsx`)                              | A mano, recargando la ruta en `npm run dev`                                                          |

### Paso a paso

1. **Rama desde `develop` actualizado:**
   ```bash
   git checkout develop
   git pull
   npm ci
   git checkout -b feat/<numero-issue>-<descripcion-corta>
   ```
   Prefijos: `feat/` para funcionalidades, `fix/` para correcciones, `docs/` para documentación (ver [Flujo de Trabajo en Git](#-flujo-de-trabajo-en-git)).
2. **Escribe primero la prueba** del comportamiento nuevo en el archivo de `tests/` que corresponda, con un caso válido, uno de límite y uno de error. Ejecútala sola y comprueba que **falla**:
   ```bash
   node --test tests/licitacionFilters.test.js
   ```
3. **Implementa el cambio** y repite el comando hasta que pase.
4. **Prueba a mano** con `npm run dev` (y la API levantada) el flujo afectado.
5. **Verifica todo** antes de subir:
   ```bash
   npm run format
   npm run verify
   npm run test:coverage
   ```
6. **Commit y Pull Request hacia `develop`**, con la plantilla del repositorio. El CI repite `verify` y la cobertura; el PR necesita la aprobación de QA y de otro integrante.
7. **Después del merge a `main`**, volver a desplegar el frontend (ver [Quién vuelve a desplegar y cuándo](#quién-vuelve-a-desplegar-y-cuándo)).

**Ejemplo real de este ciclo:** la corrección de `useAuth` siguió exactamente estos pasos, del Issue #114 al Release `v1.0.0`. Está registrada en [Taller de Gestión de la Configuración](#actividad--taller-de-gestión-de-la-configuración-del-issue-al-release).

---

## Evidencias y documentación

| Tema                                                    | Documento                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Contexto técnico y reglas para IA                       | [docs/AI_context.md](docs/AI_context.md) · [AGENTS.md](AGENTS.md)                                                         |
| Arquitectura y separación del backend                   | [docs/Arquitectura.md](docs/Arquitectura.md) · [docs/separacion-backend.md](docs/separacion-backend.md)                   |
| Modelado (casos de uso, clases, secuencia, componentes) | [docs/modelado/](docs/modelado/README.md)                                                                                 |
| Criterios de aceptación                                 | [docs/CriteriosAceptacion.md](docs/CriteriosAceptacion.md)                                                                |
| Requisitos extrafuncionales y calidad                   | [docs/ReqExtrafuncionales.md](docs/ReqExtrafuncionales.md) · [docs/PerfilMedidasCalidad.md](docs/PerfilMedidasCalidad.md) |
| API y colecciones de Thunder Client                     | [docs/api/](docs/api/README.md) · [docs/thunder-client/](docs/thunder-client/)                                            |
| Pruebas y cobertura                                     | [docs/cobertura.md](docs/cobertura.md)                                                                                    |
| Depuración                                              | [docs/depuracion.md](docs/depuracion.md) · [docs/evidencia/depuracion/](docs/evidencia/depuracion/)                       |
| Contratos y programación defensiva                      | [docs/ejercicio-2-2.md](docs/ejercicio-2-2.md) · [docs/evidencia/contratos/](docs/evidencia/contratos/)                   |
| Intervención: persistencia local (#124)                 | [docs/persistencia-local.md](docs/persistencia-local.md)                                                                  |
| Intervención: porcentajes de estadísticas (#134)        | [docs/estadisticas-porcentajes.md](docs/estadisticas-porcentajes.md)                                                      |
| Exportación a PDF                                       | [docs/evidencia/export-pdf/](docs/evidencia/export-pdf/)                                                                  |
| Filtros por sector y etiqueta                           | [docs/evidencia/filtros-sector-etiqueta/](docs/evidencia/filtros-sector-etiqueta/)                                        |
| Mockups                                                 | [docs/mockups/](docs/mockups/)                                                                                            |
| Roles del equipo                                        | [docs/roles-equipo.md](docs/roles-equipo.md)                                                                              |
| Informe de cierre y notas de versión (C7)               | [docs/informe-cierre.md](docs/informe-cierre.md)                                                                          |
| Backend: guía, PostgreSQL y evidencias                  | [LicitacionesUV-backend](https://github.com/Wilson-Jara/LicitacionesUV-backend#readme)                                    |

---

## Formateo de código

El proyecto utiliza [Prettier](https://prettier.io/) para mantener un formato consistente en los archivos compatibles.

### Formatear archivos

Para aplicar automáticamente el formato:

```bash
npm run format
```

### Verificar el formato

Para comprobar que los archivos ya estén formateados sin modificarlos:

```bash
npm run format:check
```

### Configuración

La configuración se encuentra en:

- `.prettierrc`: reglas de formato del proyecto.
- `.prettierignore`: archivos y carpetas excluidos del formateo.

Antes de crear un Pull Request, ejecuta:

```bash
npm run verify
```

El comando `verify` ya incluye la verificación de formato (`format:check`), por lo que el build falla si algún archivo no cumple el formato unificado del equipo.

El formateo no debe cambiar la lógica de la aplicación, únicamente la presentación del código.

---

## 🌿 Flujo de Trabajo en Git

El proyecto usa un modelo de ramas con dos ramas permanentes:

- **`main`**: rama de producción. Contiene únicamente versiones estables y verificadas. Está protegida: nadie trabaja sobre ella directamente.
- **`develop`**: rama de integración. Aquí convergen todas las funcionalidades terminadas y revisadas. Es la base desde la que se crean todas las ramas de trabajo.

```text
main      ──────■────────────────■──────►  (solo merges de release/hotfix)
                ▲                ▲
develop       ──■──■────■───────■──────►  (integra features vía PR)
                  ▲  ▲
feat/41-…   ───────■──■──────────────►  (ramas de trabajo)
```

### Gestión de Ramas

Nunca trabajes directo sobre `main` ni sobre `develop`. Toda tarea (Issue) se desarrolla en su propia rama, creada **siempre desde `develop`**:

```bash
git checkout develop
git pull
git checkout -b feat/[numero-issue]-[descripcion-corta]
```

Convención de nombres según el tipo de tarea:

| Tipo     | Uso                                     | Ejemplo                        |
| -------- | --------------------------------------- | ------------------------------ |
| `feat/`  | Nueva funcionalidad                     | `feat/41-modo-oscuro-claro`    |
| `fix/`   | Corrección de un bug                    | `fix/25-filtro-fecha-invalido` |
| `docs/`  | Documentación                           | `docs/30-actualizar-readme`    |
| `chore/` | Tareas de mantenimiento o configuración | `chore/8-actualizar-gitignore` |

### Registro de Cambios (Commits)

Usa mensajes atómicos e imperativos que describan el efecto del cambio, no el archivo modificado:

```bash
git add .
git commit -m "Agrega boton de alternancia de tema oscuro y claro"
```

### Publicación y Pull Request

Publica la rama y abre el Pull Request **hacia `develop`** (nunca hacia `main`):

```bash
git push -u origin feat/[numero-issue]-[descripcion-corta]
```

El PR debe incluir: propósito, resumen de cambios, cómo se verificó y el Issue que cierra:

```text
Closes #[número_issue]
```

> Cada PR hacia `main` o `develop` requiere dos aprobaciones antes del merge, una de QA (@StelleC) y otra de un integrante habilitado. Ambos revisores deben ser distintos del autor.

### Verificación automática y protección de ramas

El repositorio aplica controles automáticos para que ningún cambio llegue a las ramas permanentes sin validación:

- **Integración continua (CI):** el workflow `.github/workflows/verify.yml` ejecuta `npm run verify` en cada Pull Request hacia `main` y `develop`. Si lint, formato, pruebas o build fallan, el PR queda bloqueado.
- **Protección de ramas.** Los rulesets de `main` y `develop` deben exigir dos aprobaciones, la revisión de propietarios de código y el check `verify` antes del merge.
- **Asignación de revisores.** `.github/CODEOWNERS` solicita automáticamente la revisión de QA. Ver [Asignación del revisor](#asignación-del-revisor).
- **Plantilla de Pull Request:** `.github/pull_request_template.md` recuerda completar propósito, resumen, cómo se verificó y el issue que cierra.
- **Plantillas de issues:** `.github/ISSUE_TEMPLATE/` incluye historia de usuario, tarea/chore y bug, con _Definition of Ready_ (DoR) y _Definition of Done_ (DoD).
- **Revisor automático (IA):** el workflow `.github/workflows/ai-review.yml` publica un comentario con la revisión de DeepSeek (`.github/scripts/ai-review.mjs`) al abrir o reabrir un PR/issue y, bajo demanda, al agregar la etiqueta `ai-review`. Redacta secretos antes de enviar el contenido al modelo y responde en español. Requiere el secret `DEEPSEEK_API_KEY`; si no está configurado, la revisión se omite sin bloquear el CI.

La revisión automática de IA aporta sugerencias. Las dos aprobaciones corresponden a revisores humanos.

### Asignación del revisor

El revisor no se define como _assignee_ del issue (ese rol corresponde a quien implementa), sino que se registra en dos lugares:

- **En el tablero (planificación):** el Project incluye un campo personalizado **"Revisor"** donde se indica qué integrante revisará la entrega.
- **En el Pull Request (ejecución).** GitHub solicita la revisión de @StelleC mediante [`.github/CODEOWNERS`](.github/CODEOWNERS). El autor solicita la segunda revisión en el panel **Reviewers**.

Cuando @StelleC prepara un cambio, otro integrante debe abrir el PR. GitHub impide aprobar un PR propio.

#### CODEOWNERS

El archivo [`.github/CODEOWNERS`](.github/CODEOWNERS) asigna todos los archivos a @StelleC. GitHub lee el archivo de la rama base del PR. Para exigir su aprobación, integrar este archivo en ambas ramas y habilitar **Require review from Code Owners** en sus rulesets.

### ¿Cuándo se fusiona `develop` hacia `main`?

La integración de `develop` → `main` **no ocurre con cada feature**. Solo se realiza cuando el equipo decide cerrar una **versión entregable** (por ejemplo, al término de un hito de evaluación o un corte de sprint). El procedimiento es:

1. Verificar que `develop` está estable y que `npm run verify` pasa completo.
2. Abrir un Pull Request `develop` → `main` con un resumen de todo lo integrado desde el último corte.
3. Obtener la aprobación de QA (@StelleC) y la de otro integrante habilitado. Ambos deben ser distintos del autor del PR.
4. Merge a `main` y, si corresponde, crear un tag de versión (`git tag -a v0.X.0 -m "..."`).
5. Mantener `develop` como base de trabajo para el siguiente ciclo.

Para correcciones urgentes detectadas en producción se crea una rama `hotfix/[descripcion]` **desde `main`**, se integra a `main` y luego se sincroniza con `develop` (`git checkout develop && git merge main`).

---

## Fundamentos de Ingeniería de Software

### Actividad · Diagnóstico de madurez, caso equipo Aurora

En parejas · 10 minutos. Calificar las áreas de proceso con la escala N · P · L · F (ISO/IEC 33000) citando evidencia del caso, y luego ubicar el nivel de madurez del equipo. La regla de la actividad: se califica lo que **está registrado**, no lo que el equipo probablemente hace.

### Gestión de requisitos — P

Tienen las 9 historias de usuario en el tablero, o sea no es que no existan, pero solo 3 tienen criterio de aceptación y los cambios los resuelven conversando en la reunión, nada queda escrito. La práctica está a medias.

### Planificación del proyecto — P

Sí planifican: sprints de 2 semanas con fecha fija, eso está. Lo débil es que asignan la carga "a ojo" en la reunión de inicio, sin mirar cuánto se demoraron en los sprints anteriores. Planifican, pero sin datos.

### Gestión de la configuración — L

De las 4 áreas es la mejor. Todo el código está en Git y versionado, así que hay control. Igual le falta: no hay convención para los mensajes de commit ni etiqueta de versión, o sea si les preguntan "qué versión entregaron" no sabrían señalarla.

### Verificación — N

Prueban manualmente antes de cada demo, pero no hay ni un caso de prueba escrito ni registro de qué se probaron. Como hay que calificar lo que está registrado y no lo que uno supone que hicieron, aquí no hay evidencia de nada: va N.

### ¿En qué nivel está el equipo?

Lo ubicamos en **nivel 1 (Inicial)**. Entregaron las 4 iteraciones pero a pura pasada, y de hecho las últimas 2 demos se atrasaron y el equipo lo echa a los "cambios de último minuto", o sea responden con sobreesfuerzo y no con proceso. Tienen cosas del nivel 2 empezadas (tablero, sprints, Git, actas), pero ninguna terminada, falta el registro y la trazabilidad. Lo que más les falta para subir a nivel 2: criterios de aceptación en todos los requisitos, registrar los cambios, identificar la versión que entregan y dejar constancia de las pruebas.

### Actividad · Parte 2: Propuesta de mejora para nivel 2

En parejas · 12 minutos. Propuesta de dos acciones para llevar a Aurora hacia el Nivel 2 de madurez (Gestionado), atacando brechas distintas, sin comprar software ni sumar personas, y con indicadores calculables con los registros existentes del equipo.

### Propuesta de mejoras (Tabla de acciones)

| Campo                   | Acción 1 (Gestión de Configuración y Calidad)                                                                                                                                                                     | Acción 2 (Gestión de Requisitos y Control)                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brecha**              | Los cambios en código/documentación se integran sin validación ni revisión previa, generando fallos en producción y desorden en el repositorio.                                                                   | Las tareas se inician e implementan sin criterios de aceptación ni requisitos claros, produciendo retrabajo e incertidumbre en las entregas.                                                                    |
| **Acción**              | Establecer **reglas de protección de rama (`main`)** en GitHub exigiendo aprobación de al menos un par y ejecución de la suite de pruebas (`npm run verify`) antes de consolidar cambios.                         | Implementar una **plantilla estandarizada de tareas/issues** que exija definir la _Definition of Ready_ (DoR: criterios de aceptación) y _Definition of Done_ (DoD: verificación de QA) para cada tarea.        |
| **Responsable y plazo** | **Tech Lead / QA**, Plazo: 3 días                                                                                                                                                                                 | **Project Manager / Analista**, Plazo: 5 días (1 semana)                                                                                                                                                        |
| **Evidencia esperada**  | • Regla de _Branch Protection_ activa en el repositorio.<br>• Plantilla de Pull Request (`pull_request_template.md`) con _checklist_ de verificación.                                                             | • Plantilla oficial de tareas en `.github/ISSUE_TEMPLATE/`.<br>• Tablero de proyecto (Kanban) con tareas que incluyen criterios de aceptación y DoD antes de iniciar.                                           |
| **Indicador**           | **Tasa de integraciones seguras:** Medido como la cantidad de PRs fusionados que contaron con aprobación previa de un par y pruebas pasadas, sobre el total de PRs del sprint (extraído del historial de GitHub). | **Tasa de entregas sin retrabajo:** Medido como la cantidad de tareas cerradas que cumplieron los criterios de aceptación al primer intento sin ser reabiertas por errores (extraído del estado de los Issues). |

### Cumplimiento de condiciones

- **Brechas distintas:** La Acción 1 aborda la Gestión de Configuración y Calidad de Integración del software, mientras que la Acción 2 aborda la Gestión y Control de Requisitos del proyecto.
- **Sin compras ni personal nuevo:** Ambas acciones operan al 100% sobre la infraestructura existente de GitHub, plantillas Markdown y scripts del repositorio (`npm run verify`).
- **Indicadores calculables:** Los indicadores se obtienen directamente de los registros nativos de GitHub (historial de Pull Requests e Issues).

### Actividad · Taller de arquitectura: priorización ISO 25010

Trabajo en clases sobre el proyecto del grupo. El taller tiene tres fases y culmina en un bosquejo arquitectónico defendible: **Fase 1** priorizar los atributos ISO 25010, **Fase 2** decidir el estilo arquitectónico, el _trade-off_ y los ASR, y **Fase 3** poner en común el bosquejo.

### Fase 1 · Atributos (10 min)

Del catálogo ISO 25010 se marcaron los atributos que aplican a LicitacionesUV y se les asignó prioridad. El equipo acordó que **solo tres atributos** serían de prioridad Alta, eligiendo las condiciones críticas del producto, que coinciden con los REF de mayor prioridad documentados en [`docs/ReqExtrafuncionales.md`](docs/ReqExtrafuncionales.md).

| Atributo          | Pregunta guía para el sistema                         | Prioridad |
| ----------------- | ----------------------------------------------------- | --------- |
| Rendimiento       | ¿Cuántos usuarios simultáneos? ¿Hay tiempos críticos? | **Alta**  |
| Seguridad         | ¿Hay datos sensibles? ¿Quién accede a qué?            | **Alta**  |
| Fiabilidad        | ¿Puede caerse? ¿Por cuánto tiempo sin daño?           | **Alta**  |
| Mantenibilidad    | ¿Con qué frecuencia cambiará? ¿Rotará el equipo?      | Media     |
| Usabilidad        | ¿Qué tipo de usuario? ¿Necesita entrenamiento?        | Media     |
| Interoperabilidad | ¿Debe integrarse con otros sistemas o APIs?           | Media     |

#### Justificación de las prioridades

- **Rendimiento (Alta) — REF-01.** El explorador es el flujo principal y debe filtrar en menos de 2 segundos. Hoy el conjunto de datos es mock, por lo que el número de usuarios simultáneos aún no es medible; el criterio crítico por ahora es el tiempo de respuesta.
- **Seguridad (Alta) — REF-02 y REF-03.** Aunque el contenido de las licitaciones sea público, existen cuentas de usuario (login/registro), acciones privadas (guardar favoritos) y secretos de configuración; además el flujo de aprobaciones exige control de acceso por roles (REF-14 a REF-16).
- **Fiabilidad (Alta) — REF-04.** El sistema debe estar disponible al menos el 99 % en horario laboral. En esta fase (SPA estática con mocks) se respalda con `npm run verify` y la estabilidad del build; la disponibilidad se vuelve plenamente medible en la Fase 2, con el scraper/API real.
- **Mantenibilidad (Media) — REF-06.** La arquitectura Feature-Driven y la rotación del equipo importan, pero no son una condición que rompa el producto; se sostienen con ESLint, convenciones y bajo acoplamiento.
- **Usabilidad (Media) — REF-05.** El usuario es público general y empresas, sin entrenamiento previo, por lo que la interfaz debe ser intuitiva, responsive y con estados de carga, vacío y error; es importante, pero no bloqueante como las condiciones críticas.
- **Interoperabilidad (Media).** La integración con el scraper/API real es clave para la Fase 2 (REF-10), pero hoy no aplica porque los datos son mock; es una restricción técnica de evolución más que una condición crítica actual.

> **Trade-off de priorización:** se evaluó dejar Interoperabilidad en Alta, pero con solo tres cupos se priorizaron las condiciones críticas del producto. Si la integración con fuentes externas pasa a ser bloqueante, se intercambiaría por Fiabilidad.

### Fase 2 · Decisión arquitectónica

#### Decisión 1 · Estilo principal

**Estilo elegido: Monolito modular en capas (Feature-Driven).**

De la tabla _Del atributo al estilo_, la fila que aplica es **Simplicidad y time-to-market → Monolito en capas**. Los estilos distribuidos se descartan porque sus atributos gatillantes no están en Alta y, además, degradan los tres atributos críticos del proyecto.

| Estilo de la tabla    | Atributo que lo gatilla  | Se descarta porque…                                                                    |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| Microservicios        | Escalabilidad por partes | Nuestro Alta no es escalabilidad; agrega red y despliegue.                             |
| Event-Driven          | Desacoplamiento          | Nuestro Alta no es desacoplamiento; la trazabilidad de un flujo se vuelve más costosa. |
| REST / Servicios      | Interoperabilidad        | Interoperabilidad quedó en Media; es complemento, no estilo global.                    |
| Capas                 | Mantenibilidad           | Mantenibilidad quedó en Media; aporta, pero no es el driver.                           |
| **Monolito en capas** | **Simplicidad / TTM**    | **Elegido:** no sacrifica Rendimiento, Seguridad ni Fiabilidad.                        |

**Justificación atada a los atributos críticos (Alta):**

- **Rendimiento (REF-01).** El filtrado ocurre en el cliente (<2 s); no hay saltos de red que agregar. Microservicios solo sumarían latencia.
- **Seguridad (REF-02/03).** Un solo desplegable = una única superficie de autenticación/autorización; distribuir multiplica los canales internos que habría que proteger y auditar.
- **Fiabilidad / Disponibilidad (REF-04).** Menos componentes = menos fallos parciales, timeouts y particiones de red; distribuir **reduce** la disponibilidad alcanzable.

#### Decisión 2 · Trade-off

De la última columna de la tabla _Del atributo al estilo_, lo que se cede al elegir **Monolito en capas** es **escalar las partes por separado** más adelante.

| Se gana                                                   | Se cede                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| Simplicidad y time-to-market.                             | Escalabilidad independiente por módulo.                       |
| No sacrifica Rendimiento, Seguridad ni Fiabilidad (Alta). | Escalar una parte obliga a escalar todo el desplegable junto. |

**Por qué se acepta:** hoy no hay carga real ni equipos separados que justifiquen escalar por partes. La **capa de datos aislada dentro del monolito** cubre la restricción de evolución (reemplazar mocks por scraper/API real sin rediseñar módulos, REF-10).

#### Decisión 3 · Componentes

Los grandes bloques del sistema, en orden, con la notación **componente · conector · interfaz**:

1. **App** — composición. _Conector:_ navegación / montaje de rutas. _Interfaz:_ árbol de rutas y `AuthProvider`.
2. **Auth** — sesión del usuario. _Conector:_ contexto React. _Interfaz:_ `useAuth` (sesión, login, logout, registro) y `AuthModal`.
3. **Licitaciones** — explorar, listar y filtrar. _Conector:_ hook + props. _Interfaz:_ `useLicitacionFilters`, `LicitacionCard`/`LicitacionList`, `FilterSidebar` y contrato de licitación.
4. **Favoritos** — guardar y revisar licitaciones. _Conector:_ hook + consulta de sesión. _Interfaz:_ `MisFavoritosPage`.
5. **Aprobaciones** — nivel de aprobación y aprobador efectivo. _Conector:_ consulta de monto + sesión + config. _Interfaz:_ consulta "quién aprueba y en qué nivel" y registro de decisiones.
6. **Shared** — UI transversal. _Conector:_ props. _Interfaz:_ `Navbar` y UI común sin lógica de dominio.
7. **Configuración** — umbrales y subrogancias (datos). _Conector:_ lectura de datos. _Interfaz:_ umbrales por unidad y delegaciones.
8. **Fuente de datos** — licitaciones. _Conector:_ contrato de datos estable. _Interfaz:_ `licitaciones.mock.json` (Fase 2: scraper/API con el mismo contrato).

Conexiones principales (origen —conector→ destino):

1. `App —rutas→ Licitaciones / Favoritos / Aprobaciones`.
2. `Favoritos y Aprobaciones —consulta de sesión→ Auth`.
3. `Aprobaciones —monto→ Licitaciones` y `Aprobaciones —umbrales/delegaciones→ Configuración`.
4. `Licitaciones y Favoritos —contrato de datos→ Fuente de datos`.
5. `Shared —estado de sesión→ Auth`.

**Regla de acoplamiento:** los bloques se comunican solo por interfaces explícitas (hooks y props); ningún feature accede a los internos de otro.

#### Decisión 4 · ASR

**ASR (según la plantilla):** «El sistema debe **responder** _(atributo: Rendimiento)_ bajo **el catálogo completo de licitaciones** _(condición)_, medido por **el tiempo de respuesta del listado filtrado, ≤ 2 s** _(métrica)_.»

Es arquitectónicamente significativo porque cumple las **tres señales**:

1. **Afecta a varios módulos a la vez:** Licitaciones (filtros y lista) y la capa de datos (debe entregar el catálogo completo); Favoritos reutiliza el mismo listado.
2. **Es caro de revertir si se decide tarde:** asumir filtrado en el cliente ata el stack (SPA) y el contrato de datos; pasar después a búsqueda en servidor exige backend, índices y rediseño.
3. **Nace de un atributo de calidad, no de una función:** es **Rendimiento (REF-01)**, no "agregar un filtro".

**Cómo obliga a estructurar:** filtrado en el cliente (`useLicitacionFilters`) sobre un catálogo cargado localmente, sin round-trips por cada interacción; refuerza la SPA estática y la **capa de datos aislada** con contrato estable (REF-10).

> **Alternativa evaluada:** la sustitución mock → scraper/API real (REF-10) también cumple las tres señales, pero se documenta como **restricción de evolución** (Decisión 2, Decisión 3) porque su gatillante es una restricción técnica, no un atributo de calidad.

## Registro de Prompts e Iteraciones con IA

## Prompt:

> Ayúdame a escribir la descripción de mi proyecto de software. Se llama filtrado de licitaciones de empresas privadas y lo que hace es con un scraper recolecta los datos de las páginas donde se suben estas licitaciones, hace un filtrado de estas mismas y las publica en una web. ¿Puedes hacer una primera versión?

## Respuesta IA:

> Este proyecto automatiza la búsqueda y selección de licitaciones publicadas por empresas privadas. Mediante un scraper, recopila información de distintas plataformas y páginas web donde se anuncian estas oportunidades. Posteriormente, los datos son procesados y filtrados según criterios definidos, para mostrar únicamente las licitaciones más relevantes. Finalmente, la información seleccionada se publica en una plataforma web, facilitando su consulta y seguimiento.

## Prompt:

> Escribe una versión más detallada en la cual se vea el problema del cliente, cómo llevar este problema a una web y la solución que daría este proyecto.

## Respuesta IA:

> Las empresas y profesionales que buscan nuevas oportunidades comerciales suelen enfrentarse a un problema: la información sobre licitaciones privadas se encuentra distribuida en múltiples páginas web, plataformas y portales de contratación. Revisar manualmente todas estas fuentes requiere mucho tiempo, dificulta detectar nuevas oportunidades y puede provocar que algunas licitaciones importantes pasen desapercibidas.
>
> Este proyecto propone desarrollar una plataforma web capaz de centralizar, organizar y filtrar esta información de forma automatizada. Para ello, el sistema utiliza un scraper que consulta periódicamente las páginas donde se publican licitaciones de empresas privadas y recopila datos relevantes como el nombre de la empresa convocante, el título de la licitación, la descripción, la fecha límite, la categoría, la ubicación y el enlace a la publicación original.

## Prompt:

> Ten en cuenta que esta descripción tiene que leerla nuestro cliente pero no de forma técnica. En esta debes explicar qué tan escalable es este programa y cuáles son las limitaciones, qué es, para quién es, qué problema resuelve, etc.

## Preguntas del PPT:

> **¿Qué es?** Es una plataforma web que reúne en un único lugar las licitaciones y oportunidades de contratación publicadas por empresas privadas.
>
> **¿Qué problema resuelve?** Centraliza información dispersa, ahorra tiempo de búsqueda y reduce el riesgo de perder convocatorias relevantes.
>
> **¿Para quién está pensado?** Empresas proveedoras de productos/servicios, consultoras y equipos de desarrollo de negocio que participan activamente en compras privadas.
>
> **Escalabilidad y Limitaciones:** Permite sumar nuevas fuentes y módulos de alertas de forma modular; depende de la disponibilidad de portales abiertos y no sustituye la postulación final.

### Actividad · Taller de Gestión de la Configuración: del Issue al Release

Recorrido completo del ciclo de configuración sobre el repositorio, con un cambio pequeño: Issue → rama → commit → Pull Request con revisión → merge → tag y Release.

| Artefacto             | Enlace                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Issue                 | [#114 · useAuth no avisa cuando se usa fuera de AuthProvider](https://github.com/Wilson-Jara/LicitacionesUV/issues/114) |
| Rama                  | `fix/useauth-contexto-nulo` (eliminada tras el merge)                                                                   |
| Commit                | `fix: useAuth detecta el uso fuera de AuthProvider (#114)`                                                              |
| Pull Request          | [#115](https://github.com/Wilson-Jara/LicitacionesUV/pull/115), con revisión y aprobación de otro integrante            |
| Integración en `main` | [#116 · release: v1.0.0](https://github.com/Wilson-Jara/LicitacionesUV/pull/116)                                        |
| Release               | [v1.0.0](https://github.com/Wilson-Jara/LicitacionesUV/releases/tag/v1.0.0)                                             |

**Por qué `v1.0.0`:** es la primera versión publicada del proyecto; desde aquí, una corrección sube el tercer número (`v1.0.1`), una funcionalidad nueva el segundo (`v1.1.0`) y un cambio que rompe compatibilidad el primero (`v2.0.0`).
