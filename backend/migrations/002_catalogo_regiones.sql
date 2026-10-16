-- Catálogo de regiones que hoy usa el frontend (REGION_NAMES en licitacionUtils.js).
INSERT INTO regiones (id, nombre) VALUES
  ('valparaiso', 'Valparaíso'),
  ('metropolitana', 'Metropolitana'),
  ('biobio', 'Biobío'),
  ('antofagasta', 'Antofagasta')
ON CONFLICT (id) DO NOTHING;
