import React from 'react'
import { CRow, CCol, CCard, CCardBody, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilEnvelopeOpen,
  cilPhone,
  cilLocationPin,
  cilBriefcase,
  cilCalendar,
  cilBuilding,
  cilBookmark,
} from '@coreui/icons'

const TabInfoPersonal = ({ empleado, plaza }) => {
  if (!empleado) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No hay información disponible</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Datos Personales */}
      <h6 className="fw-bold text-eco mb-3 d-flex align-items-center">
        <CIcon icon={cilUser} className="me-2" />
        Información Personal
      </h6>
      <CRow className="g-3 mb-4">
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Nombre Completo</small>
            <div className="fw-semibold">
              {empleado.nombre} {empleado.apellidos}
            </div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Cédula</small>
            <div className="fw-semibold">{empleado.cedula || 'No registrada'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">
              <CIcon icon={cilEnvelopeOpen} className="me-1" size="sm" />
              Correo Electrónico
            </small>
            <div className="fw-semibold">{empleado.email || 'No registrado'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">
              <CIcon icon={cilPhone} className="me-1" size="sm" />
              Teléfono
            </small>
            <div className="fw-semibold">{empleado.telefono || 'No registrado'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Edad</small>
            <div className="fw-semibold">
              {empleado.edad != null ? `${empleado.edad} años` : 'No registrada'}
            </div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Género</small>
            <div className="fw-semibold">{empleado.genero || 'No registrado'}</div>
          </div>
        </CCol>
        <CCol md={12}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">
              <CIcon icon={cilLocationPin} className="me-1" size="sm" />
              Dirección / Ubicación
            </small>
            <div className="fw-semibold">
              {empleado.ubicacion || empleado.direccion || 'No registrada'}
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Datos Laborales */}
      <h6 className="fw-bold text-eco mb-3 d-flex align-items-center">
        <CIcon icon={cilBriefcase} className="me-2" />
        Información Laboral
      </h6>
      <CRow className="g-3">
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Cargo</small>
            <div className="fw-semibold">{empleado.cargo || 'No asignado'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">
              <CIcon icon={cilBuilding} className="me-1" size="sm" />
              Departamento
            </small>
            <div className="fw-semibold">{empleado.departamento || 'No asignado'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Tipo de Contrato</small>
            <div className="fw-semibold">{empleado.tipoContrato || 'No definido'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">
              <CIcon icon={cilCalendar} className="me-1" size="sm" />
              Fecha de Ingreso
            </small>
            <div className="fw-semibold">{empleado.fechaIngreso || 'No registrada'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Estado</small>
            <div className="fw-semibold">{empleado.estado || 'No definido'}</div>
          </div>
        </CCol>
        <CCol md={6}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">Supervisor</small>
            <div className="fw-semibold">
              {empleado.supervisorNombre || empleado.supervisorId || 'No asignado'}
            </div>
          </div>
        </CCol>
        {empleado.cuadrillaNombre && (
          <CCol md={12}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Cuadrilla Asignada</small>
              <div className="fw-semibold">{empleado.cuadrillaNombre}</div>
            </div>
          </CCol>
        )}
        <CCol md={12}>
          <div className="border rounded p-3 eco-surface">
            <small className="text-muted d-block mb-1">
              <CIcon icon={cilBookmark} className="me-1" size="sm" />
              Plaza Asignada
            </small>
            {plaza ? (
              <CBadge color="success" className="px-3 py-2">
                {plaza.codigo} · {plaza.cargo}
              </CBadge>
            ) : (
              <span className="text-muted">Sin plaza asignada</span>
            )}
          </div>
        </CCol>
      </CRow>

      {/* Habilidades */}
      {empleado.habilidades && empleado.habilidades.length > 0 && (
        <>
          <h6 className="fw-bold text-eco mb-3 mt-4">Habilidades</h6>
          <div className="d-flex flex-wrap gap-2">
            {empleado.habilidades.map((hab, idx) => (
              <span key={idx} className="badge bg-eco-soft text-eco px-3 py-2">
                {hab}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default TabInfoPersonal
