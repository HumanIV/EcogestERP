import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CButton,
  CRow,
  CCol,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeOpen, cilPhone, cilCalendar, cilBriefcase, cilX, cilPencil } from '@coreui/icons'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const EmpleadosModalDetalle = ({ visible, onClose, empleado, onEdit }) => {
  if (!empleado) return null

  const getPrioridadColor = (rendimiento) => {
    if (rendimiento >= 90) return '#10b981' // success
    if (rendimiento >= 80) return '#f59e0b' // warning
    return '#ef4444' // danger
  }

  const rnd = empleado.rendimiento ?? 0
  const rndColor = getPrioridadColor(rnd)

  return (
    <CModal 
      visible={visible} 
      onClose={onClose} 
      size="xl" 
      backdrop="static"
      className="border-0 shadow-lg"
    >
      <CModalHeader className="border-0 pb-0 bg-light d-flex justify-content-end p-4">
        <CButton color="link" onClick={onClose} className="text-dark p-0 text-decoration-none">
          <CIcon icon={cilX} size="lg" />
        </CButton>
      </CModalHeader>
      
      <CModalBody className="p-0">
        <CRow className="g-0 h-100">
          
          {/* Columna Izquierda - Sidebar */}
          <CCol md={4} className="exp-visor-sidebar d-flex flex-column align-items-center text-center">
            <div 
              className="exp-avatar mb-4" 
              style={{ 
                width: '120px', 
                height: '120px', 
                fontSize: '3rem',
                background: empleado.foto 
                  ? `url(${empleado.foto}) center/cover no-repeat` 
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}
            >
              {!empleado.foto && (empleado.nombre?.charAt(0) || '?')}
            </div>
            
            <h3 className="fw-bolder mb-1" style={{ color: '#1e293b' }}>
              {empleado.nombre}
            </h3>
            <p className="text-muted fw-medium mb-3">{empleado.cargo}</p>
            
            <div className="mb-4">
              <RrhhBadgeEstado estado={empleado.estado} />
            </div>

            {/* Rendimiento Circular Premium */}
            <div 
              className="position-relative d-flex align-items-center justify-content-center mt-3 mb-4"
              style={{ width: '120px', height: '120px' }}
            >
              <svg className="w-100 h-100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={rndColor} 
                  strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * rnd) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.5s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="position-absolute d-flex flex-column align-items-center">
                <span className="fw-bolder fs-3" style={{ color: rndColor }}>{rnd}%</span>
                <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Rendimiento</span>
              </div>
            </div>

            <CButton 
              color="primary" 
              className="w-100 mt-auto rounded-pill fw-semibold shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none' }}
              onClick={() => {
                onEdit(empleado)
                onClose()
              }}
            >
              <CIcon icon={cilPencil} className="me-2" />
              Editar Perfil
            </CButton>
          </CCol>
          
          {/* Columna Derecha - Contenido */}
          <CCol md={8} className="p-4 p-md-5 bg-white">
            <h4 className="fw-bold mb-4 pb-3 border-bottom" style={{ color: '#0f172a' }}>
              Información Personal & Laboral
            </h4>

            <CRow className="g-4 mb-5">
              <CCol sm={6}>
                <div className="p-3 rounded bg-light border border-light">
                  <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                    <CIcon icon={cilBriefcase} className="me-2 text-primary" size="sm" />
                    Departamento
                  </small>
                  <span className="fw-bold fs-6" style={{ color: '#334155' }}>{empleado.departamento || 'N/A'}</span>
                </div>
              </CCol>
              <CCol sm={6}>
                <div className="p-3 rounded bg-light border border-light">
                  <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                    <CIcon icon={cilCalendar} className="me-2 text-primary" size="sm" />
                    Ingreso
                  </small>
                  <span className="fw-bold fs-6" style={{ color: '#334155' }}>{empleado.fechaIngreso || 'N/A'}</span>
                </div>
              </CCol>
              
              <CCol sm={6}>
                <div className="p-3 rounded bg-light border border-light">
                  <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                    <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" size="sm" />
                    Email
                  </small>
                  <span className="fw-bold fs-6 text-break" style={{ color: '#334155' }}>{empleado.email || 'N/A'}</span>
                </div>
              </CCol>
              <CCol sm={6}>
                <div className="p-3 rounded bg-light border border-light">
                  <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                    <CIcon icon={cilPhone} className="me-2 text-primary" size="sm" />
                    Teléfono
                  </small>
                  <span className="fw-bold fs-6" style={{ color: '#334155' }}>{empleado.telefono || 'N/A'}</span>
                </div>
              </CCol>
            </CRow>

            <h5 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: '#0f172a' }}>Habilidades</h5>
            {empleado.skills && empleado.skills.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mb-4">
                {empleado.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="badge rounded-pill" 
                    style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '0.5em 1em', fontWeight: 500 }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted fst-italic mb-4">No hay habilidades registradas.</p>
            )}

            <h5 className="fw-bold mb-3 pb-2 border-bottom" style={{ color: '#0f172a' }}>Notas y Evaluación</h5>
            {empleado.ultimaEvaluacion ? (
               <div className="p-3 border rounded" style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}>
                 <p className="mb-0 fw-medium text-muted">
                    Última evaluación registrada el: <strong className="text-dark">{empleado.ultimaEvaluacion}</strong>
                 </p>
               </div>
            ) : (
              <p className="text-muted fst-italic">Sin evaluaciones recientes registradas.</p>
            )}

          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  )
}

export default EmpleadosModalDetalle
