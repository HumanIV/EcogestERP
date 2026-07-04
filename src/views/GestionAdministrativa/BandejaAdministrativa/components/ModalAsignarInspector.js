import React, { useState, useMemo } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CBadge, CAvatar, CFormInput, CInputGroup, CInputGroupText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {   cilUser, cilSearch, cilCheckCircle, cilLocationPin, cilPhone } from '@coreui/icons';

const ModalAsignarInspector = ({
  visible,
  onClose,
  onAsignar,
  tramite,
  cuadrillas = [],
}) => {
  const [busqueda, setBusqueda] = useState('');

  const inspectoresDisponibles = useMemo(() => {
    return cuadrillas.filter(
      c =>
        c.rol === 'TECNICO_INSPECTOR' &&
        c.estado === 'activa' &&
        c.disponible !== false
    );
  }, [cuadrillas]);

  const inspectoresFiltrados = useMemo(() => {
    if (!busqueda.trim()) return inspectoresDisponibles;
    const q = busqueda.toLowerCase();
    return inspectoresDisponibles.filter(
      i =>
        i.nombre?.toLowerCase().includes(q) ||
        i.zona?.toLowerCase().includes(q) ||
        i.id?.toLowerCase().includes(q)
    );
  }, [inspectoresDisponibles, busqueda]);

  const handleAsignar = (inspector) => {
    onAsignar(tramite, inspector);
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader closeButton>
        <CModalTitle>
          <CIcon icon={cilUser} className="me-2 text-success" />
          Asignar Inspector
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p className="text-muted small mb-3">
          Trámite: <strong>{tramite?.tramiteId || tramite?.id}</strong> — {tramite?.tramiteData?.solicitante || tramite?.solicitante}
        </p>

        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar inspector por nombre, zona o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </CInputGroup>

        {inspectoresFiltrados.length === 0 ? (
          <div className="text-center py-4">
            <CIcon icon={cilUser} size="3xl" className="text-muted mb-2 opacity-50" />
            <p className="text-muted">
              {inspectoresDisponibles.length === 0
                ? 'No hay inspectores disponibles. Cree uno en Equipos de Campo.'
                : 'No se encontraron inspectores con ese criterio.'}
            </p>
          </div>
        ) : (
          <div className="list-group">
            {inspectoresFiltrados.map(inspector => (
              <div
                key={inspector.id}
                className="list-group-item list-group-item-action d-flex align-items-center gap-3 p-3"
                style={{ cursor: 'pointer' }}
                onClick={() => handleAsignar(inspector)}
              >
                <CAvatar size="md" color="info" textColor="white" className="fw-bold">
                  {inspector.nombre?.charAt(0) || inspector.id?.charAt(0)}
                </CAvatar>
                <div className="flex-grow-1">
                  <div className="fw-bold">{inspector.nombre || inspector.id}</div>
                  <div className="d-flex gap-3 mt-1">
                    <small className="text-muted">
                      <CIcon icon={cilLocationPin} className="me-1" size="sm" />
                      {inspector.zona || 'Sin zona'}
                    </small>
                    {inspector.telefono && (
                      <small className="text-muted">
                        <CIcon icon={cilPhone} className="me-1" size="sm" />
                        {inspector.telefono}
                      </small>
                    )}
                  </div>
                </div>
                <CBadge color="success" className="px-2 py-1">
                  <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                  Disponible
                </CBadge>
              </div>
            ))}
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalAsignarInspector;
