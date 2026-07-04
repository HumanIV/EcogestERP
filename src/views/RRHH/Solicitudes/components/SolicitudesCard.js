import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilBriefcase, cilUser } from '@coreui/icons'

const getPrioridadStyle = (prioridad) => {
  const map = { 
    Baja: { bg: '#f1f5f9', color: '#64748b' }, 
    Media: { bg: '#e0f2fe', color: '#0ea5e9' }, 
    Alta: { bg: '#fef3c7', color: '#d97706' }, 
    Urgente: { bg: '#fee2e2', color: '#ef4444' } 
  }
  return map[prioridad] || { bg: '#f1f5f9', color: '#64748b' }
}

const SolicitudesCard = ({ solicitud, onView }) => {
  const prioStyle = getPrioridadStyle(solicitud.prioridad)
  
  return (
    <div 
      className="exp-card mb-3 shadow-sm border-0 bg-white" 
      style={{ cursor: 'pointer', padding: '1rem', borderRadius: '12px' }} 
      onClick={() => onView(solicitud)}
    >
      {/* Header: Priority & Date */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span 
          className="badge rounded-pill fw-bold"
          style={{ backgroundColor: prioStyle.bg, color: prioStyle.color, padding: '0.35em 0.7em', fontSize: '0.7rem' }}
        >
          {solicitud.prioridad}
        </span>
        <small className="text-muted fw-medium" style={{ fontSize: '0.7rem' }}>
          {solicitud.fechaSolicitud || solicitud.fecha}
        </small>
      </div>

      {/* Title */}
      <div 
        className="fw-bold mb-3" 
        style={{ 
          color: '#1e293b', 
          fontSize: '0.95rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.3'
        }} 
        title={solicitud.tipo}
      >
        {solicitud.tipo}
      </div>
      
      {/* Employee (Compact) */}
      <div className="d-flex align-items-center mb-3">
        <div 
          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 me-2"
          style={{ width: '32px', height: '32px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
        >
          {solicitud.empleadoNombre ? solicitud.empleadoNombre.charAt(0) : <CIcon icon={cilUser} size="sm" />}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0, lineHeight: '1.2' }}>
          <div className="fw-bold text-truncate" style={{ color: '#334155', fontSize: '0.8rem' }} title={solicitud.empleadoNombre}>
            {solicitud.empleadoNombre}
          </div>
          <div className="text-muted text-truncate mt-1" style={{ fontSize: '0.7rem' }} title={solicitud.departamento}>
            <CIcon icon={cilBriefcase} style={{ width: '10px', height: '10px' }} className="me-1" />
            {solicitud.departamento || 'Sin departamento'}
          </div>
        </div>
      </div>

      {/* Footer: Dates / Days */}
      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
        <div className="d-flex align-items-center text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
          <CIcon icon={cilCalendar} size="sm" className="me-1 text-primary" />
          {solicitud.detalles?.fechaInicio ? (
            <span className="text-truncate" style={{ maxWidth: '100px' }}>
              {solicitud.detalles.fechaInicio} 
            </span>
          ) : (
            'Sin fechas'
          )}
        </div>
        {solicitud.diasSolicitados > 0 && (
          <span className="badge" style={{ backgroundColor: '#f8fafc', color: '#3b82f6', border: '1px solid #e2e8f0', fontSize: '0.7rem' }}>
            {solicitud.diasSolicitados} {solicitud.diasSolicitados === 1 ? 'día' : 'días'}
          </span>
        )}
      </div>
    </div>
  )
}

export default SolicitudesCard
