# Backend — LicitacionesUV

API REST de la Fase 2 del proyecto. Servidor HTTP con el módulo nativo `node:http` de Node.js, sin dependencias externas.

## Estado actual (base)

- `GET /api/health`: estado del servicio.
- `GET /api/licitaciones`: catálogo completo, con filtros opcionales `keyword`, `region` y `tipo`.
- `GET /api/licitaciones/:id`: detalle de una licitación.

Los datos provienen del seed `src/data/licitaciones.seed.json`, con el mismo contrato que `src/features/licitaciones/data/licitaciones.mock.json` (REF-10). El frontend todavía lee el mock local; la migración a la API corresponde a una entrega posterior.

## Requisitos

- Node.js >= 20.19.0

## Ejecución

```bash
# desde la carpeta backend/
npm run dev   # arranca con recarga automática (node --watch)
npm start     # arranca el servidor
npm test      # ejecuta las pruebas de la API con node --test
```

Por defecto el servidor escucha en `http://localhost:3000` y acepta CORS desde `http://localhost:5173` (Vite). Ver `.env.example` para configurar `PORT`, `CORS_ORIGIN` y las variables reservadas para la base de datos.

## Convenciones

- JavaScript ES modules, sin punto y coma, comillas simples e indentación de dos espacios (mismo estilo que el frontend).
- Sin dependencias por ahora: al agregar autenticación y PostgreSQL se evaluará un framework HTTP (Express/Fastify) y el driver de base de datos (ver Decisión 8 en `docs/Arquitectura.md`).
- Pruebas con el runner nativo (`node --test`), cubiertas también por `npm run verify` desde la raíz del repositorio.
