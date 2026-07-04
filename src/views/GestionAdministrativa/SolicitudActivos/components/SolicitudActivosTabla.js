import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CButtonGroup,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilCheckCircle,
  cilXCircle,
  cilPencil,
  cilCloudDownload,
  cilSearch,
  cilTruck
} from '@coreui/icons';
import { getBadgeColor, formatearFecha, getOrigenColor } from '../utils/solicitudActivosUtils';
import SolicitudActivosEmpty from './SolicitudActivosEmpty';

const SolicitudActivosTabla = ({
  solicitudes,
  onAprobar,
  onRechazar,
  onVerDetalles,
  onExportar
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState('');

  // Filtrado local
  const solicitudesFiltradas = solicitudes.filter(sol => {
    const matchBusqueda = sol.cuadrillaNombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
                          sol.activoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          sol.id.toString().includes(busqueda);
    const matchEstado = filtroEstado ? sol.estado === filtroEstado : true;
    const matchOrigen = filtroOrigen ? sol.origen === filtroOrigen : true;
    return matchBusqueda && matchEstado && matchOrigen;
  });

  return (
    <CCard className="eco-card">
      <CCardHeader className="eco-card-header pt-4 pb-3">
        <CRow className="g-3">
          <CCol md={4}>
            <CInputGroup>
              <CInputGroupText className="bg-eco-soft">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por cuadrilla, activo o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </CInputGroup>
          </CCol>
          <CCol md={3}>
            <CFormSelect value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormSelect value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)}>
              <option value="">Cualquier Origen</option>
              <option value="cuadrilla">Desde Cuadrillas</option>
              <option value="inventario">Desde Movimientos (Inv)</option>
            </CFormSelect>
          </CCol>
          <CCol md={2} className="text-end">
            <CButton color="outline-success" className="w-100" onClick={onExportar}>
              <CIcon icon={cilCloudDownload} className="me-2" />
              Exportar
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody className="p-0">
        {solicitudesFiltradas.length === 0 ? (
          <SolicitudActivosEmpty />
        ) : (
          <div className="table-responsive">
            <CTable hover align="middle" className="mb-0">
              <CTableHead>
                <CTableRow className="table-header-eco">
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Origen</CTableHeaderCell>
                  <CTableHeaderCell>Cuadrilla Destino</CTableHeaderCell>
                  <CTableHeaderCell>Activo Solicitado</CTableHeaderCell>
                  <CTableHeaderCell>Cant.</CTableHeaderCell>
                  <CTableHeaderCell>Fecha Solicitud</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {solicitudesFiltradas.map(sol => {
                  const { fecha, hora } = formatearFecha(sol.fechaSolicitud);
                  return (
                    <CTableRow key={sol.id}>
                      <CTableDataCell>
                        <span className="fw-bold">#{sol.id}</span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getOrigenColor(sol.origen)} shape="rounded-pill">
                          {sol.origen === 'inventario' ? (
                            <><CIcon icon={cilTruck} size="sm" className="me-1"/> Inv</>
                          ) : (
                            <><CIcon icon={cilPeople} size="sm" className="me-1"/> Cuadrilla</>
                          )}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-semibold">{sol.cuadrillaNombre || sol.cuadrillaId || 'N/A'}</div>
                            {sol.cuadrillaId && <small className="text-muted">ID: {sol.cuadrillaId}</small>}
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold">{sol.activoNombre}</div>
                        <small className="text-muted">{sol.activoCodigo}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="secondary" className="px-2 py-1">
                          {sol.cantidad}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{fecha}</div>
                        <small className="text-muted">{hora}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getBadgeColor(sol.estado)} className="px-3 py-2">
                          {sol.estado}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {sol.estado === 'Pendiente' ? (
                          <CButtonGroup size="sm">
                            <CButton color="success" variant="outline" onClick={() => onAprobar(sol)} title="Aprobar">
                              <CIcon icon={cilCheckCircle} />
                            </CButton>
                            <CButton color="danger" variant="outline" onClick={() => onRechazar(sol)} title="Rechazar">
                              <CIcon icon={cilXCircle} />
                            </CButton>
                            <CButton color="info" variant="outline" onClick={() => onVerDetalles(sol)} title="Ver detalles">
                              <CIcon icon={cilPencil} />
                            </CButton>
                          </CButtonGroup>
                        ) : (
                          <CButton size="sm" color="secondary" variant="outline" onClick={() => onVerDetalles(sol)}>
                            Ver Detalles
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default SolicitudActivosTabla;
