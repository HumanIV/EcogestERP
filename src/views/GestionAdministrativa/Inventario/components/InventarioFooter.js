import React from 'react';
import { CCard, CCardBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilStorage, cilCalculator, cilWarning } from '@coreui/icons';

const InventarioFooter = ({ metricas }) => {
  return (
    <CCard className="eco-card mt-5">
      <CCardBody className="text-center p-4">
        <div className="stats-pills-container">
          <div className="stats-pill stats-pill-success">
            <CIcon icon={cilStorage} className="me-1" size="sm" />
            <span>{metricas.totalActivos} Activos</span>
          </div>
          <div className="stats-pill stats-pill-success">
            <CIcon icon={cilCalculator} className="me-1" size="sm" />
            <span>${metricas.valorTotalActivos?.toLocaleString() || 0} Valor Total</span>
          </div>
          <div className="stats-pill stats-pill-warning">
            <CIcon icon={cilWarning} className="me-1" size="sm" />
            <span>{metricas.activosMantenimiento} En Mantenimiento</span>
          </div>
        </div>
        <p className="text-muted small mt-3 mb-0">Panel de Gestión de Inventario</p>
      </CCardBody>
    </CCard>
  );
};

export default InventarioFooter;