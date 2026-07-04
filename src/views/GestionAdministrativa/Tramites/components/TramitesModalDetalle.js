import React, { useState } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CRow, CCol, CBadge, CFormSelect, CCard, CCardBody,
  CProgress, CProgressBar, CListGroup, CListGroupItem, CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilTask, cilDescription, cilUser, cilPhone, cilLocationPin,
  cilEnvelopeOpen, cilFile, cilClock, cilCheckCircle, cilArrowBottom, cilXCircle,
  cilInfo, cilMap, cilPencil, cilHistory, cilShieldAlt
} from '@coreui/icons';
import { ESTADOS_TRAMITE } from '../constants/tramitesConstants';
import useConfirmModal from '../../../usuarios/_shared/useConfirmModal';

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '—';
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(fecha);
};

const TramitesModalDetalle = ({
  visible,
  onClose,
  tramite,
  onEstadoChange,
  onAsignarInspector,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const { ConfirmModal, confirm } = useConfirmModal();
  const [inspectorSeleccionado, setInspectorSeleccionado] = useState('');

  // Reset tab when opening a different tramite
  React.useEffect(() => {
    if (visible) setActiveTab('general');
  }, [visible, tramite?.id]);

  if (!tramite) return null;

  const handleAccion = async (accion, nuevoEstado) => {
    const ok = await confirm(
      `Confirmar: ${accion}`,
      `¿Estás seguro de que deseas ${accion.toLowerCase()} este trámite?`,
      { confirmLabel: 'Confirmar', variant: 'primary' }
    );
    if (ok) {
      onEstadoChange(tramite.id, nuevoEstado);
    }
  };

  const handleAsignar = async () => {
    if (!inspectorSeleccionado) return;
    const ok = await confirm(
      'Asignar Inspector',
      `¿Asignar al inspector seleccionado a este trámite?`,
      { confirmLabel: 'Asignar', variant: 'success' }
    );
    if (ok) {
      const parts = inspectorSeleccionado.split('|');
      onAsignarInspector(tramite.id, parts[0], parts[1]);
      setInspectorSeleccionado('');
    }
  };

  const getEstadoBadgeColor = (estado) => {
    const found = ESTADOS_TRAMITE.find(e => e.value === estado);
    return found ? found.color : 'secondary';
  };

  const getEstadoLabel = (estado) => {
    const found = ESTADOS_TRAMITE.find(e => e.value === estado);
    return found ? found.label : estado;
  };

  const progreso = { BORRADOR: 10, REVISION: 40, INSPECCION: 70, DOCUMENTO_GENERADO: 85, APROBADO: 100, RECHAZADO: 100 };
  const porcentaje = progreso[tramite.estado] || 10;
  const esRechazado = tramite.estado === 'RECHAZADO';
  const esAprobado = tramite.estado === 'APROBADO';
  const colorProgreso = esRechazado ? 'danger' : esAprobado ? 'success' : 'primary';

  return (
    <CModal visible={visible} onClose={onClose} size="xl" backdrop="static" scrollable className="modal-minec">
      <ConfirmModal />
      <CModalHeader className="border-0 pb-0">
        <div className="d-flex align-items-center w-100">
          <div className={`bg-${tramite.tipo === 'PERMISO' ? 'primary' : 'info'} bg-opacity-10 rounded-circle p-2 me-3`}>
            <CIcon icon={tramite.tipo === 'PERMISO' ? cilTask : cilDescription} className={`text-${tramite.tipo === 'PERMISO' ? 'primary' : 'info'}`} size="xl" />
          </div>
          <div>
            <CModalTitle className="h5 fw-bold mb-1">
              {tramite.tipo === 'PERMISO' ? 'Permiso Ambiental' : 'Licencia Ambiental'} - {tramite.subtipo}
            </CModalTitle>
            <small className="text-minec-muted">ID: {tramite.id} • Solicitado el {tramite.fechaSolicitud}</small>
          </div>
        </div>
      </CModalHeader>

      <CModalBody className="pt-3">
        {/* Badges de resumen rápido */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <CBadge color={tramite.tipo === 'PERMISO' ? 'primary' : 'info'} className="px-3 py-2 d-flex align-items-center">
            {tramite.tipo}
          </CBadge>
          <CBadge color={getEstadoBadgeColor(tramite.estado)} className="px-3 py-2 d-flex align-items-center">
            <CIcon icon={cilClock} className="me-2" />{getEstadoLabel(tramite.estado)}
          </CBadge>
          {tramite.inspectorNombre && (
            <CBadge color="secondary" className="px-3 py-2 d-flex align-items-center">
              <CIcon icon={cilUser} className="me-2" />Inspector: {tramite.inspectorNombre}
            </CBadge>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-1 px-1">
            <small className="text-muted fw-bold">Progreso de solicitud</small>
            <small className="text-muted fw-bold">{porcentaje}%</small>
          </div>
          <CProgress style={{ height: '10px' }} className="rounded-pill">
            <CProgressBar color={colorProgreso} value={porcentaje} />
          </CProgress>
        </div>

        {/* Acciones Pendientes (Ej: Asignar Inspector) */}
        {tramite.estado === 'REVISION' && onAsignarInspector && (
          <CCard className="border-0 shadow-sm mb-4 bg-success bg-opacity-10">
            <CCardBody className="p-3 d-flex flex-wrap gap-3 align-items-center">
              <div className="d-flex align-items-center gap-2 text-success fw-bold me-auto">
                <CIcon icon={cilUser} /> Asignar Inspector de Campo
              </div>
              <CFormSelect
                size="sm"
                value={inspectorSeleccionado}
                onChange={(e) => setInspectorSeleccionado(e.target.value)}
                style={{ maxWidth: '300px' }}
                className="border-success"
              >
                <option value="">Seleccionar un inspector...</option>
                <option value="1|María González">María González — Zona Norte</option>
                <option value="2|Ana Martínez">Ana Martínez — Zona Sur</option>
                <option value="3|Luis Pérez">Luis Pérez — Zona Central</option>
              </CFormSelect>
              <CButton 
                color="success" 
                className="text-white px-4 fw-bold shadow-sm"
                disabled={!inspectorSeleccionado}
                onClick={handleAsignar}
                size="sm"
              >
                Asignar Inspector
              </CButton>
            </CCardBody>
          </CCard>
        )}

        {/* Tabs de Navegación */}
        <div className="d-flex gap-2 mb-4 flex-wrap border-bottom pb-2">
          {[
            { key: 'general', label: 'Información General', icon: cilInfo },
            { key: 'solicitante', label: 'Datos del Solicitante', icon: cilShieldAlt },
            { key: 'ubicacion', label: 'Ubicación y Archivos', icon: cilMap },
            { key: 'historial', label: 'Historial', icon: cilHistory }
          ].map(tab => (
            <CButton
              key={tab.key}
              size="sm"
              color={activeTab === tab.key ? 'primary' : 'outline-primary'}
              variant={activeTab === tab.key ? undefined : 'outline'}
              className="fw-medium px-3 rounded-pill"
              onClick={() => setActiveTab(tab.key)}
            >
              <CIcon icon={tab.icon} className="me-2" size="sm" />{tab.label}
              {tab.key === 'historial' && (tramite.historial?.length || 0) > 0 && (
                <CBadge color="light" className="ms-2 text-dark">{tramite.historial.length}</CBadge>
              )}
            </CButton>
          ))}
        </div>

        {/* CONTENIDO DE TABS */}
        
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <CRow className="g-4">
            <CCol md={12}>
              <CCard className="eco-card h-100 border-0 shadow-sm">
                <CCardBody className="p-4">
                  <h6 className="fw-bold mb-3 text-primary">
                    <CIcon icon={cilDescription} className="me-2" />
                    Descripción del Proyecto
                  </h6>
                  <div className="p-4 bg-light rounded-3 border mb-4 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {tramite.descripcion || <span className="fst-italic text-muted">Sin descripción detallada.</span>}
                  </div>
                  
                  {tramite.observaciones && (
                    <CAlert color="warning" className="border-0 rounded-3 bg-warning bg-opacity-10 d-flex gap-3">
                      <CIcon icon={cilInfo} size="xl" className="text-warning mt-1" />
                      <div>
                        <strong className="d-block mb-1 text-warning">Observaciones de la administración</strong>
                        <span className="small text-dark">{tramite.observaciones}</span>
                      </div>
                    </CAlert>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {/* Tab 2: Solicitante */}
        {activeTab === 'solicitante' && (
          <CRow className="g-4">
            <CCol md={12}>
              <CCard className="eco-card h-100 border-0 shadow-sm">
                <CCardBody className="p-4">
                  <h6 className="fw-bold mb-4 text-primary">
                    <CIcon icon={cilUser} className="me-2" />
                    Perfil del Solicitante
                  </h6>
                  <CRow className="g-4">
                    <CCol md={6}>
                      <div className="p-3 border rounded-3 bg-white">
                        <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Nombre / Razón Social</small>
                        <div className="fs-6 fw-semibold text-dark mt-1">{tramite.solicitante}</div>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="p-3 border rounded-3 bg-white">
                        <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Cédula / RIF</small>
                        <div className="fs-6 fw-semibold text-dark mt-1">{tramite.cedulaRif}</div>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="p-3 border rounded-3 bg-white d-flex align-items-center gap-3">
                        <div className="bg-light p-2 rounded-circle text-primary">
                          <CIcon icon={cilPhone} />
                        </div>
                        <div>
                          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Teléfono</small>
                          <div className="fw-semibold text-dark">{tramite.telefono || '—'}</div>
                        </div>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="p-3 border rounded-3 bg-white d-flex align-items-center gap-3">
                        <div className="bg-light p-2 rounded-circle text-primary">
                          <CIcon icon={cilEnvelopeOpen} />
                        </div>
                        <div>
                          <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Correo Electrónico</small>
                          <div className="fw-semibold text-dark">{tramite.email || '—'}</div>
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {/* Tab 3: Ubicación y Archivos */}
        {activeTab === 'ubicacion' && (
          <CRow className="g-4">
            <CCol md={6}>
              <CCard className="eco-card h-100 border-0 shadow-sm">
                <CCardBody className="p-4">
                  <h6 className="fw-bold mb-4 text-primary">
                    <CIcon icon={cilLocationPin} className="me-2" />
                    Ubicación Geográfica
                  </h6>
                  <CListGroup flush className="mb-4 border rounded-3 overflow-hidden">
                    <CListGroupItem className="px-3 py-3 border-bottom border-light">
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Estado</small>
                      <div className="fw-semibold mt-1">{tramite.estado_geografico || 'Táchira'}</div>
                    </CListGroupItem>
                    <CListGroupItem className="px-3 py-3 border-bottom border-light">
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Municipio</small>
                      <div className="fw-semibold mt-1">{tramite.municipio || '—'}</div>
                    </CListGroupItem>
                    <CListGroupItem className="px-3 py-3">
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Dirección Detallada</small>
                      <div className="fw-semibold mt-1">{tramite.direccion || '—'}</div>
                    </CListGroupItem>
                  </CListGroup>

                  {(tramite.latitud && tramite.longitud) && (
                    <CButton
                      color="primary"
                      variant="outline"
                      className="w-100"
                      onClick={() => window.open(`https://www.google.com/maps?q=${tramite.latitud},${tramite.longitud}`, '_blank')}
                    >
                      <CIcon icon={cilMap} className="me-2" />
                      Ver coordenadas en Google Maps
                    </CButton>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            
            <CCol md={6}>
              <CCard className="eco-card h-100 border-0 shadow-sm">
                <CCardBody className="p-4">
                  <h6 className="fw-bold mb-4 text-primary">
                    <CIcon icon={cilFile} className="me-2" />
                    Documentos Adjuntos
                  </h6>
                  {tramite.documentos && tramite.documentos.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {tramite.documentos.map((doc, idx) => (
                        <div key={idx} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-danger bg-opacity-10 text-danger p-2 rounded">
                              <CIcon icon={cilFile} size="lg" />
                            </div>
                            <span className="fw-medium text-dark text-truncate" style={{ maxWidth: '200px' }}>{doc}</span>
                          </div>
                          <CButton size="sm" color="primary" variant="ghost">Descargar</CButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 bg-light rounded-3 border">
                      <CIcon icon={cilFile} size="xxl" className="text-muted mb-3 opacity-50" />
                      <p className="text-muted fw-medium mb-0">Sin documentos</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {/* Tab 4: Historial */}
        {activeTab === 'historial' && (
          <CCard className="eco-card border-0 shadow-sm">
            <CCardBody className="p-4">
              <h6 className="fw-bold mb-4 text-primary">
                <CIcon icon={cilClock} className="me-2" />
                Línea de Tiempo del Trámite
              </h6>
              
              {tramite.historial && tramite.historial.length > 0 ? (
                <div className="position-relative ms-3 border-start border-2 border-primary border-opacity-25 pb-3">
                  {tramite.historial.map((h, idx) => (
                    <div key={idx} className="position-relative ps-4 mb-4">
                      <div 
                        className={`position-absolute rounded-circle d-flex align-items-center justify-content-center bg-white border border-2 border-${idx === tramite.historial.length - 1 ? 'primary' : 'secondary'}`}
                        style={{ width: '16px', height: '16px', left: '-9px', top: '4px' }}
                      />
                      <div className="bg-light p-3 rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <CBadge color={getEstadoBadgeColor(h.estado)}>{getEstadoLabel(h.estado)}</CBadge>
                          <small className="text-muted fw-bold">{formatearFecha(h.fecha)}</small>
                        </div>
                        <p className="mb-1 text-dark fw-medium">{h.nota}</p>
                        <small className="text-muted"><CIcon icon={cilUser} size="sm" className="me-1"/> {h.usuario}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-3">
                  <CIcon icon={cilHistory} size="xl" className="text-muted mb-3 opacity-50" />
                  <p className="text-muted mb-0">Sin historial registrado.</p>
                </div>
              )}
            </CCardBody>
          </CCard>
        )}
      </CModalBody>

      <CModalFooter className="border-0 bg-light p-4 rounded-bottom">
        <div className="w-100 d-flex flex-column gap-3">
          {/* Fila inferior: Botones de estado y cerrar */}
          <div className="d-flex justify-content-between align-items-center w-100 pt-2">
            <CButton color="secondary" variant="ghost" onClick={onClose} className="fw-bold px-4">
              Cerrar Detalle
            </CButton>

            <div className="d-flex flex-wrap justify-content-end gap-3">
              {tramite.estado === 'BORRADOR' && onEstadoChange && (
                <CButton color="primary" onClick={() => handleAccion('Pasar a Revisión', 'REVISION')} className="fw-bold px-4 shadow-sm">
                  <CIcon icon={cilArrowBottom} className="me-2" />
                  Iniciar Revisión
                </CButton>
              )}
              
              {(tramite.estado === 'REVISION' || tramite.estado === 'INSPECCION' || tramite.estado === 'DOCUMENTO_GENERADO') && onEstadoChange && (
                <>
                  <CButton color="danger" variant="outline" onClick={() => handleAccion('Rechazar Trámite', 'RECHAZADO')} className="fw-bold px-4">
                    <CIcon icon={cilXCircle} className="me-2" />
                    Rechazar
                  </CButton>
                  
                  {tramite.estado === 'INSPECCION' && (
                    <CButton color="info" className="text-white fw-bold px-4 shadow-sm" onClick={() => handleAccion('Generar Documento', 'DOCUMENTO_GENERADO')}>
                      <CIcon icon={cilArrowBottom} className="me-2" />
                      Finalizar Inspección
                    </CButton>
                  )}

                  {tramite.estado === 'DOCUMENTO_GENERADO' && (
                    <CButton color="success" onClick={() => handleAccion('Aprobar Trámite', 'APROBADO')} className="text-white fw-bold px-4 shadow-sm">
                      <CIcon icon={cilCheckCircle} className="me-2" />
                      Aprobar Definitivamente
                    </CButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CModalFooter>
    </CModal>
  );
};

export default TramitesModalDetalle;
