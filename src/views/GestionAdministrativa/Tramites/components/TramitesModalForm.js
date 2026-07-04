import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CButton,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTask, cilDescription, cilWarning, cilSave, cilPlus, cilFile } from '@coreui/icons'
import { TIPOS_TRAMITE, SUBTIPOS_PERMISO, SUBTIPOS_LICENCIA } from '../constants/tramitesConstants'

const TramitesModalForm = ({
  visible,
  onClose,
  onGuardar,
  formData,
  onInputChange,
  error,
  isEdit,
}) => {
  const subtipos = formData.tipo === TIPOS_TRAMITE.LICENCIA ? SUBTIPOS_LICENCIA : SUBTIPOS_PERMISO

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="pb-2">
        <CModalTitle className="fw-bold text-eco">
          <CIcon
            icon={formData.tipo === TIPOS_TRAMITE.LICENCIA ? cilDescription : cilTask}
            className="me-2"
          />
          {isEdit ? 'Editar Trámite' : 'Nuevo Trámite'}
          {formData.tipo && (
            <CBadge
              color={formData.tipo === 'PERMISO' ? 'primary' : 'info'}
              className="ms-2"
              style={{ fontSize: '0.7rem' }}
            >
              {formData.tipo === 'PERMISO' ? 'Permiso' : 'Licencia'}
            </CBadge>
          )}
        </CModalTitle>
      </CModalHeader>

      <CForm
        onSubmit={(e) => {
          e.preventDefault()
          onGuardar()
        }}
      >
        <CModalBody className="px-4">
          {error && (
            <CAlert color="danger" className="d-flex align-items-center mb-3 py-2">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
              <small>{error}</small>
            </CAlert>
          )}

          {/* Tipo de Trámite */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">
                <CIcon icon={cilTask} className="me-1" size="sm" />
                Tipo de Trámite *
              </CFormLabel>
              <CFormSelect name="tipo" value={formData.tipo} onChange={onInputChange} required>
                <option value={TIPOS_TRAMITE.PERMISO}>Permiso Ambiental</option>
                <option value={TIPOS_TRAMITE.LICENCIA}>Licencia Ambiental</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">Subtipo *</CFormLabel>
              <CFormSelect
                name="subtipo"
                value={formData.subtipo}
                onChange={onInputChange}
                required
              >
                <option value="">Seleccionar subtipo</option>
                {subtipos.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Solicitante */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">Solicitante *</CFormLabel>
              <CFormInput
                name="solicitante"
                value={formData.solicitante}
                onChange={onInputChange}
                placeholder="Nombre de la empresa o persona"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">Cédula / RIF *</CFormLabel>
              <CFormInput
                name="cedulaRif"
                value={formData.cedulaRif}
                onChange={onInputChange}
                placeholder="V-12345678 o J-12345678-9"
                required
              />
            </CCol>
          </CRow>

          {/* Contacto */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">Teléfono</CFormLabel>
              <CFormInput
                name="telefono"
                value={formData.telefono}
                onChange={onInputChange}
                placeholder="+58 412-555-0000"
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">Email</CFormLabel>
              <CFormInput
                name="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder="correo@ejemplo.com"
                type="email"
              />
            </CCol>
          </CRow>

          {/* Ubicación */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">Dirección</CFormLabel>
              <CFormInput
                name="direccion"
                value={formData.direccion}
                onChange={onInputChange}
                placeholder="Dirección del proyecto"
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel className="small fw-semibold mb-1">Municipio</CFormLabel>
              <CFormInput
                name="municipio"
                value={formData.municipio}
                onChange={onInputChange}
                placeholder="Municipio"
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel className="small fw-semibold mb-1">Estado</CFormLabel>
              <CFormInput
                name="estado_geografico"
                value={formData.estado_geografico}
                onChange={onInputChange}
                placeholder="Estado"
              />
            </CCol>
          </CRow>

          {/* Descripción */}
          <div className="mb-3">
            <CFormLabel className="small fw-semibold mb-1">Descripción del Trámite *</CFormLabel>
            <textarea
              className="form-control"
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={onInputChange}
              placeholder="Describa el propósito del trámite..."
              required
            />
          </div>

          {/* Documentos (simulado) */}
          <div className="mb-3">
            <CFormLabel className="small fw-semibold mb-1">
              <CIcon icon={cilFile} className="me-1" size="sm" />
              Documentos Adjuntos
            </CFormLabel>
            <CFormInput
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => {
                const files = Array.from(e.target.files).map((f) => f.name)
                onInputChange({ target: { name: 'documentos', value: files } })
              }}
              className="form-control-sm"
            />
            {formData.documentos && formData.documentos.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mt-2">
                {formData.documentos.map((doc, idx) => (
                  <CBadge
                    key={idx}
                    color="light"
                    className="d-flex align-items-center gap-1 px-2 py-1"
                  >
                    <CIcon icon={cilFile} size="sm" className="text-primary" />
                    {doc}
                  </CBadge>
                ))}
              </div>
            )}
          </div>
        </CModalBody>

        <CModalFooter className="border-top-0 pt-0">
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton
            color="success"
            type="submit"
            className="fw-bold"
            disabled={!formData.solicitante || !formData.cedulaRif || !formData.subtipo}
          >
            <CIcon icon={isEdit ? cilSave : cilPlus} className="me-1" />
            {isEdit ? 'Actualizar' : 'Crear Trámite'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default TramitesModalForm
