import React from 'react';
import {
  CRow, CCol, CCard, CCardBody, CCardHeader,
  CProgress, CProgressBar, CBadge, CTable, CTableHead,
  CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChart, cilInbox } from '@coreui/icons';
import { getEstadoColor, calcularPorcentajeCarga, getCargaColor } from '../utils/cuadrillasUtils';

const CuadrillasGraficos = ({ cuadrillas, equipos = [] }) => {
  if (!cuadrillas || cuadrillas.length === 0) {
    return (
      <div className="text-center py-5">
        <CIcon icon={cilChart} size="3xl" className="text-muted mb-3" />
        <p className="text-muted">No hay cuadrillas para mostrar estadísticas.</p>
      </div>
    );
  }

  const distribucionZona = cuadrillas.reduce((acc, c) => {
    acc[c.zona] = (acc[c.zona] || 0) + 1;
    return acc;
  }, {});

  const distribucionEstado = cuadrillas.reduce((acc, c) => {
    acc[c.estado] = (acc[c.estado] || 0) + 1;
    return acc;
  }, {});

  const totalTareas = cuadrillas.reduce((s, c) => s + (c.tareasActuales?.length || 0), 0);
  const totalTareasCompletadas = cuadrillas.reduce((s, c) => s + (c.tareasCompletadas || 0), 0);
  const totalCapacidad = cuadrillas.reduce((s, c) => s + (c.capacidad || 0), 0);

  const zonaColors = ['primary', 'success', 'warning', 'danger', 'info'];

  return (
    <CRow className="g-4">
      {/* Distribución por Zona */}
      <CCol lg={6}>
        <CCard className="eco-card h-100">
          <CCardHeader className="eco-card-header">
            <h6 className="fw-bold mb-0">Distribución por Zona</h6>
          </CCardHeader>
          <CCardBody>
            {Object.entries(distribucionZona).map(([zona, cantidad], idx) => (
              <div key={zona} className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">{zona}</span>
                  <span className="text-muted">{cantidad} cuadrilla(s)</span>
                </div>
                <CProgress style={{ height: '10px' }}>
                  <CProgressBar
                    value={(cantidad / cuadrillas.length) * 100}
                    color={zonaColors[idx % zonaColors.length]}
                  />
                </CProgress>
                <small className="text-muted">
                  {((cantidad / cuadrillas.length) * 100).toFixed(1)}% del total
                </small>
              </div>
            ))}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Estado de Cuadrillas + Métricas */}
      <CCol lg={6}>
        <CCard className="eco-card h-100">
          <CCardHeader className="eco-card-header">
            <h6 className="fw-bold mb-0">Estado del Personal</h6>
          </CCardHeader>
          <CCardBody>
            <div className="table-responsive">
              <CTable hover className="mb-4">
                <CTableHead>
                  <CTableRow className="table-header-eco">
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">%</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Object.entries(distribucionEstado).map(([estado, cantidad]) => (
                    <CTableRow key={estado}>
                      <CTableDataCell>
                        <CBadge color={getEstadoColor(estado)} className="px-3">{estado}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center fw-bold">{cantidad}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {((cantidad / cuadrillas.length) * 100).toFixed(1)}%
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>

            {/* Resumen de rendimiento */}
            <div className="border rounded p-3 eco-surface">
              <small className="text-muted fw-bold d-block mb-2">RENDIMIENTO</small>
              <CRow className="g-2">
                <CCol xs={6}>
                  <small className="text-muted">Tareas en Curso:</small>
                  <div className="fw-bold">{totalTareas}</div>
                </CCol>
                <CCol xs={6}>
                  <small className="text-muted">Tareas Completadas:</small>
                  <div className="fw-bold text-success">{totalTareasCompletadas}</div>
                </CCol>
                <CCol xs={6}>
                  <small className="text-muted">Capacidad Total:</small>
                  <div className="fw-bold">{totalCapacidad}</div>
                </CCol>
                <CCol xs={6}>
                  <small className="text-muted">Equipos Asignados:</small>
                  <div className="fw-bold text-info">{equipos.length}</div>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Carga de trabajo por cuadrilla */}
      <CCol lg={12}>
        <CCard className="eco-card">
          <CCardHeader className="eco-card-header">
            <h6 className="fw-bold mb-0">Carga de Trabajo por Cuadrilla</h6>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              {cuadrillas.map(c => {
                const pct = calcularPorcentajeCarga(c);
                const eqCount = equipos.filter(e => e.cuadrillaId === c.id).length;
                return (
                  <CCol key={c.id} md={6} lg={4}>
                    <div className="border rounded p-3 eco-surface">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-semibold small">{c.nombre}</div>
                        <CBadge color={getCargaColor(pct)}>{pct}%</CBadge>
                      </div>
                      <CProgress style={{ height: '6px' }} className="mb-2">
                        <CProgressBar value={pct} color={getCargaColor(pct)} />
                      </CProgress>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">
                          {c.tareasActuales?.length || 0}/{c.capacidad} tareas
                        </small>
                        <small className="text-muted">
                          <CIcon icon={cilInbox} size="sm" className="me-1" />
                          {eqCount} eq.
                        </small>
                      </div>
                      {c.tareasCompletadas > 0 && (
                        <small className="text-success d-block mt-1">
                          ✓ {c.tareasCompletadas} completadas
                        </small>
                      )}
                    </div>
                  </CCol>
                );
              })}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CuadrillasGraficos;