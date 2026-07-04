import React from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CProgress,
  CListGroup,
  CListGroupItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilLaptop,
  cilStorage
} from '@coreui/icons';
import {
  getTipoMovimientoColor,
  getOcupacionColor
} from '../utils/inventarioUtils';
import { UBICACIONES } from '../constants/inventarioConstants';

const InventarioDashboard = ({ metricas, activos, movimientos }) => {
  const getIcon = (cat) => {
    switch (cat) {
      case 'Tecnología': return cilLaptop;
      default: return cilStorage;
    }
  };

  return (
    <CRow>
      <CCol md={8}>
        <CCard className="eco-card mb-4">
          <CCardHeader className="eco-card-header">
            <h6 className="mb-0 fw-bold">
              <CIcon icon={cilStorage} className="me-2 text-eco" />
              Distribución de Activos por Categoría
            </h6>
          </CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <CTable hover>
                <CTableHead>
                  <CTableRow className="table-header-eco">
                    <CTableHeaderCell>Categoría</CTableHeaderCell>
                    <CTableHeaderCell>Activos</CTableHeaderCell>
                    <CTableHeaderCell>Valor Total</CTableHeaderCell>
                    <CTableHeaderCell>En Uso</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {metricas.distribucionCategorias?.map(cat => {
                    const activosCat = activos.filter(a => a.categoria === cat.nombre);
                    const enUsoCat = activosCat.filter(a => a.estado === 'En Uso').length;
                    const porcentajeUso = activosCat.length > 0 ? (enUsoCat / activosCat.length) * 100 : 0;
                    const IconComp = getIcon(cat.nombre);

                    return (
                      <CTableRow key={cat.id}>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CIcon icon={IconComp} className={`text-${cat.color} me-2`} />
                            <span className="fw-semibold">{cat.nombre}</span>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-bold">{cat.cantidad}</div>
                          <small className="text-muted">activos</small>
                        </CTableDataCell>
                        <CTableDataCell className="fw-bold text-eco">
                          ${cat.valor?.toLocaleString() || 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 me-3">
                              <CProgress value={porcentajeUso} color={cat.color} className="progress" />
                            </div>
                            <small>{porcentajeUso.toFixed(0)}%</small>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={porcentajeUso > 80 ? 'success' : porcentajeUso > 50 ? 'warning' : 'danger'}>
                            {porcentajeUso > 80 ? 'Óptimo' : porcentajeUso > 50 ? 'Regular' : 'Bajo'}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>

        <CCard className="eco-card">
          <CCardHeader className="eco-card-header">
            <h6 className="mb-0 fw-bold">
              <CIcon icon={cilStorage} className="me-2 text-eco" />
              Movimientos Recientes
            </h6>
          </CCardHeader>
          <CCardBody>
<CListGroup>
                {movimientos?.slice(0, 5).map(mov => (
                  <CListGroupItem
                    key={mov.id}
                    className="d-flex justify-content-between align-items-center border-0 mb-2 eco-surface rounded"
                  >
                    <div>
                      <div className="fw-semibold">{mov.activoNombre || mov.activo}</div>
                      <small className="text-muted">
                        {mov.tipo} • {mov.fecha} • {mov.usuario}
                      </small>
                    </div>
                    <div className="text-end">
                      <CBadge color={getTipoMovimientoColor(mov.tipo)} className="mb-1">
                        {mov.cantidad} unidad
                      </CBadge>
                      <div className="small text-muted">{mov.referencia}</div>
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={4}>
        <CCard className="eco-card mb-4">
          <CCardHeader className="eco-card-header">
            <h6 className="mb-0 fw-bold">
              <CIcon icon={cilLaptop} className="me-2 text-eco" />
              Resumen por Departamento
            </h6>
          </CCardHeader>
          <CCardBody>
            {['Dirección General', 'Tecnología e Informática', 'Logística y Transporte', 'Mantenimiento'].map(depto => {
              const activosDepto = activos.filter(a => a.departamento === depto);
              return activosDepto.length > 0 && (
                <div key={depto} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold">{depto}</span>
                    <span>{activosDepto.length}</span>
                  </div>
                  <CProgress
                    value={(activosDepto.length / metricas.totalActivos) * 100}
                    color="success"
                    className="progress"
                  />
                </div>
              );
            })}
          </CCardBody>
        </CCard>

        <CCard className="eco-card">
          <CCardHeader className="eco-card-header">
            <h6 className="mb-0 fw-bold">
              <CIcon icon={cilLaptop} className="me-2 text-eco" />
              Ocupación de Ubicaciones
            </h6>
          </CCardHeader>
          <CCardBody>
            {UBICACIONES.map(ubic => (
              <div key={ubic.id} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">{ubic.nombre}</span>
                  <span>{ubic.ocupacion}</span>
                </div>
                {ubic.ocupacion !== 'N/A' && (
                  <CProgress
                    value={parseInt(ubic.ocupacion)}
                    color={getOcupacionColor(ubic.ocupacion)}
                    className="progress"
                  />
                )}
                <small className="text-muted">Responsable: {ubic.responsable}</small>
              </div>
            ))}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default InventarioDashboard;