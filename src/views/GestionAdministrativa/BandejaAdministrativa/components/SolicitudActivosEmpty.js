import React from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilCursorMove } from '@coreui/icons';

const SolicitudActivosEmpty = () => {
  return (
    <div className="text-center py-5">
      <CIcon icon={cilCursorMove} size="4xl" className="text-muted mb-3" />
      <h6 className="text-muted">No hay solicitudes registradas</h6>
      <p className="text-muted small">
        Crea una nueva solicitud, o espera a que las cuadrillas/inventario envíen una.
      </p>
    </div>
  );
};

export default SolicitudActivosEmpty;
