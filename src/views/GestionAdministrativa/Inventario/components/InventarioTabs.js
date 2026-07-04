import React from 'react';
import {
  CNav,
  CNavItem,
  CNavLink
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSpeedometer,
  cilStorage,
  cilTruck,
  cilGraph
} from '@coreui/icons';

const InventarioTabs = ({ activeTab, setActiveTab, metricas }) => {
  const tabs = [
    { id: 'dashboard', icon: cilSpeedometer, label: 'Dashboard', badge: null },
    { id: 'activos', icon: cilStorage, label: 'Activos', badge: metricas?.totalActivos },
    { id: 'movimientos', icon: cilTruck, label: 'Movimientos', badge: null }
  ];

  return (
    <CNav variant="pills" className="border-0 mb-0 flex-nowrap overflow-auto">
      {tabs.map(tab => (
        <CNavItem key={tab.id}>
          <CNavLink
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`fw-semibold px-3 py-2 ${activeTab === tab.id ? 'active bg-success text-white' : 'text-muted'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            <CIcon icon={tab.icon} className="me-1" />
            {tab.label}
            {tab.badge !== null && (
              <span className="badge bg-eco-soft text-success ms-2 px-2 py-1 rounded-pill">
                {tab.badge}
              </span>
            )}
          </CNavLink>
        </CNavItem>
      ))}
    </CNav>
  );
};

export default InventarioTabs;