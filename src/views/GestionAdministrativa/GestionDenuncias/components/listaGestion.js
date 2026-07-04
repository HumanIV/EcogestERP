// components/listaGestion.js - VERSIÓN CON ESTILOS MINEC
import React, { useState } from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormSelect,
  CSpinner,
  CTooltip,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
  CCard,
  CCardBody
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilCircle,
  cilPencil,
  cilTrash,
  cilCheckCircle,
  cilClock,
  cilWarning,
  cilLocationPin,
  cilCalendar,
  cilUser,
  cilSend,
  cilShare,
  cilArrowRight,
  cilInfo,
  cilSearch,
  cilFilter,
} from '@coreui/icons';

// Importar desde utils CORREGIDO
import { formatearFecha, getTipoLabel } from '../utils/gestionUtils';
import useConfirmModal from '../../../usuarios/_shared/useConfirmModal';
import useToast from '../../../usuarios/_shared/useToast';

const ListaGestion = ({ 
  denuncias, 
  cuadrillas = [],
  loading, 
  onSelectDenuncia, 
  onEstadoChange, 
  onAsignar 
}) => {
  const { confirm, ConfirmModal } = useConfirmModal();
  const { showToast } = useToast();
  
  const [deleting, setDeleting] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const getPrioridadBadge = (prioridad) => {
    const config = {
      alta: { 
        color: 'danger', 
        icon: '🚨', 
        text: 'Alta',
        class: 'bg-danger bg-opacity-10 text-danger border-danger border'
      },
      media: { 
        color: 'warning', 
        icon: '⚠️', 
        text: 'Media',
        class: 'bg-warning bg-opacity-10 text-warning border-warning border'
      },
      baja: { 
        color: 'success', 
        icon: '🌿', 
        text: 'Baja',
        class: 'bg-success bg-opacity-10 text-success border-success border'
      }
    };
    const item = config[prioridad] || { 
      color: 'secondary', 
      icon: '📊', 
      text: prioridad,
      class: 'bg-secondary bg-opacity-10 text-secondary border-secondary border'
    };
    
    return (
      <div className={`badge ${item.class} px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1`}>
        <span className="fs-6">{item.icon}</span>
        <span>{item.text}</span>
      </div>
    );
  };

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: { 
        color: 'warning', 
        icon: cilClock, 
        text: 'Pendiente',
        class: 'bg-warning bg-opacity-10 text-warning border-warning border'
      },
      investigando: { 
        color: 'info', 
        icon: cilSearch, 
        text: 'Investigando',
        class: 'bg-info bg-opacity-10 text-info border-info border'
      },
      asignada: { 
        color: 'primary', 
        icon: cilUser, 
        text: 'Asignada',
        class: 'bg-primary bg-opacity-10 text-primary border-primary border'
      },
      en_proceso: { 
        color: 'dark', 
        icon: cilPencil, 
        text: 'En Proceso',
        class: 'bg-dark bg-opacity-10 text-dark border-dark border'
      },
      resuelta: { 
        color: 'success', 
        icon: cilCheckCircle, 
        text: 'Resuelta',
        class: 'bg-success bg-opacity-10 text-success border-success border'
      }
    };
    const item = config[estado] || { 
      color: 'secondary', 
      icon: cilInfo, 
      text: estado,
      class: 'bg-secondary bg-opacity-10 text-secondary border-secondary border'
    };
    
    return (
      <div className={`badge ${item.class} px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1`}>
        <CIcon icon={item.icon} size="sm" className="me-1" />
        <span>{item.text}</span>
      </div>
    );
  };

  const getTipoIcon = (tipo) => {
    const iconos = {
      deforestacion: '🌳',
      contaminacion_agua: '💧',
      contaminacion_aire: '💨',
      fauna_silvestre: '🐾',
      residuos_solidos: '🗑️',
      mineria_ilegal: '⛏️',
      urbanismo: '🏗️',
      otros: '📝'
    };
    return iconos[tipo] || '📋';
  };

  const getTipoColor = (tipo) => {
    const colores = {
      deforestacion: 'success',
      contaminacion_agua: 'info',
      contaminacion_aire: 'warning',
      fauna_silvestre: 'danger',
      residuos_solidos: 'secondary',
      mineria_ilegal: 'dark',
      urbanismo: 'primary',
      otros: 'light'
    };
    return colores[tipo] || 'primary';
  };

  const getTipoClass = (tipo) => {
    const classes = {
      deforestacion: 'bg-success bg-opacity-10 border-success',
      contaminacion_agua: 'bg-info bg-opacity-10 border-info',
      contaminacion_aire: 'bg-warning bg-opacity-10 border-warning',
      fauna_silvestre: 'bg-danger bg-opacity-10 border-danger',
      residuos_solidos: 'bg-secondary bg-opacity-10 border-secondary',
      mineria_ilegal: 'bg-dark bg-opacity-10 border-dark',
      urbanismo: 'bg-primary bg-opacity-10 border-primary',
      otros: 'eco-surface border'
    };
    return classes[tipo] || 'bg-primary bg-opacity-10 border-primary';
  };

  const denunciasFiltradas = filtroEstado === 'todos' 
    ? denuncias 
    : denuncias.filter(d => d.estado === filtroEstado);


  const cambiarEstadoRapido = async (denunciaId, nuevoEstado) => {
    const ok = await confirm(
      'Cambiar estado',
      `¿Cambiar estado a "${nuevoEstado}"?`,
      { confirmLabel: 'Cambiar', cancelLabel: 'Cancelar', variant: 'warning', icon: cilPencil }
    );
    if (ok) {
      const estadoLabels = {
        investigando: 'Investigando',
        en_proceso: 'En Proceso',
        resuelta: 'Resuelta',
        eliminada: 'Eliminada'
      };
      onEstadoChange(denunciaId, nuevoEstado);
      showToast('Estado actualizado', `Denuncia cambiada a "${estadoLabels[nuevoEstado] || nuevoEstado}"`, 'success');
    }
  };

  const handleDelete = async (denunciaId) => {
    const ok = await confirm(
      'Eliminar denuncia',
      '¿Estás seguro de eliminar esta denuncia? Esta acción no se puede deshacer.',
      { confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', variant: 'danger', icon: cilTrash }
    );
    if (ok) {
      onEstadoChange(denunciaId, 'eliminada');
    }
  };

  const getCuadrillaColor = (cuadrillaId) => {
    const colores = ['primary', 'success', 'warning', 'danger', 'info', 'secondary'];
    const idx = cuadrillas.findIndex(c => c.id === cuadrillaId);
    return idx >= 0 ? colores[idx % colores.length] : 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="text-muted mt-3 fw-medium">Cargando denuncias...</p>
      </div>
    );
  }

  if (!denuncias || denuncias.length === 0) {
    return (
      <CCard className="eco-card border-0 shadow-sm">
        <CCardBody className="text-center py-5">
          <div className="bg-eco-soft rounded-circle p-4 d-inline-block mb-4">
            <CIcon icon={cilInfo} size="xxl" className="text-eco" />
          </div>
          <h4 className="text-muted fw-semibold mb-2">No hay denuncias disponibles</h4>
          <p className="text-minec-muted mb-4">Prueba con otros filtros de búsqueda o crea una nueva denuncia.</p>
          <CButton 
            color="primary" 
            className="btn-minec fw-semibold"
            onClick={() => showToast('Crear denuncia', 'Función de creación de denuncia en desarrollo', 'info')}
          >
            <CIcon icon={cilPencil} className="me-2" />
            Crear primera denuncia
          </CButton>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <>
      <CCard className="eco-card border-0 shadow-sm">
        <CCardBody className="p-0">
          {/* Filtros rápidos */}
          <div className="eco-surface p-4 border-bottom">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="fw-bold text-montserrat mb-0 d-flex align-items-center">
                  <CIcon icon={cilFilter} className="me-2 text-eco" />
                  Gestión de Denuncias
                  <CBadge color="primary" className="ms-2">
                    {denunciasFiltradas.length} registros
                  </CBadge>
                </h5>
                <small className="text-minec-muted">
                  Sistema de seguimiento y gestión ambiental
                </small>
              </div>
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-eco-soft border-0">
                    <CIcon icon={cilFilter} />
                  </span>
                  <CFormSelect 
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="input-minec border-0"
                  >
                    <option value="todos">📋 Todos los estados</option>
                    <option value="pendiente">⏳ Pendientes</option>
                    <option value="investigando">🔍 Investigando</option>
                    <option value="asignada">👤 Asignadas</option>
                    <option value="en_proceso">⚙️ En Proceso</option>
                    <option value="resuelta">✅ Resueltas</option>
                  </CFormSelect>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="table-responsive">
            <CTable hover responsive className="table-minec align-middle mb-0">
              <CTableHead className="bg-eco-soft">
                <CTableRow>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilCircle} className="me-2" />
                      ID Denuncia
                    </div>
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Título / Descripción
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Tipo
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Ubicación
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Prioridad
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Cuadrilla
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Estado
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3">
                    Fecha
                  </CTableHeaderCell>
                  <CTableHeaderCell className="fw-bold text-uppercase text-eco border-0 py-3 text-end">
                    Acciones
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {denunciasFiltradas.map((denuncia, index) => (
                  <CTableRow 
                    key={denuncia.id} 
                    className={`border-bottom ${index % 2 === 0 ? 'eco-surface' : ''} hover-effect`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectDenuncia(denuncia)}
                  >
                    <CTableDataCell className="py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <span className="text-primary fw-bold">#{denuncia.id.split('-')[1]}</span>
                        </div>
                        <div>
                          <div className="fw-bold text-primary">{denuncia.id}</div>
                          <small className="text-minec-muted">Código único</small>
                        </div>
                      </div>
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      <div className="fw-semibold mb-1" style={{ maxWidth: '200px' }}>
                        {denuncia.titulo}
                      </div>
                      <small className="text-minec-muted d-block" style={{ maxWidth: '200px' }}>
                        {denuncia.descripcion?.substring(0, 60)}...
                      </small>
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      <div className="d-flex align-items-center">
                        <div className={`${getTipoClass(denuncia.tipo)} rounded-circle p-2 me-3`}>
                          <span className="fs-5">{getTipoIcon(denuncia.tipo)}</span>
                        </div>
                        <div>
                          <div className="small fw-semibold">{getTipoLabel(denuncia.tipo)}</div>
                          <small className="text-minec-muted">Tipo ambiental</small>
                        </div>
                      </div>
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                          <CIcon icon={cilLocationPin} className="text-info" />
                        </div>
                        <div>
                          <div className="small fw-semibold">{denuncia.municipio}</div>
                          <small className="text-minec-muted">{denuncia.estadoUbicacion}</small>
                        </div>
                      </div>
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      {getPrioridadBadge(denuncia.prioridad)}
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3" onClick={(e) => e.stopPropagation()}>
                      {denuncia.cuadrillaId ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className={`rounded-circle p-1`} style={{ width: '8px', height: '8px', backgroundColor: 'var(--cui-success, #1b9e3e)' }}></div>
                          <div>
                            <div className="small fw-semibold">{denuncia.cuadrillaId}</div>
                            <small className="text-minec-muted">
                              {(() => {
                                const c = cuadrillas.find(q => q.id === denuncia.cuadrillaId);
                                return c ? c.zona || c.nombre : '';
                              })()}
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <div className={`rounded-circle p-1`} style={{ width: '8px', height: '8px', backgroundColor: 'var(--cui-warning, #f9b115)' }}></div>
                          <span className="small text-muted fw-semibold">Sin asignar</span>
                        </div>
                      )}
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      <div className="d-flex flex-column gap-2">
                        {getEstadoBadge(denuncia.estado)}
                      </div>
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-3">
                          <CIcon icon={cilCalendar} className="text-secondary" />
                        </div>
                        <div>
                          <div className="small fw-semibold">{formatearFecha(denuncia.fecha)}</div>
                          <small className="text-minec-muted">Registro</small>
                        </div>
                      </div>
                    </CTableDataCell>
                    
                    <CTableDataCell className="py-3">
                      <div className="d-flex justify-content-end gap-2">
                        <CTooltip content="Ver detalles">
                          <CButton 
                            color="outline-primary" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDenuncia(denuncia);
                            }}
                            className="btn-icon-minec rounded-circle"
                          >
                            <CIcon icon={cilInfo} />
                          </CButton>
                        </CTooltip>
                        
                        <div onClick={(e) => e.stopPropagation()}>
                          <CButton
                            color="outline-danger"
                            size="sm"
                            className="btn-icon-minec rounded-circle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(denuncia.id);
                            }}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* Pie de tabla */}
          {denunciasFiltradas.length > 0 && (
            <div className="eco-surface p-3 border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-minec-muted">
                    Mostrando {denunciasFiltradas.length} de {denuncias.length} denuncias
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <CButton 
                    color="outline-primary" 
                    size="sm" 
                    className="btn-minec-outline fw-medium"
                  >
                    <CIcon icon={cilShare} className="me-1" />
                    Exportar
                  </CButton>
                  <CButton 
                    color="primary" 
                    size="sm"
                    className="btn-minec fw-medium"
                  >
                    <CIcon icon={cilSend} className="me-1" />
                    Generar Reporte
                  </CButton>
                </div>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>



      {ConfirmModal()}
      </>
  );
};

export default ListaGestion;