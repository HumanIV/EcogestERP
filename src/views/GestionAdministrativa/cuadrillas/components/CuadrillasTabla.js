import React from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell,
  CBadge, CButton, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider,
  CRow, CCol, CFormInput, CInputGroup, CInputGroupText,
  CProgress, CProgressBar, CFormSelect, CAvatar,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSearch, cilPencil, cilTrash,
  cilTask, cilStorage, cilPeople, cilOptions, cilUser, cilInfo, cilClock, cilInbox,
} from '@coreui/icons';
import {
  getEstadoColor, getEstadoLabel, calcularPorcentajeCarga, getCargaColor,
} from '../utils/cuadrillasUtils';

const CuadrillasTabla = ({
  cuadrillas,
  busqueda,
  onBusquedaChange,
  onEditar,
  onEliminar,
  onSolicitarActivo,
  onVerTareas,
  onVerHistorial,
  onAbrirEquipos,
  filtroEstado,
  onFiltroEstadoChange,
  filtroRol,
  onFiltroRolChange,
}) => {
  const opcionesFiltro = [
    { value: '', label: 'Todos los estados' },
    { value: 'activa', label: '● Activas' },
    { value: 'inactiva', label: '● Inactivas' },
    { value: 'ocupada', label: '● Ocupadas' },
    { value: 'mantenimiento', label: '● En Mantenimiento' },
  ];

  const opcionesRol = [
    { value: '', label: 'Todos los tipos' },
    { value: 'OPERATIVO', label: '● Cuadrilla Operativa' },
    { value: 'TECNICO_INSPECTOR', label: '● Inspector Técnico' },
  ];

  return (
    <>
      {/* Barra de filtros */}
      <CRow className="mb-3 g-2 align-items-center">
        <CCol sm={5} lg={4}>
          <CInputGroup size="sm">
            <CInputGroupText className="bg-transparent">
              <CIcon icon={cilSearch} className="text-muted" />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar por nombre, zona o ID..."
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
            {opcionesFiltro.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol sm={3} lg={2}>
          <CFormSelect
            size="sm"
            value={filtroRol || ''}
            onChange={(e) => onFiltroRolChange?.(e.target.value)}
          >
            {opcionesRol.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol sm={3} lg={5} className="text-end">
          <small className="text-muted">
            <CIcon icon={cilPeople} className="me-1" />
            {cuadrillas.length} resultado(s)
          </small>
        </CCol>
      </CRow>

      {/* Tabla o vacío */}
      {cuadrillas.length === 0 ? (
        <div className="text-center py-5">
          <CIcon icon={cilPeople} size="3xl" className="text-muted mb-3 opacity-50" />
          <h6 className="text-muted">No se encontraron cuadrillas</h6>
          <small className="text-muted">Ajusta los filtros o crea una nueva cuadrilla.</small>
        </div>
      ) : (
        <div className="table-responsive">
          <CTable hover align="middle" className="mb-0" borderless>
            <CTableHead>
              <CTableRow className="table-header-eco">
                <CTableHeaderCell style={{ width: '180px' }}>Cuadrilla</CTableHeaderCell>
                <CTableHeaderCell>Zona</CTableHeaderCell>
                <CTableHeaderCell>Supervisor</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '60px', textAlign: 'center' }}>Equipo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell className="text-end" style={{ width: '60px' }}>Acc.</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {cuadrillas.map((c) => {
                const pct = calcularPorcentajeCarga(c);
                const cantIntegrantes = (c.integrantes?.length || 0) + (c.supervisorId ? 1 : 0);
                const puedeEliminar = c.estado !== 'activa' && (c.tareasActuales?.length || 0) === 0;

                return (
                  <CTableRow key={c.id}>
                    {/* Cuadrilla */}
                    <CTableDataCell>
                      <div className="fw-bold text-eco small">{c.id}</div>
                      <CBadge
                        color={c.rol === 'TECNICO_INSPECTOR' ? 'info' : 'secondary'}
                        shape="rounded-pill"
                        className="mt-1 px-2 py-1"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {c.rol === 'TECNICO_INSPECTOR' ? 'Inspector' : 'Operativo'}
                      </CBadge>
                      {c.telefono && (
                        <small className="text-muted d-block">{c.telefono}</small>
                      )}
                      {(c.especialidad && c.especialidad.length > 0) && (
                        <div className="mt-1 d-flex flex-wrap gap-1">
                          {c.especialidad.map(esp => (
                            <CBadge key={esp} color="success" shape="rounded-pill" style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                              {esp.replace(/_/g, ' ')}
                            </CBadge>
                          ))}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Zona */}
                    <CTableDataCell>
                      <CBadge color="info" shape="rounded-pill" className="px-2 py-1">
                        {c.zona?.replace('Zona ', '') || '—'}
                      </CBadge>
                    </CTableDataCell>

                    {/* Supervisor */}
                    <CTableDataCell>
                      {(c.supervisor || c.jefe) ? (
                        <div className="d-flex align-items-center gap-2">
                          <CAvatar size="sm" color="success" textColor="white" className="fw-bold" style={{ fontSize: '0.65rem' }}>
                            {(c.supervisor || c.jefe).charAt(0)}
                          </CAvatar>
                          <small className="fw-semibold">{c.supervisor || c.jefe}</small>
                        </div>
                      ) : (
                        <small className="text-muted fst-italic">Sin asignar</small>
                      )}
                    </CTableDataCell>

                    {/* Equipo */}
                    <CTableDataCell className="text-center">
                      <CBadge color={cantIntegrantes > 0 ? 'dark' : 'light'} className="px-2">
                        <CIcon icon={cilUser} size="sm" className="me-1" />
                        {cantIntegrantes}
                      </CBadge>
                    </CTableDataCell>

                    {/* Estado */}
                    <CTableDataCell>
                      <CBadge color={getEstadoColor(c.estado)} className="px-2 py-1" style={{ fontSize: '0.75rem' }}>
                        {getEstadoLabel(c.estado)}
                      </CBadge>
                    </CTableDataCell>

                    {/* Acciones */}
                    <CTableDataCell className="text-end">
                      <CDropdown alignment="end">
                        <CDropdownToggle color="light" size="sm" caret={false} className="border-0 p-1">
                          <CIcon icon={cilOptions} />
                        </CDropdownToggle>
                        <CDropdownMenu>
                          <CDropdownItem onClick={() => onVerTareas(c)} className="small">
                            <CIcon icon={cilTask} className="me-2 text-info" size="sm" />
                            Ver Tareas ({c.tareasActuales?.length || 0})
                          </CDropdownItem>
                          <CDropdownItem onClick={() => onAbrirEquipos(c)} className="small">
                            <CIcon icon={cilInbox} className="me-2 text-dark" size="sm" />
                            Equipos
                          </CDropdownItem>
                          <CDropdownItem onClick={() => onSolicitarActivo(c)} className="small">
                            <CIcon icon={cilStorage} className="me-2 text-success" size="sm" />
                            Solicitar Material
                          </CDropdownItem>
                          <CDropdownItem onClick={() => onVerHistorial(c)} className="small">
                            <CIcon icon={cilClock} className="me-2 text-secondary" size="sm" />
                            Historial
                          </CDropdownItem>
                          <CDropdownItem onClick={() => onEditar(c)} className="small">
                            <CIcon icon={cilPencil} className="me-2 text-primary" size="sm" />
                            Editar
                          </CDropdownItem>
                          <CDropdownDivider />
                          <CDropdownItem
                            onClick={() => puedeEliminar && onEliminar(c)}
                            disabled={!puedeEliminar}
                            className={`small ${puedeEliminar ? 'text-danger' : 'text-muted'}`}
                          >
                            <CIcon icon={cilTrash} className="me-2" size="sm" />
                            Eliminar
                          </CDropdownItem>
                          {!puedeEliminar && (
                            <div className="px-3 py-1">
                              <small className="text-muted fst-italic" style={{ fontSize: '0.65rem' }}>
                                <CIcon icon={cilInfo} size="sm" className="me-1" />
                                {c.estado === 'activa' ? 'Desactívela primero' : 'Tiene tareas pendientes'}
                              </small>
                            </div>
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
      )}
    </>
  );
};

export default CuadrillasTabla;
