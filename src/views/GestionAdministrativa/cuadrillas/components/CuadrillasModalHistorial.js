import React, { useEffect } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CBadge, CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilClock, cilPlus, cilPencil, cilTrash, cilTask,
  cilCheckCircle, cilStorage, cilWarning, cilInfo,
} from '@coreui/icons';

const TIPO_CONFIG = {
  creacion: { icon: cilPlus, color: 'success', label: 'Creación' },
  edicion: { icon: cilPencil, color: 'primary', label: 'Edición' },
  eliminacion: { icon: cilTrash, color: 'danger', label: 'Eliminación' },
  tarea_asignada: { icon: cilTask, color: 'info', label: 'Tarea Asignada' },
  tarea_completada: { icon: cilCheckCircle, color: 'success', label: 'Tarea Completada' },
  cambio_estado: { icon: cilInfo, color: 'warning', label: 'Cambio de Estado' },
  solicitud_activo: { icon: cilStorage, color: 'secondary', label: 'Solicitud de Activo' },
};

const CuadrillasModalHistorial = ({ visible, onClose, cuadrilla, actividad, cargarActividad }) => {
  useEffect(() => {
    if (visible && cargarActividad) cargarActividad();
  }, [visible, cargarActividad]);

  if (!cuadrilla) return null;

  const eventos = (actividad || []).filter(a => a.cuadrillaId === cuadrilla.id);

  const formatFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilClock} className="me-2" />
          Historial — {cuadrilla.nombre}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        {eventos.length === 0 ? (
          <div className="text-center py-4">
            <CIcon icon={cilClock} size="3xl" className="text-muted mb-3 opacity-50" />
            <p className="text-muted">Sin actividad registrada aún.</p>
          </div>
        ) : (
          <div className="timeline-eco">
            {eventos.map((ev, idx) => {
              const config = TIPO_CONFIG[ev.tipo] || { icon: cilInfo, color: 'secondary', label: ev.tipo };
              return (
                <div key={ev.id} className="timeline-item-eco d-flex gap-3 pb-3">
                  <div className="timeline-dot-eco d-flex flex-column align-items-center">
                    <div className={`rounded-circle bg-${config.color} bg-opacity-10 d-flex align-items-center justify-content-center`} style={{ width: '36px', height: '36px' }}>
                      <CIcon icon={config.icon} className={`text-${config.color}`} size="sm" />
                    </div>
                    {idx < eventos.length - 1 && <div className="timeline-line-eco flex-grow-1" />}
                  </div>
                  <div className="flex-grow-1 pb-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <CBadge color={config.color} style={{ fontSize: '0.65rem' }}>{config.label}</CBadge>
                      <small className="text-muted">{formatFecha(ev.fecha)}</small>
                    </div>
                    <small className="d-block">{ev.detalle}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>

      <style>{`
        .timeline-eco {
          padding: 4px 0;
        }
        .timeline-item-eco:last-child {
          padding-bottom: 0 !important;
        }
        .timeline-line-eco {
          width: 2px;
          background: var(--cui-border-color, #dee2e6);
          margin: 4px auto;
        }
        [data-coreui-theme="dark"] .timeline-line-eco {
          background: var(--cui-border-color-dark, #444b50);
        }
      `}</style>
    </CModal>
  );
};

export default CuadrillasModalHistorial;