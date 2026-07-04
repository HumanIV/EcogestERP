import React from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell,
  CBadge, CButton, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider,
  CRow, CCol, CFormInput, CInputGroup, CInputGroupText,
  CFormSelect, CAvatar, CTabs, CNav, CNavItem, CNavLink, CTabContent, CTabPane,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSearch, cilPencil, cilTrash, cilOptions, cilUser, cilInfo, cilTask, cilDescription,
} from '@coreui/icons';
import { ESTADOS_TRAMITE } from '../constants/tramitesConstants';

const getEstadoBadgeColor = (estado) => {
  const found = ESTADOS_TRAMITE.find(e => e.value === estado);
  return found ? found.color : 'secondary';
};

const getEstadoLabel = (estado) => {
  const found = ESTADOS_TRAMITE.find(e => e.value === estado);
  return found ? found.label : estado;
};

const TramitesTabla = ({
  tramites,
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstadoChange,
  filtroTipo,
  onFiltroTipoChange,
  onEditar,
  onEliminar,
  onVerDetalle,
  onCambiarEstado,
  onAsignarInspector,
}) => {
  const opcionesEstado = [
    { value: '', label: 'Todos los estados' },
    ...ESTADOS_TRAMITE.map(e => ({ value: e.value, label: e.label })),
  ];

  return (
    <>
      {/* Tabs de tipo */}
      <CTabs activeKey={filtroTipo || 'todos'} onActiveKeyChange={(key) => onFiltroTipoChange?.(key)}>
        <CNav variant="pills" className="mb-3">
          <CNavItem>
            <CNavLink
              active={filtroTipo === 'todos'}
              onClick={() => onFiltroTipoChange?.('todos')}
              className="fw-semibold"
            >
              <CIcon icon={cilTask} className="me-2" />
              Todos
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={filtroTipo === 'PERMISO'}
              onClick={() => onFiltroTipoChange?.('PERMISO')}
              className="fw-semibold"
            >
              <CIcon icon={cilTask} className="me-2" />
              Permisos
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={filtroTipo === 'LICENCIA'}
              onClick={() => onFiltroTipoChange?.('LICENCIA')}
              className="fw-semibold"
            >
              <CIcon icon={cilDescription} className="me-2" />
              Licencias
            </CNavLink>
          </CNavItem>
        </CNav>
      </CTabs>

      {/* Filtros */}
      <CRow className="mb-3 g-2 align-items-center">
        <CCol sm={5} lg={4}>
          <CInputGroup size="sm">
            <CInputGroupText className="bg-transparent">
              <CIcon icon={cilSearch} className="text-muted" />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar por solicitante, ID, cédula..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
          </CInputGroup>
        </CCol>
        <CCol sm={4} lg={3}>
          <CFormSelect
            size="sm"
            value={filtroEstado || ''}
            onChange={(e) => onFiltroEstadoChange?.(e.target.value)}
          >
            {opcionesEstado.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol sm={3} lg={5} className="text-end">
          <small className="text-muted">
            <CIcon icon={cilTask} className="me-1" />
            {tramites.length} resultado(s)
          </small>
        </CCol>
      </CRow>

      {/* Tabla o vacío */}
      {tramites.length === 0 ? (
        <div className="text-center py-5">
          <CIcon icon={cilTask} size="3xl" className="text-muted mb-3 opacity-50" />
          <h6 className="text-muted">No se encontraron trámites</h6>
          <small className="text-muted">Ajusta los filtros o crea un nuevo trámite.</small>
        </div>
      ) : (
        <div className="table-responsive">
          <CTable hover align="middle" className="mb-0" borderless>
            <CTableHead>
              <CTableRow className="table-header-eco">
                <CTableHeaderCell style={{ width: '140px' }}>ID</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px' }}>Tipo</CTableHeaderCell>
                <CTableHeaderCell>Solicitante</CTableHeaderCell>
                <CTableHeaderCell>Subtipo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Inspector</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell className="text-end" style={{ width: '60px' }}>Acc.</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {tramites.map((t) => {
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
                      <div className="d-flex align-items-center gap-2">
                        <CAvatar size="sm" color={t.tipo === 'PERMISO' ? 'primary' : 'info'} textColor="white" className="fw-bold" style={{ fontSize: '0.65rem' }}>
                          {t.solicitante?.charAt(0)}
                        </CAvatar>
                        <div>
                          <small className="fw-semibold">{t.solicitante}</small>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{t.cedulaRif}</small>
                        </div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <small>{t.subtipo || '—'}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getEstadoBadgeColor(t.estado)} className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
                        {getEstadoLabel(t.estado)}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {t.inspectorNombre ? (
                        <div className="d-flex align-items-center gap-1">
                          <CIcon icon={cilUser} size="sm" className="text-info" />
                          <small>{t.inspectorNombre}</small>
                        </div>
                      ) : (
                        <small className="text-muted fst-italic">Sin asignar</small>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <small className="text-muted">{t.fechaSolicitud || '—'}</small>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <CButton color="info" variant="ghost" size="sm" onClick={() => onVerDetalle(t)} title="Ver Detalle" className="p-1">
                          <CIcon icon={cilInfo} size="lg" />
                        </CButton>
                        <CButton color="primary" variant="ghost" size="sm" onClick={() => onEditar(t)} title="Editar" className="p-1">
                          <CIcon icon={cilPencil} size="lg" />
                        </CButton>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => onEliminar(t)} title="Eliminar" className="p-1">
                          <CIcon icon={cilTrash} size="lg" />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                );
              })}
            </CTableBody>
          </CTable>
        </div>
      )}
    </>
  );
};

export default TramitesTabla;
