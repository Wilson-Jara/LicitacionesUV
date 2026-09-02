# 🏛️ LicitacionesUV: Plataforma de Filtrado y Centralización de Licitaciones Privadas

Plataforma web desarrollada en **React + Vite** diseñada para centralizar, filtrar y optimizar la búsqueda de oportunidades comerciales y licitaciones publicadas por empresas privadas, recopiladas de forma automatizada mediante técnicas de web scraping.

---

## 📌 Descripción del Proyecto

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

Para ejecutar el entorno local, necesitas:

- **Runtime:** Node.js 20.19+ o 22.12+
- **Gestor de paquetes:** npm 10+
- **Stack principal:** React 19, Vite 8, ESLint 10
- **Pruebas:** runner nativo de Node (`node --test`)
- **Editor recomendado:** Visual Studio Code

### Wrapper y línea base reproducible

Al ser un proyecto Node.js, el equivalente al wrapper `./gradlew` de Gradle es el propio `npm`, complementado con los mecanismos de reproducibilidad del proyecto:

- **`package-lock.json`:** bloquea el árbol de dependencias para installs 100% reproducibles.
- **`engines` en `package.json`:** declara las versiones mínimas de Node.js y npm requeridas.
- **SemVer explícito:** las dependencias se declaran con versión exacta (`19.2.8`, sin rangos `^`/`~`), de modo que todos los entornos usen exactamente la misma versión.

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

Si tu versión de Node.js es menor a la 20.19, actualízala antes de continuar.

### 3. Instalar dependencias

```bash
npm install
```

### 4. Comando único integrador

El proyecto expone un comando único que **limpia, compila, prueba y empaqueta** (equivalente a `./gradlew clean build`):

```bash
npm run verify
```

Equivale a ejecutar en secuencia:

```bash
npm run clean   # elimina artefactos de build (dist/)
npm run lint    # análisis estático con ESLint
npm run test    # pruebas con el runner nativo de Node
npm run build   # compilación y empaquetado con Vite
```

### 5. Ejecutar entorno de desarrollo

```bash
npm run dev
```

### Variables de entorno

El proyecto documenta sus variables en `.env.example`. Para configurar tu entorno local:

```bash
cp .env.example .env
```

- Cada variable está documentada con su **nombre**, **formato** y **obligatoriedad** dentro de `.env.example`.
- Los archivos `.env` reales nunca se suben al repositorio (excluidos por `.gitignore`), igual que certificados y llaves privadas (`*.pem`, `*.key`, `*.p12`, `*.pfx`).

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
npm run format:check
npm run verify
```

El formateo no debe cambiar la lógica de la aplicación, únicamente la presentación del código.

---

## 🌿 Flujo de Trabajo en Git

### Gestión de Ramas

Nunca trabajes directo sobre `main`. Crea ramas descriptivas asociadas a un Issue:

```bash
git checkout main
git pull
git checkout -b feat/[numero-issue]-[descripcion-corta]
```

### Registro de Cambios (Commits)

Usa mensajes atómicos e imperativos:

```bash
git add .
git commit -m "Agrega filtros por fecha de expiracion y categoria"
```

### Publicación y Pull Request

```bash
git push -u origin feat/[numero-issue]-[descripcion-corta]
```

Abre el Pull Request hacia `main` usando la convención:

```text
Closes #[número_issue]
```

> **Regla:** El Pull Request requiere la revisión y aprobación de al menos otro integrante del equipo antes del merge.

---

## Fundamentos de Ingeniería de Software

## Registro de Prompts e Iteraciones con IA

## Prompr

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
