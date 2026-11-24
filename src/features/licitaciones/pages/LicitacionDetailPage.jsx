import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { motion as Motion } from 'motion/react'
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileDown,
  Loader2,
} from 'lucide-react'
import FavoritoButton from '../components/FavoritoButton.jsx'
import NotFoundPage from '../../../app/routes/NotFoundPage.jsx'
import { EstadoCatalogo } from '../components/EstadoCatalogo'
import { fetchLicitacion } from '../services/licitacionesApi.js'
import {
  formatLicitacionAmount,
  formatLicitacionDate,
  getRegionLabel,
  getTypeLabel,
  isLicitacionCerrada,
} from '../licitacionUtils.js'
import './LicitacionDetailPage.css'

/**
 * Página de detalle de una licitación (ruta `/licitaciones/:id`, HU #44).
 * Pide la licitación a la API (`GET /api/licitaciones/:id`) con el `id` de la URL:
 * mientras responde muestra "cargando", si la API responde 404 muestra la página 404
 * y si la API no responde muestra el error con un botón para reintentar.
 *
 * @returns {JSX.Element}
 */
function LicitacionDetailPage() {
  const { id } = useParams()
  const [carga, setCarga] = useState({ id: null, estado: 'cargando', licitacion: null })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    fetchLicitacion(id)
      .then((licitacion) => {
        if (vigente) setCarga({ id, estado: licitacion ? 'listo' : 'no-encontrada', licitacion })
      })
      .catch(() => {
        if (vigente) setCarga({ id, estado: 'error', licitacion: null })
      })
    return () => {
      vigente = false
    }
  }, [id, intento])

  // Hasta que llega la respuesta del id actual (primera carga, otro id o reintento) se muestra "cargando".
  const estado = carga.id === id ? carga.estado : 'cargando'

  if (estado === 'cargando' || estado === 'error') {
    const reintentar = () => {
      setCarga({ id: null, estado: 'cargando', licitacion: null })
      setIntento((n) => n + 1)
    }
    return (
      <section className="frame licitacion-detail">
        <EstadoCatalogo estado={estado} onReintentar={reintentar} />
      </section>
    )
  }

  if (estado === 'no-encontrada') return <NotFoundPage />

  return <LicitacionDetail key={carga.licitacion.id} licitacion={carga.licitacion} />
}

/**
 * Contenido del detalle: todos los campos de la licitación, estado
 * Vigente/Cerrada, enlace a la fuente oficial (pestaña nueva), botón de
 * favorito y exportación a PDF.
 *
 * - Favorito: mismas reglas que `LicitacionCard` (sin sesión abre el modal de
 *   acceso; cerrada no se puede guardar, pero sí quitar si ya estaba guardada).
 * - PDF: el módulo y el Web Worker se cargan solo al hacer clic, y la generación
 *   ocurre fuera del hilo principal para no congelar la página (HU #49).
 *
 * @param {object} props
 * @param {object} props.licitacion - Licitación con los 9 campos del contrato (REF-10).
 * @returns {JSX.Element}
 */
function LicitacionDetail({ licitacion }) {
  const { state } = useLocation()
  const [exportando, setExportando] = useState(false)
  const [exportError, setExportError] = useState(null)
  const cerrada = isLicitacionCerrada(licitacion.closingDate)

  const handleExportarPdf = async () => {
    setExportando(true)
    setExportError(null)
    try {
      // Carga diferida (REF-01): el módulo y el worker solo se cargan al exportar.
      // La generación corre en un Web Worker, por lo que la interfaz no se bloquea (CA6).
      const { exportLicitacionPdf } = await import('../services/exportLicitacionPdf.js')
      await exportLicitacionPdf(licitacion)
    } catch (error) {
      setExportError(error?.message || 'No se pudo generar el PDF. Inténtalo nuevamente.')
    } finally {
      setExportando(false)
    }
  }

  return (
    <section className="frame licitacion-detail">
      <Link
        className="licitacion-detail-back"
        to={{ pathname: '/licitaciones', search: state?.explorerSearch ?? '' }}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Volver a licitaciones</span>
      </Link>

      <Motion.article
        className="licitacion-detail-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="licitacion-detail-header">
          <div className="licitacion-detail-badges">
            <span className="licitacion-detail-type">{getTypeLabel(licitacion.type)}</span>
            <span className="licitacion-status" data-closed={cerrada}>
              {cerrada ? (
                <Archive size={16} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={16} aria-hidden="true" />
              )}
              <span>{cerrada ? 'Cerrada' : 'Vigente'}</span>
            </span>
          </div>
          <h1>{licitacion.title}</h1>
          <p>{licitacion.institution}</p>
        </header>

        <div className="licitacion-detail-body">
          <dl className="licitacion-detail-data">
            <div>
              <dt>Monto estimado</dt>
              <dd className="licitacion-detail-amount">
                {formatLicitacionAmount(licitacion.amount, licitacion.currency)}
              </dd>
            </div>
            <div>
              <dt>Moneda</dt>
              <dd>{licitacion.currency}</dd>
            </div>
            <div>
              <dt>Fecha de cierre</dt>
              <dd>
                <time dateTime={licitacion.closingDate}>
                  {formatLicitacionDate(licitacion.closingDate)}
                </time>
              </dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{getTypeLabel(licitacion.type)}</dd>
            </div>
            <div>
              <dt>Región</dt>
              <dd>{getRegionLabel(licitacion.region)}</dd>
            </div>
          </dl>

          <div className="licitacion-detail-actions">
            <a
              className="button button--primary"
              href={licitacion.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>Ver fuente oficial</span>
              <ExternalLink size={17} aria-hidden="true" />
              <span className="sr-only"> (abre en una pestaña nueva)</span>
            </a>
            <button
              type="button"
              className="button"
              onClick={handleExportarPdf}
              disabled={exportando}
            >
              {exportando ? (
                <Loader2 size={17} aria-hidden="true" className="icon-spin" />
              ) : (
                <FileDown size={17} aria-hidden="true" />
              )}
              <span>{exportando ? 'Generando PDF…' : 'Exportar PDF'}</span>
            </button>
            <FavoritoButton licitacion={licitacion} />
          </div>

          {exportError && (
            <p className="licitacion-detail-error" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>{exportError}</span>
            </p>
          )}

          {cerrada && (
            <p className="licitacion-detail-notice">
              Esta licitación ya cerró y no puede guardarse como favorita.
            </p>
          )}
        </div>
      </Motion.article>
    </section>
  )
}

LicitacionDetail.propTypes = {
  licitacion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    institution: PropTypes.string.isRequired,
    closingDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    region: PropTypes.string.isRequired,
    sourceUrl: PropTypes.string.isRequired,
  }).isRequired,
}

export default LicitacionDetailPage
