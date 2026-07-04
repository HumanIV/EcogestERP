import React from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CRow, CCol, CFormLabel, CFormSelect, CFormInput,
  CButton, CAlert, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilTask, cilDescription, cilWarning, cilSave, cilInfo,
  cilUser, cilPhone, cilEnvelopeOpen, cilLocationPin,
  cilFile, cilBuilding, cilCreditCard, cilCloudUpload, cilX,
  cilCheckCircle, cilSearch,
} from '@coreui/icons';
import { TIPOS_TRAMITE, SUBTIPOS_PERMISO, SUBTIPOS_LICENCIA } from '../../../GestionAdministrativa/Tramites/constants/tramitesConstants';
import { VENEZUELA_GEO } from '../../_shared/venezuelaGeo';

const MAX_NOMBRE = 30;
const MAX_MUNICIPIO = 40;
const MAX_ESTADO = 40;
const MAX_TELEFONO = 20;
const MAX_EMAIL = 80;
const MAX_DOCS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const detectTipoDocumento = (value) => {
  const cleaned = value.trim().toUpperCase();
  if (!cleaned) return { tipo: null, valido: false };

  const rifPattern = /^[JGVPE]-\d{8}-\d$/;
  const cedulaPattern = /^[VE]-\d{6,8}$/;

  if (rifPattern.test(cleaned)) return { tipo: 'RIF', valido: true };
  if (cedulaPattern.test(cleaned)) return { tipo: 'Cédula', valido: true };
  return { tipo: null, valido: false };
};

const formatCedulaRif = (prefijo, numero) => {
  const num = numero.replace(/\D/g, '');
  if (!num) return '';
  if (['J', 'G', 'V', 'P', 'E'].includes(prefijo)) {
    return `${prefijo}-${num}`;
  }
  return `V-${num}`;
};

const NuevoTramiteForm = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    tipo: TIPOS_TRAMITE.PERMISO,
    subtipo: '',
    solicitante: '',
    cedulaRif: '',
    telefono: '',
    email: '',
    municipio: '',
    estado_geografico: '',
    descripcion: '',
    documentos: [],
  });
  const [error, setError] = React.useState(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [docTipo, setDocTipo] = React.useState('V');
  const [municipiosDisponibles, setMunicipiosDisponibles] = React.useState([]);

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setFormData(prev => ({ ...prev, estado_geografico: estado, municipio: '' }));
    setMunicipiosDisponibles(VENEZUELA_GEO[estado]?.municipios || []);
  };

  const handleMunicipioChange = (e) => {
    setFormData(prev => ({ ...prev, municipio: e.target.value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'tipo') {
      setFormData(prev => ({ ...prev, tipo: value, subtipo: '' }));
    }
  };

  const handleCedulaNumeroChange = (e) => {
    const num = e.target.value.replace(/\D/g, '').slice(0, 10);
    const formatted = formatCedulaRif(docTipo, num);
    setFormData(prev => ({ ...prev, cedulaRif: formatted }));
  };

  const handleDocTipoChange = (e) => {
    const nuevoTipo = e.target.value;
    setDocTipo(nuevoTipo);
    const num = formData.cedulaRif.replace(/\D/g, '');
    const formatted = formatCedulaRif(nuevoTipo, num);
    setFormData(prev => ({ ...prev, cedulaRif: formatted }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFiles = (files) => {
    const nuevosDocs = Array.from(files).filter(f => {
      if (f.type !== 'application/pdf') {
        setError(`"${f.name}" no es un archivo PDF válido.`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`"${f.name}" supera el límite de 10MB.`);
        return false;
      }
      return true;
    });

    if (nuevosDocs.length > 0) {
      setFormData(prev => {
        const total = [...prev.documentos, ...nuevosDocs];
        if (total.length > MAX_DOCS) {
          setError(`Máximo ${MAX_DOCS} documentos permitidos.`);
          return prev;
        }
        return { ...prev, documentos: total };
      });
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeDoc = (index) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index),
    }));
  };

  const handleGuardar = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.solicitante || !formData.cedulaRif || !formData.subtipo || !formData.descripcion || !formData.estado_geografico || !formData.municipio) {
      setError('Complete todos los campos obligatorios.');
      return;
    }

    const docCheck = detectTipoDocumento(formData.cedulaRif);
    if (!docCheck.valido) {
      setError('Formato de Cédula/RIF inválido. Use: V-12345678 (Cédula) o J-12345678-9 (RIF).');
      return;
    }

    if (formData.descripcion.length > 50) {
      setError('La descripción no debe exceder los 50 caracteres.');
      return;
    }
    if (formData.email && !validateEmail(formData.email)) {
      setError('El email no es válido.');
      return;
    }

    const docNombres = formData.documentos.map(f => f.name);
    onSave({ ...formData, documentos: docNombres });
    setFormData({
      tipo: TIPOS_TRAMITE.PERMISO,
      subtipo: '',
      solicitante: '',
      cedulaRif: '',
      telefono: '',
      email: '',
      municipio: '',
      estado_geografico: '',
      descripcion: '',
      documentos: [],
    });
    setDocTipo('V');
  };

  const subtipos = formData.tipo === TIPOS_TRAMITE.LICENCIA ? SUBTIPOS_LICENCIA : SUBTIPOS_PERMISO;
  const isPermiso = formData.tipo === TIPOS_TRAMITE.PERMISO;
  const themeColor = isPermiso ? 'primary' : 'success';
  const themeIcon = isPermiso ? cilTask : cilDescription;

  const docCheck = detectTipoDocumento(formData.cedulaRif);

  const infoSteps = isPermiso
    ? [
      { num: 1, text: 'Complete sus datos personales' },
      { num: 2, text: 'Indique la ubicación del proyecto' },
      { num: 3, text: 'Describa la actividad y adjunte requisitos en PDF' },
    ]
    : [
      { num: 1, text: 'Complete los datos del titular' },
      { num: 2, text: 'Indique la ubicación de la instalación' },
      { num: 3, text: 'Describa el proyecto y adjunte documentos en PDF' },
    ];

  return (
    <CModal visible={visible} onClose={() => { onClose(); setError(null); }} size="xl" scrollable backdrop="static">
      <CModalHeader closeButton className={`pb-3 ${isPermiso ? 'bg-primary bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
        <CModalTitle className={`fw-bold ${isPermiso ? 'text-primary' : 'text-success'}`}>
          <CIcon icon={themeIcon} className="me-2" />
          {isPermiso ? 'Solicitud de Permiso Ambiental' : 'Solicitud de Licencia Ambiental'}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleGuardar}>
        <CModalBody className="px-4 py-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <CAlert color="danger" className="d-flex align-items-center mb-3 py-2">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
              <small>{error}</small>
            </CAlert>
          )}

          {/* Steps indicator */}
          <div className="d-flex gap-2 mb-4">
            {infoSteps.map((step, i) => (
              <div key={i} className="d-flex align-items-center flex-grow-1">
                <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${themeColor === 'primary' ? 'bg-primary' : 'bg-success'} text-white`} style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                  {step.num}
                </div>
                <small className="ms-2 text-muted d-none d-md-inline">{step.text}</small>
                {i < infoSteps.length - 1 && <hr className="flex-grow-1 mx-2 my-0 opacity-25" />}
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* SECCIÓN 1: Tipo + Datos del Solicitante */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className={`fw-bold mb-3 d-flex align-items-center ${isPermiso ? 'text-primary' : 'text-success'}`}>
              <CIcon icon={cilUser} className="me-2" size="sm" />
              Paso 1 — Tipo y Datos del Solicitante
            </h6>

            <CRow className="g-3">
              {/* Tipo */}
              <CCol md={4}>
                <CFormLabel className="small fw-semibold mb-1">Tipo de Trámite *</CFormLabel>
                <CFormSelect name="tipo" value={formData.tipo} onChange={handleInputChange} required>
                  <option value={TIPOS_TRAMITE.PERMISO}>Permiso Ambiental</option>
                  <option value={TIPOS_TRAMITE.LICENCIA}>Licencia Ambiental</option>
                </CFormSelect>
                <small className="text-muted d-block mt-1">
                  {isPermiso
                    ? 'Autoriza actividades puntuales y temporales'
                    : 'Habilita operación continua de proyectos'}
                </small>
              </CCol>

              {/* Subtipo */}
              <CCol md={4}>
                <CFormLabel className="small fw-semibold mb-1">
                  <CIcon icon={cilFile} className="me-1" size="sm" />
                  Subtipo *
                </CFormLabel>
                <CFormSelect name="subtipo" value={formData.subtipo} onChange={handleInputChange} required>
                  <option value="">Seleccionar...</option>
                  {subtipos.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Solicitante */}
              <CCol md={4}>
                <CFormLabel className="small fw-semibold mb-1">
                  {isPermiso ? 'Solicitante' : 'Titular'} *
                </CFormLabel>
                <CFormInput
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleInputChange}
                  placeholder={isPermiso ? 'Nombre de la empresa o persona' : 'Nombre del titular o empresa'}
                  maxLength={MAX_NOMBRE}
                  required
                />
                <small className="text-muted">{formData.solicitante.length}/{MAX_NOMBRE}</small>
              </CCol>
            </CRow>

            {/* Cédula/RIF + Teléfono + Email */}
            <CRow className="g-3 mt-1">
              <CCol md={4}>
                <CFormLabel className="small fw-semibold mb-1">
                  <CIcon icon={cilCreditCard} className="me-1" size="sm" />
                  Cédula / RIF *
                </CFormLabel>
                <div className="d-flex gap-2">
                  <CFormSelect
                    value={docTipo}
                    onChange={handleDocTipoChange}
                    style={{ maxWidth: '70px' }}
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="J">J</option>
                    <option value="G">G</option>
                    <option value="P">P</option>
                  </CFormSelect>
                  <CFormInput
                    value={formData.cedulaRif.replace(/\D/g, '')}
                    onChange={handleCedulaNumeroChange}
                    placeholder={docTipo === 'J' || docTipo === 'G' || docTipo === 'P' ? '123456789' : '12345678'}
                    maxLength={10}
                    required
                  />
                </div>
                {docCheck.tipo && (
                  <CBadge color={docCheck.tipo === 'RIF' ? 'warning' : 'info'} className="mt-1 px-2 py-1">
                    <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                    {docCheck.tipo} detectado
                  </CBadge>
                )}
                {formData.cedulaRif.length > 0 && !docCheck.valido && (
                  <small className="text-danger d-block mt-1">
                    <CIcon icon={cilWarning} className="me-1" size="sm" />
                    Formato incompleto
                  </small>
                )}
              </CCol>
              <CCol md={4}>
                <CFormLabel className="small fw-semibold mb-1">
                  <CIcon icon={cilPhone} className="me-1" size="sm" />
                  Teléfono
                </CFormLabel>
                <CFormInput
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+58 412-555-0000"
                  maxLength={MAX_TELEFONO}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel className="small fw-semibold mb-1">
                  <CIcon icon={cilEnvelopeOpen} className="me-1" size="sm" />
                  Email
                </CFormLabel>
                <CFormInput
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  maxLength={MAX_EMAIL}
                />
              </CCol>
            </CRow>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* SECCIÓN 2: Ubicación                    */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className={`fw-bold mb-3 d-flex align-items-center ${isPermiso ? 'text-primary' : 'text-success'}`}>
              <CIcon icon={cilLocationPin} className="me-2" size="sm" />
              Paso 2 — Ubicación del {isPermiso ? 'Proyecto' : 'Proyecto/Instalación'}
            </h6>

            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel className="small fw-semibold mb-1">
                  <CIcon icon={cilBuilding} className="me-1" size="sm" />
                  Estado *
                </CFormLabel>
                <CFormSelect
                  name="estado_geografico"
                  value={formData.estado_geografico}
                  onChange={handleEstadoChange}
                  required
                >
                  <option value="">Seleccionar estado...</option>
                  {Object.keys(VENEZUELA_GEO).map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small fw-semibold mb-1">
                  <CIcon icon={cilBuilding} className="me-1" size="sm" />
                  Municipio *
                </CFormLabel>
                <CFormSelect
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleMunicipioChange}
                  disabled={!formData.estado_geografico}
                  required
                >
                  <option value="">
                    {!formData.estado_geografico
                      ? 'Seleccione un estado primero'
                      : 'Seleccionar municipio...'}
                  </option>
                  {municipiosDisponibles.map(mun => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* SECCIÓN 3: Descripción + Documentos     */}
          {/* ═══════════════════════════════════════ */}
          <div className="mb-4">
            <h6 className={`fw-bold mb-3 d-flex align-items-center ${isPermiso ? 'text-primary' : 'text-success'}`}>
              <CIcon icon={cilFile} className="me-2" size="sm" />
              Paso 3 — Descripción y Documentos
            </h6>

            {/* Descripción */}
            <div className="mb-3">
              <CFormLabel className="small fw-semibold mb-1">Descripción *</CFormLabel>
              <textarea
                className="form-control"
                name="descripcion"
                rows="4"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder={isPermiso
                  ? 'Describa la actividad que requiere el permiso: ubicación exacta, duración estimada, impacto ambiental previsto...'
                  : 'Describa el proyecto o instalación: tipo de actividad, capacidad operativa, procesos involucrados...'
                }
                maxLength={50}
                required
              />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">Máximo 50 caracteres</small>
                <small className={formData.descripcion.length <= 50 ? 'text-success fw-bold' : 'text-danger'}>
                  {formData.descripcion.length} caracteres
                </small>
              </div>
            </div>

            {/* Upload de documentos */}
            <div className="mb-3">
              <CFormLabel className="small fw-semibold mb-1">
                <CIcon icon={cilCloudUpload} className="me-1" size="sm" />
                Documentos de Soporte (PDF únicamente)
              </CFormLabel>

              <div
                className={`border rounded p-4 text-center ${dragActive ? `border-${themeColor} bg-${themeColor} bg-opacity-10` : 'border-dashed'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{ cursor: 'pointer', borderStyle: dragActive ? 'solid' : 'dashed' }}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <CIcon icon={cilCloudUpload} size="2xl" className={`text-${themeColor} mb-2`} />
                <p className={`mb-1 fw-semibold text-${themeColor}`}>
                  {dragActive ? 'Suelte los archivos aquí' : 'Arrastre archivos PDF o haga clic para seleccionar'}
                </p>
                <small className="text-muted">Solo PDF · Máximo {MAX_DOCS} archivos · Hasta 10MB cada uno</small>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                    }
                  }}
                />
              </div>

              {/* Lista de documentos cargados */}
              {formData.documentos.length > 0 && (
                <div className="mt-3">
                  <small className="fw-semibold text-muted d-block mb-2">
                    {formData.documentos.length} documento(s) cargado(s):
                  </small>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.documentos.map((doc, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 border rounded px-2 py-1 bg-light">
                        <CIcon icon={cilFile} className="text-danger" size="sm" />
                        <small className="fw-semibold" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.name}
                        </small>
                        <small className="text-muted">({(doc.size / 1024).toFixed(0)} KB)</small>
                        <CButton
                          color="link"
                          size="sm"
                          className="p-0 text-danger"
                          onClick={(e) => { e.stopPropagation(); removeDoc(idx); }}
                        >
                          <CIcon icon={cilX} size="sm" />
                        </CButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className={`border rounded p-3 ${isPermiso ? 'bg-primary bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
            <h6 className={`fw-bold mb-2 ${isPermiso ? 'text-primary' : 'text-success'}`}>
              <CIcon icon={cilSearch} className="me-2" size="sm" />
              Resumen de la Solicitud
            </h6>
            <CRow className="g-2 small">
              <CCol xs={6} md={3}>
                <span className="text-muted">Tipo:</span>{' '}
                <CBadge color={themeColor}>{isPermiso ? 'Permiso' : 'Licencia'}</CBadge>
              </CCol>
              <CCol xs={6} md={3}>
                <span className="text-muted">Subtipo:</span>{' '}
                <strong>{formData.subtipo || '—'}</strong>
              </CCol>
              <CCol xs={6} md={3}>
                <span className="text-muted">Solicitante:</span>{' '}
                <strong>{formData.solicitante || '—'}</strong>
              </CCol>
              <CCol xs={6} md={3}>
                <span className="text-muted">Documento:</span>{' '}
                <strong>{docCheck.tipo || '—'}</strong>
              </CCol>
            </CRow>
          </div>
        </CModalBody>

        <CModalFooter className="border-top-0 pt-0">
          <CButton color="secondary" variant="outline" onClick={() => { onClose(); setError(null); }}>
            Cancelar
          </CButton>
          <CButton color={themeColor} type="submit" className="fw-bold px-4">
            <CIcon icon={cilSave} className="me-1" />
            {isPermiso ? 'Enviar Solicitud de Permiso' : 'Enviar Solicitud de Licencia'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
};

export default NuevoTramiteForm;
