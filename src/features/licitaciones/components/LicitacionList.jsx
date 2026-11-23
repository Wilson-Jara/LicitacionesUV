import PropTypes from 'prop-types'
import { AnimatePresence, motion as Motion } from 'motion/react'
import { LicitacionCard } from './LicitacionCard'
import './LicitacionList.css'

const listSpring = { type: 'spring', stiffness: 400, damping: 32 }

export function LicitacionList({ licitaciones, onResetFilters }) {
  if (!licitaciones.length) {
    return (
      <Motion.div
        className="licitaciones-empty"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3>No encontramos licitaciones</h3>
        <p>Prueba otro título o limpia los filtros para volver a explorar el catálogo.</p>
        {onResetFilters && (
          <button type="button" className="button button--primary" onClick={onResetFilters}>
            Limpiar filtros
          </button>
        )}
      </Motion.div>
    )
  }

  return (
    <ul className="licitaciones-list" role="list">
      <AnimatePresence mode="popLayout" initial={false}>
        {licitaciones.map((licitacion) => (
          <Motion.li
            key={licitacion.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={listSpring}
          >
            <LicitacionCard licitacion={licitacion} />
          </Motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

LicitacionList.propTypes = {
  licitaciones: PropTypes.arrayOf(PropTypes.object).isRequired,
  onResetFilters: PropTypes.func,
}
