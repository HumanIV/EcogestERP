import React from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CBadge,
  CButton,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilClipboard, cilInfo } from '@coreui/icons';
import { getBadgeColor, getOrigenColor } from '../utils/solicitudActivosUtils';

const SolicitudActivosModalVer = ({
  visible,
  onClose,
  solicitud
}) => {
  if (!solicitud) return null;

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilClipboard} className="me-2" />
          Detalle de Solicitud #{solicitud.id}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {solicitud.origen === 'inventario' && (
          <CAlert color="info" className="d-flex align-items-center mb-4">
            <CIcon icon={cilInfo} className="me-2" />
            <div>
              Esta solicitud fue generada desde el módulo de <strong>Inventario</strong> (Movimientos).
              <br/>
              <small>Origen detalle: {solicitud.origenDetalle}</small>
            </div>
          </CAlert>
        )}

        <CRow className="g-3">
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface h-100">
              <small className="text-muted d-block mb-1">Estado Actual</small>
              <CBadge color={getBadgeColor(solicitud.estado)} className="px-3 py-2 fs-6">
                {solicitud.estado}
              </CBadge>
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface h-100">
              <small className="text-muted d-block mb-1">Origen</small>
              <CBadge color={getOrigenColor(solicitud.origen)} className="px-3 py-2 fs-6">
                {solicitud.origen === 'inventario' ? 'Inventario' : 'Cuadrilla'}
              </CBadge>
            </div>
          </CCol>
          
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Cuadrilla / Destino</small>
              <div className="fw-bold">{solicitud.cuadrillaNombre || solicitud.cuadrillaId || 'N/A'}</div>
              {solicitud.cuadrillaId && <small className="text-muted">ID: {solicitud.cuadrillaId}</small>}
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Activo</small>
              <div className="fw-bold">{solicitud.activoNombre}</div>
              <small className="text-muted">{solicitud.activoCodigo}</small>
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Cantidad</small>
              <div className="fw-bold fs-5">{solicitud.cantidad}</div>
            </div>
          </CCol>
          <CCol md={6}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Fecha Solicitud</small>
              <div className="fw-bold">{solicitud.fechaSolicitud}</div>
            </div>
          </CCol>
          
          <CCol md={12}>
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted d-block mb-1">Motivo / Observaciones</small>
              <div>{solicitud.observaciones || 'Sin observaciones'}</div>
            </div>
          </CCol>

          {solicitud.estado !== 'Pendiente' && (
            <CCol md={12}>
              <div className="border rounded p-3 eco-surface">
                <small className="text-muted d-block mb-1">Resolución</small>
                <div className="fw-bold">{solicitud.estado} por: {solicitud.aprobadoPor || 'Administrador'}</div>
                <small className="text-muted">{solicitud.fechaAprobacion}</small>
                {solicitud.referencia && (
                  <div className="mt-2"><small className="text-muted">Ref. Inventario:</small> <strong>{solicitud.referencia}</strong></div>
                )}
              </div>
            </CCol>
          )}
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default SolicitudActivosModalVer;
