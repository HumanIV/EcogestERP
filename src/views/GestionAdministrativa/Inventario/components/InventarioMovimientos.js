import React from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilTruck } from '@coreui/icons';
import { getTipoMovimientoColor } from '../utils/inventarioUtils';

const InventarioMovimientos = ({ movimientos, onNuevoMovimiento }) => {
  return (
    <>
      <CRow className="mb-4 align-items-center">
        <CCol xs={12} md={6}>
          <h5 className="mb-0 fw-bold">
            <CIcon icon={cilTruck} className="me-2 text-eco" />
            Historial de Movimientos
          </h5>
          <p className="text-muted mb-0">Registro de asignaciones, transferencias y bajas de activos</p>
        </CCol>
        <CCol xs={12} md={6} className="text-md-end">
          <CButton color="success" onClick={() => onNuevoMovimiento()}>
            <CIcon icon={cilPlus} className="me-2" />
            Registrar Movimiento
          </CButton>
        </CCol>
      </CRow>

      <CCard className="eco-card">
        <CCardBody className="p-0">
          <div className="table-responsive">
            <CTable hover>
              <CTableHead>
                <CTableRow className="table-header-eco">
                  <CTableHeaderCell>Fecha/Hora</CTableHeaderCell>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Activo</CTableHeaderCell>
                  <CTableHeaderCell>Ubicaciones</CTableHeaderCell>
                  <CTableHeaderCell>Cuadrilla</CTableHeaderCell>
                  <CTableHeaderCell>Motivo/Referencia</CTableHeaderCell>
                  <CTableHeaderCell>Usuario</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {movimientos.map(mov => {
                    const fechaRaw = mov.fecha || ''
                    const isISO = fechaRaw.includes('T')
                    const fechaParte = isISO ? fechaRaw.split('T')[0] : fechaRaw.split(' ')[0]
                    const horaParte = isISO ? fechaRaw.split('T')[1]?.split('.')[0] : fechaRaw.split(' ')[1]
                    return (
                  <CTableRow key={mov.id}>
                    <CTableDataCell>
                      <div>{fechaParte}</div>
                      {horaParte && <small className="text-muted">{horaParte}</small>}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getTipoMovimientoColor(mov.tipo)}>
                        {mov.tipo}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">{mov.activoNombre || mov.activo}</div>
                      <small className="text-muted">{mov.codigoActivo}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>
                        <div>Origen: {mov.ubicacionOrigen || mov.ubicacion_origen}</div>
                        <div>Destino: {mov.ubicacionDestino || mov.ubicacion_destino}</div>
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {mov.cuadrillaNombre ? (
                        <CBadge color="info" className="px-2">
                          {mov.cuadrillaNombre}
                        </CBadge>
                      ) : (
                        <small className="text-muted">N/A</small>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{mov.motivo}</div>
                      <small className="text-muted">{mov.referencia}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small className="text-muted">{mov.usuario}</small>
                    </CTableDataCell>
                  </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </>
  );
};

export default InventarioMovimientos;