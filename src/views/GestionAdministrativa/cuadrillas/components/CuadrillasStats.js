import React from 'react';
import { CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPeople, cilCheckCircle, cilTask, cilInbox, cilUser } from '@coreui/icons';

const CuadrillasStats = ({ stats }) => {
  const items = [
    { icon: cilPeople, value: stats.totalCuadrillas, label: 'Total Equipos', color: 'success' },
    { icon: cilCheckCircle, value: stats.activas, label: 'Activos', color: 'success' },
    { icon: cilUser, value: stats.inspectores || 0, label: 'Inspectores', color: 'info' },
    { icon: cilInbox, value: stats.totalEquipos || 0, label: 'Equipos Asignados', color: 'dark' },
  ];

  return (
    <CRow className="g-3 mb-4">
      {items.map((item, idx) => (
        <CCol key={idx} xs={6} lg={3}>
          <div className="eco-card p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 bg-${item.color} bg-opacity-10`} style={{ width: '48px', height: '48px' }}>
              <CIcon icon={item.icon} size="lg" className={`text-${item.color}`} />
            </div>
            <h3 className="mb-0 fw-bold">{item.value}</h3>
            <small className="text-muted fw-semibold">{item.label}</small>
          </div>
        </CCol>
      ))}
    </CRow>
  );
};

export default CuadrillasStats;