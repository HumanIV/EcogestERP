import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CSpinner,
  CProgress,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilFile, cilArrowLeft, cilFolder, cilDescription, cilImage } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import useToast from '../../usuarios/_shared/useToast'
import useEmpleados from './hooks/useEmpleados'
import { expedienteService } from '../Expedientes/services/expedienteService'
import { estructuraOrgService } from '../EstructuraOrg/services/estructuraOrgService'
import ExpedientesVisor from '../Expedientes/components/ExpedientesVisor'
import RrhhBadgeEstado from '../_shared/RrhhBadgeEstado'
import TabInfoPersonal from './components/TabInfoPersonal'

const PerfilEmpleadoContainer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { empleados } = useEmpleados()

  const [activeTab, setActiveTab] = useState(1)
  const [formData, setFormData] = useState(null)
  const [expediente, setExpediente] = useState(null)
  const [plaza, setPlaza] = useState(null)
  const [loadingExp, setLoadingExp] = useState(false)
  const [showVisor, setShowVisor] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (empleados.length > 0) {
        const emp = empleados.find((e) => e.id.toString() === id)
        if (emp) {
          setFormData(emp)
          setLoadingExp(true)
          const [expRes, plazasRes] = await Promise.all([
            expedienteService.obtenerExpedientePorEmpleadoId(emp.id),
            estructuraOrgService.obtenerPlazas(),
          ])
          if (expRes.success) {
            setExpediente(expRes.data)
          } else {
            setExpediente(null)
          }
          if (plazasRes.success) {
            const plazaAsignada = (plazasRes.data || []).find((p) => p.empleadoId === emp.id)
            setPlaza(plazaAsignada || null)
          } else {
            setPlaza(null)
          }
          setLoadingExp(false)
        } else {
          showToast('Empleado no encontrado', 'danger')
        }
      }
    }
    cargar()
  }, [empleados, id, showToast])

  const iconoPorTipo = (nombre) => {
    const n = (nombre || '').toLowerCase()
    if (n.includes('pdf')) return <CIcon icon={cilDescription} className="text-danger" />
    if (n.includes('png') || n.includes('jpg') || n.includes('jpeg'))
      return <CIcon icon={cilImage} className="text-success" />
    return <CIcon icon={cilFile} className="text-secondary" />
  }

  if (!formData) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
      >
        <CSpinner color="success" />
        <span className="ms-3 text-muted">Cargando perfil...</span>
      </div>
    )
  }

  return (
    <>
      <ToastContainer />
      <CRow className="p-4 fade-in">
        <CCol xs={12}>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => navigate('/listEmpleados')}
            className="mb-3"
          >
            <CIcon icon={cilArrowLeft} className="me-2" /> Volver a la lista
          </CButton>

          <CCard className="eco-card mb-3 border-0 shadow-sm">
            <CCardBody className="p-0">
              <CNav variant="pills" role="tablist" className="px-3 pt-3">
                <CNavItem>
                  <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
                    <CIcon icon={cilUser} className="me-2" /> Información
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
                    <CIcon icon={cilFile} className="me-2" /> Expediente
                  </CNavLink>
                </CNavItem>
              </CNav>
              <hr className="mt-2 mb-0" />
            </CCardBody>
          </CCard>

          <CCard className="eco-card border-0 shadow-sm">
            <CCardBody className="p-4">
              <CTabContent>
                <CTabPane visible={activeTab === 1}>
                  <h5 className="fw-bold text-montserrat border-bottom pb-2 mb-4">
                    Datos Personales y Laborales
                  </h5>
                  <TabInfoPersonal empleado={formData} plaza={plaza} />
                </CTabPane>

                <CTabPane visible={activeTab === 2}>
                  <h5 className="fw-bold text-montserrat border-bottom pb-2 mb-4">
                    Expediente Documental
                  </h5>
                  {loadingExp ? (
                    <div className="text-center py-4">
                      <CSpinner color="success" size="sm" />
                      <span className="ms-2 text-muted">Cargando expediente...</span>
                    </div>
                  ) : expediente ? (
                    <>
                      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
                        <RrhhBadgeEstado estado={expediente.estadoExp} />
                        <CBadge color="primary">
                          {expediente.documentos?.length || 0} documentos
                        </CBadge>
                      </div>

                      <CRow className="g-3 mb-4">
                        <CCol xs={6} md={4}>
                          <div className="border rounded p-2 text-center">
                            <small className="text-muted d-block">Creación</small>
                            <span className="fw-semibold small">{expediente.fechaCreacion}</span>
                          </div>
                        </CCol>
                        <CCol xs={6} md={4}>
                          <div className="border rounded p-2 text-center">
                            <small className="text-muted d-block">Actualización</small>
                            <span className="fw-semibold small">
                              {expediente.ultimaActualizacion}
                            </span>
                          </div>
                        </CCol>
                        <CCol xs={12} md={4}>
                          <div className="border rounded p-2">
                            <small className="text-muted d-block mb-1">Completado</small>
                            <CProgress
                              color="success"
                              value={expediente.porcentajeCompletado || 0}
                              style={{ height: '6px' }}
                            />
                            <small className="text-muted">
                              {expediente.porcentajeCompletado || 0}%
                            </small>
                          </div>
                        </CCol>
                      </CRow>

                      {expediente.documentos && expediente.documentos.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold small text-muted mb-2">
                            Documentos del expediente
                          </h6>
                          <CListGroup>
                            {expediente.documentos.map((doc) => (
                              <CListGroupItem
                                key={doc.id}
                                className="d-flex align-items-center gap-2 py-2"
                              >
                                {iconoPorTipo(doc.nombre)}
                                <div className="flex-grow-1">
                                  <div className="small fw-semibold">{doc.nombre}</div>
                                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                    {doc.tipo} · {doc.fecha} · {doc.tamaño}
                                  </div>
                                </div>
                              </CListGroupItem>
                            ))}
                          </CListGroup>
                        </div>
                      )}

                      <CButton color="success" onClick={() => setShowVisor(true)}>
                        <CIcon icon={cilFolder} className="me-2" />
                        Abrir Visor Completo
                      </CButton>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <CIcon icon={cilFolder} size="xl" className="text-muted mb-2" />
                      <p className="text-muted mb-0">Este empleado aún no tiene expediente.</p>
                      <small className="text-muted">
                        Visite la sección de Expedientes para crear uno automáticamente.
                      </small>
                    </div>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {expediente && (
        <ExpedientesVisor
          visible={showVisor}
          onClose={() => setShowVisor(false)}
          expediente={expediente}
          empleado={formData}
        />
      )}
    </>
  )
}

export default PerfilEmpleadoContainer
