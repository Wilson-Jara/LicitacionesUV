// Dos implementaciones con la misma interfaz asíncrona:
//   list({ keyword, region, tipo }) -> Promise<Licitacion[]>
//   findById(id) -> Promise<Licitacion | null>
// Ambas devuelven el contrato del mock del frontend (REF-10).

function equalsIgnoreCase(value, expected) {
  return String(value).toLowerCase() === expected.toLowerCase()
}

// CA1 de #43: la palabra clave se busca solo en el título, igual que el frontend
function matchesKeyword(licitacion, keyword) {
  return licitacion.title.toLowerCase().includes(keyword.toLowerCase())
}

export function createMemoryLicitacionesRepository(licitaciones) {
  return {
    async list({ keyword, region, tipo } = {}) {
      let resultado = licitaciones
      if (keyword) resultado = resultado.filter((l) => matchesKeyword(l, keyword))
      if (region) resultado = resultado.filter((l) => equalsIgnoreCase(l.region, region))
      if (tipo) resultado = resultado.filter((l) => equalsIgnoreCase(l.type, tipo))
      return resultado
    },
    async findById(id) {
      return licitaciones.find((l) => l.id === id) ?? null
    },
  }
}

const SELECT_LICITACION = `
  SELECT id, titulo, institucion, monto, moneda,
    to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre,
    tipo, region_id, url_fuente
  FROM licitaciones`

// BIGINT llega como texto desde pg y DATE se formatea en SQL para no depender
// de la zona horaria del servidor.
export function mapLicitacionRow(row) {
  return {
    id: row.id,
    title: row.titulo,
    amount: Number(row.monto),
    currency: row.moneda,
    institution: row.institucion,
    closingDate: row.fecha_cierre,
    type: row.tipo,
    region: row.region_id,
    sourceUrl: row.url_fuente,
  }
}

function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&')
}

export function buildListQuery({ keyword, region, tipo } = {}) {
  const condiciones = []
  const params = []
  if (keyword) {
    params.push(`%${escapeLike(keyword)}%`)
    condiciones.push(`titulo ILIKE $${params.length}`)
  }
  if (region) {
    params.push(region)
    condiciones.push(`lower(region_id) = lower($${params.length})`)
  }
  if (tipo) {
    params.push(tipo)
    condiciones.push(`lower(tipo) = lower($${params.length})`)
  }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : ''
  return { text: `${SELECT_LICITACION}${where} ORDER BY id`, values: params }
}

export function createPgLicitacionesRepository(db) {
  return {
    async list(filters) {
      const { rows } = await db.query(buildListQuery(filters))
      return rows.map(mapLicitacionRow)
    },
    async findById(id) {
      const { rows } = await db.query({
        text: `${SELECT_LICITACION} WHERE id = $1`,
        values: [id],
      })
      return rows.length ? mapLicitacionRow(rows[0]) : null
    },
  }
}
