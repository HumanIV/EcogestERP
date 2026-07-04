import React, { useState } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CRow, CCol, CFormInput, CFormLabel, CFormSelect, CFormTextarea,
  CButton, CAlert, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilStorage, cilWarning, cilSend, cilInfo } from '@coreui/icons';

const CuadrillasModalSolicitarActivo = ({
  visible,
  onClose,
  onEnviarSolicitud,
  cuadrilla,
  activos,
}) => {
  const [formSolicitud, setFormSolicitud] = useState({
    activoId: '',
    activoNombre: '',
    activoCodigo: '',
    cantidad: 1,
    observaciones: '',
  });
  const [error, setError] = useState(null);

  const handleActivoChange = (e) => {
    const id = e.target.value;
    const activo = activos.find(a => String(a.id) === String(id));
    setFormSolicitud(prev => ({
      ...prev,
      activoId: id,
      activoNombre: activo?.nombre || '',
      activoCodigo: activo?.codigo || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formSolicitud.activoId) {
      setError('Debe seleccionar un activo del inventario');
      return;
    }
    if (!formSolicitud.observaciones.trim() || formSolicitud.observaciones.trim().length < 10) {
      setError('Debe indicar el motivo de la solicitud (mínimo 10 caracteres)');
      return;
    }
    setError(null);
    onEnviarSolicitud(cuadrilla, formSolicitud);
    setFormSolicitud({ activoId: '', activoNombre: '', activoCodigo: '', cantidad: 1, observaciones: '' });
  };

  const handleClose = () => {
    setError(null);
    setFormSolicitud({ activoId: '', activoNombre: '', activoCodigo: '', cantidad: 1, observaciones: '' });
    onClose();
  };

  if (!cuadrilla) return null;

  return (
    <CModal visible={visible} onClose={handleClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilStorage} className="me-2" />
          Solicitar Material / Equipo
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {/* Info de la cuadrilla solicitante */}
          <div className="border rounded p-3 eco-surface mb-4">
            <div className="d-flex align-items-center gap-3">
              <CIcon icon={cilInfo} className="text-info" size="lg" />
              <div>
                <small className="text-muted d-block">Cuadrilla Solicitante</small>
                <div className="fw-bold">{cuadrilla.nombre}</div>
                <small className="text-muted">
                  {cuadrilla.zona} — {Array.isArray(cuadrilla.responsables) ? cuadrilla.responsables.join(', ') : cuadrilla.responsables}
                </small>
              </div>
            </div>
          </div>

          <CAlert color="info" className="d-flex align-items-center mb-4">
            <CIcon icon={cilInfo} className="me-2 flex-shrink-0" />
            <small>
              La solicitud quedará <strong>Pendiente</strong> hasta que el Administrador la apruebe
              en el módulo <strong>Solicitud de Activos</strong>. Solo al aprobarla se registrará
              el movimiento en el Inventario.
            </small>
          </CAlert>

          {error && (
            <CAlert color="danger" className="d-flex align-items-center mb-3">
              <CIcon icon={cilWarning} className="me-2" />
              {error}
            </CAlert>
          )}

          <CRow className="g-3">
            <CCol md={12}>
              <CFormLabel>Activo del Inventario *</CFormLabel>
              <CFormSelect value={formSolicitud.activoId} onChange={handleActivoChange}>
                <option value="">Seleccionar activo...</option>
                {activos.length > 0 ? (
                  activos
                    .filter(a => a.estado === 'Disponible' || a.estado === 'Nuevo')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.codigo} — {a.nombre} ({a.estado})
                      </option>
                    ))
                ) : (
                  <>
                    <option value="mock-1">MINECO-HER-001 — Taladro Industrial</option>
                    <option value="mock-2">MINECO-VEH-001 — Camioneta Toyota Hilux</option>
                    <option value="mock-3">MINECO-EQU-001 — Kit de Herramientas Completo</option>
                  </>
                )}
              </CFormSelect>
              {activos.length === 0 && (
                <small className="text-warning d-block mt-1">
                  ⚠ No hay activos cargados desde el Inventario. Se usarán valores de ejemplo.
                </small>
              )}
            </CCol>

            <CCol md={4}>
              <CFormLabel>Cantidad *</CFormLabel>
              <CFormInput
                type="number"
                min="1"
                value={formSolicitud.cantidad}
                onChange={(e) => setFormSolicitud(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Motivo / Justificación *</CFormLabel>
              <CFormTextarea
                rows={3}
                maxLength={200}
                value={formSolicitud.observaciones}
                onChange={(e) => setFormSolicitud(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Describa para qué se necesita el activo, qué tarea se va a realizar, urgencia, etc. (mínimo 10 caracteres)"
              />
              <small className="text-muted">{formSolicitud.observaciones.length}/200 caracteres</small>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClose}>Cancelar</CButton>
          <CButton type="submit" color="success" className="fw-bold">
            <CIcon icon={cilSend} className="me-2" />
            Enviar Solicitud al HUB
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
};

export default CuadrillasModalSolicitarActivo;
