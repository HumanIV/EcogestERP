import React, { useState, useEffect, useCallback } from 'react'
import {
  CContainer,
  CButton,
  CProgress,
  CBadge,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUserPlus,
  cilArrowLeft,
  cilArrowRight,
  cilCheckCircle,
  cilSave,
  cilWarning,
  cilUser,
  cilBriefcase,
  cilFile,
} from '@coreui/icons'

import useToast from '../../usuarios/_shared/useToast'
import RrhhPageHeader from '../_shared/RrhhPageHeader'

import StepDatosPersonales from './components/WizardSteps/StepDatosPersonales'
import StepSeleccionPlaza from './components/WizardSteps/StepSeleccionPlaza'
import StepDocumentacion from './components/WizardSteps/StepDocumentacion'
import StepConfirmacion from './components/WizardSteps/StepConfirmacion'

import { solicitudService } from '../Solicitudes/services/solicitudService'
import { estructuraOrgService } from '../EstructuraOrg/services/estructuraOrgService'
import { resolverDepto } from '../EstructuraOrg/constants/estructuraConstants'

const STEPS = [
  { label: 'Datos Personales', icon: cilUser },
  { label: 'Plaza y Contrato', icon: cilBriefcase },
  { label: 'Documentación', icon: cilFile },
  { label: 'Confirmación', icon: cilCheckCircle },
]

const NuevoEmpleadoWizardContainer = () => {
  const { showToast, ToastContainer } = useToast()

  const [activeTab, setActiveTab] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [visibleModal, setVisibleModal] = useState(false)
  const [plazasVacantes, setPlazasVacantes] = useState([])
  const [loadingPlazas, setLoadingPlazas] = useState(true)

  const cargarPlazasVacantes = useCallback(async () => {
    setLoadingPlazas(true)
    const res = await estructuraOrgService.obtenerPlazasVacantes()
    if (res.success) setPlazasVacantes(res.data || [])
    setLoadingPlazas(false)
  }, [])

  useEffect(() => {
    cargarPlazasVacantes()
  }, [cargarPlazasVacantes])

  const [estadoWizard, setEstadoWizard] = useState({
    datosPersonales: {
      nombre: '',
      segundoNombre: '',
      apellidos: '',
      segundoApellido: '',
      cedula: '',
      fechaNacimiento: '',
      genero: '',
      email: '',
      telefono: '',
      estado: '',
      municipio: '',
      direccion: '',
    },
    datosLaborales: {
      plazaId: '',
      tipoContrato: '',
    },
    datosDocumentales: [],
  })

  const updateWizardState = (domain, field, value) => {
    setEstadoWizard((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [field]: value,
      },
    }))
  }

  const handlePlazaSelect = (plazaId, tipoContrato) => {
    if (tipoContrato !== undefined) {
      setEstadoWizard((prev) => ({
        ...prev,
        datosLaborales: {
          ...prev.datosLaborales,
          tipoContrato,
        },
      }))
    } else {
      setEstadoWizard((prev) => ({
        ...prev,
        datosLaborales: {
          ...prev.datosLaborales,
          plazaId,
        },
      }))
    }
  }

  const updateDocumentos = (newDocs) => {
    setEstadoWizard((prev) => ({
      ...prev,
      datosDocumentales: newDocs,
    }))
  }

  const handleNext = () => {
    if (!validateStep(activeTab)) return
    if (activeTab < STEPS.length - 1) setActiveTab((prev) => prev + 1)
  }

  const validateStep = (step) => {
    const { datosPersonales, datosLaborales } = estadoWizard
    if (step === 0) {
      if (
        !datosPersonales.nombre?.trim() ||
        !datosPersonales.segundoNombre?.trim() ||
        !datosPersonales.apellidos?.trim() ||
        !datosPersonales.segundoApellido?.trim() ||
        !datosPersonales.cedula?.trim() ||
        !datosPersonales.fechaNacimiento?.trim() ||
        !datosPersonales.genero?.trim() ||
        !datosPersonales.email?.trim() ||
        !datosPersonales.telefono?.trim() ||
        !datosPersonales.estado ||
        !datosPersonales.municipio ||
        !datosPersonales.direccion?.trim()
      ) {
        showToast('Complete todos los campos personales', 'warning')
        return false
      }
    }
    if (step === 1) {
      if (plazasVacantes.length > 0 && !datosLaborales.plazaId) {
        showToast('Seleccione una plaza vacante', 'warning')
        return false
      }
      if (!datosLaborales.tipoContrato) {
        showToast('Seleccione el tipo de contrato', 'warning')
        return false
      }
    }
    return true
  }

  const handlePrev = () => {
    if (activeTab > 0) setActiveTab((prev) => prev - 1)
  }

  const confirmarRegistro = async () => {
    setIsSubmitting(true)

    try {
      const { nombre, segundoNombre, apellidos, segundoApellido } =
        estadoWizard.datosPersonales || {}
      const empleadoFullName = [nombre, segundoNombre, apellidos, segundoApellido]
        .filter(Boolean)
        .join(' ')

      const plaza = plazasVacantes.find((p) => p.id === estadoWizard.datosLaborales.plazaId)
      const deptoNombre = plaza ? resolverDepto(plaza.departamentoCodigo).nombre : ''

      const solicitudPayload = {
        tipo: 'Solicitud de Contratación',
        empleadoNombre: empleadoFullName,
        usuario: empleadoFullName,
        fecha: new Date().toISOString().split('T')[0],
        fechaSolicitud: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
        prioridad: 'Alta',
        departamento: deptoNombre,
        descripcion: `Contratación de ${empleadoFullName} para el cargo de ${plaza?.cargo || 'N/A'}`,
        motivo: `Solicitud de contratación para ${plaza?.cargo || 'N/A'} en ${deptoNombre}`,
        detalles: JSON.stringify({
          datosPersonales: estadoWizard.datosPersonales,
          datosLaborales: estadoWizard.datosLaborales,
          datosDocumentales: estadoWizard.datosDocumentales,
          plaza: plaza
            ? {
                id: plaza.id,
                codigo: plaza.codigo,
                cargo: plaza.cargo,
                departamentoCodigo: plaza.departamentoCodigo,
                salario: plaza.salario,
              }
            : null,
        }),
        documentos: (estadoWizard.datosDocumentales || [])
          .map((d) => d.nombreArchivo)
          .filter(Boolean),
      }

      const res = await solicitudService.crearSolicitud(solicitudPayload)
      if (!res.success) throw new Error(res.error)

      showToast('Solicitud de contratación enviada a Bandeja Administrativa', 'success')
      setVisibleModal(false)

      setActiveTab(0)
      setEstadoWizard({
        datosPersonales: {
          nombre: '',
          segundoNombre: '',
          apellidos: '',
          segundoApellido: '',
          cedula: '',
          fechaNacimiento: '',
          genero: '',
          email: '',
          telefono: '',
          estado: '',
          municipio: '',
          direccion: '',
        },
        datosLaborales: { plazaId: '', tipoContrato: '' },
        datosDocumentales: [],
      })
    } catch (error) {
      showToast(error.message || 'Error al enviar la solicitud.', 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = Math.round(((activeTab + 1) / STEPS.length) * 100)

  return (
    <>
      <CContainer fluid className="px-0 px-md-4">
        <RrhhPageHeader
          icon={cilUserPlus}
          title="Nuevo Empleado"
          subtitle="Proceso de contratación y apertura de expediente"
        />

        <div className="eco-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex gap-2">
              {STEPS.map((step, i) => (
                <div key={i} className="d-flex align-items-center gap-1">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      i < activeTab
                        ? 'bg-success text-white'
                        : i === activeTab
                          ? 'bg-eco-soft text-eco'
                          : 'bg-secondary bg-opacity-10 text-muted'
                    }`}
                    style={{ width: '32px', height: '32px' }}
                  >
                    {i < activeTab ? (
                      <CIcon icon={cilCheckCircle} size="sm" />
                    ) : (
                      <CIcon icon={step.icon} size="sm" />
                    )}
                  </div>
                  <span
                    className={`small fw-semibold d-none d-md-inline ${
                      i === activeTab ? 'text-eco' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className="d-none d-md-block mx-1"
                      style={{
                        width: '40px',
                        height: '2px',
                        background:
                          i < activeTab ? 'var(--cui-success)' : 'var(--cui-border-color)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <CBadge color="success" className="px-2 py-1">
              {progress}%
            </CBadge>
          </div>

          <CProgress className="mb-4" color="success" value={progress} style={{ height: '4px' }} />

          <div className="p-4 bg-body border rounded-3 mb-4 shadow-sm">
            {activeTab === 0 && (
              <StepDatosPersonales
                data={estadoWizard.datosPersonales}
                onChange={updateWizardState}
              />
            )}
            {activeTab === 1 && (
              <StepSeleccionPlaza
                plazasVacantes={plazasVacantes}
                loading={loadingPlazas}
                selected={estadoWizard.datosLaborales}
                onSelect={handlePlazaSelect}
              />
            )}
            {activeTab === 2 && (
              <StepDocumentacion
                data={estadoWizard.datosDocumentales}
                onChange={updateDocumentos}
              />
            )}
            {activeTab === 3 && <StepConfirmacion estadoWizard={estadoWizard} />}
          </div>

          <div className="d-flex justify-content-between mt-4 pt-3 border-top">
            <CButton color="outline-secondary" onClick={handlePrev} disabled={activeTab === 0}>
              <CIcon icon={cilArrowLeft} className="me-1" /> Anterior
            </CButton>

            {activeTab < STEPS.length - 1 ? (
              <CButton color="success" onClick={handleNext}>
                Siguiente <CIcon icon={cilArrowRight} className="ms-1" />
              </CButton>
            ) : (
              <CButton
                color="success"
                onClick={() => setVisibleModal(true)}
                disabled={isSubmitting}
              >
                <CIcon icon={cilSave} className="me-1" /> Finalizar Contratación
              </CButton>
            )}
          </div>
        </div>
      </CContainer>

      <CModal visible={visibleModal} onClose={() => setVisibleModal(false)} className="eco-modal">
        <CModalHeader closeButton>
          <CModalTitle className="fw-bold text-eco">Confirmar Contratación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color="info">
            <CIcon icon={cilWarning} className="me-2" />
            Esta acción enviará una <strong>Solicitud de Contratación</strong> a la Bandeja
            Administrativa para aprobación. El empleado será creado una vez aprobada la solicitud.
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleModal(false)}>
            Cancelar
          </CButton>
          <CButton color="success" onClick={confirmarRegistro} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Confirmar Todo'}
          </CButton>
        </CModalFooter>
      </CModal>

      <ToastContainer />
    </>
  )
}

export default NuevoEmpleadoWizardContainer
