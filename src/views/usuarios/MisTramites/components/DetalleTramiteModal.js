import React from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CRow, CCol, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTask, cilDescription, cilUser, cilCalendar, cilClock, cilCheckCircle } from '@coreui/icons';
import { ESTADOS_TRAMITE } from '../../../GestionAdministrativa/Tramites/constants/tramitesConstants';

const DetalleTramiteModal = ({ visible, onClose, tramite }) => {
  if (!tramite) return null;

  const getEstadoBadgeColor = (estado) => {
    const found = ESTADOS_TRAMITE.find(e => e.value === estado);
    return found ? found.color : 'secondary';
  };

  const getEstadoLabel = (estado) => {
    const found = ESTADOS_TRAMITE.find(e => e.value === estado);
    return found ? found.label : estado;
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader closeButton className="pb-2">
        <CModalTitle className="fw-bold text-eco">
          <CIcon icon={tramite.tipo === 'PERMISO' ? cilTask : cilDescription} className="me-2" />
          Detalle del Trámite
          <CBadge color={tramite.tipo === 'PERMISO' ? 'primary' : 'info'} className="ms-2">
            {tramite.tipo === 'PERMISO' ? 'Permiso' : 'Licencia'}
          </CBadge>
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="px-4">
        <CRow className="g-3 mb-4">
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">ID del Trámite</small>
              <div className="fw-bold">{tramite.id}</div>
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Estado Actual</small>
              <CBadge color={getEstadoBadgeColor(tramite.estado)} className="px-3 py-2 fs-6">
                {getEstadoLabel(tramite.estado)}
              </CBadge>
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Solicitante</small>
              <div className="fw-bold">{tramite.solicitante}</div>
              <small className="text-muted">{tramite.cedulaRif}</small>
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Subtipo</small>
              <div className="fw-bold">{tramite.subtipo || '—'}</div>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">
                <CIcon icon={cilCalendar} className="me-1" size="sm" />
                Fecha Solicitud
              </small>
              <div className="fw-semibold small">{tramite.fechaSolicitud || '—'}</div>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">
                <CIcon icon={cilUser} className="me-1" size="sm" />
                Inspector
              </small>
              <div className="fw-semibold small">
                {tramite.inspectorNombre || 'Sin asignar'}
              </div>
            </div>
          </CCol>
          <CCol md={4}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Ubicación</small>
              <div className="fw-semibold small">{tramite.municipio || '—'}, {tramite.estado_geografico || '—'}</div>
            </div>
          </CCol>
          <CCol md={12}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Descripción</small>
              <div>{tramite.descripcion || '—'}</div>
            </div>
          </CCol>
        </CRow>

        {/* Historial */}
        <div className="mb-3">
          <h6 className="fw-bold mb-3">
            <CIcon icon={cilClock} className="me-2" />
            Historial de Estados
          </h6>
          <div className="border rounded p-3 eco-surface" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {tramite.historial && tramite.historial.length > 0 ? (
              <div>
                {tramite.historial.map((h, idx) => (
                  <div key={idx} className="d-flex align-items-start gap-3 mb-2 pb-2 border-bottom">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${idx === tramite.historial.length - 1 ? 'bg-success bg-opacity-10' : 'bg-eco-soft'}`} style={{ width: '32px', height: '32px' }}>
                      <CIcon icon={cilCheckCircle} size="sm" className={idx === tramite.historial.length - 1 ? 'text-success' : 'text-muted'} />
                    </div>
                    <div className="flex-grow-1">
                      <CBadge color={getEstadoBadgeColor(h.estado)} className="mb-1">{getEstadoLabel(h.estado)}</CBadge>
                      <div className="small fw-semibold">{h.nota}</div>
                      <small className="text-muted">
                        {h.usuario} — {new Date(h.fecha).toLocaleString('es-VE')}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <small className="text-muted fst-italic">Sin historial</small>
            )}
          </div>
        </div>

        {tramite.observaciones && (
          <div className="border rounded p-3 bg-warning bg-opacity-10 border-warning">
            <small className="text-warning fw-bold d-block mb-1">Observaciones</small>
            <small>{tramite.observaciones}</small>
          </div>
        )}
      </CModalBody>

      <CModalFooter className="border-top-0 pt-0">
        <CButton color="secondary" variant="outline" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default DetalleTramiteModal;
