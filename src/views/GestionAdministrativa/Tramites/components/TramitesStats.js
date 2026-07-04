import React from 'react';
import { CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTask, cilDescription, cilCheckCircle, cilWarning, cilClock } from '@coreui/icons';

const TramitesStats = ({ estadisticas }) => {
  const items = [
    { icon: cilTask, value: estadisticas.total || 0, label: 'Total Trámites', color: 'primary' },
    { icon: cilDescription, value: estadisticas.porTipo?.LICENCIA || 0, label: 'Licencias', color: 'info' },
    { icon: cilClock, value: estadisticas.pendientes || 0, label: 'Pendientes', color: 'warning' },
    { icon: cilCheckCircle, value: estadisticas.aprobados || 0, label: 'Aprobados', color: 'success' },
  ];

  return (
    <CRow className="g-3 mb-4">
      {items.map((item, idx) => (
        <CCol key={idx} xs={6} lg={3}>
          <div className="eco-card p-4 h-100 position-relative overflow-hidden hover-lift">
            <div className="position-absolute" style={{ right: '-15px', bottom: '-15px', opacity: 0.1 }}>
              <CIcon icon={item.icon} size="5xl" className={`text-${item.color}`} />
            </div>
            <div className="d-flex justify-content-between align-items-start position-relative z-1">
              <div>
                <small className="text-muted fw-semibold text-uppercase tracking-wider">
                  {item.label}
                </small>
                <h3 className="mb-0 fw-bold mt-1 text-dark fs-2">{item.value}</h3>
              </div>
              <div className={`p-2 rounded-3 bg-${item.color} bg-opacity-10 text-${item.color}`}>
                <CIcon icon={item.icon} size="lg" />
              </div>
            </div>
          </div>
        </CCol>
      ))}
    </CRow>
  );
};

export default TramitesStats;
