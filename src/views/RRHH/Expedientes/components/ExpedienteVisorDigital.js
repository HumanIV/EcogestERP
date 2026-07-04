import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFile, cilUser, cilBriefcase, cilCloudUpload, cilX, cilCheckCircle } from '@coreui/icons'
import useToast from '../../../usuarios/_shared/useToast'
import { expedienteService } from '../services/expedienteService'

const ExpedienteVisorDigital = ({ visible, onClose, expediente, empleado }) => {
  const { showToast, ToastContainer } = useToast()
  const [documentos, setDocumentos] = useState([])

  useEffect(() => {
    if (expediente?.documentos) {
      setDocumentos(expediente.documentos)
    } else {
      setDocumentos([])
    }
  }, [visible, empleado, expediente])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const res = await expedienteService.agregarDocumento(expediente.id, {
        nombre: file.name,
        tipo: 'Documento Adicional',
        tamaño: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: reader.result,
      })
      if (res.success) {
        setDocumentos(
          res.data.documentos || [
            ...documentos,
            {
              id: `doc_${Date.now()}`,
              nombre: file.name,
              tipo: 'Documento Adicional',
              fecha: new Date().toISOString().split('T')[0],
              tamaño: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              dataUrl: reader.result,
            },
          ],
        )
        showToast('Documento cargado al expediente exitosamente', 'success')
      } else {
        showToast(res.error || 'Error al cargar documento', 'danger')
      }
    }
    reader.onerror = () => {
      showToast('Error al leer el archivo', 'danger')
    }
    reader.readAsDataURL(file)
  }

  if (!empleado || !expediente) return null

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="xl" className="eco-modal fade-in">
        <CModalHeader className="bg-eco-soft border-0">
          <CModalTitle className="fw-bold text-montserrat d-flex align-items-center">
            <div className="bg-white rounded-circle p-2 me-3 shadow-sm d-flex">
              <CIcon icon={cilFile} className="text-eco" size="xl" />
            </div>
            <div>
              Expediente Digital: {empleado.nombre} {empleado.apellidos}
              <div className="text-muted small fw-normal mt-1">
                ID Expediente: {expediente.id} | Apertura: {expediente.fechaCreacion || 'N/A'}
              </div>
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4 bg-body-tertiary">
          <CRow className="g-4">
            {/* Columna Izquierda: Información Administrativa y Financiera (Solo Lectura) */}
            <CCol md={4}>
              <CCard className="border-0 shadow-sm mb-4 rounded-4">
                <CCardHeader className="bg-white border-0 pt-4 pb-0">
                  <h6 className="fw-bold text-montserrat text-eco mb-0">
                    <CIcon icon={cilUser} className="me-2" />
                    Datos del Empleado
                  </h6>
                </CCardHeader>
                <CCardBody>
                  <div className="mb-3">
                    <small className="text-muted d-block">Cédula</small>
                    <span className="fw-semibold">{empleado.cedula || 'N/A'}</span>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Departamento</small>
                    <span className="fw-semibold">{empleado.departamento || 'N/A'}</span>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Cargo</small>
                    <CBadge color="info">{empleado.cargo || 'N/A'}</CBadge>
                  </div>
                </CCardBody>
              </CCard>

              <CCard
                className="border-0 shadow-sm rounded-4"
                style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
              >
                <CCardBody className="text-center py-4">
                  <div className="bg-success text-white rounded-circle p-3 d-inline-block mb-3 shadow-sm">
                    <CIcon icon={cilBriefcase} size="xl" />
                  </div>
                  <h6 className="fw-bold text-success mb-1">Estado del Expediente</h6>
                  <div className="h4 fw-bold text-dark mb-0">Completado</div>
                  <small className="text-muted mt-2 d-block">Documentación al día</small>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Columna Derecha: Gestor Documental (PDFs) y Upload Zone */}
            <CCol md={8}>
              <CCard className="border-0 shadow-sm h-100 rounded-4">
                <CCardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                  <h6 className="fw-bold text-montserrat mb-0">
                    <CIcon icon={cilBriefcase} className="me-2 text-eco" />
                    Bóveda de Documentos
                  </h6>
                  <CBadge color={documentos.length > 0 ? 'success' : 'warning'}>
                    {documentos.length} Archivos
                  </CBadge>
                </CCardHeader>
                <CCardBody className="d-flex flex-column">
                  {/* Lista de Documentos */}
                  <div className="flex-grow-1 mb-4 overflow-auto" style={{ maxHeight: '300px' }}>
                    {documentos.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <CIcon icon={cilFile} size="xxl" className="mb-3 text-light" />
                        <h5>Expediente Vacío</h5>
                        <p>No se encontraron documentos escaneados para este empleado.</p>
                      </div>
                    ) : (
                      <CListGroup className="border-0">
                        {documentos.map((doc, idx) => (
                          <CListGroupItem
                            key={doc.id || idx}
                            className="border-0 bg-body-tertiary mb-2 rounded-3 p-3 d-flex justify-content-between align-items-center hover-lift"
                          >
                            <div className="d-flex align-items-center">
                              <div className="bg-white rounded p-2 shadow-sm me-3 text-danger">
                                <CIcon icon={cilFile} size="lg" />
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{doc.nombre}</div>
                                <div className="small text-muted">
                                  {doc.tipo} · {doc.fecha}
                                </div>
                              </div>
                            </div>
                            {doc.dataUrl && (
                              <CButton
                                color="success"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.dataUrl, '_blank')}
                              >
                                Ver
                              </CButton>
                            )}
                          </CListGroupItem>
                        ))}
                      </CListGroup>
                    )}
                  </div>

                  {/* Upload Zone Activa */}
                  <div className="mt-auto border-top pt-4">
                    <div
                      className="rounded-4 p-4 text-center bg-body-tertiary"
                      style={{ border: '2px dashed var(--cui-border-color)' }}
                    >
                      <CIcon icon={cilCloudUpload} size="xl" className="text-muted mb-2" />
                      <h6 className="fw-bold text-dark">Cargar Documento Adicional</h6>
                      <p className="small text-muted mb-3">Arrastra un PDF o haz clic para subir</p>
                      <input
                        type="file"
                        id="upload-doc"
                        className="d-none"
                        accept=".pdf,.jpg,.png"
                        onChange={handleFileUpload}
                      />
                      <CButton
                        color="success"
                        onClick={() => document.getElementById('upload-doc').click()}
                      >
                        Seleccionar Archivo
                      </CButton>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter className="bg-white border-top-0">
          <CButton color="secondary" onClick={onClose}>
            <CIcon icon={cilX} className="me-2" />
            Cerrar Visor
          </CButton>
        </CModalFooter>
      </CModal>
      <ToastContainer />
    </>
  )
}

export default ExpedienteVisorDigital
