---
name: Bug
about: Reportar un comportamiento defectuoso con pasos para reproducirlo.
title: '[Bug] '
labels: ''
assignees: ''
---

## Descripción

[Qué ocurre y en qué parte de la aplicación.]

## Pasos para reproducir

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## Resultado esperado

[Qué debería ocurrir.]

## Resultado obtenido

[Qué ocurre realmente, con mensajes de error si aplica.]

## Entorno

- Navegador / sistema operativo:
- Versión o commit:
- ¿Ocurre siempre o de forma intermitente?:

## Evidencia

<!-- Capturas, logs o enlaces. -->

## Definition of Ready (DoR)

El bug está listo para trabajar solo si:

- [ ] La descripción y los pasos para reproducir están completos.
- [ ] Se indica el resultado esperado y el obtenido.
- [ ] Se adjunta evidencia (capturas o logs) que confirme el defecto.
- [ ] Se identificó el entorno y la versión afectada.

## Definition of Done (DoD)

El bug se cierra solo si:

- [ ] El defecto ya no se reproduce siguiendo los pasos indicados.
- [ ] `npm run verify` pasa completo (lint, formato, test y build).
- [ ] Existe revisión y aprobación de al menos un par (PR fusionado).
