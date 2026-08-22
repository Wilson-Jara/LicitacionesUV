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