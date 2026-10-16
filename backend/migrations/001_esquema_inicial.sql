-- Esquema inicial: las 8 entidades del dominio (README, "Entidades del Dominio").
-- Las tablas de CR-302 (aprobaciones, delegaciones, umbrales) se crean sin
-- endpoints; su lógica se implementa en US-09, US-10 y US-11.

CREATE TABLE regiones (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('facultad', 'direccion', 'rectoria'))
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  proveedor_auth TEXT NOT NULL DEFAULT 'local'
    CHECK (proveedor_auth IN ('local', 'google', 'github')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX usuarios_email_unico ON usuarios (lower(email));

CREATE TABLE licitaciones (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  institucion TEXT NOT NULL,
  monto BIGINT NOT NULL CHECK (monto >= 0),
  moneda CHAR(3) NOT NULL DEFAULT 'CLP',
  fecha_cierre DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('publica', 'privada')),
  region_id TEXT NOT NULL REFERENCES regiones (id),
  unidad_id UUID REFERENCES unidades (id),
  url_fuente TEXT NOT NULL
);

CREATE INDEX licitaciones_region_idx ON licitaciones (region_id);
CREATE INDEX licitaciones_unidad_idx ON licitaciones (unidad_id);

CREATE TABLE favoritos (
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  licitacion_id TEXT NOT NULL REFERENCES licitaciones (id) ON DELETE CASCADE,
  fecha_guardado TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, licitacion_id)
);

CREATE TABLE umbrales_aprobacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES unidades (id) ON DELETE CASCADE,
  -- monto_minimo es inclusivo y monto_maximo exclusivo; NULL = sin tope
  monto_minimo BIGINT NOT NULL CHECK (monto_minimo >= 0),
  monto_maximo BIGINT CHECK (monto_maximo IS NULL OR monto_maximo > monto_minimo),
  nivel_aprobador SMALLINT NOT NULL CHECK (nivel_aprobador > 0)
);

CREATE INDEX umbrales_unidad_idx ON umbrales_aprobacion (unidad_id);

CREATE TABLE delegaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titular_id UUID NOT NULL REFERENCES usuarios (id),
  subrogante_id UUID NOT NULL REFERENCES usuarios (id),
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  CHECK (titular_id <> subrogante_id),
  CHECK (fecha_termino >= fecha_inicio)
);

CREATE INDEX delegaciones_titular_idx ON delegaciones (titular_id);

CREATE TABLE aprobaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacion_id TEXT NOT NULL REFERENCES licitaciones (id) ON DELETE CASCADE,
  aprobador_efectivo_id UUID NOT NULL REFERENCES usuarios (id),
  nivel SMALLINT NOT NULL CHECK (nivel > 0),
  decision TEXT NOT NULL CHECK (decision IN ('aprobada', 'rechazada')),
  comentario TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX aprobaciones_licitacion_idx ON aprobaciones (licitacion_id);
