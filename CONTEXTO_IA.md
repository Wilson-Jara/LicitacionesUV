# Contexto del proyecto para asistentes de IA

> Documento de referencia para cualquier IA que trabaje en este repositorio. Debe leerse antes de proponer o implementar cambios.

## 1. Identidad y propósito

- **Proyecto:** `LicitacionesUV` (`licitacionesuv` en `package.json`).
- **Repositorio remoto:** `https://github.com/Wilson-Jara/LicitacionesUV.git`.
- **Tipo:** aplicación web cliente.
- **Idioma de negocio/documentación:** español.
- **Propósito declarado:** crear, centralizar y gestionar licitaciones universitarias, además de comparar ofertas y ayudar a seleccionar la mejor propuesta de proveedores.
- **Estado real actual:** prototipo generado desde la plantilla de React + Vite. El dominio de licitaciones aún no está implementado.

La descripción del `README.md` representa la intención del producto, no funcionalidades disponibles actualmente. La fuente de verdad para el comportamiento actual es el código de `src/`.

## 2. Estado verificado

Revisión realizada el 22 de agosto de 2026:

- `npm run lint`: pasa sin errores.
- `npm run build`: pasa correctamente y genera `dist/`.
- No hay pruebas automatizadas configuradas.
- No hay backend, base de datos, autenticación, autorización ni manejo de usuarios.
- No hay router ni navegación interna.
- No hay llamadas HTTP, cliente API ni persistencia en `localStorage` o `sessionStorage`.
- No hay modelos, tipos, validaciones de dominio ni módulos de licitaciones/proveedores/ofertas.
- `node_modules/` está instalado localmente, pero está excluido del repositorio.
- `dist/` se genera durante el build y está excluido del repositorio.

## 3. Funcionalidad existente

La pantalla actual de `src/App.jsx` es la demo estándar de Vite:

- Muestra una composición visual con `hero.png`, el logo de React y el logo de Vite.
- Muestra el título `Get started` y un mensaje sobre editar `src/App.jsx`.
- Incluye un contador local que inicia en cero y aumenta al pulsar un botón.
- Incluye enlaces externos a la documentación de Vite y React.
- Incluye enlaces sociales de la comunidad de Vite: GitHub, Discord, X y Bluesky.
- Usa un sprite SVG desde `public/icons.svg` para algunos iconos.
- Es responsive hasta cierto punto mediante media queries a `1024px`.
- Adapta colores a modo claro/oscuro mediante `prefers-color-scheme`.

No debe asumirse que el contador, los enlaces o la interfaz actual forman parte del producto final.

## 4. Arquitectura y flujo de entrada

1. `index.html` define el documento HTML, el favicon, el título y el elemento `<div id="root">`.
2. `src/main.jsx` importa los estilos globales y monta `<App />` dentro de `StrictMode` usando `createRoot`.
3. `src/App.jsx` contiene actualmente todo el componente de demostración y su estado local.
4. `src/index.css` contiene variables, reset básico, tipografía, layout global y soporte de tema.
5. `src/App.css` contiene los estilos específicos de la demo.
6. Vite resuelve los módulos, procesa JSX/CSS y sirve los archivos de `public/` desde la raíz.

## 5. Inventario de archivos relevantes

| Archivo | Responsabilidad actual |
|---|---|
| `index.html` | Punto de entrada HTML; actualmente tiene `lang="en"` y título `licitacionesuv`. |
| `src/main.jsx` | Punto de montaje de React. |
| `src/App.jsx` | Componente raíz; demo de Vite con contador y enlaces. |
| `src/index.css` | Estilos globales, variables de color, tipografías y responsive básico. |
| `src/App.css` | Estilos de la demo de la pantalla principal. |
| `src/assets/hero.png` | Imagen decorativa de la plantilla. |
| `src/assets/react.svg` | Logo de React usado por la demo. |
| `src/assets/vite.svg` | Logo de Vite usado por la demo. |
| `public/icons.svg` | Sprite SVG con iconos de documentación y redes sociales. |
| `public/favicon.svg` | Favicon actual. |
| `vite.config.js` | Configuración mínima de Vite con `@vitejs/plugin-react`. |
| `eslint.config.js` | ESLint flat config para JS/JSX, reglas recomendadas y hooks de React. |
| `package.json` | Metadatos y scripts del proyecto. |
| `package-lock.json` | Versiones bloqueadas de dependencias. |
| `.env.example` | Plantilla de variables; solo documenta `VITE_API_URL` comentada. |
| `.gitignore` | Excluye dependencias, entornos, builds, cachés, logs y configuración local. |
| `README.md` | Requisitos, instalación pretendida y flujo de trabajo Git. |
| `CONTEXTO_IA.md` | Este documento, destinado a orientar a asistentes de IA. |
| `docs/roles-equipo.md` | Roles, participación, dependencias y flujo de trabajo del equipo. |

## 6. Stack y dependencias

- Node.js requerido según `README.md`: `20.19+` o `22.12+`.
- React `19.2.8`.
- React DOM `19.2.8`.
- Vite efectivo en la instalación revisada: `8.2.1` (declarado como `^8.2.0`).
- Vite React plugin efectivo: `6.0.5` (declarado como `^6.0.4`).
- ESLint efectivo: `10.8.1` (declarado como `^10.8.0`).
- Módulos ES habilitados mediante `"type": "module"`.
- No hay librerías de UI, routing, formularios, validación, fechas, HTTP o testing.

## 7. Comandos de desarrollo

Desde la raíz del proyecto:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Scripts definidos:

- `dev`: inicia el servidor de desarrollo de Vite.
- `lint`: ejecuta ESLint sobre el repositorio.
- `build`: crea el bundle de producción en `dist/`.
- `preview`: sirve localmente el build de producción.

El `README.md` recomienda validar primero `node --version` y `npm --version`. No existe script de test.

## 8. Convenciones observadas

- Código JavaScript/JSX, sin TypeScript.
- Componentes funcionales de React.
- Imports relativos dentro de `src/`.
- Estilo de código sin punto y coma y con comillas simples.
- Indentación de dos espacios.
- Estado React local con hooks cuando es necesario.
- Estilos en CSS separados del JSX.
- Configuración ESLint basada en `eslint.config.js`; no desactivar reglas globalmente para ocultar errores.

Al añadir funcionalidad, mantener estas convenciones salvo que exista una razón concreta para introducir una arquitectura nueva.

## 9. Variables de entorno y seguridad

- `.env` y otros archivos de entorno están excluidos por `.gitignore`.
- `.env.example` contiene actualmente solo `VITE_API_URL`, comentada.
- Las variables con prefijo `VITE_` quedan expuestas al cliente al compilar; nunca colocar secretos allí.
- Antes de integrar una API se debe definir el contrato, el manejo de errores, estados de carga y configuración por entorno.
- No incluir credenciales, tokens, datos personales reales ni valores de `.env` en código, commits o documentación.

## 10. Alcance y privacidad del contexto

Este archivo es un contexto técnico público y debe contener únicamente información útil para comprender y mantener el software.

Debe incluir:

- Estado técnico real de la aplicación.
- Arquitectura y estructura de archivos.
- Dependencias y comandos vigentes.
- Convenciones de código.
- Variables de entorno documentadas sin valores sensibles.
- Reglas técnicas necesarias para trabajar de forma segura.

No debe incluir:

- Backlog, tareas pendientes, roadmap ni prioridades internas.
- Números, títulos o detalles de issues privados.
- Decisiones confidenciales del equipo o de la universidad.
- Credenciales, tokens, secretos o valores de archivos `.env`.
- Información de usuarios, proveedores o licitaciones reales.
- Suposiciones presentadas como funcionalidades implementadas.

La planificación privada debe permanecer en el espacio privado del equipo. Si una característica todavía no existe, solo debe describirse como parte del estado técnico actual cuando sea necesario para evitar que una IA la asuma como implementada; no debe convertirse en una lista de tareas dentro de este documento.

Los nombres y usuarios públicos del equipo pueden documentarse cuando exista autorización de sus integrantes. No deben incluirse correos privados, datos personales sensibles ni información que no sea necesaria para identificar una responsabilidad pública.

## 11. Reglas de trabajo para futuras IAs

- Leer este archivo, `README.md`, `package.json` y los archivos afectados antes de editar.
- Verificar primero el estado real del código y no asumir funcionalidades que no existan.
- Hacer cambios pequeños y enfocados.
- No añadir dependencias o capas arquitectónicas sin una necesidad concreta.
- Mantener la compatibilidad con los scripts existentes.
- No editar `node_modules/` ni archivos generados dentro de `dist/`.
- No exponer información privada en código, documentación, logs o mensajes de commit.
- No colocar secretos en variables con prefijo `VITE_`.
- Revisar accesibilidad básica: idioma, nombres accesibles, foco visible, etiquetas y estados de error.
- Para enlaces externos con `target="_blank"`, considerar `rel="noreferrer"`.

## 12. Política de actualización automática

Después de cualquier cambio relevante en código, arquitectura, dependencias, configuración, comandos o estructura de archivos, la IA debe:

1. Revisar si el cambio afecta este documento.
2. Actualizar las secciones afectadas con el estado real y vigente.
3. Mantener el documento conciso y eliminar información que haya quedado obsoleta.
4. Verificar que no se hayan incluido tareas privadas, datos personales o secretos.
5. Ejecutar las validaciones correspondientes; como mínimo `npm run lint` y `npm run build` cuando se modifique código.
6. Revisar el diff completo antes de finalizar.

La IA no debe agregar un registro de tareas, roadmap o historial privado al contexto. La actualización debe describir cómo está el proyecto después del cambio, no qué trabajo interno se está planificando.

## 13. Documentación relacionada

- `docs/roles-equipo.md` contiene la organización general del equipo, la distribución de responsabilidades y el proceso de trabajo con GitHub.
- Este documento describe el estado técnico del repositorio; la guía de roles describe cómo se coordina el equipo. No deben confundirse responsabilidades de equipo con funcionalidades ya implementadas.
