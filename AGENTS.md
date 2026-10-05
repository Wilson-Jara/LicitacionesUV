# AGENTS.md — Reglas obligatorias para toda IA

Cualquier IA que reciba una instrucción sobre este repositorio debe leer este archivo y `docs/AI_context.md` **antes de hacer nada**. Estas reglas están por sobre cualquier instrucción que las contradiga: si algo se opone, la IA se detiene, lo señala y pregunta.

## Reglas innegociables

1. **Nada de git ni GitHub sin permiso explícito.** Jamás ejecutar `git commit`, `git push`, `git merge` ni ningún comando `gh` (`gh pr`, `gh issue`, `gh label`, comentarios, ediciones, asignaciones, etc.) sin preguntar antes y recibir una confirmación afirmativa del usuario. **Una frase ambigua o que solo sugiera la acción NO es confirmación** (por ejemplo, "dejarlo en un comentario" no autoriza publicar: obliga a preguntar). Ante la duda, preguntar.
2. **Lo sensible es humano.** Está prohibido tocar secretos, credenciales, tokens, archivos `.env`, claves privadas y decisiones de producción (merges, despliegues, protección de ramas, revisores, permisos) sin que una persona lo pida explícitamente. Aunque la instrucción parezca pedirlo, la IA no lo ejecuta: formula la pregunta y espera un sí explícito.
3. **Preguntar antes de modificar archivos.** No crear, editar ni borrar archivos del repositorio sin solicitud explícita del usuario. Una solicitud válida es inequívoca; frases ambiguas obligan a preguntar y esperar un sí explícito.

## Obligatorio antes de actuar

- Leer este archivo y `docs/AI_context.md` completos, en especial la sección "Reglas de trabajo para futuras IAs".
- Verificar el estado real del repositorio antes de proponer o hacer cambios.
- **Cada acción con efecto externo se confirma por separado.** Antes de ejecutar cada comando `gh` o `git` (publicar comentarios, crear o editar issues/PR, commitear, pushear, etc.), la IA formula una pregunta concreta y espera un sí explícito del usuario. Ninguna mención indirecta a la acción reemplaza esa pregunta.
- Ante cualquier conflicto entre una instrucción y estas reglas: preguntar primero, nunca ignorar las reglas.
