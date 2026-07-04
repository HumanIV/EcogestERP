import React from 'react'
import { CRow, CCol, CCard, CCardBody, CButton, CBadge, CTooltip } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoom, cilCloudUpload, cilFolder } from '@coreui/icons'

const BADGE_SOLID = {
  success: { background: '#2eb85c', color: '#fff' },
  warning: { background: '#f9b115', color: '#1a1a1a' },
  danger: { background: '#e55353', color: '#fff' },
  info: { background: '#3399ff', color: '#fff' },
  primary: { background: '#321fdb', color: '#fff' },
  secondary: { background: '#9da5b1', color: '#fff' },
}

const STATUS_STYLE = {
  Completo: { background: '#2eb85c', color: '#fff' },
  'En revisión': { background: '#f9b115', color: '#1a1a1a' },
  Incompleto: { background: '#e55353', color: '#fff' },
  Pendiente: { background: '#9da5b1', color: '#fff' },
}

const ExpedientesGrid = ({ data, empleados, onView, onUpload }) => {
  const getEmpleado = (empleadoId) => empleados.find((e) => String(e.id) === String(empleadoId))

  if (data.length === 0) return null

  return (
    <CRow className="g-3 mt-2">
      {data.map((item) => {
        const emp = getEmpleado(item.empleadoId)
        const pct = item.porcentajeCompletado || 0
        const badgeColor = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'
        const statusStyle = STATUS_STYLE[item.estadoExp] || STATUS_STYLE.Pendiente
        return (
          <CCol xs={12} sm={6} lg={4} xl={3} key={item.id}>
            <div className="exp-card h-100 p-3 d-flex flex-column">
              {/* Employee header */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  className="exp-avatar flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}
                >
                  {emp?.nombre?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <div className="fw-bolder text-truncate" style={{ fontSize: '1.05rem', color: '#1e293b' }}>
                    {emp?.nombre || 'Sin empleado'} {emp?.apellidos || ''}
                  </div>
                  <div className="text-truncate text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {emp?.cargo || 'Sin cargo asignado'}
                  </div>
                </div>
              </div>

              {/* Badges row */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge rounded-pill" style={{ ...BADGE_SOLID.primary, fontWeight: 500, padding: '0.4em 0.8em' }}>
                  {emp?.departamento || 'N/A'}
                </span>
                <span className="badge rounded-pill" style={{ ...statusStyle, fontWeight: 500, padding: '0.4em 0.8em' }}>
                  {item.estadoExp}
                </span>
              </div>

              {/* Stats row */}
              <div className="d-flex justify-content-between align-items-center mb-3 px-1 mt-auto">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded-circle" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                    <CIcon icon={cilFolder} style={{ color: '#0ea5e9' }} size="sm" />
                  </div>
                  <span className="fw-semibold small" style={{ color: '#475569' }}>
                    {item.documentos?.length || 0} archivos
                  </span>
                </div>
                <span className="fw-bold" style={{ color: BADGE_SOLID[badgeColor].background }}>
                  {pct}%
                </span>
              </div>

              {/* Premium Progress Bar */}
              <div className="exp-progress-wrapper mb-4">
                <div 
                  className="exp-progress-bar" 
                  style={{ 
                    width: `${pct}%`, 
                    background: BADGE_SOLID[badgeColor].background 
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
                  Visualizar
                </CButton>
                <CTooltip content="Subir nuevo documento">
                  <CButton
                    color="primary"
                    onClick={() => onUpload(item)}
                    style={{ borderRadius: '8px', padding: '0.375rem 0.75rem' }}
                  >
                    <CIcon icon={cilCloudUpload} />
                  </CButton>
                </CTooltip>
              </div>
            </div>
          </CCol>
        )
      })}
    </CRow>
  )
}

export default ExpedientesGrid
