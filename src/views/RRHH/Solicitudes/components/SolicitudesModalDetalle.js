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
import {
  cilUser,
  cilCalendar,
  cilFile,
  cilClock,
  cilInbox,
  cilCheckCircle,
  cilX,
  cilDescription
} from '@coreui/icons'

const SolicitudesModalDetalle = ({ visible, onClose, solicitud }) => {
  if (!solicitud) return null

  const getPrioridadStyle = (prioridad) => {
    const map = { 
      Baja: { bg: '#f1f5f9', color: '#64748b' }, 
      Media: { bg: '#e0f2fe', color: '#0ea5e9' }, 
      Alta: { bg: '#fef3c7', color: '#d97706' }, 
      Urgente: { bg: '#fee2e2', color: '#ef4444' } 
    }
    return map[prioridad] || { bg: '#f1f5f9', color: '#64748b' }
  }
  
  const prioStyle = getPrioridadStyle(solicitud.prioridad)
  
  const getStatusStyle = (estado) => {
    if (estado === 'Aprobada') return { bg: '#10b981', color: '#fff' }
    if (estado === 'Rechazada') return { bg: '#ef4444', color: '#fff' }
    if (estado === 'En revisión') return { bg: '#8b5cf6', color: '#fff' }
    return { bg: '#f59e0b', color: '#fff' } // Pendiente
  }
  
  const statusStyle = getStatusStyle(solicitud.estado)

  return (
    <CModal visible={visible} onClose={onClose} size="lg" backdrop="static" className="border-0 shadow-lg">
      <CModalHeader className="border-0 pb-0 bg-light d-flex justify-content-end p-4">
        <CButton color="link" onClick={onClose} className="text-dark p-0 text-decoration-none">
          <CIcon icon={cilX} size="lg" />
        </CButton>
      </CModalHeader>
      
      <CModalBody className="p-0">
        <CRow className="g-0 h-100">
          
          {/* Sidebar */}
          <CCol md={4} className="exp-visor-sidebar d-flex flex-column p-4 border-end border-light">
            <div className="mb-4 text-center">
              <div 
                className="exp-avatar mx-auto mb-3" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}
              >
                {solicitud.empleadoNombre?.charAt(0) || '?'}
              </div>
              <h5 className="fw-bolder mb-1" style={{ color: '#1e293b' }}>{solicitud.empleadoNombre}</h5>
              <p className="text-muted fw-medium small mb-2">{solicitud.departamento || 'Sin departamento'}</p>
            </div>
            
            <div className="d-flex flex-column gap-2 mb-4">
              <span className="badge rounded-pill fw-bold text-center py-2" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                {solicitud.estado}
              </span>
              <span className="badge rounded-pill fw-bold text-center py-2" style={{ backgroundColor: prioStyle.bg, color: prioStyle.color }}>
                Prioridad {solicitud.prioridad}
              </span>
              <span className="badge rounded-pill fw-bold text-center py-2 bg-light text-dark border">
                {solicitud.tipo}
              </span>
            </div>

            <div className="mt-auto">
              <small className="text-muted d-block fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                <CIcon icon={cilCalendar} className="me-2 text-primary" size="sm" />
                Fecha de Solicitud
              </small>
              <span className="fw-bold fs-6" style={{ color: '#334155' }}>
                {solicitud.fechaSolicitud || solicitud.fecha}
              </span>
            </div>
          </CCol>

          {/* Main Content */}
          <CCol md={8} className="p-4 p-md-5 bg-white">
            <h4 className="fw-bold mb-4 pb-3 border-bottom" style={{ color: '#0f172a' }}>
              Detalles de la Solicitud
            </h4>

            {(() => {
              const detalles =
                typeof solicitud.detalles === 'string'
                  ? JSON.parse(solicitud.detalles || '{}')
                  : solicitud.detalles || {}
              return detalles.fechaInicio && detalles.fechaFin ? (
                <CRow className="g-3 mb-4">
                  <CCol sm={4}>
                    <div className="p-3 rounded bg-light border border-light h-100">
                      <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.7rem' }}>Inicio</small>
                      <span className="fw-bold" style={{ color: '#334155' }}>{detalles.fechaInicio}</span>
                    </div>
                  </CCol>
                  <CCol sm={4}>
                    <div className="p-3 rounded bg-light border border-light h-100">
                      <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.7rem' }}>Fin</small>
                      <span className="fw-bold" style={{ color: '#334155' }}>{detalles.fechaFin}</span>
                    </div>
                  </CCol>
                  <CCol sm={4}>
                    <div className="p-3 rounded bg-light border border-light h-100">
                      <small className="text-muted d-block fw-semibold mb-1 text-uppercase" style={{ fontSize: '0.7rem' }}>Días</small>
                      <span className="fw-bold text-primary">{solicitud.diasSolicitados} días</span>
                    </div>
                  </CCol>
                </CRow>
              ) : null
            })()}

            <div className="mb-4">
              <small className="text-muted d-block fw-semibold mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Descripción</small>
              <div className="p-3 bg-light rounded text-dark" style={{ border: '1px solid #f1f5f9' }}>
                {solicitud.descripcion || 'Sin descripción'}
              </div>
            </div>

            {solicitud.motivo && (
              <div className="mb-4">
                <small className="text-muted d-block fw-semibold mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Motivo</small>
                <div className="p-3 bg-light rounded text-dark" style={{ border: '1px solid #f1f5f9' }}>
                  {solicitud.motivo}
                </div>
              </div>
            )}

            <h5 className="fw-bold mb-3 mt-5 pb-2 border-bottom" style={{ color: '#0f172a' }}>Flujo de Revisión</h5>
            
            <div className="position-relative ps-3 border-start border-2 border-primary ms-2 mb-4">
              <div className="mb-3 position-relative">
                <div className="position-absolute" style={{ left: '-22px', top: '2px', background: 'white', padding: '2px' }}>
                   <CIcon icon={cilCheckCircle} className="text-primary bg-white" size="sm" />
                </div>
                <strong className="d-block small" style={{ color: '#334155' }}>Solicitud Creada</strong>
                <span className="text-muted small">{solicitud.fechaSolicitud || solicitud.fecha}</span>
              </div>
              
              {solicitud.estado !== 'Pendiente' && (
                <div className="mb-3 position-relative">
                  <div className="position-absolute" style={{ left: '-22px', top: '2px', background: 'white', padding: '2px' }}>
                     <CIcon icon={cilCheckCircle} className="text-info bg-white" size="sm" />
                  </div>
                  <strong className="d-block small" style={{ color: '#334155' }}>En Revisión</strong>
                  <span className="text-muted small">Por Gestión Administrativa</span>
                </div>
              )}
              
              {(solicitud.estado === 'Aprobada' || solicitud.estado === 'Rechazada') && (
                <div className="mb-3 position-relative">
                  <div className="position-absolute" style={{ left: '-22px', top: '2px', background: 'white', padding: '2px' }}>
                     <CIcon icon={solicitud.estado === 'Aprobada' ? cilCheckCircle : cilX} className={solicitud.estado === 'Aprobada' ? 'text-success bg-white' : 'text-danger bg-white'} size="sm" />
                  </div>
                  <strong className="d-block small" style={{ color: '#334155' }}>
                    {solicitud.estado}
                  </strong>
                  <span className="text-muted small">{solicitud.fechaRespuesta || 'Procesada por GA'}</span>
                </div>
              )}
            </div>

            {solicitud.comentarios && (
              <div className="mb-4">
                <small className="text-muted d-block fw-semibold mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Comentarios de Resolución</small>
                <div className="p-3 bg-light rounded" style={{ borderLeft: '4px solid #3b82f6' }}>
                  {solicitud.comentarios}
                </div>
              </div>
            )}

            {solicitud.documentos && solicitud.documentos.length > 0 && (
              <div className="mb-3">
                <small className="text-muted d-block fw-semibold mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Documentos Adjuntos</small>
                <div className="d-flex flex-wrap gap-2">
                  {solicitud.documentos.map((doc, i) => (
                    <div key={i} className="exp-file-card d-flex align-items-center bg-light p-2 px-3 rounded border">
                      <CIcon icon={cilDescription} className="me-2 text-primary" size="sm" />
                      <span className="fw-medium small">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  )
}

export default SolicitudesModalDetalle
