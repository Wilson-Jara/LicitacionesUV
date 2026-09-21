# Contexto del proyecto para asistentes de IA

> Documento de referencia para cualquier IA que trabaje en este repositorio. Debe leerse antes de proponer o implementar cambios.

## 1. Identidad y propósito

- **Proyecto:** `LicitacionesUV` (`licitacionesuv` en `package.json`).
- **Repositorio remoto:** `https://github.com/Wilson-Jara/LicitacionesUV.git`.
- **Tipo:** aplicación web cliente.
- **Idioma de negocio/documentación:** español.
- **Propósito declarado:** crear, centralizar y gestionar licitaciones universitarias, además de comparar ofertas y ayudar a seleccionar la mejor propuesta de proveedores.
- **Estado real actual:** aplicación web en React con enrutamiento (`react-router-dom`), interfaz y módulo de acceso basados en el wireframe oficial de Figma de la Universidad de Valparaíso, explorador de licitaciones con filtros sincronizados en URL y gestión de favoritos.

## 2. Estado verificado

Revisión realizada en septiembre de 2026:

- `npm run lint`: pasa sin errores.
- `npm run build`: pasa correctamente y genera `dist/`.
- `npm run test`: suite de smoke tests pasando (4/4 tests).
- `npm run format:check`: pasa con formato consistente Prettier.
- `npm run verify`: ejecuta limpia, lint, format:check, test y build con éxito.
- Manejo de estado de autenticación en cliente con `AuthProvider` y hook `useAuth` (simulación de login/registro).
- Router con navegación interna (`react-router-dom` v7).
- Persistencia local y datos mock en `features/licitaciones/data/licitaciones.mock.json`.
- `node_modules/` y `dist/` excluidos del control de versiones.

## 3. Funcionalidad existente

- **Módulo de Autenticación Institucional (Figma Wireframes):**
  - Modal de autenticación (`AuthModal`) y página dedicada de acceso (`LoginPage` en `/login`).
  - Diseño _split-screen_: panel izquierdo con identidad institucional de la Universidad de Valparaíso / República de Chile, escudo, métricas en línea y colores oficiales (Azul Marino `#0E1B38` y Dorado `#C59B27`); los paneles de marca permanecen navy en ambos temas.
  - Panel derecho con formulario de acceso ("Módulo de Acceso"), campos de correo institucional y contraseña con botón para alternar visibilidad, aviso de soporte institucional, enlaces a términos e indicador de estado operativo.
  - Alternancia entre inicio de sesión y registro de cuenta.
  - Accesos sociales simulados con Google y GitHub.
  - Validación de campos con mensajes de error.
- **Explorador de Licitaciones:**
  - Header Hero institucional con sobretítulo dorado, estadísticas clave del portal y tipografía institucional.
  - Barra lateral de filtros (`FilterSidebar`) con la estética de Figma: sobretítulo dorado, buscador con limpieza rápida, selectores estilizados, botones _pills_ de tipo, chips interactivos de filtros activos con eliminación individual, aviso informativo institucional y estado sincronizado con URL.
  - Tarjetas de licitación (`LicitacionCard`) con iconos vectoriales, indicador de estado por puntos (verde para Pública, ámbar para Privada), etiqueta de región y botón de acción.
  - Lista de licitaciones (`LicitacionList`) con estado vacío ilustrado y botón directo de restablecimiento de filtros.
  - Barra de resumen de resultados y alternancia de filtros para dispositivos móviles.
- **Favoritos:**
  - Página `/favoritos` para visualizar licitaciones guardadas.
- **Barra de Navegación (`Navbar`):**
  - Cabecera institucional con isotipo UV, enlaces a licitaciones/favoritos, información de usuario logueado con avatar y botón de acceso modal.
- **Temas Claro/Oscuro:**
  - Alternancia de tema mediante atributo `data-theme` en `<html>`, con variables CSS duplicadas por tema en `src/index.css`.
  - Script inline en `index.html` que aplica el tema guardado o la preferencia del sistema antes del montaje de React, evitando el flash de tema incorrecto.
  - Persistencia de la elección en `localStorage` (clave `licitacionesuv-theme`).
  - Botón de alternancia accesible (`ThemeToggle` con `aria-label` y `aria-pressed`) en la barra de navegación.
  - Los componentes usan variables semánticas (`--card-bg`, `--surface-soft`, `--border-strong`, etc.); los hex restantes pertenecen a paneles de marca navy que permanecen oscuros en ambos temas.

## 4. Arquitectura y flujo de entrada

1. `index.html` define el documento HTML, favicon y contenedor `#root`.
2. `src/main.jsx` importa `index.css` y monta `<App />`.
3. `src/app/App.jsx` envuelve la aplicación en `ThemeProvider`, `AuthProvider` y `BrowserRouter`.
4. `src/app/routes/AppRoutes.jsx` gestiona las rutas (`/login`, `/licitaciones`, `/favoritos`, 404).
5. `src/app/layouts/PublicLayout.jsx` define el layout con la barra de navegación persistente.
6. `src/index.css` define las variables de diseño institucional (Navy, Gold, neutros, sombras y tipografía).

## 5. Inventario de archivos relevantes

| Archivo                                                        | Responsabilidad actual                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| `index.html`                                                   | Punto de entrada HTML.                                              |
| `src/main.jsx`                                                 | Punto de montaje de React.                                          |
| `src/app/App.jsx`                                              | Componente raíz con proveedores de Auth y Router.                   |
| `src/app/routes/AppRoutes.jsx`                                 | Enrutamiento de la aplicación (`/login`, `/licitaciones`, etc.).    |
| `src/app/layouts/PublicLayout.jsx`                             | Layout principal con Navbar y contenedor de páginas.                |
| `src/index.css`                                                | Variables globales de diseño institucional UV, reset y tipografía.  |
| `src/features/auth/components/AuthModal.jsx`                   | Modal de inicio de sesión/registro con split-screen de Figma.       |
| `src/features/auth/components/AuthModal.css`                   | Estilos del modal institucional.                                    |
| `src/features/auth/pages/LoginPage.jsx`                        | Página completa de inicio de sesión según wireframe de Figma.       |
| `src/features/auth/pages/LoginPage.css`                        | Estilos de la página de inicio de sesión.                           |
| `src/features/auth/hooks/useAuth.js`                           | Hook de consumo del contexto de autenticación.                      |
| `src/app/providers/AuthProvider.jsx`                           | Proveedor de estado de autenticación.                               |
| `src/app/providers/ThemeProvider.jsx`                          | Proveedor de tema claro/oscuro con persistencia en localStorage.    |
| `src/shared/components/Navbar.jsx`                             | Barra de navegación institucional con escudo y acciones de usuario. |
| `src/shared/components/Navbar.css`                             | Estilos del Navbar.                                                 |
| `src/shared/components/ThemeToggle.jsx`                        | Botón accesible de alternancia de tema claro/oscuro.                |
| `src/shared/components/ThemeToggle.css`                        | Estilos del botón de tema.                                          |
| `src/shared/hooks/useTheme.js`                                 | Hook de consumo del contexto de tema.                               |
| `src/features/licitaciones/pages/LicitacionesExplorerPage.jsx` | Página principal de exploración de licitaciones.                    |
| `src/features/licitaciones/hooks/useLicitacionFilters.js`      | Hook de sincronización de filtros con URL.                          |
| `src/features/licitaciones/components/FilterSidebar.jsx`       | Barra lateral de filtros.                                           |
| `src/features/licitaciones/components/LicitacionCard.jsx`      | Tarjeta individual de licitación.                                   |
| `src/features/licitaciones/components/LicitacionList.jsx`      | Lista de licitaciones.                                              |
| `src/features/favoritos/pages/MisFavoritosPage.jsx`            | Página de licitaciones favoritas.                                   |
| `tests/smoke.test.js`                                          | Pruebas automatizadas de línea base reproducible.                   |
| `docs/AI_context.md`                                            | Contexto técnico actualizado para asistentes de IA.                 |

## 6. Stack y dependencias

- Node.js requerido: `>=20.19.0`.
- React `19.2.8`.
- React DOM `19.2.8`.
- React Router DOM `7.18.2`.
- PropTypes `15.8.1`.
- Vite `8.2.1`.
- ESLint `10.8.1`.
- Prettier `3.9.6`.
- Módulos ES habilitados mediante `"type": "module"`.

## 7. Comandos de desarrollo

```bash
npm install
npm run dev
npm run lint
npm run format
npm run format:check
npm run test
npm run build
npm run verify
npm run preview
```

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

- **Modo por defecto: dar instrucciones, no modificar archivos.** La IA debe explicar los pasos, comandos y contenido que el usuario debe realizar por sí mismo. Aunque el usuario lo pida directamente, la IA debe ofrecer las instrucciones en lugar de crear, editar o borrar archivos del proyecto.
- Solo se permite modificar archivos cuando el usuario lo solicite de forma explícita e inequívoca, o cuando exista un acuerdo previo que autorice la edición directa.
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

La IA que realice un cambio autorizado en el repositorio es responsable de actualizar directamente este archivo en la misma entrega cuando el cambio afecte código, arquitectura, dependencias, configuración, comandos o estructura de archivos. Si el cambio no afecta el contexto técnico, debe verificarlo y conservarlo sin modificaciones innecesarias.

## 13. Documentación relacionada

- `docs/roles-equipo.md` contiene la organización general del equipo, la distribución de responsabilidades y el proceso de trabajo con GitHub.
- Este documento describe el estado técnico del repositorio; la guía de roles describe cómo se coordina el equipo. No deben confundirse responsabilidades de equipo con funcionalidades ya implementadas.
