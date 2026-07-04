import React from 'react';
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBell, cilWarning } from '@coreui/icons';

const InventarioAlertas = ({ alertas, onVerTodas }) => {
  if (!alertas || alertas.length === 0) return null;

  return (
    <CCard className="eco-card mb-4 border-warning">
      <CCardBody className="p-3">
        <div className="d-flex align-items-center">
          <CIcon icon={cilBell} className="text-warning me-3" size="lg" />
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">Alertas del Sistema</h6>
            <div className="d-flex gap-3 flex-wrap">
              {alertas.slice(0, 3).map(alerta => (
                <CBadge
                  key={alerta.id}
                  color={alerta.nivel === 'alta' ? 'danger' : alerta.nivel === 'media' ? 'warning' : 'info'}
                  className="px-3 py-2"
                >
                  <CIcon icon={cilWarning} className="me-1" />
                  {alerta.mensaje}
                </CBadge>
              ))}
            </div>
          </div>
          {onVerTodas && (
            <CButton size="sm" color="warning" variant="outline" onClick={onVerTodas}>
              Ver Todas
            </CButton>
          )}
        </div>
      </CCardBody>
    </CCard>
  );
};

export default InventarioAlertas;