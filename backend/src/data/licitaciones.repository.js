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

/**
 * Crea un repositorio de licitaciones que filtra en memoria un arreglo ya cargado.
 * Se usa en las pruebas y cuando no hay `DATABASE_URL`.
 *
 * Reglas de filtrado (mismas que el repositorio PostgreSQL y el frontend):
 * `keyword` se busca solo en el título (CA1 de #43); `region` y `tipo` deben
 * coincidir exactamente; las tres comparaciones ignoran mayúsculas y los filtros
 * se combinan con Y lógico. Un filtro vacío no restringe el resultado.
 *
 * @param {Array<object>} licitaciones - Licitaciones con el contrato del mock (REF-10).
 * @returns {{list: (filters?: {keyword?: string, region?: string, tipo?: string}) => Promise<Array<object>>, findById: (id: string) => Promise<object|null>}}
 *   Repositorio: `list` devuelve las que cumplen los filtros y `findById` la de ese
 *   `id` exacto (distingue mayúsculas) o `null`.
 */
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

/**
 * Convierte una fila de la tabla `licitaciones` al contrato de datos del frontend (REF-10).
 *
 * Decisiones no evidentes: `pg` entrega los `BIGINT` como texto, por eso el monto se
 * convierte a número; la fecha de cierre ya llega como `YYYY-MM-DD` desde el SQL
 * para no depender de la zona horaria del servidor.
 *
 * @param {object} row - Fila con las columnas de `SELECT_LICITACION`.
 * @returns {{id: string, title: string, amount: number, currency: string, institution: string, closingDate: string, type: string, region: string, sourceUrl: string}}
 *   Licitación con los 9 campos del contrato.
 */
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

/**
 * Arma la consulta SQL del listado con los filtros activos, siempre parametrizada
 * (`$1`, `$2`…) para evitar inyección SQL. `keyword` usa `ILIKE` solo sobre el
 * título y escapa `%`, `_` y `\` para que se busquen como texto literal;
 * `region` y `tipo` se comparan sin distinguir mayúsculas. Ordena por `id`.
 *
 * @param {{keyword?: string, region?: string, tipo?: string}} [filters={}] - Filtros; uno vacío no se aplica.
 * @returns {{text: string, values: Array<string>}} Consulta y valores para `db.query`.
 */
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

/**
 * Crea un repositorio de licitaciones respaldado por PostgreSQL, con la misma
 * interfaz y las mismas reglas de filtrado que el repositorio en memoria.
 * La conexión se recibe por parámetro (un `pg.Pool` o un cliente), lo que
 * permite reemplazarla por un doble en las pruebas.
 *
 * @param {{query: Function}} db - Objeto con `query(consulta)` que devuelve `{ rows }`.
 * @returns {{list: (filters?: {keyword?: string, region?: string, tipo?: string}) => Promise<Array<object>>, findById: (id: string) => Promise<object|null>}}
 *   Repositorio con el contrato del mock (REF-10).
 */
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
