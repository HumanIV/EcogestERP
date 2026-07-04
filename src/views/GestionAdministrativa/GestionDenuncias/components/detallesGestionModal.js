import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CAlert,
  CProgress,
  CProgressBar,
  CListGroup,
  CListGroupItem,
  CFormTextarea,
  CFormInput,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPencil,
  cilCheckCircle,
  cilClock,
  cilWarning,
  cilLocationPin,
  cilCalendar,
  cilUser,
  cilMap,
  cilShieldAlt,
  cilSend,
  cilTrash,
  cilInfo,
  cilTask,
  cilCommentSquare,
  cilHistory,
  cilCloudDownload
} from '@coreui/icons';
import { formatearFecha, getTipoLabel } from '../utils/gestionUtils';
import useConfirmModal from '../../../usuarios/_shared/useConfirmModal';
import useToast from '../../../usuarios/_shared/useToast';
import MapaUbicacionDetalle from './MapaUbicacionDetalle';

const DetalleGestionModal = ({
  visible,
  onClose,
  denuncia,
  onEstadoChange,
  onAsignar,
  onAgregarComentario,
  onResolver,
  onExportarIndividual,
  cuadrillasDisponibles: cuadrillasDisponiblesProp = [],
  obtenerCuadrillaOptima
}) => {
  const { confirm, ConfirmModal } = useConfirmModal();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [comentario, setComentario] = useState('');
  const [cuadrillaSeleccionada, setCuadrillaSeleccionada] = useState('');
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    if (visible && denuncia) {
      setComentario('');
      if (denuncia.cuadrillaId) {
        setCuadrillaSeleccionada(denuncia.cuadrillaId);
      }
    }
  }, [visible, denuncia]);

  if (!denuncia) return null;

  const estaResuelta = denuncia.estado === 'resuelta';
  const tieneCuadrilla = !!denuncia.cuadrillaId;

  const getPrioridadBadge = (prioridad) => {
    const c = {
      alta: { color: 'danger', icon: '🚨', text: 'Alta' },
      media: { color: 'warning', icon: '⚠️', text: 'Media' },
      baja: { color: 'success', icon: '🌿', text: 'Baja' }
    };
    const item = c[prioridad] || { color: 'secondary', icon: '📊', text: prioridad };
    return (
      <CBadge color={item.color} className="badge-eco px-3 py-2 d-flex align-items-center">
        <span className="me-2">{item.icon}</span>{item.text}
      </CBadge>
    );
  };

  const getEstadoBadge = (estado) => {
    const c = {
      pendiente: { color: 'warning', icon: cilClock, text: 'Pendiente' },
      investigando: { color: 'info', icon: cilWarning, text: 'Investigando' },
      asignada: { color: 'primary', icon: cilUser, text: 'Asignada' },
      en_proceso: { color: 'primary', icon: cilPencil, text: 'En Proceso' },
      resuelta: { color: 'success', icon: cilCheckCircle, text: 'Resuelta' }
    };
    const item = c[estado] || { color: 'secondary', icon: cilInfo, text: estado };
    return (
      <CBadge color={item.color} className="badge-eco px-3 py-2 d-flex align-items-center">
        <CIcon icon={item.icon} className="me-2" />{item.text}
      </CBadge>
    );
  };

  const progreso = { pendiente: 10, investigando: 30, asignada: 45, en_proceso: 70, resuelta: 100 };
  const porcentaje = progreso[denuncia.estado] || 10;

  const handleAsignarCuadrilla = async () => {
    if (!cuadrillaSeleccionada) {
      showToast('Selecciona cuadrilla', 'Debes seleccionar una cuadrilla', 'warning');
      return;
    }
    const ok = await confirm(
      'Asignar cuadrilla',
      `¿Asignar esta denuncia a la cuadrilla seleccionada?`,
      { confirmLabel: 'Asignar', cancelLabel: 'Cancelar', variant: 'info', icon: cilUser }
    );
    if (ok) {
      setAsignando(true);
      await onAsignar(denuncia.id, cuadrillaSeleccionada);
      setAsignando(false);
      showToast('Cuadrilla asignada', 'La denuncia fue asignada y su estado cambió a "Asignada"', 'success');
    }
  };

  const handleAsignacionAutomatica = async () => {
    if (!obtenerCuadrillaOptima) return;
    const resultado = obtenerCuadrillaOptima(denuncia);
    if (resultado) {
      setCuadrillaSeleccionada(resultado.id);
      showToast('Cuadrilla encontrada', `Mejor opción: ${resultado.nombre}`, 'info');
    } else {
      showToast('Sin resultado', 'No se encontró una cuadrilla óptima', 'warning');
    }
  };

  const handleGuardarComentario = async () => {
    if (!comentario.trim()) {
      showToast('Campo vacío', 'Escribe un comentario', 'warning');
      return;
    }
    await onAgregarComentario(denuncia.id, comentario);
    setComentario('');
    showToast('Comentario guardado', '', 'success');
  };

  const iniciarAccion = async (tipo) => {
    const sufijo = tieneCuadrilla ? ` (Cuadrilla asignada: ${cuadrillaActual?.nombre || denuncia.cuadrillaId})` : '';

    if (tipo === 'investigar') {
      const ok = await confirm('Iniciar investigación', `¿Iniciar investigación de la denuncia?${sufijo}`, { confirmLabel: 'Iniciar', variant: 'info', icon: cilWarning });
      if (ok) {
        await onEstadoChange(denuncia.id, 'investigando', `Investigación iniciada automáticamente${sufijo}`);
        showToast('Investigación iniciada', '', 'success');
      }
      return;
    }
    
    if (tipo === 'proceso') {
      const ok = await confirm('Marcar en proceso', `¿Marcar esta denuncia como "En Proceso"?${sufijo}`, { confirmLabel: 'Confirmar', variant: 'info', icon: cilPencil });
      if (ok) {
        await onEstadoChange(denuncia.id, 'en_proceso', `Marcado en proceso automáticamente${sufijo}`);
        showToast('En proceso', '', 'success');
      }
      return;
    }

    if (tipo === 'resolver') {
      const ok = await confirm('Resolver denuncia', `¿Marcar esta denuncia como "Resuelta"?${sufijo}`, { confirmLabel: 'Resolver', variant: 'success', icon: cilCheckCircle });
      if (ok) {
        await onResolver(denuncia.id, {
          descripcionResolucion: `Denuncia resuelta automáticamente${sufijo}`,
          accionesTomadas: 'Asistencia y evaluación en el sitio completada.'
        });
        showToast('Denuncia resuelta', '', 'success');
      }
      return;
    }
  };

  const handleEliminar = async () => {
    const ok = await confirm('Eliminar denuncia', '¿Estás seguro? No se puede deshacer.', { confirmLabel: 'Eliminar', variant: 'danger', icon: cilTrash });
    if (ok) {
      await onEstadoChange(denuncia.id, 'eliminada');
      onClose();
    }
  };

  const cuadrillaActual = tieneCuadrilla ? cuadrillasDisponiblesProp.find(c => c.id === denuncia.cuadrillaId) : null;

  const renderTimeline = () => {
    const historial = denuncia.historial || [];
    const comentarios = denuncia.comentarios || [];
    const items = [
      ...historial.map(h => ({ ...h, tipoItem: 'historial' })),
      ...comentarios.map(c => ({ ...c, tipoItem: 'comentario' }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (items.length === 0) {
      return (
        <div className="text-center py-5">
          <CIcon icon={cilHistory} size="xl" className="text-minec-muted mb-3" />
          <p className="text-minec-muted">Sin historial de acciones</p>
        </div>
      );
    }

    const iconos = {
      estado: { icon: cilPencil, color: 'info' },
      asignacion: { icon: cilUser, color: 'primary' },
      resolucion: { icon: cilCheckCircle, color: 'success' },
      comentario: { icon: cilCommentSquare, color: 'warning' }
    };

    return items.map((item, idx) => {
      const tipo = item.tipoItem === 'comentario' ? 'comentario' : (item.tipo || 'estado');
      const info = iconos[tipo] || { icon: cilInfo, color: 'secondary' };
      const esCom = item.tipoItem === 'comentario';
      return (
        <div key={idx} className="d-flex mb-3">
          <div className="me-3" style={{ minWidth: '36px' }}>
            <div className={`bg-${info.color} bg-opacity-10 rounded-circle p-2`}>
              <CIcon icon={info.icon} className={`text-${info.color}`} size="sm" />
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between">
              <strong className="small">{esCom ? item.autor : item.accion}</strong>
              <small className="text-minec-muted">{formatearFecha(item.fecha)}</small>
            </div>
            <p className="small mb-0 mt-1 text-muted">{esCom ? item.texto : item.detalle}</p>
            {idx < items.length - 1 && <hr className="my-2 opacity-25" />}
          </div>
        </div>
      );
    });
  };



  return (
    <CModal visible={visible} onClose={onClose} size="xl" backdrop="static" scrollable className="modal-minec">
      <CModalHeader className="border-0 pb-0">
        <div className="d-flex align-items-center w-100">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
            <CIcon icon={cilWarning} className="text-primary" />
          </div>
          <div>
            <CModalTitle className="h5 fw-bold">{denuncia.titulo}</CModalTitle>
            <small className="text-minec-muted">{denuncia.id} • {formatearFecha(denuncia.fecha)}</small>
          </div>
        </div>
      </CModalHeader>

      <CModalBody className="pt-3">
        <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
          {getPrioridadBadge(denuncia.prioridad)}
          {getEstadoBadge(denuncia.estado)}
          {tieneCuadrilla && (
            <CBadge color="primary" className="badge-eco px-3 py-2 d-flex align-items-center">
              <CIcon icon={cilUser} className="me-2" />{cuadrillaActual?.nombre || denuncia.cuadrillaId}
            </CBadge>
          )}
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-minec-muted">Progreso</small>
            <small className="text-minec-muted">{porcentaje}%</small>
          </div>
          <CProgress style={{ height: '6px' }}>
            <CProgressBar color={estaResuelta ? 'success' : 'primary'} value={porcentaje} />
          </CProgress>
        </div>

        <div className="d-flex gap-1 mb-3 flex-wrap">
          {[
            { key: 'general', label: 'General', icon: cilInfo },
            { key: 'ubicacion', label: 'Ubicación', icon: cilMap },
            { key: 'acciones', label: 'Acciones', icon: cilPencil },
            { key: 'historial', label: 'Historial', icon: cilHistory }
          ].map(tab => (
            <CButton
              key={tab.key}
              size="sm"
              color={activeTab === tab.key ? 'primary' : 'outline-primary'}
              variant={activeTab === tab.key ? undefined : 'outline'}
              className="fw-medium"
              onClick={() => setActiveTab(tab.key)}
            >
              <CIcon icon={tab.icon} className="me-1" size="sm" />{tab.label}
              {tab.key === 'historial' && (denuncia.historial?.length || 0) > 0 && (
                <CBadge color="light" className="ms-1">{denuncia.historial.length}</CBadge>
              )}
            </CButton>
          ))}
        </div>

        {activeTab === 'general' && (
          <CRow className="g-3">
            <CCol md={6}>
              <CCard className="eco-card">
                <CCardBody>
                  <h6 className="fw-bold mb-2">📋 Información</h6>
                  <div className="mb-3">
                    <small className="text-minec-muted d-block">Descripción</small>
                    <div className="p-3 bg-body-tertiary rounded">{denuncia.descripcion}</div>
                  </div>
                  <CListGroup flush>
                    <CListGroupItem className="border-0 px-0 py-2 d-flex justify-content-between">
                      <span><small className="text-minec-muted">Tipo</small><br /><strong>{getTipoLabel(denuncia.tipo)}</strong></span>
                      <CBadge color="primary">{denuncia.tipo}</CBadge>
                    </CListGroupItem>
                    <CListGroupItem className="border-0 px-0 py-2">
                      <small className="text-minec-muted">Fecha</small><br /><strong>{formatearFecha(denuncia.fecha)}</strong>
                    </CListGroupItem>
                    {denuncia.fechaIncidente && (
                      <CListGroupItem className="border-0 px-0 py-2">
                        <small className="text-minec-muted">Fecha incidente</small><br /><strong>{formatearFecha(denuncia.fechaIncidente)}</strong>
                      </CListGroupItem>
                    )}
                  </CListGroup>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="eco-card">
                <CCardBody>
                  <h6 className="fw-bold mb-2">🛡️ Reportante</h6>
                  <CAlert color="info" className="border-0 rounded-3 bg-info bg-opacity-10 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <CIcon icon={cilShieldAlt} className="text-info" />
                      <small><strong>Confidencial:</strong> Identidad protegida</small>
                    </div>
                  </CAlert>
                  <CListGroup flush>
                    <CListGroupItem className="border-0 px-0 py-2">
                      <small className="text-minec-muted">Canal</small><br /><strong>Plataforma Web</strong>
                    </CListGroupItem>
                    <CListGroupItem className="border-0 px-0 py-2">
                      <small className="text-minec-muted">Comentarios</small><br /><strong>{(denuncia.comentarios || []).length}</strong>
                    </CListGroupItem>
                  </CListGroup>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {activeTab === 'ubicacion' && (
          <CRow className="g-3">
            <CCol md={6}>
              <CCard className="eco-card">
                <CCardBody>
                  <h6 className="fw-bold mb-3">📍 Ubicación</h6>
                  {denuncia.latitud && denuncia.longitud ? (
                    <>
                      <MapaUbicacionDetalle 
                        latitud={denuncia.latitud} 
                        longitud={denuncia.longitud} 
                        popupContent={`
                          <div style="font-family: sans-serif;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${denuncia.titulo}</div>
                            <div style="font-size: 12px; color: #666;">Lat: ${denuncia.latitud}</div>
                            <div style="font-size: 12px; color: #666;">Lng: ${denuncia.longitud}</div>
                          </div>
                        `}
                      />
                      <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small className="text-minec-muted">Lat: {denuncia.latitud}, Lng: {denuncia.longitud}</small>
                        <CButton
                          color="primary"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://www.google.com/maps?q=${denuncia.latitud},${denuncia.longitud}`, '_blank')}
                        >
                          <CIcon icon={cilMap} className="me-1" />
                          Ver en Google Maps
                        </CButton>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 bg-light rounded-3">
                      <CIcon icon={cilMap} size="xxl" className="text-minec-muted mb-3 opacity-50" />
                      <p className="text-minec-muted fw-medium mb-0">Sin coordenadas exactas</p>
                      <small className="text-muted">La denuncia no incluye ubicación geográfica</small>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard className="eco-card h-100">
                <CCardBody>
                  <h6 className="fw-bold mb-3">📍 Detalles</h6>
                  <CListGroup flush>
                    <CListGroupItem className="border-0 px-0 py-2">
                      <small className="text-minec-muted">Estado</small><br /><strong>{denuncia.estadoUbicacion}</strong>
                    </CListGroupItem>
                    <CListGroupItem className="border-0 px-0 py-2">
                      <small className="text-minec-muted">Municipio</small><br /><strong>{denuncia.municipio}</strong>
                      </CListGroupItem>
                    {denuncia.ubicacion && (
                      <CListGroupItem className="border-0 px-0 py-2">
                        <small className="text-minec-muted">Dirección</small><br /><strong>{denuncia.ubicacion}</strong>
                      </CListGroupItem>
                    )}
                  </CListGroup>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {activeTab === 'acciones' && (
          <CRow className="g-3">
            <CCol md={6}>
              <CCard className="eco-card">
                <CCardBody>
                  <h6 className="fw-bold mb-3">⚡ Responder</h6>

                  {!estaResuelta && (
                    <div className="d-grid gap-2 mb-3">
                      <CButton color="info" className="btn-minec py-2" onClick={() => iniciarAccion('investigar')}>
                        <CIcon icon={cilWarning} className="me-2" />🔍 Iniciar Investigación
                      </CButton>
                      <CButton color="primary" className="btn-minec py-2" onClick={() => iniciarAccion('proceso')}>
                        <CIcon icon={cilPencil} className="me-2" />⚙️ Marcar En Proceso
                      </CButton>
                      <CButton color="success" className="btn-minec py-2" onClick={() => iniciarAccion('resolver')}>
                        <CIcon icon={cilCheckCircle} className="me-2" />✅ Resolver Denuncia
                      </CButton>
                    </div>
                  )}

                  {estaResuelta && (
                    <CAlert color="success" className="border-0 rounded-3 bg-success bg-opacity-10 mb-3">
                      <strong>✅ Denuncia resuelta</strong>
                      {denuncia.resolucion && <p className="small mb-0 mt-1">{denuncia.resolucion.descripcionResolucion}</p>}
                    </CAlert>
                  )}

                  <div className="mt-3 pt-3 border-top">
                    <h6 className="fw-bold mb-2">📝 Comentario</h6>
                    <CFormTextarea placeholder="Nota interna..." value={comentario} onChange={e => setComentario(e.target.value)} rows={2} className="input-minec mb-2" />
                    <CButton color="primary" size="sm" className="btn-minec" onClick={handleGuardarComentario}>
                      <CIcon icon={cilCommentSquare} className="me-1" />Guardar
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6}>
              <CCard className="eco-card">
                <CCardBody>
                  <h6 className="fw-bold mb-3">👥 Cuadrilla</h6>

                  {tieneCuadrilla && cuadrillaActual && (
                    <CAlert color="primary" className="border-0 rounded-3 bg-primary bg-opacity-10 mb-3">
                      <div className="d-flex align-items-start gap-2">
                        <CIcon icon={cilUser} className="text-primary mt-1" />
                        <div>
                          <strong>{cuadrillaActual.nombre}</strong>
                          <p className="small mb-0">Zona: {cuadrillaActual.zona}{cuadrillaActual.especialidad ? ` • ${cuadrillaActual.especialidad.join(', ')}` : ''}</p>
                        </div>
                      </div>
                    </CAlert>
                  )}

                  {!tieneCuadrilla && cuadrillasDisponiblesProp.length > 0 && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-minec-muted">Asignar cuadrilla:</small>
                        <CButton size="sm" color="outline-primary" onClick={handleAsignacionAutomatica}>
                          <CIcon icon={cilTask} className="me-1" />Auto
                        </CButton>
                      </div>
                      <CFormSelect value={cuadrillaSeleccionada} onChange={e => setCuadrillaSeleccionada(e.target.value)} className="input-minec mb-2">
                        <option value="">Seleccionar...</option>
                        {cuadrillasDisponiblesProp.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre} - {c.zona} ({c.cargaActual}/{c.capacidad})</option>
                        ))}
                      </CFormSelect>
                      {cuadrillaSeleccionada && (
                        <CButton color="primary" className="btn-minec w-100 mb-3" onClick={handleAsignarCuadrilla} disabled={asignando}>
                          {asignando ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilUser} className="me-2" />}
                          Asignar Cuadrilla
                        </CButton>
                      )}
                    </>
                  )}

                  {!tieneCuadrilla && cuadrillasDisponiblesProp.length === 0 && (
                    <CAlert color="warning" className="border-0 rounded-3 bg-warning bg-opacity-10">
                      <small><strong>Sin cuadrillas:</strong> Activa cuadrillas en el módulo de Cuadrillas</small>
                    </CAlert>
                  )}

                  <div className="mt-3 pt-3 border-top">
                    <h6 className="fw-bold mb-2">📤 Enviar a Director</h6>
                    <CAlert color="warning" className="border-0 rounded-3 bg-warning bg-opacity-10 mb-2">
                      <small>Enviar para revisión y aprobación</small>
                    </CAlert>
                    <CButton color="warning" className="btn-minec w-100" onClick={() => onEstadoChange(denuncia.id, 'investigando')}>
                      <CIcon icon={cilSend} className="me-2" />Enviar
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {activeTab === 'historial' && (
          <CCard className="eco-card">
            <CCardBody>
              <h6 className="fw-bold mb-3">📋 Historial de Acciones</h6>
              {renderTimeline()}
            </CCardBody>
          </CCard>
        )}
      </CModalBody>

      <CModalFooter className="border-top-0">
        <CButton color="outline-secondary" className="btn-minec-outline" onClick={onClose}>Cerrar</CButton>
        <div className="d-flex gap-2">
          <CButton color="outline-danger" className="btn-minec-outline" onClick={handleEliminar}>
            <CIcon icon={cilTrash} className="me-1" />Eliminar
          </CButton>
          <CButton color="primary" className="btn-minec" onClick={() => onExportarIndividual(denuncia)}>
            <CIcon icon={cilCloudDownload} className="me-1" />Exportar
          </CButton>
        </div>
      </CModalFooter>

      {ConfirmModal()}
    </CModal>
  );
};

export default DetalleGestionModal;
