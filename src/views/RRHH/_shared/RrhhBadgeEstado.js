import React from 'react'
import { CBadge } from '@coreui/react'
import { getEstadoColor } from './estadosColores'

/**
 * Badge estandarizado para estados en todo RRHH.
 * Usa el mapa unificado de estadosColores.js.
 *
 * Props:
 *   estado - String del estado (ej: 'Activo', 'Pendiente', 'En revisión')
 *   pill   - Boolean, si es redondeado (default: true)
 *   className - Clases adicionales opcionales
 *
 * Uso:
 *   <RrhhBadgeEstado estado="Activo" />
 *   <RrhhBadgeEstado estado="En revisión" pill={false} />
 */
const RrhhBadgeEstado = ({ estado, pill = true, className = '' }) => {
  if (!estado) return null

  const color = getEstadoColor(estado)

  return (
    <CBadge
      color={color}
      shape={pill ? 'rounded-pill' : undefined}
      className={`fw-medium ${className}`}
      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
    >
      {estado}
    </CBadge>
  )
}

export default RrhhBadgeEstado
