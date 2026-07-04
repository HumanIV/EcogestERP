import React from 'react';
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
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilClipboard, cilPlus, cilWarning } from '@coreui/icons';

const SolicitudActivosModalCrear = ({
  visible,
  onClose,
  onSubmit,
  formData,
  error,
  cuadrillas,
  activos,
  onCuadrillaChange,
  onActivoChange,
  onInputChange
}) => {
  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilClipboard} className="me-2" />
          Nueva Solicitud de Activo
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={onSubmit}>
        <CModalBody>
          {error && Object.keys(error).length > 0 && (
            <CAlert color="danger" className="mb-3">
              <CIcon icon={cilWarning} className="me-2" />
              Por favor complete todos los campos obligatorios
            </CAlert>
          )}

          <CRow className="g-3">
            <CCol md={12}>
              <CFormLabel>Cuadrilla Destino *</CFormLabel>
              <CFormSelect
                value={formData.cuadrillaId}
                onChange={onCuadrillaChange}
                invalid={!!error?.cuadrillaId}
              >
                <option value="">Seleccionar cuadrilla</option>
                {cuadrillas.length > 0 ? (
                  cuadrillas.map(c => (
                    <option key={c.id || c.nombre} value={c.id || c.nombre}>
                      {c.nombre} {c.zona ? `- ${c.zona}` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Cuadrilla A">Cuadrilla A - Zona Norte</option>
                    <option value="Cuadrilla B">Cuadrilla B - Zona Sur</option>
                    <option value="Cuadrilla C">Cuadrilla C - Centro</option>
                  </>
                )}
              </CFormSelect>
              {error?.cuadrillaId && <small className="text-danger">{error.cuadrillaId}</small>}
            </CCol>

            <CCol md={12}>
              <CFormLabel>Activo del Inventario *</CFormLabel>
              <CFormSelect
                value={formData.activoId}
                onChange={onActivoChange}
                invalid={!!error?.activoId}
              >
                <option value="">Seleccionar activo</option>
                {activos.length > 0 ? (
                  activos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} - {a.nombre} ({a.estado}) - Cantidad Disp: {a.tipoActivo === 'contable' ? 'Múltiple' : 1}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">MINECO-HER-001 - Taladro Industrial</option>
                    <option value="2">MINECO-VEH-001 - Camioneta Toyota Hilux</option>
                    <option value="3">MINECO-COM-001 - Computadora HP Elite</option>
                  </>
                )}
              </CFormSelect>
              {error?.activoId && <small className="text-danger">{error.activoId}</small>}
            </CCol>

            <CCol md={6}>
              <CFormLabel>Cantidad *</CFormLabel>
              <CFormInput
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => onInputChange('cantidad', parseInt(e.target.value))}
                invalid={!!error?.cantidad}
              />
              {error?.cantidad && <small className="text-danger">{error.cantidad}</small>}
            </CCol>

            <CCol md={12}>
              <CFormLabel>Observaciones / Motivo</CFormLabel>
              <textarea
                className="form-control"
                rows="3"
                value={formData.observaciones}
                onChange={(e) => onInputChange('observaciones', e.target.value)}
                placeholder="Motivo de la solicitud, trabajo a realizar, justificación..."
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
          <CButton type="submit" color="success">
            <CIcon icon={cilPlus} className="me-2" />
            Crear Solicitud
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
};

export default SolicitudActivosModalCrear;
