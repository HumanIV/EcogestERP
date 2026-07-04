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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CAlert,
  CProgress,
  CProgressBar,
  CListGroup,
  CListGroupItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilTrash,
  cilLocationPin,
  cilCalendar,
  cilMap,
  cilImage,
  cilWarning,
  cilCheckCircle,
  cilClock,
  cilArrowRight,
  cilX,
  cilInfo,
  cilFile,
  cilGlobeAlt,
  cilShieldAlt,
  cilSearch,
  cilCircle
} from '@coreui/icons';

import BadgeEstado from './badgeEstado';
import { formatearFecha, getTipoLabel } from '../utils/denunciasUtils';
import MapaDenunciaDetalle from './mapaDenunciaDetalle'

const DenunciasTable = ({ denuncias, onDelete }) => {
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [denunciaToDelete, setDenunciaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const getPrioridadBadge = (prioridad) => {
    const config = {
      baja: { color: 'success', icon: '🌿', text: 'Baja' },
      media: { color: 'warning', icon: '⚠️', text: 'Media' },
      alta: { color: 'danger', icon: '🚨', text: 'Alta' }
    };
    const configItem = config[prioridad] || { color: 'secondary', icon: '📊', text: prioridad };
    return (
      <CBadge color={configItem.color} className="px-3 py-2 d-flex align-items-center badge-eco">
        <span className="me-2">{configItem.icon}</span>
        {configItem.text}
      </CBadge>
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

  const handleViewDetails = (denuncia) => {
    setSelectedDenuncia(denuncia);
    setActiveSection('general');
    setModalVisible(true);
  };

  const handleDeleteClick = (denuncia) => {
    setDenunciaToDelete(denuncia);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!denunciaToDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(denunciaToDelete.id);
      setDeleteConfirmVisible(false);
      setDenunciaToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la denuncia:', error);
    } finally {
      setDeleting(false);
    }
  };

  const renderMapPreview = (denuncia) => {
    if (!denuncia.latitud || !denuncia.longitud) {
      return (
        <CCard className="eco-card h-100">
          <CCardBody className="text-center p-5">
            <div className="eco-surface rounded-circle p-4 d-inline-block mb-3">
              <CIcon icon={cilMap} size="xl" className="text-minec-muted" />
            </div>
            <h6 className="text-minec-muted mb-2 fw-titles">Ubicación general</h6>
            <p className="text-minec-muted small mb-0 fw-light">
              Sin coordenadas específicas registradas
            </p>
          </CCardBody>
        </CCard>
      );
    }

    return (
      <CCard className="eco-card overflow-hidden h-100">
        <CCardBody className="p-0">
          <div className="bg-nature-soft p-4 d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
            <div className="text-center">
              <div className="bg-white rounded-circle p-3 d-inline-block shadow mb-3">
                <CIcon icon={cilLocationPin} size="xl" className="text-nature" />
              </div>
              <h6 className="fw-bold fw-titles mb-2 text-eco">📍 Ubicación específica</h6>
              <p className="text-minec-muted mb-0 small fw-light">
                Coordenadas GPS registradas
              </p>
            </div>
          </div>
          <div className="p-3 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-minec-muted d-block fw-light">Latitud</small>
                <span className="fw-semibold fw-data text-inter">{denuncia.latitud}</span>
              </div>
              <div>
                <small className="text-minec-muted d-block fw-light">Longitud</small>
                <span className="fw-semibold fw-data text-inter">{denuncia.longitud}</span>
              </div>
            </div>
          </div>
        </CCardBody>
      </CCard>
    );
  };

  const renderEvidencia = (evidencia) => {
    if (!evidencia || evidencia.length === 0) {
      return (
        <CCard className="eco-card">
          <CCardBody className="text-center p-5">
            <div className="eco-surface rounded-circle p-3 d-inline-block mb-3">
              <CIcon icon={cilImage} size="xl" className="text-minec-muted" />
            </div>
            <h6 className="text-minec-muted mb-2 fw-titles">Sin evidencia adjunta</h6>
            <p className="text-minec-muted small mb-0 fw-light">
              No se han subido archivos para este reporte
            </p>
          </CCardBody>
        </CCard>
      );
    }

    return (
      <div className="d-flex flex-column gap-3">
        <CAlert color="info" className="border-0 rounded-3 bg-eco-soft">
          <div className="d-flex align-items-center">
            <CIcon icon={cilInfo} className="me-2 text-eco" />
            <small className="fw-light text-inter">
              Se han adjuntado <strong>{evidencia.length}</strong> archivo{evidencia.length > 1 ? 's' : ''} como evidencia
            </small>
          </div>
        </CAlert>
        
        <CListGroup>
          {evidencia.map((file, index) => (
            <CListGroupItem 
              key={index}
              className="d-flex justify-content-between align-items-center rounded-3 mb-2 eco-surface"
            >
              <div className="d-flex align-items-center">
                <div className="bg-eco-soft rounded-circle p-2 me-3">
                  <CIcon icon={cilFile} className="text-eco" />
                </div>
                <div>
                  <div className="fw-semibold fw-data text-inter">{file}</div>
                  <small className="text-minec-muted fw-light">
                    Archivo de evidencia #{index + 1}
                  </small>
                </div>
              </div>
              <CBadge color="primary" shape="rounded-pill" className="badge-eco">
                Ver
              </CBadge>
            </CListGroupItem>
          ))}
        </CListGroup>
      </div>
    );
  };

  const getProgresoEstado = (estado) => {
    const progreso = {
      pendiente: 25,
      investigando: 50,
      en_proceso: 75,
      resuelta: 100,
      rechazada: 100
    };
    return progreso[estado] || 25;
  };

  const getColorProgreso = (estado) => {
    const colores = {
      pendiente: 'warning',
      investigando: 'info',
      en_proceso: 'primary',
      resuelta: 'success',
      rechazada: 'danger'
    };
    return colores[estado] || 'warning';
  };

  const navigationSections = [
    { id: 'general', label: 'General', icon: cilInfo },
    { id: 'ubicacion', label: 'Ubicación', icon: cilMap },
    { id: 'evidencia', label: 'Evidencia', icon: cilImage },
    { id: 'seguimiento', label: 'Seguimiento', icon: cilClock }
  ];

  if (!denuncias || denuncias.length === 0) {
    return null;
  }

  return (
    <>
      <div className="table-responsive animate-fade-eco">
        <CTable hover responsive className="align-middle table-minec" style={{ minWidth: '1000px' }}>
          <CTableHead>
            <CTableRow style={{ background: 'linear-gradient(135deg, var(--eco-50), var(--eco-100))' }}>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Código</CTableHeaderCell>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Incidente</CTableHeaderCell>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Tipo</CTableHeaderCell>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Ubicación</CTableHeaderCell>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Fecha</CTableHeaderCell>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Estado</CTableHeaderCell>
              <CTableHeaderCell className="fw-bold fw-titles text-inter text-eco">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {denuncias.map((d) => (
              <CTableRow key={d.id} className="border-bottom">
                <CTableDataCell>
                  <div className="fw-bold fw-titles text-montserrat" style={{ color: 'var(--eco-700)' }}>{d.id}</div>
                </CTableDataCell>
                <CTableDataCell>
                  <div className="fw-semibold fw-data mb-1 text-truncate text-inter" style={{ maxWidth: '250px' }}>
                    {d.titulo}
                  </div>
                  <small className="text-minec-muted d-block fw-light" style={{ lineHeight: '1.4', maxWidth: '250px' }}>
                    {d.descripcion?.substring(0, 80) || 'Sin descripción'}...
                  </small>
                </CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex align-items-center">
                    <div className={`bg-${getTipoColor(d.tipo)} bg-opacity-10 rounded-circle p-2 me-3`}>
                      <span className="fs-5">{getTipoIcon(d.tipo)}</span>
                    </div>
                    <div>
                      <div className="fw-semibold fw-data small text-inter">{getTipoLabel(d.tipo)}</div>
                      {getPrioridadBadge(d.prioridad)}
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex align-items-center">
                    <div className="bg-eco-soft rounded-circle p-2 me-3">
                      <CIcon icon={cilLocationPin} className="text-eco" />
                    </div>
                    <div>
                      <div className="fw-semibold fw-data small text-inter">{d.municipio}</div>
                      <small className="text-minec-muted fw-light">{d.estadoUbicacion}</small>
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex align-items-center">
                    <div className="bg-nature-soft rounded-circle p-2 me-3">
                      <CIcon icon={cilCalendar} className="text-nature" />
                    </div>
                    <div>
                      <div className="fw-semibold fw-data small text-inter">{formatearFecha(d.fecha)}</div>
                      <small className="text-minec-muted fw-light">Registro</small>
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <BadgeEstado estado={d.estado} />
                </CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex gap-2">
                    <CButton 
                      color="outline-primary" 
                      size="sm" 
                      onClick={() => handleViewDetails(d)}
                      className="rounded-pill px-3 btn-minec-outline"
                      title="Ver detalles completos"
                    >
                      <CIcon icon={cilCircle} className="me-1" />
                      Detalles
                    </CButton>
                    <CButton 
                      color="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(d)}
                      className="rounded-pill px-3"
                      title="Eliminar reporte"
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Modal de detalles mejorado */}
      <CModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        size="xl"
        backdrop="static"
        scrollable
        className="modal-dialog-centered modal-minec"
      >
        <CModalHeader style={{ 
          background: 'linear-gradient(135deg, var(--eco-700) 0%, var(--eco-500) 100%)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <div className="d-flex align-items-center w-100">
            <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
              <CIcon icon={cilShieldAlt} className="text-white" />
            </div>
            <div className="flex-grow-1">
              <CModalTitle className="fw-bold fw-titles h4 mb-0 text-montserrat">
                Detalles del Reporte Ambiental
              </CModalTitle>
              <small className="opacity-90 fw-light">Información completa del incidente reportado</small>
            </div>
          </div>
        </CModalHeader>

        <CModalBody className="pt-4">
          {selectedDenuncia && (
            <>
              {/* Header del reporte */}
              <div className="text-center mb-5">
                <div className="position-relative d-inline-block">
                  <div 
                    className={`bg-${getTipoColor(selectedDenuncia.tipo)} bg-opacity-10 rounded-circle p-4 d-inline-block`}
                    style={{ width: '100px', height: '100px' }}
                  >
                    <span className="fs-1">{getTipoIcon(selectedDenuncia.tipo)}</span>
                  </div>
                  <CBadge 
                    color={getTipoColor(selectedDenuncia.tipo)} 
                    shape="rounded-pill"
                    className="position-absolute top-0 start-100 translate-middle badge-eco"
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    {getTipoLabel(selectedDenuncia.tipo)}
                  </CBadge>
                </div>
                <h3 className="mt-3 fw-bold fw-titles text-montserrat text-eco">
                  {selectedDenuncia.titulo}
                </h3>
                <div className="d-flex justify-content-center gap-3 mt-2">
                  <CBadge color="primary" className="px-3 py-2 d-flex align-items-center badge-eco">
                    <CIcon icon={cilShieldAlt} className="me-2" />
                    ID: {selectedDenuncia.id}
                  </CBadge>
                  <BadgeEstado estado={selectedDenuncia.estado} />
                </div>
              </div>

              {/* Navegación */}
              <div className="mb-4">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {navigationSections.map((section) => (
                    <CButton
                      key={section.id}
                      color={activeSection === section.id ? "success" : "outline-secondary"}
                      onClick={() => setActiveSection(section.id)}
                      className={`rounded-pill px-4 ${activeSection === section.id ? 'btn-minec-success' : 'btn-minec-outline'}`}
                      size="sm"
                    >
                      <CIcon icon={section.icon} className="me-2" />
                      {section.label}
                    </CButton>
                  ))}
                </div>
              </div>

              {/* Progreso */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-minec-muted fw-light">Progreso del caso</small>
                  <small className="fw-semibold fw-data text-inter">{getProgresoEstado(selectedDenuncia.estado)}%</small>
                </div>
                <CProgress style={{ height: '8px', borderRadius: 'var(--radius-sm)' }}>
                  <CProgressBar 
                    color={getColorProgreso(selectedDenuncia.estado)} 
                    value={getProgresoEstado(selectedDenuncia.estado)}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  />
                </CProgress>
              </div>

              {/* Contenido según sección activa */}
              <div className="tab-content mt-4">
                {/* Sección General */}
                {activeSection === 'general' && (
                  <div className="fade show active">
                    <CRow className="g-4">
                      <CCol lg={6}>
                        <CCard className="eco-card h-100">
                          <CCardBody className="p-4">
                            <h6 className="fw-bold fw-titles mb-4 d-flex align-items-center text-eco">
                              <div className="bg-nature-soft rounded-circle p-2 me-3">
                                <CIcon icon={cilInfo} className="text-nature" />
                              </div>
                              Información del Incidente
                            </h6>
                            
                            <div className="mb-4">
                              <small className="text-minec-muted d-block mb-1 fw-light">Descripción completa</small>
                              <div className="p-3 rounded-3 eco-surface">
                                <p className="mb-0 fw-info text-inter">{selectedDenuncia.descripcion}</p>
                              </div>
                            </div>

                            <CRow className="g-3">
                              <CCol xs={6}>
                                <div className="mb-2">
                                  <small className="text-minec-muted d-block fw-light">Gravedad</small>
                                  {getPrioridadBadge(selectedDenuncia.prioridad)}
                                </div>
                              </CCol>
                              <CCol xs={6}>
                                <div className="mb-2">
                                  <small className="text-minec-muted d-block fw-light">Estado</small>
                                  <BadgeEstado estado={selectedDenuncia.estado} />
                                </div>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      
                      <CCol lg={6}>
                        <CCard className="eco-card h-100">
                          <CCardBody className="p-4">
                            <h6 className="fw-bold fw-titles mb-4 d-flex align-items-center text-eco">
                              <div className="bg-eco-soft rounded-circle p-2 me-3">
                                <CIcon icon={cilCalendar} className="text-eco" />
                              </div>
                              Fechas Relevantes
                            </h6>

                            <CListGroup flush>
                              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0 py-3">
                                <div>
                                  <small className="text-minec-muted d-block fw-light">Fecha de registro</small>
                                  <span className="fw-semibold fw-data text-inter">{formatearFecha(selectedDenuncia.fecha)}</span>
                                </div>
                                <CBadge color="success" className="badge-eco">✓</CBadge>
                              </CListGroupItem>
                              
                              {selectedDenuncia.fechaIncidente && (
                                <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0 py-3">
                                  <div>
                                    <small className="text-minec-muted d-block fw-light">Fecha del incidente</small>
                                    <span className="fw-semibold fw-data text-inter">
                                      {formatearFecha(selectedDenuncia.fechaIncidente)}
                                    </span>
                                  </div>
                                  <CBadge color="info" className="badge-eco">📅</CBadge>
                                </CListGroupItem>
                              )}
                              
                              {selectedDenuncia.fechaResolucion && (
                                <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0 py-3">
                                  <div>
                                    <small className="text-minec-muted d-block fw-light">Fecha de resolución</small>
                                    <span className="fw-semibold fw-data text-inter">
                                      {formatearFecha(selectedDenuncia.fechaResolucion)}
                                    </span>
                                  </div>
                                  <CBadge color="success" className="badge-eco">🏆</CBadge>
                                </CListGroupItem>
                              )}
                            </CListGroup>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                  </div>
                )}
// En DenunciasTable.jsx, en la sección de ubicación (línea ~330), reemplazar:
{/* Sección Ubicación */}
{activeSection === 'ubicacion' && (
  <div className="fade show active">
    <CRow className="g-4">
      <CCol lg={6}>
        {/* Aquí reemplazamos la función renderMapPreview por el nuevo componente */}
        <MapaDenunciaDetalle denuncia={selectedDenuncia} />
      </CCol>
      <CCol lg={6}>
        <CCard className="eco-card h-100">
          <CCardBody className="p-4">
            <h6 className="fw-bold fw-titles mb-4 d-flex align-items-center text-eco">
              <div className="bg-eco-soft rounded-circle p-2 me-3">
                <CIcon icon={cilGlobeAlt} className="text-eco" />
              </div>
              Detalles de Ubicación
            </h6>

            <CListGroup flush>
              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0 py-3">
                <div>
                  <small className="text-minec-muted d-block fw-light">Estado</small>
                  <span className="fw-semibold fw-data text-inter">{selectedDenuncia.estadoUbicacion}</span>
                </div>
                <CBadge color="primary" className="badge-eco">📍</CBadge>
              </CListGroupItem>
              
              <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0 py-3">
                <div>
                  <small className="text-minec-muted d-block fw-light">Municipio</small>
                  <span className="fw-semibold fw-data text-inter">{selectedDenuncia.municipio}</span>
                </div>
                <CBadge color="info" className="badge-eco">🏙️</CBadge>
              </CListGroupItem>
              
              {selectedDenuncia.ubicacion && (
                <CListGroupItem className="d-flex justify-content-between align-items-center border-0 px-0 py-3">
                  <div>
                    <small className="text-minec-muted d-block fw-light">Dirección específica</small>
                    <span className="fw-semibold fw-data text-inter">{selectedDenuncia.ubicacion}</span>
                  </div>
                  <CBadge color="secondary" className="badge-eco">🏠</CBadge>
                </CListGroupItem>
              )}
              
              {(selectedDenuncia.latitud && selectedDenuncia.longitud) && (
                <CListGroupItem className="border-0 px-0 py-3">
                  <small className="text-minec-muted d-block mb-1 fw-light">Coordenadas GPS</small>
                  <div className="d-flex align-items-center">
                    <div className="bg-nature-soft rounded p-2 me-3">
                      <CIcon icon={cilLocationPin} className="text-nature" />
                    </div>
                    <div>
                      <div className="fw-semibold fw-data text-inter">Lat: {selectedDenuncia.latitud}</div>
                      <div className="fw-semibold fw-data text-inter">Lng: {selectedDenuncia.longitud}</div>
                    </div>
                  </div>
                </CListGroupItem>
              )}
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
)}
                {/* Sección Evidencia */}
                {activeSection === 'evidencia' && (
                  <div className="fade show active">
                    {renderEvidencia(selectedDenuncia.evidencia)}
                  </div>
                )}

                {/* Sección Seguimiento */}
                {activeSection === 'seguimiento' && (
                  <div className="fade show active">
                    <CCard className="eco-card">
                      <CCardBody className="p-4">
                        <h6 className="fw-bold fw-titles mb-4 d-flex align-items-center text-eco">
                          <div className="bg-nature-soft rounded-circle p-2 me-3">
                            <CIcon icon={cilClock} className="text-nature" />
                          </div>
                          Historial de Seguimiento
                        </h6>

                        <CAlert color="info" className="border-0 rounded-3 bg-eco-soft">
                          <div className="d-flex">
                            <div className="flex-shrink-0">
                              <CIcon icon={cilShieldAlt} size="lg" className="text-eco" />
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h6 className="alert-heading fw-bold fw-titles text-eco">Tu reporte está en proceso</h6>
                              <p className="mb-2 fw-info text-inter">
                                Nuestro equipo ambiental está revisando la información proporcionada.
                                Recibirás actualizaciones por correo electrónico.
                              </p>
                              <small className="text-minec-muted d-flex align-items-center fw-light">
                                <CIcon icon={cilInfo} className="me-1" />
                                Tiempo estimado de respuesta: 72 horas hábiles
                              </small>
                            </div>
                          </div>
                        </CAlert>

                        <div className="mt-4">
                          <h6 className="fw-bold fw-titles mb-3 text-eco">Próximos pasos</h6>
                          <CListGroup>
                            <CListGroupItem className="d-flex align-items-center border-0 px-0 py-3">
                              <div className="bg-nature-soft rounded-circle p-2 me-3">
                                <CIcon icon={cilCheckCircle} className="text-nature" />
                              </div>
                              <div>
                                <div className="fw-semibold fw-data text-inter">Reporte registrado</div>
                                <small className="text-minec-muted fw-light">Tu denuncia ha sido recibida exitosamente</small>
                              </div>
                              <CBadge color="success" className="ms-auto badge-eco">Completado</CBadge>
                            </CListGroupItem>
                            
                            <CListGroupItem className="d-flex align-items-center border-0 px-0 py-3">
                              <div className={`bg-${getColorProgreso(selectedDenuncia.estado)} bg-opacity-10 rounded-circle p-2 me-3`}>
                                <CIcon icon={cilSearch} className={`text-${getColorProgreso(selectedDenuncia.estado)}`} />
                              </div>
                              <div>
                                <div className="fw-semibold fw-data text-inter">Revisión técnica</div>
                                <small className="text-minec-muted fw-light">El equipo está evaluando la información</small>
                              </div>
                              <CBadge color={getColorProgreso(selectedDenuncia.estado)} className="ms-auto badge-eco">
                                En progreso
                              </CBadge>
                            </CListGroupItem>
                            
                            <CListGroupItem className="d-flex align-items-center border-0 px-0 py-3">
                              <div className="eco-surface rounded-circle p-2 me-3">
                                <CIcon icon={cilWarning} className="text-minec-muted" />
                              </div>
                              <div>
                                <div className="fw-semibold fw-data text-inter">Acción correspondiente</div>
                                <small className="text-minec-muted fw-light">Se tomarán las medidas necesarias</small>
                              </div>
                              <CBadge color="secondary" className="ms-auto badge-eco">Pendiente</CBadge>
                            </CListGroupItem>
                          </CListGroup>
                        </div>
                      </CCardBody>
                    </CCard>
                  </div>
                )}
              </div>
            </>
          )}
        </CModalBody>
        
        <CModalFooter className="border-top-0 eco-surface pt-3 pb-4">
          <div className="d-flex justify-content-between w-100">
            <div>
              <CButton 
                color="outline-secondary" 
                onClick={() => setModalVisible(false)}
                className="rounded-3 px-4 btn-minec-outline"
              >
                <CIcon icon={cilX} className="me-2" />
                Cerrar
              </CButton>
            </div>
            
            <div className="d-flex gap-3">
              <CButton 
                color="outline-danger" 
                onClick={() => {
                  setModalVisible(false);
                  handleDeleteClick(selectedDenuncia);
                }}
                className="rounded-3 px-4"
              >
                <CIcon icon={cilTrash} className="me-2" />
                Eliminar Reporte
              </CButton>
              <CButton 
                color="success" 
                className="rounded-3 px-4 fw-semibold btn-minec-success"
              >
                <CIcon icon={cilShieldAlt} className="me-2" />
                Compartir Reporte
              </CButton>
            </div>
          </div>
        </CModalFooter>
      </CModal>

      {/* Modal de confirmación de eliminación mejorado */}
      <CModal 
        visible={deleteConfirmVisible} 
        onClose={() => setDeleteConfirmVisible(false)}
        className="modal-dialog-centered modal-minec"
      >
        <CModalHeader style={{ 
          background: 'linear-gradient(135deg, var(--danger) 0%, var(--warning) 100%)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <div className="d-flex align-items-center w-100">
            <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
              <CIcon icon={cilWarning} className="text-white" />
            </div>
            <div>
              <CModalTitle className="fw-bold fw-titles h5 mb-0 text-montserrat">
                ⚠️ Confirmar Eliminación
              </CModalTitle>
              <small className="opacity-90 fw-light">Esta acción no se puede deshacer</small>
            </div>
          </div>
        </CModalHeader>
        
        <CModalBody className="text-center py-4">
          <div className="mb-4">
            <div className="bg-danger bg-opacity-10 rounded-circle p-4 d-inline-block">
              <CIcon icon={cilTrash} size="xl" className="text-danger" />
            </div>
          </div>
          
          <h5 className="fw-bold fw-titles mb-3 text-eco">¿Eliminar este reporte?</h5>
          <p className="text-minec-muted mb-4 fw-info text-inter">
            El reporte ambiental <strong>"{denunciaToDelete?.titulo}"</strong> 
            <br />con código <strong>{denunciaToDelete?.id}</strong> será eliminado permanentemente.
          </p>
          
          <CAlert color="warning" className="border-0 rounded-3 bg-eco-soft">
            <div className="d-flex align-items-center">
              <CIcon icon={cilInfo} className="me-2 text-warning" />
              <small className="fw-light text-inter">
                <strong>Importante:</strong> Esta acción eliminará toda la información relacionada con este reporte.
              </small>
            </div>
          </CAlert>
        </CModalBody>
        
        <CModalFooter className="border-top-0 eco-surface pt-3 pb-4">
          <div className="d-flex justify-content-between w-100">
            <CButton 
              color="outline-secondary" 
              onClick={() => setDeleteConfirmVisible(false)}
              disabled={deleting}
              className="rounded-3 px-4 btn-minec-outline"
            >
              Cancelar
            </CButton>
            <CButton 
              color="danger" 
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-3 px-4 fw-semibold"
              style={{ border: 'none' }}
            >
              {deleting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <CIcon icon={cilTrash} className="me-2" />
                  Sí, eliminar definitivamente
                </>
              )}
            </CButton>
          </div>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default DenunciasTable;