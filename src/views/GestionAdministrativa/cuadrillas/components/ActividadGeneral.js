import React, { useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CRow, CCol,
  CBadge, CFormInput, CInputGroup, CInputGroupText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilClock, cilPlus, cilPencil, cilTrash, cilTask,
  cilCheckCircle, cilStorage, cilInfo, cilSearch,
} from '@coreui/icons';
import { useState } from 'react';

const TIPO_CONFIG = {
  creacion: { icon: cilPlus, color: 'success', label: 'Creación' },
  edicion: { icon: cilPencil, color: 'primary', label: 'Edición' },
  eliminacion: { icon: cilTrash, color: 'danger', label: 'Eliminación' },
  tarea_asignada: { icon: cilTask, color: 'info', label: 'Tarea Asignada' },
  tarea_completada: { icon: cilCheckCircle, color: 'success', label: 'Tarea Completada' },
  cambio_estado: { icon: cilInfo, color: 'warning', label: 'Cambio de Estado' },
  solicitud_activo: { icon: cilStorage, color: 'secondary', label: 'Solicitud de Activo' },
};

const formatFecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ActividadGeneral = ({ actividad, cargarActividad }) => {
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (cargarActividad) cargarActividad();
  }, [cargarActividad]);

  const eventos = busqueda.trim()
    ? actividad.filter(e =>
        e.detalle?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.cuadrillaId?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : actividad;

  return (
    <CCard className="eco-card">
      <CCardHeader className="eco-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 className="fw-bold mb-0">
          <CIcon icon={cilClock} className="me-2" />
          Actividad General
        </h6>
        <CInputGroup size="sm" style={{ maxWidth: '280px' }}>
          <CInputGroupText className="bg-transparent">
            <CIcon icon={cilSearch} className="text-muted" size="sm" />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar en actividad..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </CInputGroup>
      </CCardHeader>
      <CCardBody>
        {eventos.length === 0 ? (
          <div className="text-center py-4">
            <CIcon icon={cilClock} size="3xl" className="text-muted mb-3 opacity-50" />
            <p className="text-muted">No hay actividad registrada aún.</p>
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
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <CBadge color={config.color} style={{ fontSize: '0.65rem' }}>{config.label}</CBadge>
                      <small className="text-muted">{formatFecha(ev.fecha)}</small>
                      <small className="text-eco fw-semibold">{ev.cuadrillaId}</small>
                    </div>
                    <small className="d-block">{ev.detalle}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CCardBody>

      <style>{`
        .timeline-eco { padding: 4px 0; }
        .timeline-item-eco:last-child { padding-bottom: 0 !important; }
        .timeline-line-eco {
          width: 2px;
          background: var(--cui-border-color, #dee2e6);
          margin: 4px auto;
          flex: 1;
          min-height: 8px;
        }
        [data-coreui-theme="dark"] .timeline-line-eco {
          background: var(--cui-border-color-dark, #444b50);
        }
      `}</style>
    </CCard>
  );
};

export default ActividadGeneral;