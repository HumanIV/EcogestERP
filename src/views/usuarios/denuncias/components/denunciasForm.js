import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CFormInput, CFormSelect, CFormTextarea, CFormLabel,
  CRow, CCol, CAlert, CSpinner,
  CProgress, CProgressBar, CCard, CCardBody,
  CBadge, CListGroup, CListGroupItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilLocationPin, cilCloudUpload, cilWarning,
  cilMap, cilImage, cilDescription, cilCheckCircle, cilInfo,
  cilTrash, cilArrowRight, cilArrowLeft,
  cilShieldAlt, cilSend, cilPlus, cilCircle
} from '@coreui/icons';
import MapaInteractivo from './mapaInteractivo';
import { validateSelect, validateFiles, sanitizeText } from '../../_shared/validation';
import { ESTADOS_VENEZUELA } from '../../_shared/constants';
import { getMunicipiosByEstado, getCapitalCoords } from '../../_shared/venezuelaGeo';
import useToast from '../../_shared/useToast';
import useConfirmModal from '../../_shared/useConfirmModal';

const PRIORIDAD_POR_TIPO = {
  deforestacion: 'alta',
  contaminacion_agua: 'alta',
  contaminacion_aire: 'alta',
  fauna_silvestre: 'alta',
  residuos_solidos: 'media',
  mineria_ilegal: 'alta',
  urbanismo: 'media',
  otros: 'baja'
};

const TIPOS_CONFIG = [
  { value: 'deforestacion', label: 'Deforestación', desc: 'Tala ilegal', icon: '🌳', color: 'danger' },
  { value: 'contaminacion_agua', label: 'Contaminación del Agua', desc: 'Vertidos tóxicos', icon: '💧', color: 'danger' },
  { value: 'contaminacion_aire', label: 'Contaminación del Aire', desc: 'Emisiones nocivas', icon: '💨', color: 'warning' },
  { value: 'fauna_silvestre', label: 'Fauna Silvestre', desc: 'Caza/tráfico ilegal', icon: '🐾', color: 'danger' },
  { value: 'residuos_solidos', label: 'Residuos Sólidos', desc: 'Basura/vertederos', icon: '🗑️', color: 'warning' },
  { value: 'mineria_ilegal', label: 'Minería Ilegal', desc: 'Extracción ilegal', icon: '⛏️', color: 'danger' },
  { value: 'urbanismo', label: 'Urbanismo', desc: 'Construcción irregular', icon: '🏗️', color: 'info' },
  { value: 'otros', label: 'Otros', desc: 'Otro incidente', icon: '📝', color: 'secondary' }
];

const DenunciaForm = ({ visible, onClose, onSave }) => {
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmModal } = useConfirmModal();
  const mapaRef = useRef(null);
  const fileInputRef = useRef(null);

  const initialState = {
    tipo: '',
    estadoUbicacion: '',
    municipio: '',
    ubicacion: '',
    latitud: '',
    longitud: '',
    evidencia: [],
    fechaIncidente: '',
    mapaPosition: null
  };

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(50);
  const [searchingAddress, setSearchingAddress] = useState(false);

  const municipiosDisponibles = useMemo(() => {
    return getMunicipiosByEstado(form.estadoUbicacion);
  }, [form.estadoUbicacion]);

  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setForm(initialState);
        setErrors({});
        setActiveTab(0);
        setProgress(50);
      }, 300);
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === 'estadoUbicacion') {
      updated.municipio = '';
      const coords = getCapitalCoords(value);
      if (coords && mapaRef.current) {
        mapaRef.current.flyTo(coords[0], coords[1], 9);
      }
    }

    if (name === 'municipio' && updated.estadoUbicacion) {
      const coords = getCapitalCoords(updated.estadoUbicacion);
      if (coords && mapaRef.current) {
        mapaRef.current.flyTo(coords[0], coords[1], 12);
      }
    }

    setForm(updated);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const result = validateFiles(files, form.evidencia);
    if (!result.isValid) {
      showToast(result.errorMessage, 'warning', 5000);
    }
    if (result.validFiles.length > 0) {
      setForm(prev => ({
        ...prev,
        evidencia: [...prev.evidencia, ...result.validFiles]
      }));
    }
  };

  const removeFile = (index) => {
    setForm(prev => ({
      ...prev,
      evidencia: prev.evidencia.filter((_, i) => i !== index)
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = [position.coords.latitude, position.coords.longitude];
          setForm(prev => ({
            ...prev,
            latitud: position.coords.latitude.toFixed(6),
            longitud: position.coords.longitude.toFixed(6),
            mapaPosition: newPosition
          }));
          showToast('Ubicación obtenida', 'success');
        },
        (error) => {
          showToast(`Error de ubicación: ${error.message}`, 'warning');
        },
        { timeout: 10000 }
      );
    } else {
      showToast('Tu navegador no soporta geolocalización', 'warning');
    }
  };

  const handleMapLocationSelect = (position) => {
    setSearchingAddress(true);
    setForm(prev => ({
      ...prev,
      latitud: position.lat.toFixed(6),
      longitud: position.lng.toFixed(6),
      mapaPosition: [position.lat, position.lng],
      ubicacion: 'Obteniendo dirección...'
    }));
  };

  const handleAddressFound = (address) => {
    setSearchingAddress(false);
    setForm(prev => ({
      ...prev,
      ubicacion: address
    }));
  };

  const validateCurrentTab = () => {
    const currentErrors = {};
    const tiposValidos = TIPOS_CONFIG.map(t => t.value);

    if (activeTab === 0) {
      const tipoV = validateSelect(form.tipo, tiposValidos, 'el tipo de incidente');
      if (!tipoV.isValid) currentErrors.tipo = tipoV.error;
    } else {
      const estadoV = validateSelect(form.estadoUbicacion, ESTADOS_VENEZUELA, 'el estado');
      if (!estadoV.isValid) currentErrors.estadoUbicacion = estadoV.error;

      if (!form.municipio) {
        currentErrors.municipio = 'Selecciona el municipio';
      } else if (form.estadoUbicacion && municipiosDisponibles.length > 0 && !municipiosDisponibles.includes(form.municipio)) {
        currentErrors.municipio = 'Municipio inválido para el estado seleccionado';
      }
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      showToast('Completa los campos requeridos', 'warning');
      return false;
    }

    setErrors({});
    return true;
  };

  const nextTab = () => {
    if (activeTab < 1) {
      if (!validateCurrentTab()) return;
      setActiveTab(1);
      setProgress(100);
    }
  };

  const prevTab = () => {
    if (activeTab > 0) {
      setActiveTab(0);
      setProgress(50);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === 0) {
      nextTab();
      return;
    }

    if (!validateCurrentTab()) return;

    const tipoConfig = TIPOS_CONFIG.find(t => t.value === form.tipo);
    const tituloAuto = `Reporte de ${tipoConfig?.label || 'incidente'} - ${form.estadoUbicacion}`;
    const descripcionAuto = `Incidente de tipo ${tipoConfig?.label?.toLowerCase() || 'desconocido'} reportado en ${form.municipio}, ${form.estadoUbicacion}`;

    const sanitizedForm = {
      ...form,
      titulo: sanitizeText(tituloAuto),
      descripcion: sanitizeText(descripcionAuto),
      municipio: sanitizeText(form.municipio),
      ubicacion: sanitizeText(form.ubicacion),
      prioridad: PRIORIDAD_POR_TIPO[form.tipo] || 'media',
      latitud: form.latitud ? Number(form.latitud) : null,
      longitud: form.longitud ? Number(form.longitud) : null,
      fechaRegistro: Date.now()
    };

    setSubmitting(true);
    try {
      await onSave(sanitizedForm);
      setForm(initialState);
      setErrors({});
      setActiveTab(0);
      setProgress(50);
      onClose();
    } catch {
      showToast('Error al registrar. Intenta nuevamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    const hasChanges = Object.entries(form).some(
      ([key, value]) => value !== initialState[key]
    );

    const resetAndClose = () => {
      setForm(initialState);
      setErrors({});
      setActiveTab(0);
      setProgress(50);
      onClose();
    };

    if (hasChanges) {
      const ok = await confirm(
        'Cancelar reporte',
        '¿Seguro que quieres cancelar? Se perderán los datos.',
        { confirmLabel: 'Sí, cancelar', variant: 'warning' }
      );
      if (ok) resetAndClose();
    } else {
      resetAndClose();
    }
  };

  if (!visible) return null;

  const mapPosition = form.mapaPosition ||
    (form.latitud && form.longitud ? [parseFloat(form.latitud), parseFloat(form.longitud)] : null);

  return (
    <>
      <CModal
        visible={visible}
        onClose={handleClose}
        size="xl"
        backdrop="static"
        scrollable
        className="modal-dialog-centered modal-minec"
      >
        <CModalHeader className="border-bottom-0 pb-2" style={{
          background: 'linear-gradient(135deg, var(--eco-700) 0%, var(--eco-500) 100%)',
          color: 'white'
        }}>
          <div className="d-flex align-items-center w-100">
            <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
              <CIcon icon={cilWarning} className="text-white" />
            </div>
            <div>
              <CModalTitle className="fw-bold fw-titles h4 mb-0 text-montserrat">
                Nuevo Reporte Ambiental
              </CModalTitle>
              <small className="opacity-90 fw-light">Selecciona tipo y ubica el incidente</small>
            </div>
            <CBadge
              color="warning"
              shape="rounded-pill"
              className="ms-auto"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Paso {activeTab + 1} de 2
            </CBadge>
          </div>
        </CModalHeader>

        <CModalBody className="pt-4">
          <div className="mb-4">
            <div className="position-relative">
              <CProgress style={{ height: '6px', borderRadius: 'var(--radius-sm)' }}>
                <CProgressBar
                  color="success"
                  value={progress}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                />
              </CProgress>
              <div className="position-absolute top-0 start-0 w-100" style={{ top: '-12px' }}>
                <div className="d-flex justify-content-between">
                  {[
                    { title: 'Incidente', icon: cilDescription },
                    { title: 'Ubicación', icon: cilMap }
                  ].map((step, index) => (
                    <div key={index} className="position-relative">
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center ${index === activeTab ? 'bg-success text-white' : 'eco-surface text-minec-muted'}`}
                        style={{
                          width: '30px',
                          height: '30px',
                          border: `3px solid ${index <= activeTab ? 'var(--eco-500)' : 'var(--neutral-200)'}`,
                          transition: 'var(--transition-base)'
                        }}
                      >
                        <CIcon icon={step.icon} size="sm" />
                      </div>
                      <div className="position-absolute top-100 start-50 translate-x-50 mt-2">
                        <small className={`fw-semibold fw-data text-inter ${index === activeTab ? 'text-success' : 'text-minec-muted'}`}>
                          {step.title}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {activeTab === 0 && (
            <>
              <div className="text-center mb-3">
                <h5 className="fw-bold text-montserrat text-eco mb-1">Qué tipo de incidente?</h5>
                <p className="text-minec-muted small mb-0">Selecciona una opción</p>
              </div>

              <div className="mb-4">
                <CRow className="g-2">
                  {TIPOS_CONFIG.map((tipo) => (
                    <CCol xs={6} sm={4} md={3} key={tipo.value}>
                      <div
                        className={`border rounded-3 p-3 text-center cursor-pointer transition-all ${form.tipo === tipo.value
                          ? `border-${tipo.color} border-2 shadow-sm bg-${tipo.color} bg-opacity-10`
                          : 'border-light hover-shadow'}`}
                        onClick={() => {
                          setForm(prev => ({ ...prev, tipo: tipo.value }));
                          if (errors.tipo) setErrors(prev => ({ ...prev, tipo: null }));
                        }}
                        style={{ cursor: 'pointer', minHeight: '90px', transition: 'var(--transition-base)' }}
                      >
                        <span className="fs-3 d-block mb-1">{tipo.icon}</span>
                        <small className="fw-semibold d-block text-inter">{tipo.label}</small>
                        <small className="text-minec-muted" style={{ fontSize: '0.7rem' }}>{tipo.desc}</small>
                        {form.tipo === tipo.value && (
                          <CBadge color={tipo.color} className="mt-1" style={{ fontSize: '0.65rem' }}>
                            Prioridad {PRIORIDAD_POR_TIPO[tipo.value]}
                          </CBadge>
                        )}
                      </div>
                    </CCol>
                  ))}
                </CRow>
                {errors.tipo && (
                  <div className="text-danger small mt-2 d-flex align-items-center">
                    <CIcon icon={cilWarning} className="me-1" />
                    {errors.tipo}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-semibold text-inter small">Fecha del incidente (opcional)</CFormLabel>
                <CFormInput
                  type="date"
                  name="fechaIncidente"
                  value={form.fechaIncidente}
                  onChange={handleChange}
                  className="input-minec"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-semibold text-inter small">
                  Evidencia (opcional)
                </CFormLabel>
                <div className="border rounded-3 p-3 border-dashed text-center" style={{ borderStyle: 'dashed' }}>
                  <CIcon icon={cilCloudUpload} className="text-minec-muted mb-2" size="lg" />
                  <p className="text-minec-muted small mb-2">Arrastra o selecciona archivos</p>
                  <CButton
                    color="outline-primary"
                    size="sm"
                    onClick={() => fileInputRef.current.click()}
                    className="rounded-3"
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Seleccionar
                  </CButton>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,.pdf,video/mp4"
                    className="d-none"
                    ref={fileInputRef}
                  />
                  <p className="text-minec-muted small mt-2 mb-0" style={{ fontSize: '0.7rem' }}>
                    Máx 10MB por archivo • JPG, PNG, PDF, MP4 (máx 5)
                  </p>
                </div>

                {form.evidencia.length > 0 && (
                  <div className="mt-2">
                    <CListGroup>
                      {form.evidencia.map((file, index) => (
                        <CListGroupItem
                          key={index}
                          className="d-flex justify-content-between align-items-center rounded-3 mb-2 eco-surface py-2"
                        >
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilImage} className="text-minec-muted me-2" />
                            <small className="text-inter">{file.name}</small>
                          </div>
                          <CButton
                            color="outline-danger"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="rounded-circle p-1"
                            style={{ width: '28px', height: '28px', padding: '0' }}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 1 && (
            <>
              <div className="text-center mb-3">
                <h5 className="fw-bold text-montserrat text-eco mb-1">Dónde ocurrió?</h5>
                <p className="text-minec-muted small mb-0">Marca en el mapa o selecciona estado y municipio</p>
              </div>

              <CCard className="eco-card mb-3">
                <CCardBody className="p-2">
                  <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <span className="small fw-semibold text-inter">
                      <CIcon icon={cilMap} className="me-1 text-eco" />
                      Mapa interactivo
                    </span>
                    <CButton
                      color="outline-success"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="rounded-pill px-2"
                    >
                      <CIcon icon={cilCircle} className="me-1" size="sm" />
                      Mi ubicación
                    </CButton>
                  </div>
                  <div style={{ minHeight: '350px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <MapaInteractivo
                      ref={mapaRef}
                      onLocationSelect={handleMapLocationSelect}
                      onAddressFound={handleAddressFound}
                      initialPosition={mapPosition}
                    />
                  </div>
                  {form.latitud && form.longitud && (
                    <div className="mt-2 px-2 py-2 rounded-3 eco-surface d-flex justify-content-between align-items-center">
                      <small className="fw-semibold fw-data text-inter">
                        Lat: {form.latitud}, Lng: {form.longitud}
                      </small>
                      <CBadge color="success" style={{ fontSize: '0.7rem' }}>
                        <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                        Ubicación marcada
                      </CBadge>
                    </div>
                  )}
                </CCardBody>
              </CCard>

              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold text-inter small">
                    <span className="text-danger">*</span> Estado
                  </CFormLabel>
                  <CFormSelect
                    name="estadoUbicacion"
                    value={form.estadoUbicacion}
                    onChange={handleChange}
                    className={`input-minec ${errors.estadoUbicacion ? 'border-danger' : ''}`}
                  >
                    <option value="">Selecciona un estado</option>
                    {ESTADOS_VENEZUELA.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </CFormSelect>
                  {errors.estadoUbicacion && (
                    <div className="text-danger small mt-1 d-flex align-items-center">
                      <CIcon icon={cilWarning} className="me-1" />
                      {errors.estadoUbicacion}
                    </div>
                  )}
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold text-inter small">
                    <span className="text-danger">*</span> Municipio
                  </CFormLabel>
                  <CFormSelect
                    name="municipio"
                    value={form.municipio}
                    onChange={handleChange}
                    disabled={!form.estadoUbicacion}
                    className={`input-minec ${errors.municipio ? 'border-danger' : ''}`}
                  >
                    <option value="">
                      {form.estadoUbicacion ? 'Selecciona un municipio' : 'Primero selecciona estado'}
                    </option>
                    {municipiosDisponibles.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </CFormSelect>
                  {errors.municipio && (
                    <div className="text-danger small mt-1 d-flex align-items-center">
                      <CIcon icon={cilWarning} className="me-1" />
                      {errors.municipio}
                    </div>
                  )}
                </CCol>
              </CRow>

              <div className="mb-3 mt-3">
                <CFormLabel className="fw-semibold text-inter small">Dirección o referencia</CFormLabel>
                <div className="position-relative">
                  <CFormTextarea
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    placeholder="Calle, sector, cerca de..."
                    maxLength={500}
                    className={`input-minec ${searchingAddress ? 'text-minec-muted fst-italic' : ''}`}
                    style={{ borderRadius: 'var(--radius-lg)', minHeight: '60px', resize: 'none', paddingRight: '40px' }}
                  />
                  {searchingAddress && (
                    <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                      <CSpinner size="sm" color="primary" />
                    </div>
                  )}
                  {!searchingAddress && form.ubicacion && form.latitud && (
                    <div className="position-absolute" style={{ top: '8px', right: '10px' }}>
                      <CBadge color="success" style={{ fontSize: '0.65rem' }}>
                        <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                        Auto
                      </CBadge>
                    </div>
                  )}
                </div>
                <small className="text-minec-muted" style={{ fontSize: '0.7rem' }}>
                  {form.ubicacion && form.latitud ? 'Dirección obtenida del mapa' : 'Selecciona un punto en el mapa para obtener la dirección automáticamente'}
                </small>
              </div>

              <CAlert color="info" className="rounded-3 bg-eco-soft border-0 small mb-0">
                <CIcon icon={cilInfo} className="me-2 text-eco" />
                <strong>Sugerencia:</strong> Marca el punto exacto en el mapa para mayor precisión
              </CAlert>
            </>
          )}
        </CModalBody>

        <CModalFooter className="border-top-0 eco-surface pt-3 pb-4">
          <div className="d-flex justify-content-between w-100">
            <div>
              {activeTab > 0 && (
                <CButton
                  color="outline-secondary"
                  onClick={prevTab}
                  disabled={submitting}
                  className="rounded-3 px-3"
                >
                  <CIcon icon={cilArrowLeft} className="me-1" />
                  Atrás
                </CButton>
              )}
            </div>

            <div className="d-flex gap-2">
              <CButton
                color="outline-secondary"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-3 px-3"
              >
                Cancelar
              </CButton>
              <CButton
                color={activeTab === 1 ? "success" : "primary"}
                onClick={handleSubmit}
                disabled={submitting}
                className={`rounded-3 px-3 fw-semibold ${activeTab === 1 ? 'btn-minec-success' : 'btn-minec'}`}
                style={{ minWidth: '140px' }}
              >
                {submitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Enviando...
                  </>
                ) : activeTab === 1 ? (
                  <>
                    <CIcon icon={cilSend} className="me-1" />
                    Enviar Reporte
                  </>
                ) : (
                  <>
                    Siguiente
                    <CIcon icon={cilArrowRight} className="ms-1" />
                  </>
                )}
              </CButton>
            </div>
          </div>
        </CModalFooter>
      </CModal>
      <ToastContainer />
      <ConfirmModal />
    </>
  );
};

export default DenunciaForm;
