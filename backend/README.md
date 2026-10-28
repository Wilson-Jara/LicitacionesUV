# Backend — LicitacionesUV

API REST de la Fase 2 del proyecto. Servidor HTTP con el módulo nativo `node:http` de Node.js y PostgreSQL 16 mediante el driver `pg` (única dependencia).

## Estado actual

- `GET /api/health`: estado del servicio.
- `GET /api/licitaciones`: catálogo completo, con filtros opcionales `keyword` (título o institución), `region` y `tipo`, sin distinguir mayúsculas.
- `GET /api/licitaciones/:id`: detalle de una licitación.

Los datos se leen de PostgreSQL cuando existe `DATABASE_URL`. Sin ella, la API usa en memoria el mock del frontend (`src/features/licitaciones/data/licitaciones.mock.json`), con el mismo contrato en ambos casos (REF-10). El frontend todavía lee el mock local; la migración a la API corresponde a una entrega posterior.

## Requisitos

- Node.js >= 20.19.0
- PostgreSQL 16 (con Docker, ver abajo) solo si quieres usar la base de datos

## Instalación

```bash
# desde la carpeta backend/
npm install
```

## Base de datos local con Docker

1. En la raíz del repositorio, copia `.env.example` como `.env` y define `POSTGRES_USER` y `POSTGRES_PASSWORD` con valores propios.
2. Levanta PostgreSQL desde la raíz:

   ```bash
   docker compose up -d
   ```

   La primera vez también se crea la base de pruebas `licitaciones_test`.

3. En `backend/`, copia `.env.example` como `.env` y define `DATABASE_URL` (y, si quieres correr las pruebas de integración, `DATABASE_URL_TEST`) con el mismo usuario y contraseña.
4. Crea el esquema y carga los datos:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

Las migraciones son archivos SQL numerados en `migrations/` (`001_...sql`, `002_...sql`). `db:migrate` aplica solo las pendientes, cada una en su transacción, y las registra en la tabla `schema_migrations`. Para cambiar el esquema se agrega una migración nueva; nunca se edita una ya aplicada.

## Ejecución

```bash
# desde la carpeta backend/
npm run dev   # arranca con recarga automática (node --watch)
npm start     # arranca el servidor
npm test      # ejecuta las pruebas de la API con node --test
```

Por defecto el servidor escucha en `http://localhost:3000` y acepta CORS desde `http://localhost:5173` (Vite). Ver `.env.example` para configurar `PORT`, `CORS_ORIGIN` y las variables de la base de datos.

## Pruebas

- Las pruebas unitarias no necesitan PostgreSQL y se ejecutan siempre, también con `npm run verify` desde la raíz.
- Las pruebas de integración (`tests/db.integration.test.js`) corren contra PostgreSQL real solo si existe `DATABASE_URL_TEST`. Borran y recrean el esquema, por eso se niegan a correr si el nombre de la base no termina en `_test`. En CI las ejecuta el servicio `postgres:16` de `.github/workflows/verify.yml`.

## Convenciones

- JavaScript ES modules, sin punto y coma, comillas simples e indentación de dos espacios (mismo estilo que el frontend).
- Consultas SQL parametrizadas escritas a mano, sin ORM (Decisión 11 en `docs/Arquitectura.md`).
- Pruebas con el runner nativo (`node --test`), cubiertas también por `npm run verify` desde la raíz del repositorio.
