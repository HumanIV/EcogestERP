import React from 'react';
import { CRow, CCol, CCard, CCardBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilClipboard, cilWarning, cilCheckCircle, cilXCircle } from '@coreui/icons';

const SolicitudActivosStats = ({ estadisticas }) => {
  return (
    <CRow className="mb-4">
      <CCol md={3}>
        <CCard className="eco-card text-center">
          <CCardBody>
            <CIcon icon={cilClipboard} size="2xl" className="text-warning mb-2" />
            <h3 className="mb-1">{estadisticas.total}</h3>
            <small className="text-muted">Total Solicitudes</small>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={3}>
        <CCard className="eco-card text-center">
          <CCardBody>
            <CIcon icon={cilWarning} size="2xl" className="text-warning mb-2" />
            <h3 className="mb-1">{estadisticas.pendientes}</h3>
            <small className="text-muted">Pendientes</small>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={3}>
        <CCard className="eco-card text-center">
          <CCardBody>
            <CIcon icon={cilCheckCircle} size="2xl" className="text-success mb-2" />
            <h3 className="mb-1">{estadisticas.aprobados}</h3>
            <small className="text-muted">Aprobados</small>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={3}>
        <CCard className="eco-card text-center">
          <CCardBody>
            <CIcon icon={cilXCircle} size="2xl" className="text-danger mb-2" />
            <h3 className="mb-1">{estadisticas.rechazados}</h3>
            <small className="text-muted">Rechazados</small>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default SolicitudActivosStats;
