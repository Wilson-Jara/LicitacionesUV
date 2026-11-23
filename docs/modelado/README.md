# ISF225 — Entrega 3: modelado del sistema

Este índice reúne los cuatro diagramas UML de la Entrega 3. Cada documento
conserva el diagrama como código (Mermaid o PlantUML) y una nota de lectura que
explica la decisión arquitectónica representada. El concepto de coherencia que
se sigue entre los cuatro es **Licitación**: el visitante la busca, el dominio
la modela, la API la entrega y los componentes la transportan/persisten.

## Diagramas

| #   | Diagrama     | Archivo                            | Estado                        |
| --- | ------------ | ---------------------------------- | ----------------------------- |
| 1   | Casos de uso | `1-casos-de-uso.md`                | Pendiente del PR #129         |
| 2   | Clases       | [`2-clases.md`](2-clases.md)       | Disponible; PR #123 fusionado |
| 3   | Secuencia    | [`3-secuencia.md`](3-secuencia.md) | Disponible; PR #154 fusionado |
| 4   | Componentes  | `4-componentes.md`                 | PR #153 pendiente de merge    |

## Decisión para la demo

Se propone demostrar **Buscar licitaciones** (#43), porque es el flujo más
completo y conecta la interfaz del explorador, `LicitacionesProvider`, el cliente
HTTP, la API y el repositorio de datos. El flujo PDF queda como respaldo, no como
recorrido principal. Esta propuesta debe confirmarse por el equipo antes de la
presentación.

## Orden recomendado de integración

1. Fusionar los PR de los cuatro diagramas después de la revisión de QA.
2. Verificar que `develop` contiene la misma versión descrita por los diagramas.
3. Ejecutar `npm.cmd run verify` y comprobar la URL pública antes de la demo.
4. Registrar el commit evaluable y el resultado del ensayo en la evidencia de
   coordinación.

Los enlaces a despliegue y presentación se agregarán cuando el equipo confirme
las URLs y el flujo final.
