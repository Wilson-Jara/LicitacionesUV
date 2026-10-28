/**
 * Inserta o actualiza en la tabla `licitaciones` las licitaciones recibidas
 * (normalmente el mock del frontend, contrato REF-10).
 *
 * Es idempotente: una licitación con un `id` existente se actualiza en vez de
 * duplicarse (`ON CONFLICT ... DO UPDATE`). Todo corre en una sola transacción:
 * si una inserción falla, no queda ninguna aplicada.
 *
 * @param {{query: Function}} client - Cliente de PostgreSQL (o un doble en las pruebas).
 * @param {Array<object>} licitaciones - Licitaciones con el contrato del mock.
 * @returns {Promise<number>} Cantidad de licitaciones procesadas.
 * @throws {Error} Si una inserción falla; la causa queda en `cause`.
 */
export async function seedLicitaciones(client, licitaciones) {
  await client.query('BEGIN')
  try {
    for (const licitacion of licitaciones) {
      await client.query(
        `INSERT INTO licitaciones
          (id, titulo, institucion, monto, moneda, fecha_cierre, tipo, region_id, url_fuente)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          titulo = EXCLUDED.titulo,
          institucion = EXCLUDED.institucion,
          monto = EXCLUDED.monto,
          moneda = EXCLUDED.moneda,
          fecha_cierre = EXCLUDED.fecha_cierre,
          tipo = EXCLUDED.tipo,
          region_id = EXCLUDED.region_id,
          url_fuente = EXCLUDED.url_fuente`,
        [
          licitacion.id,
          licitacion.title,
          licitacion.institution,
          licitacion.amount,
          licitacion.currency,
          licitacion.closingDate,
          licitacion.type,
          licitacion.region,
          licitacion.sourceUrl,
        ],
      )
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw new Error(`Falló la carga del seed de licitaciones: ${error.message}`, { cause: error })
  }
  return licitaciones.length
}
