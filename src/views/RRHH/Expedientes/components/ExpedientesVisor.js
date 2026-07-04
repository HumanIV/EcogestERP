import React, { useState, useRef, useCallback } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
  CRow,
  CCol,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFile,
  cilDescription,
  cilImage,
  cilCloudDownload,
  cilFolder,
  cilCalendar,
  cilCloudUpload,
  cilCheckAlt,
  cilClock,
  cilHistory
} from '@coreui/icons'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const ExpedientesVisor = ({ visible, onClose, expediente, empleado, onUpload }) => {
  const [activeTab, setActiveTab] = useState('documentos')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const docData = {
          nombre: file.name,
          tipo: file.type.includes('pdf')
            ? 'Documento PDF'
            : file.type.includes('image')
              ? 'Imagen'
              : 'Documento',
          dataUrl: reader.result,
          tamaño:
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`,
        }
        if (onUpload) {
          onUpload(expediente.id, docData)
        }
      }
      reader.readAsDataURL(file)
    },
    [expediente, onUpload],
  )

  const iconoPorTipo = (nombre) => {
    const n = (nombre || '').toLowerCase()
    if (n.includes('pdf')) return <CIcon icon={cilDescription} className="text-danger" size="xl" />
    if (n.includes('png') || n.includes('jpg') || n.includes('jpeg') || n.includes('gif'))
      return <CIcon icon={cilImage} className="text-success" size="xl" />
    if (n.includes('doc') || n.includes('docx'))
      return <CIcon icon={cilFile} className="text-primary" size="xl" />
    return <CIcon icon={cilFile} className="text-secondary" size="xl" />
  }

  const handleDownload = (doc) => {
    if (doc.dataUrl) {
      const a = document.createElement('a')
      a.href = doc.dataUrl
      a.download = doc.nombre
      a.click()
    }
  }

  if (!expediente) return null
  const completado = expediente.porcentajeCompletado || 0

  return (
    <CModal visible={visible} onClose={onClose} size="xl" scrollable alignment="center" className="border-0">
      <CModalHeader closeButton className="border-0 pb-0" style={{ background: '#f8f9fa' }}>
        <CModalTitle className="fw-bolder text-dark d-flex align-items-center">
          <div className="p-2 bg-success bg-opacity-10 rounded me-3 text-success">
            <CIcon icon={cilFolder} size="lg" />
          </div>
          Expediente Digital
        </CModalTitle>
      </CModalHeader>
      
      <CModalBody className="p-0">
        <CRow className="g-0 h-100">
          {/* SIDEBAR: INFO & STATS */}
          <CCol md={4} lg={3} className="exp-visor-sidebar">
            <div className="text-center mb-4">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #047857)',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(16,185,129,0.3)'
                }}
              >
                {empleado?.nombre?.charAt(0) || '?'}
              </div>
              <h5 className="fw-bolder text-dark mb-1">
                {empleado?.nombre || 'Sin empleado'} {empleado?.apellidos || ''}
              </h5>
              <div className="text-muted small mb-3">{empleado?.cargo || 'Sin cargo'}</div>
              <RrhhBadgeEstado estado={expediente.estadoExp} />
            </div>

            <hr className="my-4 opacity-10" />

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="small fw-semibold text-muted">Progreso</span>
                <span className="small fw-bold text-success">{completado}%</span>
              </div>
              <div className="exp-progress-wrapper" style={{ height: '6px' }}>
                <div 
                  className="exp-progress-bar bg-success" 
                  style={{ width: `${completado}%` }} 
                />
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-light rounded text-muted">
                  <CIcon icon={cilCalendar} />
                </div>
                <div>
                  <div className="small text-muted fw-semibold">Creado</div>
                  <div className="small fw-bold">{expediente.fechaCreacion}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-light rounded text-muted">
                  <CIcon icon={cilCheckAlt} />
                </div>
                <div>
                  <div className="small text-muted fw-semibold">Actualizado</div>
                  <div className="small fw-bold">{expediente.ultimaActualizacion || 'N/A'}</div>
                </div>
              </div>
            </div>
          </CCol>

          {/* MAIN CONTENT: TABS & FILES */}
          <CCol md={8} lg={9} className="p-4 bg-white">
            <CNav variant="pills" className="eco-nav-pills mb-4">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'documentos'}
                  onClick={() => setActiveTab('documentos')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilFolder} className="me-2" /> Documentos
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'historial'}
                  onClick={() => setActiveTab('historial')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilHistory} className="me-2" /> Historial de Cambios
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              <CTabPane visible={activeTab === 'documentos'}>
                {onUpload && (
                  <div className="exp-drag-zone mb-4" onClick={() => fileInputRef.current?.click()}>
                    <CIcon icon={cilCloudUpload} size="3xl" className="text-success mb-3 opacity-75" />
                    <h5 className="fw-bolder text-dark mb-1">Cargar nuevo documento</h5>
                    <p className="text-muted small mb-0">Arrastra archivos aquí o haz clic para explorar</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {!expediente.documentos || expediente.documentos.length === 0 ? (
                  <div className="text-center py-5">
                    <CIcon icon={cilFolder} size="3xl" className="text-muted opacity-25 mb-3" />
                    <h6 className="fw-bold text-muted">No hay documentos registrados</h6>
                    <p className="text-muted small">El expediente está vacío.</p>
                  </div>
                ) : (
                  <CRow className="g-3">
                    {expediente.documentos.map((doc) => (
                      <CCol xs={12} sm={6} md={4} key={doc.id}>
                        <div 
                          className="exp-file-card cursor-pointer" 
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <div className="flex-shrink-0">
                              {iconoPorTipo(doc.nombre)}
                            </div>
                            <div className="min-w-0 flex-grow-1">
                              <div className="fw-bold text-dark text-truncate small mb-1">
                                {doc.nombre}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {doc.tipo} • {doc.tamaño}
                              </div>
                            </div>
                          </div>
                          {selectedDoc?.id === doc.id && (
                            <div className="mt-3 pt-3 border-top d-flex gap-2">
                              <CButton 
                                size="sm" 
                                color="light" 
                                className="w-100 flex-grow-1 text-muted"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(doc)
                                }}
                              >
                                <CIcon icon={cilCloudDownload} className="me-1" /> Descargar
                              </CButton>
                              <CButton 
                                size="sm" 
                                color="light" 
                                className="text-muted"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedDoc(null)
                                }}
                              >
                                Cerrar
                              </CButton>
                            </div>
                          )}
                          
                          {/* File Preview if selected */}
                          {selectedDoc?.id === doc.id && doc.dataUrl && (
                            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                              {doc.nombre.toLowerCase().includes('pdf') ? (
                                <iframe
                                  src={doc.dataUrl}
                                  title={doc.nombre}
                                  className="w-100 border rounded"
                                  style={{ height: '300px' }}
                                />
                              ) : doc.nombre.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                                <img
                                  src={doc.dataUrl}
                                  alt={doc.nombre}
                                  className="img-fluid rounded border w-100"
                                />
                              ) : null}
                            </div>
                          )}
                        </div>
                      </CCol>
                    ))}
                  </CRow>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'historial'}>
                {!expediente.historial || expediente.historial.length === 0 ? (
                  <CAlert color="info" className="border-0 bg-info bg-opacity-10 text-info">
                    No hay historial registrado.
                  </CAlert>
                ) : (
                  <div className="position-relative ms-3 border-start border-2 border-light py-2">
                    {expediente.historial.map((hist, idx) => (
                      <div key={idx} className="position-relative mb-4 ps-4">
                        <div 
                          className="position-absolute rounded-circle bg-success"
                          style={{ width: '12px', height: '12px', left: '-7px', top: '4px' }}
                        />
                        <div className="fw-bold text-dark small">{hist.fecha}</div>
                        <div className="text-dark my-1">{hist.evento}</div>
                        <div className="text-muted small">
                          <CIcon icon={cilClock} size="sm" className="me-1" />
                          Usuario: {hist.usuario || 'Sistema'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CTabPane>
            </CTabContent>
          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  )
}

export default ExpedientesVisor
