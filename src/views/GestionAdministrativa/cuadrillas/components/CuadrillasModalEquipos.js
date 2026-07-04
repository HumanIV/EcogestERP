import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CBadge, CTable, CTableHead,
  CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilInbox, cilCheckCircle, cilClock, cilWarning } from '@coreui/icons';
import { solicitudActivosService } from '../../SolicitudActivos/services/solicitudActivosService';

const CuadrillasModalEquipos = ({ visible, onClose, cuadrilla }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    if (visible && cuadrilla) {
      const cargar = async () => {
        try {
          const res = await solicitudActivosService.obtenerSolicitudes()
          const todas = res.success ? res.data : []
          setSolicitudes(todas.filter(s =>
            s.cuadrillaId === cuadrilla.id && s.estado === 'Aprobado'
          ))
          setPendientes(todas.filter(s =>
            s.cuadrillaId === cuadrilla.id && s.estado === 'Pendiente'
          ).length)
        } catch {
          setSolicitudes([])
          setPendientes(0)
        }
      }
      cargar()
    }
  }, [visible, cuadrilla]);

  if (!cuadrilla) return null;

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilInbox} className="me-2" />
          Equipos Asignados — {cuadrilla.nombre}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {pendientes > 0 && (
          <CAlert color="info" className="d-flex align-items-center py-2">
            <CIcon icon={cilClock} className="me-2 flex-shrink-0" />
            <small>Tienes <strong>{pendientes}</strong> solicitud(es) pendiente(s) de aprobación</small>
          </CAlert>
        )}

        {solicitudes.length === 0 ? (
          <div className="text-center py-4">
            <CIcon icon={cilInbox} size="3xl" className="text-muted mb-3 opacity-50" />
            <p className="text-muted">No hay equipos aprobados para esta cuadrilla.</p>
            <p className="text-muted small">Usa <strong>Solicitar Material</strong> para pedir equipos. Serán asignados cuando un administrador los apruebe.</p>
          </div>
        ) : (
          <CTable hover borderless size="sm">
            <CTableHead>
              <CTableRow className="table-header-eco">
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Equipo</CTableHeaderCell>
                <CTableHeaderCell>Cant.</CTableHeaderCell>
                <CTableHeaderCell>Aprobado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {solicitudes.map(s => (
                <CTableRow key={s.id}>
                  <CTableDataCell><CBadge color="dark">{s.activoCodigo}</CBadge></CTableDataCell>
                  <CTableDataCell className="fw-semibold">{s.activoNombre}</CTableDataCell>
                  <CTableDataCell>{s.cantidad}</CTableDataCell>
                  <CTableDataCell>
                    <small className="text-muted">
                      <CIcon icon={cilCheckCircle} className="me-1 text-success" size="sm" />
                      {s.fechaAprobacion || '—'}
                    </small>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default CuadrillasModalEquipos;