import React from 'react'
import { CRow, CCol, CFormInput, CFormLabel } from '@coreui/react'

const StepContacto = ({ formData, errors, onChange }) => {
  return (
    <CRow className="g-3">
      <CCol md={6}>
        <CFormLabel className="fw-semibold small">Correo Electrónico *</CFormLabel>
        <CFormInput
          type="email"
          value={formData.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          invalid={!!errors.email}
          className="input-minec"
          placeholder="correo@ejemplo.com"
        />
        {errors.email && <small className="text-danger">{errors.email}</small>}
      </CCol>
      <CCol md={6}>
        <CFormLabel className="fw-semibold small">Teléfono *</CFormLabel>
        <CFormInput
          value={formData.telefono || ''}
          onChange={(e) => onChange('telefono', e.target.value)}
          invalid={!!errors.telefono}
          className="input-minec"
          placeholder="Ej: 0412-1234567"
          maxLength={15}
        />
        {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
        <small className="text-muted" style={{ fontSize: '0.65rem' }}>
          Formato: 0412-1234567 (11 dígitos)
        </small>
      </CCol>

      <CCol md={12}>
        <CFormLabel className="fw-semibold small">Dirección</CFormLabel>
        <CFormInput
          value={formData.direccion || ''}
          onChange={(e) => onChange('direccion', e.target.value)}
          className="input-minec"
          placeholder="Dirección completa"
          maxLength={200}
        />
        <small className="text-muted" style={{ fontSize: '0.65rem' }}>
          {(formData.direccion || '').length}/200 caracteres
        </small>
      </CCol>
    </CRow>
  )
}

export default StepContacto
