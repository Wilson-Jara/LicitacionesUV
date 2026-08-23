# Roles y trabajo del equipo

## Propósito

Este documento explica cómo se organizará el equipo de LicitacionesUV durante el desarrollo del proyecto. Está pensado para un equipo universitario que está realizando su primer proyecto profesional.

Los roles representan responsabilidades principales, no jerarquías. Las cinco personas participan en cada issue, pero cada una coordina una parte concreta del trabajo.

## Equipo de cinco personas

### 1. Wilson Jara (@Wilson-Jara) - Project Manager + Product Designer / Analista funcional

**En palabras simples:** organiza el proyecto y representa las necesidades de las personas que utilizarán el sistema.

Responsabilidades:

- Definir objetivos, prioridades y alcance.
- Crear y mantener los issues.
- Controlar dependencias, fechas y avances.
- Diseñar flujos de usuario y wireframes simples.
- Definir textos, datos y criterios de aceptación.
- Validar que el resultado sea útil y entendible.
- Documentar acuerdos y decisiones.

Este rol puede ser asumido por el PM para equilibrar su carga de trabajo con tareas de diseño, análisis y validación. El PM no debe ser la única persona que apruebe su propio código.

### 2. Vicente Garcia (@Vixoooooo19) - Tech Lead / Arquitecto de software

**En palabras simples:** ayuda a decidir cómo construir el código para que sea ordenado y fácil de mantener.

Responsabilidades:

- Definir la estructura técnica del proyecto.
- Establecer convenciones de código.
- Revisar decisiones de arquitectura.
- Ayudar a resolver problemas técnicos.
- Revisar Pull Requests.
- Evitar código duplicado o innecesariamente acoplado.

### 3. Vicente Saa (@Reinald-Code) - Frontend Developer / UI

**En palabras simples:** construye las pantallas y controles que el usuario ve en el navegador.

Responsabilidades:

- Implementar componentes y páginas React.
- Construir layouts y navegación.
- Conectar botones, formularios y estados visuales.
- Integrar datos mock.
- Cuidar el diseño responsive y la accesibilidad.
- Implementar estados de carga, vacío y error cuando corresponda.

### 4.  Benjamin lazo (@lazo1838k) - Backend Developer / Integrations

**En palabras simples:** prepara la futura parte del sistema que guardará información y se comunicará con el frontend.

Responsabilidades:

- Definir modelos y contratos de API.
- Planificar usuarios, autenticación y base de datos.
- Revisar que los datos mock puedan reemplazarse por datos reales.
- Proponer parámetros compatibles con futuras APIs.
- Documentar decisiones de integración.

### 5. Mauricio Henriquez (@MauricioH) - QA Engineer / DevOps

**En palabras simples:** comprueba que el trabajo funcione y que el proyecto pueda ejecutarse correctamente.

Responsabilidades:

- Probar los criterios de aceptación.
- Buscar errores y regresiones.
- Verificar que la aplicación inicie correctamente.
- Ejecutar `npm run lint` y `npm run build`.
- Registrar evidencias y problemas encontrados.
- Apoyar la automatización y los despliegues.

## Participación equitativa

Todos los integrantes deben participar en cada issue mediante planificación, implementación, revisión, pruebas o documentación.

No es necesario que las cinco personas editen los mismos archivos. Para evitar conflictos, una o dos personas pueden implementar el código mientras las demás trabajan en análisis, datos, revisión y pruebas.

El aporte no se mide únicamente por la cantidad de commits. También cuentan:

- Código implementado.
- Diseño y análisis funcional.
- Documentación.
- Revisiones de código.
- Pruebas manuales.
- Corrección de errores.
- Definición de datos y contratos.
- Coordinación y validación.

Se recomienda rotar el responsable principal en cada issue para que todas las personas aprendan diferentes partes del proyecto.

## Flujo de trabajo con GitHub

### 1. Leer el issue

Las cinco personas revisan el objetivo, el alcance, las tareas, las dependencias y los criterios de aceptación.

### 2. Resolver dudas

El equipo conversa sobre lo que se debe construir. Las decisiones importantes se registran en el issue para que todos puedan consultarlas.

### 3. Dividir el trabajo

Se asignan tareas de producto, arquitectura, código, integración, documentación y pruebas.

### 4. Crear una rama

No se debe trabajar directamente sobre `main`.

```bash
git switch main
git pull origin main
git switch -c feat/[numero]-[descripcion]
```

### 5. Implementar y hacer commits

Los cambios deben ser pequeños y los commits deben explicar claramente qué se modificó.

```bash
git add .
git commit -m "Implementa descripcion de la tarea"
```

### 6. Abrir un Pull Request

El Pull Request debe explicar qué se hizo, cómo se verificó y relacionarse con el issue correspondiente.

```text
Closes #[numero-del-issue]
```

### 7. Revisar y probar

Una persona diferente del autor debe revisar el código. QA debe probar los criterios de aceptación y registrar cualquier problema.

### 8. Validar y cerrar

El PM verifica que el resultado responda al objetivo del issue. Después de aprobar la revisión y las pruebas, se puede hacer merge y cerrar el issue.

## Reglas de revisión y validación

- La persona que desarrolla no debe ser la única que valida su trabajo.
- Todo Pull Request debe tener al menos un revisor diferente del autor.
- Las revisiones deben buscar errores, imports sin usar, cambios innecesarios y problemas de accesibilidad.
- QA debe comprobar el flujo principal y los casos de error.
- Deben ejecutarse `npm run lint` y `npm run build` antes de cerrar un issue.
- Los criterios de aceptación deben estar cumplidos antes de hacer merge.
- Los problemas encontrados deben registrarse en el issue o Pull Request.
- No se deben ocultar errores ni modificar el alcance sin acuerdo del equipo.
- No se deben subir credenciales, archivos `.env`, `node_modules` ni archivos generados.

## Lista de control antes de cerrar una tarea

- [ ] Se cumplió el objetivo.
- [ ] Se cumplieron los criterios de aceptación.
- [ ] Todos los integrantes tuvieron una tarea o participación verificable.
- [ ] Se revisó el Pull Request.
- [ ] Se probó el flujo principal.
- [ ] Se probaron los casos de error relevantes.
- [ ] `npm run lint` finaliza sin errores.
- [ ] `npm run build` finaliza correctamente.
- [ ] Se documentaron las decisiones importantes.
- [ ] El PM validó el resultado.
