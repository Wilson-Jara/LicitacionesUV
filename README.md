# Sistema de Gestión de Licitaciones Universitarias

Este software es la interfaz cliente diseñada en **React + Vite** para agilizar, centralizar y optimizar la creación de licitaciones dentro de la universidad, proporcionando además herramientas interactivas para evaluar y elegir la mejor oferta de los proveedores.

---

## 1. Requisitos Previos

Para ejecutar este proyecto, asegúrate de tener instaladas las siguientes herramientas en tu sistema:

- **Lenguaje / Runtime:** Node.js 20.19+ o 22.12+
- **Herramientas de construcción:** npm, Vite 8.2.1, React 19.2.8, ESLint 10.8.1
- **Editor recomendado:** Visual Studio Code

---

## 2. Configuración Inicial

Sigue estos pasos para obtener una copia local del proyecto y configurar el entorno desde cero.

Abre tu terminal y ejecuta:

```bash
git clone https://github.com/Wilson-Jara/LicitacionesUV
cd LicitacionesUV
```

---

## 3. Instalación de Dependencias


### 3.1. Validación previa del entorno

Antes de instalar, valida que tu entorno cumpla los requisitos de la sección 1:

```bash
node --version
npm --version
```

- Si `node --version` devuelve una versión **inferior a 20.19**, detén el proceso: la instalación fallará y el proyecto no podrá ejecutarse.
- Si `npm` no está disponible, instala Node.js desde su sitio oficial antes de continuar.

### 3.2. Instalación de paquetes

Con el entorno validado, abre tu terminal y ejecuta:
> El instalador valida automáticamente la versión de Node.js al iniciar y cancela la instalación si el entorno no es compatible.

---

## 4. Puesta en Marcha

Abre tu terminal y ejecuta:

```bash
npm run dev
```

---

## 5. Flujo de Trabajo en Git

### 5.1. Gestión de Ramas

- **Nunca trabajes directamente sobre `main`.** Crea una rama nueva para cada tarea partiendo de un *Issue*.
- **Nomenclatura:** Usa prefijos descriptivos (ej. `feat/12-agregar-validacion`, `fix/15-corregir-login`, `docs/readme`).

Abre tu terminal y ejecuta:

```bash
git checkout main
git pull
git checkout -b feat/[numero-issue]-[descripcion-corta]
```

### 5.2. Registro de Cambios (Commits)

- **Realiza commits atómicos:** Pequeños, coherentes y con una única intención principal por commit.
- **Usa mensajes claros:** En modo imperativo, que expliquen el efecto del cambio.

Abre tu terminal y ejecuta:

```bash
git add .
git commit -m "Valida campos obligatorios antes de procesar"
```

### 5.3. Publicación y Revisión (Push & PR)

- **Sube tu rama al repositorio remoto:**

Abre tu terminal y ejecuta:

```bash
git push -u origin feat/[numero-issue]-[descripcion-corta]
```

- **Crea un Pull Request (PR) hacia `main`:**
  - En la descripción del PR, incluye el propósito, los cambios realizados, cómo se verificó y vincula el Issue utilizando la palabra clave `Closes #[número_de_issue]`.
  
> **Regla de oro:** El autor no aprueba su propio PR; otro integrante debe revisarlo y verificar que el proyecto compile y ejecute correctamente antes de hacer el merge. Una vez integrado, la rama de trabajo debe ser eliminada.


Trabajo Fundamentos Ingenieria Software

Promts de Chatgpt

ayudame a escribir la descripcion de mi proyecto software . se llama filtrado de licitaciones de empresas privadas y lo que hace es con un scraper recolecta los datos de las paginas donde se suben estas licitaciones y hace un filtrado de estas mismas y las publica en una web . ¿Puedes hacer una primera version?
Filtrado de licitaciones de empresas privadas

Este proyecto automatiza la búsqueda y selección de licitaciones publicadas por empresas privadas. Mediante un scraper, recopila información de distintas plataformas y páginas web donde se anuncian estas oportunidades. Posteriormente, los datos son procesados y filtrados según criterios definidos, para mostrar únicamente las licitaciones más relevantes. Finalmente, la información seleccionada se publica en una plataforma web, facilitando su consulta y seguimiento.

escribe una version mas detalla en la cual se vea el problema del cliente y como llevar este problema a una web y la solucion que daria este proyecto 
Filtrado de licitaciones de empresas privadas
Las empresas y profesionales que buscan nuevas oportunidades comerciales suelen enfrentarse a un problema: la información sobre licitaciones privadas se encuentra distribuida en múltiples páginas web, plataformas y portales de contratación. Revisar manualmente todas estas fuentes requiere mucho tiempo, dificulta detectar nuevas oportunidades y puede provocar que algunas licitaciones importantes pasen desapercibidas.

Este proyecto propone desarrollar una plataforma web capaz de centralizar, organizar y filtrar esta información de forma automatizada. Para ello, el sistema utiliza un scraper que consulta periódicamente las páginas donde se publican licitaciones de empresas privadas y recopila datos relevantes como el nombre de la empresa convocante, el título de la licitación, la descripción, la fecha límite, la categoría, la ubicación y el enlace a la publicación original.

Una vez recolectada la información, el sistema procesa los datos y aplica diferentes criterios de filtrado. Los usuarios podrán encontrar licitaciones según sus intereses, sector de actividad, palabras clave, ubicación, fechas o tipo de servicio requerido. De esta manera, se evita que tengan que revisar individualmente una gran cantidad de páginas y publicaciones que pueden no ser relevantes para su negocio.

La información filtrada se presenta en una web clara y accesible, donde los usuarios pueden consultar las licitaciones disponibles, visualizar sus detalles y acceder a la fuente original. La plataforma también puede incorporar funcionalidades como búsquedas avanzadas, filtros personalizados, ordenamiento por fecha de publicación o vencimiento y alertas para avisar sobre nuevas oportunidades.

La solución busca transformar un proceso manual, disperso y poco eficiente en un sistema automatizado y centralizado. Así, las empresas pueden ahorrar tiempo, mejorar su capacidad de búsqueda y aumentar sus posibilidades de participar en licitaciones privadas relevantes para su actividad.

ten en cuenta que en esta descripcion tiene que leerla nuestro cliente pero no de forma tecnica en esta debes explicar que tan escalable es este programa y cuales son las limitaciones , que es , para quien es , que problema resuelve , etc
Filtrado de licitaciones de empresas privadas
¿Qué es?
Es una plataforma web que reúne en un único lugar las licitaciones y oportunidades de contratación publicadas por empresas privadas. El sistema revisa periódicamente distintas páginas y portales de publicación, recopila la información disponible y la organiza para que los usuarios puedan encontrar oportunidades relevantes de forma rápida y sencilla.

La plataforma no sustituye la participación en la licitación, sino que facilita el proceso de búsqueda y permite acceder directamente a la publicación original.

¿Qué problema resuelve?
Actualmente, muchas empresas deben consultar manualmente numerosas páginas web para encontrar licitaciones relacionadas con sus servicios. Esta información suele estar dispersa, presentarse en formatos diferentes y actualizarse con frecuencia. Como consecuencia:

Se invierte una gran cantidad de tiempo en buscar oportunidades.
Es difícil revisar todas las fuentes disponibles.
Algunas licitaciones pueden pasar desapercibidas.
Se consultan muchas publicaciones que no son relevantes para la empresa.
Resulta complicado priorizar las oportunidades cuya fecha límite está próxima.
El proyecto resuelve este problema centralizando la información y aplicando filtros que permiten mostrar únicamente las licitaciones que pueden ser de interés para cada usuario o empresa.

¿Cómo funciona la solución?
La plataforma recopila información de las páginas seleccionadas y la presenta de forma ordenada en una web. Cada licitación puede incluir datos como:

Empresa que publica la oportunidad.
Título y descripción.
Categoría o sector.
Ubicación.
Fecha de publicación.
Fecha límite de presentación.
Enlace a la fuente original.
Los usuarios podrán buscar y filtrar las licitaciones utilizando criterios como palabras clave, sector, ubicación o fechas. También podrán consultar los detalles de cada oportunidad y acceder al portal donde fue publicada originalmente.

De esta forma, el usuario pasa de realizar una búsqueda manual en múltiples páginas a disponer de un punto centralizado para descubrir, revisar y priorizar nuevas oportunidades de negocio.

¿Para quién está pensado?
La solución está dirigida principalmente a:

Empresas que buscan nuevos contratos privados.
Proveedores de productos o servicios.
Consultoras y agencias comerciales.
Profesionales encargados de ventas o desarrollo de negocio.
Organizaciones que participan habitualmente en procesos de contratación privada.
Puede adaptarse a diferentes sectores, siempre que existan fuentes públicas o autorizadas donde se publiquen las oportunidades.

Escalabilidad del proyecto
El proyecto está pensado para crecer progresivamente. Inicialmente, puede trabajar con un conjunto definido de páginas y categorías, validando el funcionamiento de la plataforma y las necesidades de los usuarios. Posteriormente, se pueden incorporar nuevas fuentes, sectores, filtros y funcionalidades sin tener que reemplazar la solución completa.

Entre las posibilidades de crecimiento se encuentran:

Añadir nuevas páginas y portales de licitaciones.
Incorporar más categorías y tipos de oportunidades.
Permitir perfiles y filtros personalizados por usuario.
Crear alertas por correo electrónico.
Añadir planes para diferentes tamaños de empresa.
Incluir estadísticas sobre sectores, ubicaciones y fechas.
Integrar herramientas de seguimiento de oportunidades.
Adaptar la plataforma para distintos países o mercados.
La escalabilidad dependerá principalmente del número de fuentes que se incorporen, la cantidad de información procesada y las funcionalidades que se añadan. Por ello, se recomienda comenzar con un alcance controlado y ampliar la plataforma según el uso y la demanda real.

Limitaciones
Para ofrecer una solución clara y realista, es importante tener en cuenta algunas limitaciones:

La plataforma solo puede recopilar información de páginas accesibles y permitidas para su consulta.
No todas las empresas publican sus licitaciones en portales abiertos.
Algunas páginas pueden requerir registro, suscripción o permisos especiales.
Los cambios en el diseño o funcionamiento de una fuente pueden afectar temporalmente la recopilación de información.
La calidad y actualización de los datos dependerá de la información publicada por cada fuente.
El sistema no garantiza que se recojan todas las licitaciones existentes en el mercado.
La plataforma informa y organiza las oportunidades, pero no sustituye la revisión de los requisitos ni la presentación de ofertas.
Será necesario mantener y revisar las fuentes para asegurar que continúen funcionando correctamente.
Beneficios principales
Esta solución permitirá reducir el tiempo dedicado a la búsqueda, mejorar la visibilidad de nuevas oportunidades y facilitar la toma de decisiones comerciales. Al disponer de información organizada y filtrada, las empresas podrán concentrarse en analizar las licitaciones más relevantes y aumentar sus posibilidades de encontrar contratos adecuados para su actividad.

En resumen, el proyecto convierte una búsqueda dispersa y manual en un servicio web centralizado, organizado y ampliable, diseñado para ayudar a las empresas a identificar oportunidades de contratación privada de manera más eficiente.

Preguntas 

¿Cuentas veces cambiaron de direccion?
No cambiamos de direccion seguimos la misma rama

¿La version elegida fue la ultima o una intermedia?
Elegimos la ultima version ya que es la mas detallada y con mejor explicacion para el cliente 
¿La libertad fue ventaja o caos?
Fue ventaja ya que teniamos libertad de accion por lo cual no nos estresamos por tener preguntas limitadas 
