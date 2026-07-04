import React from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell,
  CBadge, CButton, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem,
  CFormSelect, CAvatar,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilInfo, cilXCircle, cilOptions, cilTask, cilDescription } from '@coreui/icons';
import { ESTADOS_TRAMITE } from '../../../GestionAdministrativa/Tramites/constants/tramitesConstants';

const getEstadoBadgeColor = (estado) => {
  const found = ESTADOS_TRAMITE.find(e => e.value === estado);
  return found ? found.color : 'secondary';
};

const getEstadoLabel = (estado) => {
  const found = ESTADOS_TRAMITE.find(e => e.value === estado);
  return found ? found.label : estado;
};

const MisTramitesTabla = ({
  tramites,
  filtro,
  onFiltroChange,
  onCancelar,
  onVerDetalle,
}) => {
  const opcionesFiltro = [
    { value: 'todos', label: 'Todos' },
    { value: 'PERMISO', label: 'Solo Permisos' },
    { value: 'LICENCIA', label: 'Solo Licencias' },
    { value: 'REVISION', label: 'En Revisión' },
    { value: 'INSPECCION', label: 'En Inspección' },
    { value: 'APROBADO', label: 'Aprobados' },
    { value: 'RECHAZADO', label: 'Rechazados' },
  ];

  const tramitesFiltrados = tramites.filter(t => {
    if (filtro === 'todos') return true;
    if (filtro === 'PERMISO' || filtro === 'LICENCIA') return t.tipo === filtro;
    return t.estado === filtro;
  });

  if (tramitesFiltrados.length === 0) {
    return (
      <div className="text-center py-5">
        <CIcon icon={cilTask} size="3xl" className="text-muted mb-3 opacity-50" />
        <h6 className="text-muted">
          {tramites.length === 0 ? 'No tienes trámites registrados' : 'No hay resultados para este filtro'}
        </h6>
        <small className="text-muted">
          {tramites.length === 0 ? 'Crea un nuevo trámite para comenzar.' : 'Prueba con otro filtro.'}
        </small>
      </div>
    );
  }

  return (
    <>
      {/* Filtro rápido */}
      <div className="mb-3">
        <CFormSelect size="sm" value={filtro} onChange={(e) => onFiltroChange(e.target.value)}>
          {opcionesFiltro.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </CFormSelect>
      </div>

      <div className="table-responsive">
        <CTable hover align="middle" className="mb-0" borderless>
          <CTableHead>
            <CTableRow className="table-header-eco">
              <CTableHeaderCell style={{ width: '140px' }}>ID</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '100px' }}>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Subtipo</CTableHeaderCell>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Inspector</CTableHeaderCell>
              <CTableHeaderCell className="text-end" style={{ width: '60px' }}>Acc.</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tramitesFiltrados.map((t) => {
              const puedeCancelar = ['BORRADOR', 'REVISION'].includes(t.estado);
              return (
                <CTableRow key={t.id}>
                  <CTableDataCell>
                    <div className="fw-bold text-eco small">{t.id}</div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={t.tipo === 'PERMISO' ? 'primary' : 'info'}
                      shape="rounded-pill"
                      className="px-2 py-1"
                    >
                      <CIcon icon={t.tipo === 'PERMISO' ? cilTask : cilDescription} size="sm" className="me-1" />
                      {t.tipo === 'PERMISO' ? 'Permiso' : 'Licencia'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small>{t.subtipo || '—'}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small className="text-muted">{t.fechaSolicitud || '—'}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getEstadoBadgeColor(t.estado)} className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
                      {getEstadoLabel(t.estado)}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {t.inspectorNombre ? (
                      <div className="d-flex align-items-center gap-1">
                        <CAvatar size="sm" color="info" textColor="white" className="fw-bold" style={{ fontSize: '0.55rem' }}>
                          {t.inspectorNombre.charAt(0)}
                        </CAvatar>
                        <small>{t.inspectorNombre}</small>
                      </div>
                    ) : (
                      <small className="text-muted fst-italic">Pendiente</small>
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <CDropdown alignment="end">
                      <CDropdownToggle color="light" size="sm" caret={false} className="border-0 p-1">
                        <CIcon icon={cilOptions} />
                      </CDropdownToggle>
                      <CDropdownMenu>
                        <CDropdownItem onClick={() => onVerDetalle(t)} className="small">
                          <CIcon icon={cilInfo} className="me-2 text-info" size="sm" />
                          Ver Detalle
                        </CDropdownItem>
                        {puedeCancelar && (
                          <CDropdownItem onClick={() => onCancelar(t.id)} className="small text-danger">
                            <CIcon icon={cilXCircle} className="me-2" size="sm" />
                            Cancelar
                          </CDropdownItem>
                        )}
                      </CDropdownMenu>
                    </CDropdown>
                  </CTableDataCell>
                </CTableRow>
              );
            })}
          </CTableBody>
        </CTable>
      </div>
    </>
  );
};

export default MisTramitesTabla;
