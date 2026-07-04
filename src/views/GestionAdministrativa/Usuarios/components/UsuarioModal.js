import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilX, cilUser, cilShieldAlt, cilEnvelopeClosed, cilLockLocked, cilCreditCard } from '@coreui/icons'

const FORM_INICIAL = {
  nombre: '',
  email: '',
  password: '',
  rol: 'inspector',
  cedula: '',
  telefono: '',
  activo: true,
}

const UsuarioModal = ({ visible, onClose, usuario, onGuardar }) => {
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [error, setError] = useState(null)
  const isEditing = !!usuario

  useEffect(() => {
    if (visible) {
      if (usuario) {
        setFormData({ ...usuario, password: '' })
      } else {
        setFormData(FORM_INICIAL)
      }
      setError(null)
    }
  }, [visible, usuario])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombre || !formData.email || !formData.rol) {
      setError('Nombre, Correo y Rol son obligatorios.')
      return
    }
    if (!isEditing && !formData.password) {
      setError('La contraseña es obligatoria para nuevos usuarios.')
      return
    }
    onGuardar(formData)
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" alignment="center" size="lg">
      <CModalHeader className="bg-white border-bottom px-4 py-3">
        <CModalTitle className="h5 fw-bold d-flex align-items-center gap-3 mb-0">
          <div className="bg-success bg-opacity-10 p-2 rounded-circle d-flex align-items-center justify-content-center">
            <CIcon icon={cilUser} className="text-success" size="lg" />
          </div>
          {isEditing ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario'}
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody className="p-4 bg-light bg-opacity-50">
          {error && (
            <CAlert color="danger" className="d-flex align-items-center mb-4 rounded-3 border-0 shadow-sm">
              <CIcon icon={cilX} className="flex-shrink-0 me-2" size="lg"/>
              <div>{error}</div>
            </CAlert>
          )}

          <CRow className="g-4">
            <CCol md={6}>
              <CFormLabel className="fw-semibold text-dark">Nombre Completo <span className="text-danger">*</span></CFormLabel>
              <CInputGroup className="shadow-sm rounded-3 overflow-hidden">
                <CInputGroupText className="bg-white border-end-0">
                  <CIcon icon={cilUser} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  className="border-start-0 bg-white ps-0 focus-ring focus-ring-success"
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel className="fw-semibold text-dark">Correo Electrónico <span className="text-danger">*</span></CFormLabel>
              <CInputGroup className="shadow-sm rounded-3 overflow-hidden">
                <CInputGroupText className="bg-white border-end-0">
                  <CIcon icon={cilEnvelopeClosed} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  disabled={isEditing}
                  className="border-start-0 bg-white ps-0 focus-ring focus-ring-success"
                />
              </CInputGroup>
            </CCol>

            <CCol md={6}>
              <CFormLabel className="fw-semibold text-dark">Rol de Sistema <span className="text-danger">*</span></CFormLabel>
              <CInputGroup className="shadow-sm rounded-3 overflow-hidden">
                <CInputGroupText className="bg-white border-end-0">
                  <CIcon icon={cilShieldAlt} className="text-muted" />
                </CInputGroupText>
                <CFormSelect 
                  name="rol" 
                  value={formData.rol} 
                  onChange={handleChange}
                  disabled={formData.rol === 'ciudadano'}
                  className="border-start-0 bg-white ps-0 focus-ring focus-ring-success cursor-pointer"
                >
                  {formData.rol === 'ciudadano' ? (
                    <option value="ciudadano">Ciudadano (Portal)</option>
                  ) : (
                    <>
                      <option value="inspector">Inspector de Campo</option>
                      <option value="admin">Administrador (TI)</option>
                      <option value="rrhh">Recursos Humanos</option>
                      <option value="director">Director</option>
                    </>
                  )}
                </CFormSelect>
              </CInputGroup>
            </CCol>

            <CCol md={6}>
              <CFormLabel className="fw-semibold text-dark">Cédula de Identidad</CFormLabel>
              <CInputGroup className="shadow-sm rounded-3 overflow-hidden">
                <CInputGroupText className="bg-white border-end-0">
                  <CIcon icon={cilCreditCard} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  name="cedula"
                  value={formData.cedula || ''}
                  onChange={handleChange}
                  placeholder="V-12345678"
                  className="border-start-0 bg-white ps-0 focus-ring focus-ring-success"
                />
              </CInputGroup>
            </CCol>

            <CCol md={12}>
              <CFormLabel className="fw-semibold text-dark">{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso'} {!isEditing && <span className="text-danger">*</span>}</CFormLabel>
              <CInputGroup className="shadow-sm rounded-3 overflow-hidden">
                <CInputGroupText className="bg-white border-end-0">
                  <CIcon icon={cilLockLocked} className="text-muted" />
                </CInputGroupText>
                <CFormInput
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isEditing ? 'Dejar en blanco para mantener la actual' : 'Asignar contraseña inicial segura'}
                  className="border-start-0 bg-white ps-0 focus-ring focus-ring-success"
                />
              </CInputGroup>
              <small className="text-muted mt-2 d-block">
                La contraseña debe ser comunicada al usuario de forma segura.
              </small>
            </CCol>

          </CRow>
        </CModalBody>
        <CModalFooter className="border-top bg-white px-4 py-3">
          <CButton color="secondary" variant="ghost" onClick={onClose} className="px-4 fw-bold rounded-pill border-0 hover-bg-light">
            <CIcon icon={cilX} className="me-2" />
            Cancelar
          </CButton>
          <CButton type="submit" color="success" className="px-4 fw-bold shadow-sm rounded-pill text-white" style={{ background: 'linear-gradient(135deg, #198754 0%, #157347 100%)' }}>
            <CIcon icon={cilSave} className="me-2" />
            {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default UsuarioModal
