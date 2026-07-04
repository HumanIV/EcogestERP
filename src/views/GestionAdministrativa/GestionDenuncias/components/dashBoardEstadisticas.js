import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CProgress,
  CProgressBar,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CWidgetStatsF,
  CButton
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilWarning,
  cilCheckCircle,
  cilClock,
  cilChartLine,
  cilMap,
  cilFire,
  cilCalendar,
  cilLocationPin
} from '@coreui/icons';

const DashboardEstadisticas = ({ estadisticas, denuncias, filtros }) => {
  // Datos para gráficos
  const datosTipos = denuncias.reduce((acc, d) => {
    acc[d.tipo] = (acc[d.tipo] || 0) + 1;
    return acc;
  }, {});
  const datosTiposArray = Object.entries(datosTipos);
  const datosEstados = [
    { estado: 'Pendientes', cantidad: estadisticas.pendientes || 0 },
    { estado: 'Investigando', cantidad: estadisticas.investigando || 0 },
    { estado: 'Asignadas', cantidad: estadisticas.asignada || 0 },
    { estado: 'En Proceso', cantidad: estadisticas.en_proceso || 0 },
    { estado: 'Resueltas', cantidad: estadisticas.resuelta || 0 }
  ];

  // Top municipios con más denuncias
  const topMunicipios = denuncias.reduce((acc, d) => {
    const key = `${d.municipio}, ${d.estadoUbicacion}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const top5Municipios = Object.entries(topMunicipios)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="animate-fade-eco">
      {/* KPI Cards - Estilo MINEC */}
      <CRow className="g-4 mb-4">
        <CCol xs={6} md={3}>
          <CCard className="stats-card-minec h-100">
            <CCardBody className="text-center">
              <div className="stats-icon-minec mx-auto mb-3">
                <CIcon icon={cilWarning} />
              </div>
              <h4 className="fw-bold text-eco mb-2">{estadisticas.total || 0}</h4>
              <h6 className="text-minec-muted fw-semibold mb-0">Total Denuncias</h6>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} md={3}>
          <CCard className="stats-card-minec h-100">
            <CCardBody className="text-center">
              <div className="stats-icon-minec mx-auto mb-3 bg-warning">
                <CIcon icon={cilClock} />
              </div>
              <h4 className="fw-bold text-warning mb-2">{estadisticas.pendientes || 0}</h4>
              <h6 className="text-minec-muted fw-semibold mb-0">Pendientes</h6>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} md={3}>
          <CCard className="stats-card-minec h-100">
            <CCardBody className="text-center">
              <div className="stats-icon-minec mx-auto mb-3 bg-danger">
                <CIcon icon={cilFire} />
              </div>
              <h4 className="fw-bold text-danger mb-2">{estadisticas.altaPrioridad || 0}</h4>
              <h6 className="text-minec-muted fw-semibold mb-0">Alta Prioridad</h6>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} md={3}>
          <CCard className="stats-card-minec h-100">
            <CCardBody className="text-center">
              <div className="stats-icon-minec mx-auto mb-3 bg-success">
                <CIcon icon={cilCheckCircle} />
              </div>
              <h4 className="fw-bold text-success mb-2">{estadisticas.resuelta || 0}</h4>
              <h6 className="text-minec-muted fw-semibold mb-0">Resueltas</h6>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4">
        {/* Gráfico de Estados - Estilo MINEC */}
        <CCol lg={6}>
          <CCard className="eco-card h-100">
            <CCardHeader className="eco-card-header">
              <h5 className="fw-bold text-montserrat mb-0 d-flex align-items-center">
                <CIcon icon={cilChartLine} className="me-2 text-eco" />
                Distribución por Estado
              </h5>
            </CCardHeader>
            <CCardBody>
              <div className="mb-4">
                {datosEstados.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-semibold text-minec-muted">{item.estado}</span>
                      <span className="fw-bold">{item.cantidad}</span>
                    </div>
                    <CProgress className="mb-2" style={{ height: '8px' }}>
                      <CProgressBar 
                        value={(item.cantidad / (estadisticas.total || 1)) * 100}
                        color={getColorEstado(item.estado)}
                      />
                    </CProgress>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <CBadge color="info" className="badge-eco">
                  <CIcon icon={cilCalendar} className="me-1" />
                  Tiempo promedio resolución: {estadisticas.tiempoPromedioResolucion || 0} días
                </CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Top Municipios - Estilo MINEC */}
        <CCol lg={6}>
          <CCard className="eco-card h-100">
            <CCardHeader className="eco-card-header">
              <h5 className="fw-bold text-montserrat mb-0 d-flex align-items-center">
                <CIcon icon={cilMap} className="me-2 text-success" />
                Zonas con Mayor Incidencia
              </h5>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive className="table-minec align-middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Municipio</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Denuncias</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">%</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {top5Municipios.map(([municipio, cantidad], index) => (
                    <CTableRow key={index} className="align-middle">
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <div className="stats-icon-minec-sm bg-eco-soft me-3">
                            <CIcon icon={cilLocationPin} className="text-eco" />
                          </div>
                          <div>
                            <div className="fw-semibold">{municipio.split(',')[0]}</div>
                            <small className="text-minec-muted">{municipio.split(',')[1]}</small>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-end fw-bold">{cantidad}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CBadge color="primary" className="badge-eco">
                          {((cantidad / (estadisticas.total || 1)) * 100).toFixed(1)}%
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <div className="text-center mt-3">
                <CBadge color="success" className="badge-eco">
                  <CIcon icon={cilFire} className="me-1" />
                  Zonas activas: {estadisticas.zonasActivas || 0}
                </CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabla de Tipos de Denuncias - Estilo MINEC */}
      <CCard className="eco-card mt-4">
        <CCardHeader className="eco-card-header">
          <h5 className="fw-bold text-montserrat mb-0">
            📊 Análisis por Tipo de Denuncia
          </h5>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-4">
            {datosTiposArray.map(([tipo, cantidad], index) => (
              <CCol xs={6} md={4} lg={3} key={index}>
                <div className="stats-card-minec text-center h-100">
                  <div className={`stats-icon-minec-sm bg-${getTipoColor(tipo)}-soft mx-auto mb-3`}>
                    <span className="fs-4">{getTipoIcon(tipo)}</span>
                  </div>
                  <h6 className="fw-bold mb-1 text-eco">{getTipoLabel(tipo)}</h6>
                  <div className="fw-bold display-6 mb-2 text-eco">
                    {cantidad}
                  </div>
                  <small className="text-minec-muted fw-info">
                    {((cantidad / (estadisticas.total || 1)) * 100).toFixed(1)}% del total
                  </small>
                </div>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>

      {/* Resumen de filtros aplicados */}
      <CCard className="eco-card mt-4">
        <CCardHeader className="eco-card-header">
          <h5 className="fw-bold text-montserrat mb-0">
            🔍 Filtros Activos
          </h5>
        </CCardHeader>
        <CCardBody className="eco-surface">
          <CRow className="g-2">
            {filtros.estado !== 'todas' && (
              <CCol xs="auto">
                <CBadge color="primary" className="badge-eco">
                  Estado: {filtros.estado}
                </CBadge>
              </CCol>
            )}
            {filtros.prioridad !== 'todas' && (
              <CCol xs="auto">
                <CBadge color="warning" className="badge-eco">
                  Prioridad: {filtros.prioridad}
                </CBadge>
              </CCol>
            )}
            {filtros.fechaDesde && (
              <CCol xs="auto">
                <CBadge color="info" className="badge-eco">
                  Desde: {filtros.fechaDesde}
                </CBadge>
              </CCol>
            )}
            {filtros.fechaHasta && (
              <CCol xs="auto">
                <CBadge color="info" className="badge-eco">
                  Hasta: {filtros.fechaHasta}
                </CBadge>
              </CCol>
            )}
            <CCol xs="auto">
              <CBadge color="success" className="badge-eco">
                Mostrando {denuncias.length} resultados
              </CBadge>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};

// Funciones auxiliares
const getColorEstado = (estado) => {
  const colores = {
    'Pendientes': 'warning',
    'Investigando': 'info',
    'Asignadas': 'primary',
    'En Proceso': 'primary',
    'Resueltas': 'success'
  };
  return colores[estado] || 'secondary';
};

const getTipoIcon = (tipo) => {
  const iconos = {
    deforestacion: '🌳',
    contaminacion_agua: '💧',
    contaminacion_aire: '💨',
    fauna_silvestre: '🐾',
    residuos_solidos: '🗑️',
    mineria_ilegal: '⛏️',
    urbanismo: '🏗️',
    otros: '📝'
  };
  return iconos[tipo] || '📋';
};

const getTipoColor = (tipo) => {
  const colores = {
    deforestacion: 'success',
    contaminacion_agua: 'info',
    contaminacion_aire: 'warning',
    fauna_silvestre: 'danger',
    residuos_solidos: 'secondary',
    mineria_ilegal: 'dark',
    urbanismo: 'primary',
    otros: 'light'
  };
  return colores[tipo] || 'primary';
};

const getTipoLabel = (tipo) => {
  const labels = {
    deforestacion: 'Deforestación',
    contaminacion_agua: 'Contaminación Agua',
    contaminacion_aire: 'Contaminación Aire',
    fauna_silvestre: 'Fauna Silvestre',
    residuos_solidos: 'Residuos Sólidos',
    mineria_ilegal: 'Minería Ilegal',
    urbanismo: 'Urbanismo',
    otros: 'Otros'
  };
  return labels[tipo] || tipo;
};

export default DashboardEstadisticas;