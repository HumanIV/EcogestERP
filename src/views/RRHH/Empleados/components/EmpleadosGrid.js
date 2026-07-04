import React from 'react'
import { CRow, CCol, CBadge, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoom, cilLocationPin, cilBriefcase } from '@coreui/icons'

// Fallback solid colors if needed
const BADGE_SOLID = {
  success: { background: '#10b981', color: '#fff' },
  warning: { background: '#f59e0b', color: '#fff' },
  danger: { background: '#ef4444', color: '#fff' },
  primary: { background: '#3b82f6', color: '#fff' }
}

const EmpleadosGrid = ({ data, onView }) => {
  const getPrioridadColor = (rendimiento) => {
    if (rendimiento >= 90) return 'success'
    if (rendimiento >= 80) return 'warning'
    return 'danger'
  }

  const getStatusStyle = (estado) => {
    if (estado === 'Activo') return { background: '#10b981', color: '#fff' }
    if (estado === 'Inactivo') return { background: '#ef4444', color: '#fff' }
    if (estado === 'Vacaciones') return { background: '#f59e0b', color: '#fff' }
    return { background: '#64748b', color: '#fff' }
  }

  if (data.length === 0) return null

  return (
    <CRow className="g-3">
      {data.map((item) => {
        const rnd = item.rendimiento ?? 0
        const rndColor = getPrioridadColor(rnd)
        const statusStyle = getStatusStyle(item.estado)
        
        return (
          <CCol xs={12} sm={6} md={4} lg={3} key={item.id}>
            <div className="exp-card h-100 p-3 d-flex flex-column">
              {/* Employee header */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  className="exp-avatar flex-shrink-0"
                  style={{ 
                    background: item.foto 
                      ? `url(${item.foto}) center/cover no-repeat` 
                      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                  }}
                >
                  {!item.foto && (item.nombre?.charAt(0) || '?')}
                </div>
                <div className="min-w-0">
                  <div className="fw-bolder text-truncate" style={{ fontSize: '1.05rem', color: '#1e293b' }}>
                    {item.nombre || 'Sin nombre'}
                  </div>
                  <div className="text-truncate text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {item.email || 'Sin email'}
                  </div>
                </div>
              </div>

              {/* Badges row */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge rounded-pill" style={{ background: '#3b82f6', color: '#fff', fontWeight: 500, padding: '0.4em 0.8em' }}>
                  {item.departamento || 'N/A'}
                </span>
                <span className="badge rounded-pill" style={{ ...statusStyle, fontWeight: 500, padding: '0.4em 0.8em' }}>
                  {item.estado}
                </span>
              </div>

              {/* Info rows */}
              <div className="small mb-2 fw-medium text-muted">
                <CIcon icon={cilBriefcase} className="me-2" size="sm" />
                {item.cargo}
              </div>
              <div className="small mb-3 fw-medium text-muted">
                <CIcon icon={cilLocationPin} className="me-2" size="sm" />
                {item.ubicacion}
              </div>

              {/* Rendimiento (Stats row) */}
              <div className="d-flex justify-content-between align-items-center mb-1 px-1 mt-auto">
                <span className="fw-semibold small" style={{ color: '#475569' }}>
                  Rendimiento
                </span>
                <span className="fw-bold" style={{ color: BADGE_SOLID[rndColor].background }}>
                  {item.rendimiento != null ? `${item.rendimiento}%` : '—'}
                </span>
              </div>

              {/* Premium Progress Bar */}
              <div className="exp-progress-wrapper mb-4">
                <div 
                  className="exp-progress-bar" 
                  style={{ 
                    width: `${rnd}%`, 
                    background: BADGE_SOLID[rndColor].background 
                  }} 
                />
              </div>

              {/* Actions */}
              <div className="d-flex gap-2">
                <CButton
                  color="light"
                  className="w-100 fw-semibold"
                  onClick={() => onView(item)}
                  style={{ color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                >
                  <CIcon icon={cilZoom} className="me-2" />
                  Ver Perfil
                </CButton>
              </div>
            </div>
          </CCol>
        )
      })}
    </CRow>
  )
}

export default EmpleadosGrid
