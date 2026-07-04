import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CRow, CCol, CFormLabel, CFormSelect, CFormInput,
  CButton, CAlert, CBadge, CAvatar,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople, cilWarning, cilPlus, cilSave,
  cilTask, cilCheckCircle, cilUser, cilX, cilBuilding,
  cilBriefcase, cilPhone,
} from '@coreui/icons';
import { ZONAS_OPERACION, ESTADOS_CUADRILLA, ESPECIALIDADES_DISPONIBLES, ROLES_EQUIPO } from '../constants/cuadrillasConstants';
import tachiraGeoJSON from '../assets/tachira_zonas_features.json';

const TACHIRA_ZONAS = {
  'Zona Norte': { lat: 8.1333, lng: -71.9833, color: '#0d6efd' }, 
  'Zona Sur': { lat: 7.498, lng: -71.597, color: '#198754' },    
  'Zona Este': { lat: 7.983, lng: -71.696, color: '#fd7e14' },   
  'Zona Oeste': { lat: 7.794, lng: -72.443, color: '#dc3545' },  
  'Zona Central': { lat: 7.766, lng: -72.233, color: '#6f42c1' }, 
};

// Componente para actualizar la vista del mapa cuando cambia la zona
const MapUpdater = ({ zona }) => {
  const map = useMap();
  useEffect(() => {
    if (zona && TACHIRA_ZONAS[zona]) {
      const { lat, lng } = TACHIRA_ZONAS[zona];
      map.flyTo([lat, lng], 10, { animate: true, duration: 1.5 });
    } else {
      // Centro del Táchira por defecto
      map.flyTo([7.766, -72.233], 8, { animate: true });
    }
  }, [zona, map]);
  return null;
};

const CuadrillasModalForm = ({
  visible,
  onClose,
  onGuardar,
  formData,
  onInputChange,
  onEspecialidadChange,
  onSupervisorSelect,
  onIntegranteToggle,
  supervisores = [],
  obreros = [],
  error,
  isEdit,
}) => {
  const supervisorSeleccionado = useMemo(() => {
    if (!formData.supervisorId || !supervisores.length) return null;
    return supervisores.find(e => e.id === formData.supervisorId) || null;
  }, [formData.supervisorId, supervisores]);

  const allEmpleados = useMemo(() => [...supervisores, ...obreros], [supervisores, obreros]);

  const integrantesSeleccionados = useMemo(() => {
    return (formData.integrantes || [])
      .map(id => allEmpleados.find(e => e.id === id))
      .filter(Boolean);
  }, [formData.integrantes, allEmpleados]);

  const obrerosDisponibles = useMemo(() => {
    const ids = formData.integrantes || [];
    return obreros.filter(e => !ids.includes(e.id));
  }, [obreros, formData.integrantes]);

  const nombreGenerado = formData.zona
    ? `${formData.zona.toUpperCase()}-${formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'INSPECTOR' : 'OBREROS'}-${String((formData.integrantes?.length || 0) + 1).padStart(3, '0')}`
    : '';

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="pb-2">
        <CModalTitle className="fw-bold text-eco">
          <CIcon icon={cilPeople} className="me-2" />
          {isEdit ? 'Editar Equipo' : formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'Nuevo Inspector' : 'Nueva Cuadrilla'}
          {nombreGenerado && !isEdit && (
            <CBadge color="success" className="ms-2" style={{ fontSize: '0.7rem' }}>
              {nombreGenerado}
            </CBadge>
          )}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={(e) => { e.preventDefault(); onGuardar(); }}>
        <CModalBody className="px-4">
          <CRow>
            <CCol md={6} className="border-end pe-4">
          {error && (
            <CAlert color="danger" className="d-flex align-items-center mb-3 py-2">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
              <small>{error}</small>
            </CAlert>
          )}

          {/* ── Rol del Equipo ── */}
          <div className="mb-3">
            <CFormLabel className="small fw-semibold mb-2">
              <CIcon icon={cilPeople} className="me-1" size="sm" />
              Tipo de Equipo *
            </CFormLabel>
            <CRow className="g-2">
              <CCol xs={6}>
                <div
                  onClick={() => onInputChange({ target: { name: 'rol', value: ROLES_EQUIPO.OPERATIVO } })}
                  className={`border rounded p-2 text-center ${formData.rol === ROLES_EQUIPO.OPERATIVO ? 'border-success bg-success bg-opacity-10' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilPeople} size="lg" className={formData.rol === ROLES_EQUIPO.OPERATIVO ? 'text-success' : 'text-muted'} />
                  <div className={`small fw-semibold mt-1 ${formData.rol === ROLES_EQUIPO.OPERATIVO ? 'text-success' : ''}`}>Cuadrilla Operativa</div>
                  <small className="text-muted" style={{ fontSize: '0.65rem' }}>Equipo de 2+ personas</small>
                </div>
              </CCol>
              <CCol xs={6}>
                <div
                  onClick={() => onInputChange({ target: { name: 'rol', value: ROLES_EQUIPO.TECNICO_INSPECTOR } })}
                  className={`border rounded p-2 text-center ${formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'border-info bg-info bg-opacity-10' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilUser} size="lg" className={formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'text-info' : 'text-muted'} />
                  <div className={`small fw-semibold mt-1 ${formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'text-info' : ''}`}>Inspector Técnico</div>
                  <small className="text-muted" style={{ fontSize: '0.65rem' }}>Inspector individual</small>
                </div>
              </CCol>
            </CRow>
          </div>

          {/* ── Zona + Supervisor ── */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">
                <CIcon icon={cilBuilding} className="me-1" size="sm" />
                Zona de Operación *
              </CFormLabel>
              <CFormSelect
                name="zona"
                value={formData.zona}
                onChange={onInputChange}
                required
              >
                <option value="">Seleccionar zona</option>
                {ZONAS_OPERACION.map(z => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel className="small fw-semibold mb-1">
                <CIcon icon={cilUser} className="me-1" size="sm" />
                {formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'Inspector Asignado' : 'Supervisor / Jefe *'}
              </CFormLabel>

              {supervisorSeleccionado ? (
                <div className="d-flex align-items-center gap-2 p-2 rounded border border-success bg-success bg-opacity-10">
                  <CAvatar size="sm" color="success" textColor="white" className="fw-bold">
                    {supervisorSeleccionado.nombre?.charAt(0)}
                  </CAvatar>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small">{supervisorSeleccionado.nombre}</div>
                    <small className="text-muted">{supervisorSeleccionado.cargo}</small>
                  </div>
                  {supervisorSeleccionado.telefono && (
                    <small className="text-success d-none d-md-inline">
                      <CIcon icon={cilPhone} size="sm" className="me-1" />
                      {supervisorSeleccionado.telefono}
                    </small>
                  )}
                  <CButton color="link" size="sm" className="text-danger p-0" onClick={() => onSupervisorSelect(null)}>
                    <CIcon icon={cilX} />
                  </CButton>
                </div>
              ) : (
                <div className="border rounded eco-surface" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                  {supervisores.length === 0 ? (
                    <div className="text-center text-muted py-3">
                      <small><CIcon icon={cilWarning} className="me-1" />No hay supervisores en RRHH</small>
                    </div>
                  ) : (
                    supervisores.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => onSupervisorSelect(emp.id)}
                        className="eco-list-item d-flex align-items-center gap-2 px-3 py-2 border-bottom"
                        style={{ cursor: 'pointer' }}
                      >
                        <CAvatar size="sm" color="primary" textColor="white" className="fw-bold" style={{ fontSize: '0.6rem' }}>
                          {emp.nombre?.charAt(0)}
                        </CAvatar>
                        <div className="flex-grow-1">
                          <small className="fw-semibold">{emp.nombre}</small>
                          <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{emp.cargo}</small>
                        </div>
                        <CIcon icon={cilPlus} className="text-success" size="sm" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </CCol>
          </CRow>

          {/* ── Integrantes ── */}
          <div className="mb-3">
            <CFormLabel className="small fw-semibold mb-1">
              <CIcon icon={cilBriefcase} className="me-1" size="sm" />
              {formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'Inspector (1 persona) *' : 'Integrantes del Equipo *'}
            </CFormLabel>

            {integrantesSeleccionados.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-2">
                {integrantesSeleccionados.map(emp => (
                  <CBadge
                    key={emp.id}
                    color="success"
                    className="d-flex align-items-center gap-1 px-2 py-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {emp.nombre?.split(' ')[0]}
                    <span
                      onClick={() => onIntegranteToggle(emp.id)}
                      style={{ cursor: 'pointer', marginLeft: '2px' }}
                    >
                      <CIcon icon={cilX} size="sm" />
                    </span>
                  </CBadge>
                ))}
              </div>
            )}

            <div className="border rounded eco-surface" style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {obrerosDisponibles.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <small><CIcon icon={cilWarning} className="me-1" />No hay obreros disponibles</small>
                </div>
              ) : (
                obrerosDisponibles.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => onIntegranteToggle(emp.id)}
                    className="eco-list-item d-flex align-items-center gap-2 px-3 py-1 border-bottom"
                    style={{ cursor: 'pointer' }}
                  >
                    <CAvatar size="sm" color="secondary" textColor="white" style={{ fontSize: '0.55rem' }}>
                      {emp.nombre?.charAt(0)}
                    </CAvatar>
                    <div className="flex-grow-1">
                      <small className="fw-semibold">{emp.nombre}</small>
                      <small className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>{emp.cargo}</small>
                    </div>
                    <CIcon icon={cilPlus} className="text-success" size="sm" />
                  </div>
                ))
              )}
            </div>
            {(formData.integrantes || []).length === 0 && (
              <small className="text-danger d-block mt-1">
                <CIcon icon={cilWarning} className="me-1" size="sm" />
                {formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'Seleccione al inspector' : 'Seleccione al menos 1 integrante'}
              </small>
            )}
          </div>

          {/* ── Especialidades ── */}
          <div className="mb-3">
            <CFormLabel className="small fw-semibold mb-1">
              <CIcon icon={cilTask} className="me-1" size="sm" />
              Especialidades
            </CFormLabel>
            <div className="d-flex flex-wrap gap-1">
              {ESPECIALIDADES_DISPONIBLES.map(esp => {
                const sel = (formData.especialidad || []).includes(esp);
                return (
                  <span
                    key={esp}
                    onClick={() => onEspecialidadChange(esp)}
                    className={`eco-tag ${sel ? 'eco-tag-active' : ''}`}
                  >
                    {sel && <CIcon icon={cilCheckCircle} className="me-1" size="sm" />}
                    {esp.replace(/_/g, ' ')}
                  </span>
                );
              })}
            </div>
          </div>

          {/* ── Estado (solo edición) ── */}
          {isEdit && (
            <div>
              <CFormLabel className="small fw-semibold mb-1">Estado de la Cuadrilla</CFormLabel>
              <CFormSelect size="sm" name="estado" value={formData.estado} onChange={onInputChange} className="w-50">
                {ESTADOS_CUADRILLA.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </CFormSelect>
            </div>
          )}
            </CCol>
            
            <CCol md={6} className="ps-4 d-flex flex-column">
              <CFormLabel className="small fw-semibold mb-2">
                Mapa del Estado Táchira
              </CFormLabel>
              <div className="flex-grow-1 border rounded overflow-hidden shadow-sm" style={{ minHeight: '400px' }}>
                <MapContainer 
                  center={[7.766, -72.233]} 
                  zoom={8} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  <MapUpdater zona={formData.zona} />
                  
                  {/* Dibujar los 29 municipios del Táchira y destacar la zona seleccionada */}
                  {tachiraGeoJSON?.features && (
                    <GeoJSON
                      key={formData.zona || 'none'}
                      data={tachiraGeoJSON}
                      style={(feature) => {
                        const { zona } = feature.properties;
                        
                        if (formData.zona) {
                          if (zona === formData.zona) {
                            return {
                              color: TACHIRA_ZONAS[zona]?.color || '#198754',
                              fillColor: TACHIRA_ZONAS[zona]?.color || '#2eb85c',
                              fillOpacity: 0.5,
                              weight: 2
                            };
                          } else {
                            return {
                              color: '#cccccc',
                              fillOpacity: 0,
                              weight: 1
                            };
                          }
                        } else {
                          return {
                            color: TACHIRA_ZONAS[zona]?.color || '#6c757d',
                            fillColor: TACHIRA_ZONAS[zona]?.color || '#6c757d',
                            fillOpacity: 0.15,
                            weight: 1
                          };
                        }
                      }}
                    />
                  )}
                </MapContainer>
              </div>
              {formData.zona && (
                <div className="mt-3 text-center">
                  <CBadge 
                    style={{ backgroundColor: TACHIRA_ZONAS[formData.zona]?.color || '#6c757d' }}
                    className="px-3 py-2 fs-6 shadow-sm"
                  >
                    {formData.zona}
                  </CBadge>
                </div>
              )}
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="border-top-0 pt-0">
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton
            color="success"
            type="submit"
            className="fw-bold"
            disabled={!formData.zona || (formData.rol === ROLES_EQUIPO.OPERATIVO && !formData.supervisorId) || (formData.integrantes || []).length === 0}
          >
            <CIcon icon={isEdit ? cilSave : cilPlus} className="me-1" />
            {isEdit ? 'Actualizar' : formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'Crear Inspector' : 'Crear Cuadrilla'}
          </CButton>
        </CModalFooter>
      </CForm>

      <style>{`
        .eco-list-item:last-child {
          border-bottom: none !important;
        }
        .eco-list-item:hover {
          background-color: var(--cui-success-bg, rgba(25, 135, 84, 0.08));
        }
        .eco-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border: 1px solid var(--cui-border-color, #dee2e6);
          border-radius: 14px;
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.15s ease;
          background: var(--cui-eco-surface, #f8f9fa);
          color: var(--cui-body-color, #212529);
        }
        .eco-tag:hover {
          border-color: var(--cui-success, #198754);
        }
        .eco-tag-active {
          background: var(--cui-success, #198754);
          color: #fff;
          border-color: var(--cui-success, #198754);
        }
        [data-coreui-theme="dark"] .eco-tag {
          background: var(--cui-eco-surface-dark, #2b3035);
          border-color: var(--cui-border-color-dark, #444b50);
          color: var(--cui-body-color-dark, #e4e5e6);
        }
        [data-coreui-theme="dark"] .eco-list-item:hover {
          background-color: rgba(25, 135, 84, 0.15);
        }
      `}</style>
    </CModal>
  );
};

export default CuadrillasModalForm;