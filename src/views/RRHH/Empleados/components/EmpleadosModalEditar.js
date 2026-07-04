import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil } from '@coreui/icons'

const EmpleadosModalEditar = ({
  visible,
  onClose,
  empleado,
  onChange,
  onSave,
  departamentos = [],
  estados = [],
  tiposContrato = [],
}) => {
  if (!empleado) return null

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton>
        <CModalTitle className="fw-bold text-eco d-flex align-items-center">
          <CIcon icon={cilPencil} className="me-2" />
          Editar Empleado
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="px-4">
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Nombre Completo *</CFormLabel>
            <CFormInput
              value={empleado.nombre || ''}
              onChange={(e) => onChange('nombre', e.target.value)}
              className="input-minec"
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Cédula</CFormLabel>
            <CFormInput
              value={empleado.cedula || ''}
              onChange={(e) => onChange('cedula', e.target.value)}
              className="input-minec"
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Cargo *</CFormLabel>
            <CFormInput
              value={empleado.cargo || ''}
              onChange={(e) => onChange('cargo', e.target.value)}
              className="input-minec"
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Departamento *</CFormLabel>
            <CFormSelect
              value={empleado.departamento || ''}
              onChange={(e) => onChange('departamento', e.target.value)}
              className="input-minec"
            >
              <option value="">Seleccionar</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Email</CFormLabel>
            <CFormInput
              type="email"
              value={empleado.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className="input-minec"
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Teléfono</CFormLabel>
            <CFormInput
              value={empleado.telefono || ''}
              onChange={(e) => onChange('telefono', e.target.value)}
              className="input-minec"
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Estado</CFormLabel>
            <CFormSelect
              value={empleado.estado || ''}
              onChange={(e) => onChange('estado', e.target.value)}
              className="input-minec"
            >
              {estados.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.value}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Tipo de Contrato</CFormLabel>
            <CFormSelect
              value={empleado.tipoContrato || ''}
              onChange={(e) => onChange('tipoContrato', e.target.value)}
              className="input-minec"
            >
              <option value="">Seleccionar</option>
              {tiposContrato.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Ubicación</CFormLabel>
            <CFormInput
              value={empleado.ubicacion || ''}
              onChange={(e) => onChange('ubicacion', e.target.value)}
              className="input-minec"
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Fecha de Ingreso</CFormLabel>
            <CFormInput
              type="date"
              value={empleado.fechaIngreso || ''}
              onChange={(e) => onChange('fechaIngreso', e.target.value)}
              className="input-minec"
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="fw-semibold small">Rendimiento (%)</CFormLabel>
            <CFormInput
              type="number"
              min="0"
              max="100"
              value={empleado.rendimiento || 0}
              onChange={(e) => onChange('rendimiento', parseInt(e.target.value) || 0)}
              className="input-minec"
            />
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter className="border-top-0 pt-0">
        <CButton color="secondary" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="success" onClick={onSave}>
          Guardar Cambios
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default EmpleadosModalEditar
