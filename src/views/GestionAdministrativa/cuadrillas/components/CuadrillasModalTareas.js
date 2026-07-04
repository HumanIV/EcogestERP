import React from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CRow, CCol, CButton, CBadge, CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTask, cilWarning } from '@coreui/icons';
import { getModuloOrigenInfo } from '../utils/cuadrillasUtils';

const CuadrillasModalTareas = ({ visible, onClose, cuadrilla }) => {
  if (!cuadrilla) return null;

  const tareas = cuadrilla.tareasActuales || [];

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilTask} className="me-2" />
          Tareas Actuales — {cuadrilla.nombre}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <div className="border rounded p-3 eco-surface mb-4">
          <CRow>
            <CCol xs={6} md={3}>
              <small className="text-muted d-block">Zona</small>
              <strong>{cuadrilla.zona}</strong>
            </CCol>
            <CCol xs={6} md={3}>
              <small className="text-muted d-block">Capacidad</small>
              <strong>{tareas.length} / {cuadrilla.capacidad}</strong>
            </CCol>
            <CCol xs={6} md={3}>
              <small className="text-muted d-block">Estado</small>
              <CBadge color={cuadrilla.estado === 'activa' ? 'success' : 'warning'}>
                {cuadrilla.estado}
              </CBadge>
            </CCol>
            <CCol xs={6} md={3}>
              <small className="text-muted d-block">Disponible</small>
              <CBadge color={cuadrilla.disponible ? 'success' : 'danger'}>
                {cuadrilla.disponible ? 'Sí' : 'No'}
              </CBadge>
            </CCol>
          </CRow>
        </div>

        {tareas.length === 0 ? (
          <div className="text-center py-4">
            <CIcon icon={cilTask} size="3xl" className="text-muted mb-3" />
            <p className="text-muted">Esta cuadrilla no tiene tareas asignadas actualmente.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {tareas.map((tarea, idx) => {
              const moduloInfo = getModuloOrigenInfo(tarea.moduloOrigen);
              return (
                <div key={idx} className="border rounded p-3 eco-surface">
                  <div className="d-flex align-items-start gap-3">
                    <CBadge color={moduloInfo.color} className="px-3 py-2">
                      {moduloInfo.label}
                    </CBadge>
                    <div>
                      <div className="fw-semibold">{tarea.descripcion}</div>
                      <small className="text-muted">Ref: {tarea.tareaId}</small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tareas.length >= cuadrilla.capacidad && (
          <CAlert color="warning" className="mt-3 d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2" />
            Esta cuadrilla ha alcanzado su <strong className="mx-1">capacidad máxima</strong>.
            No se le asignarán nuevas tareas automáticamente.
          </CAlert>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default CuadrillasModalTareas;
