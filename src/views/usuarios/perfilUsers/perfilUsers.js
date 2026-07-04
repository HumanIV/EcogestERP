import React, { useState, useEffect } from 'react';
import {
  CContainer, CCard, CCardBody, CCardHeader, CRow, CCol,
  CAvatar, CButton, CForm, CFormInput,
  CListGroup, CListGroupItem, CBadge,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPencil, cilSave, cilX, cilEnvelopeOpen,
  cilPhone, cilLockLocked, cilUser, cilCircle,
  cilCalendar, cilHome, cilShieldAlt
} from '@coreui/icons';

import { MOCK_USUARIO, PROFILE_FIELDS, PASSWORD_FIELDS } from './constants/perfilConfig';
import { validateText, validateEmail, validatePhone, validatePassword, sanitizeText } from '../_shared/validation';
import useToast from '../_shared/useToast';

// ── HELPER: reusable info row ────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, gradient }) => (
  <CListGroupItem className="border-0 p-3 d-flex align-items-center eco-surface rounded-3 mb-3">
    <div className="me-3">
      <div className="stats-icon-minec" style={gradient ? { background: gradient } : undefined}>
        <CIcon icon={icon} />
      </div>
    </div>
    <div className="flex-grow-1">
      <div className="small text-minec-muted fw-light">{label}</div>
      <div className="fw-bold fw-data">{value}</div>
    </div>
  </CListGroupItem>
);

// ── COMPONENT ────────────────────────────────────────────────────────────────
const PerfilUsuario = () => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(MOCK_USUARIO);
  const [formErrors, setFormErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [pwd, setPwd] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const { showToast, ToastContainer } = useToast();

  useEffect(() => { setFormData(MOCK_USUARIO); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwd(prev => ({ ...prev, [name]: value }));
    if (pwdErrors[name]) {
      setPwdErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateProfile = () => {
    const errors = {};
    const nameV = validateText(formData.nombre, { minLen: 2, maxLen: 100, label: 'El nombre' });
    if (!nameV.isValid) errors.nombre = nameV.error;
    const apV = validateText(formData.apellidos, { minLen: 2, maxLen: 100, label: 'Los apellidos' });
    if (!apV.isValid) errors.apellidos = apV.error;
    const emailV = validateEmail(formData.email);
    if (!emailV.isValid) errors.email = emailV.error;
    const telV = validatePhone(formData.telefono);
    if (!telV.isValid) errors.telefono = telV.error;
    const cedV = validateText(formData.cedula, { minLen: 6, maxLen: 10, label: 'La cédula' });
    if (!cedV.isValid) errors.cedula = cedV.error;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const guardarCambios = () => {
    if (!validateProfile()) {
      showToast('Corrige los errores antes de guardar.', 'warning');
      return;
    }

    const sanitizedData = {
      ...formData,
      nombre: sanitizeText(formData.nombre),
      apellidos: sanitizeText(formData.apellidos),
      direccion: sanitizeText(formData.direccion),
    };

    setFormData(sanitizedData);
    // TODO: PATCH /api/usuarios/:id
    showToast('Información actualizada exitosamente.', 'success');
    setEditMode(false);
    setFormErrors({});
  };

  const procesarCambioPwd = () => {
    const errors = {};

    if (!pwd.actual) {
      errors.actual = 'La contraseña actual es obligatoria';
    }

    const pwdValidation = validatePassword(pwd.nueva, pwd.confirmar);
    if (!pwdValidation.isValid) {
      Object.assign(errors, pwdValidation.errors);
    }

    if (Object.keys(errors).length > 0) {
      setPwdErrors(errors);
      showToast('Corrige los errores del formulario.', 'warning');
      return;
    }

    // TODO: POST /api/auth/change-password
    showToast('Contraseña actualizada exitosamente.', 'success');
    setPwd({ actual: '', nueva: '', confirmar: '' });
    setPwdErrors({});
    setShowModal(false);
  };

  return (
    <CContainer fluid className="px-3 px-md-4 pb-5 animate-fade-eco">
      {/* ── PAGE HEADER ── */}
      <div className="d-flex align-items-center gap-3 pt-3 pb-2 mb-2">
        <div className="stats-icon-minec"><CIcon icon={cilUser} /></div>
        <div>
          <h1 className="h3 fw-bold mb-0 text-montserrat text-eco">Mi Perfil</h1>
          <p className="text-minec-muted small mb-0">Gestiona tu información personal y credenciales</p>
        </div>
      </div>

      <CRow className="g-4">
        {/* ── LEFT COLUMN: Avatar + Quick Info ── */}
        <CCol md={4}>
          <CCard className="eco-card mb-4 text-center">
            <CCardBody className="p-4">
              <CAvatar
                size="xl"
                src={formData.foto}
                className="mb-3"
                style={{ border: '4px solid var(--eco-200)', boxShadow: 'var(--shadow-md)' }}
              />
              <h4 className="fw-bold text-inter mb-1">{`${formData.nombre} ${formData.apellidos}`}</h4>
              <p className="text-minec-muted small mb-3">Usuario ECOGEST</p>
              <CBadge color="success" className="px-3 py-2 mb-4 badge-eco">Activo</CBadge>

              <div className="d-flex flex-column gap-2">
                <CButton color="success" className="w-100 btn-minec-success"
                  onClick={() => setEditMode(true)} disabled={editMode}>
                  <CIcon icon={cilPencil} className="me-2" />Editar Perfil
                </CButton>
                <CButton color="secondary" variant="outline" className="w-100 btn-minec-outline"
                  onClick={() => { setPwd({ actual: '', nueva: '', confirmar: '' }); setPwdErrors({}); setShowModal(true); }}>
                  <CIcon icon={cilLockLocked} className="me-2" />Cambiar Contraseña
                </CButton>
              </div>
            </CCardBody>
          </CCard>




          {/* Contact Quick View */}
          <CCard className="eco-card">
            <CCardHeader className="eco-card-header d-flex align-items-center gap-2 py-3">
              <CIcon icon={cilEnvelopeOpen} className="text-eco" />
              <span className="fw-bold text-montserrat">Contacto Rápido</span>
            </CCardHeader>
            <CCardBody className="pt-3 px-3 pb-3">
              <CListGroup flush>
                <CListGroupItem className="border-0 py-2 d-flex align-items-center">
                  <div className="stats-icon-minec me-3" style={{ width: 36, height: 36 }}>
                    <CIcon icon={cilEnvelopeOpen} />
                  </div>
                  <div>
                    <div className="small text-minec-muted">Email</div>
                    <div className="fw-medium">{formData.email}</div>
                  </div>
                </CListGroupItem>
                <CListGroupItem className="border-0 py-2 d-flex align-items-center">
                  <div className="stats-icon-minec me-3"
                    style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))' }}>
                    <CIcon icon={cilPhone} />
                  </div>
                  <div>
                    <div className="small text-minec-muted">Teléfono</div>
                    <div className="fw-medium">{formData.telefono}</div>
                  </div>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        {/* ── RIGHT COLUMN: Personal Details ── */}
        <CCol md={8}>
          <CCard className="eco-card">
            <CCardHeader className="eco-card-header d-flex justify-content-between align-items-center py-3">
              <h4 className="fw-bold m-0 text-montserrat">Mi Información Personal</h4>
              {editMode && (
                <div className="d-flex gap-2">
                  <CButton color="success" className="btn-minec-success px-3" onClick={guardarCambios}>
                    <CIcon icon={cilSave} className="me-2" />Guardar
                  </CButton>
                  <CButton color="danger" variant="outline" className="px-3" onClick={() => { setEditMode(false); setFormData(MOCK_USUARIO); setFormErrors({}); }}>
                    <CIcon icon={cilX} className="me-2" />Cancelar
                  </CButton>
                </div>
              )}
            </CCardHeader>

            <CCardBody className="p-4">
              {!editMode ? (
                <CRow className="g-4">
                  <CCol md={6}>
                    <CListGroup className="border-0">
                      <InfoRow icon={cilUser} label="Nombre" value={formData.nombre} />
                      <InfoRow icon={cilUser} label="Apellidos" value={formData.apellidos}
                        gradient="linear-gradient(135deg, var(--earth-500), var(--accent-600))" />
                      <InfoRow icon={cilCircle} label="Cédula" value={formData.cedula}
                        gradient="linear-gradient(135deg, var(--nature), var(--eco-700))" />
                    </CListGroup>
                  </CCol>
                  <CCol md={6}>
                    <CListGroup className="border-0">
                      <InfoRow icon={cilEnvelopeOpen} label="Email" value={formData.email}
                        gradient="linear-gradient(135deg, #3B82F6, var(--info))" />
                      <InfoRow icon={cilPhone} label="Teléfono" value={formData.telefono}
                        gradient="linear-gradient(135deg, #F59E0B, var(--warning))" />
                      <InfoRow icon={cilCalendar} label="Fecha de Nacimiento" value={formData.fechaNacimiento}
                        gradient="linear-gradient(135deg, var(--accent-500), var(--accent-700))" />
                    </CListGroup>
                  </CCol>
                  <CCol md={12}>
                    <div className="p-3 eco-surface rounded-3 d-flex align-items-center gap-3">
                      <div className="stats-icon-minec"
                        style={{ background: 'linear-gradient(135deg, var(--earth-400), var(--earth-500))', flexShrink: 0 }}>
                        <CIcon icon={cilHome} />
                      </div>
                      <div>
                        <div className="small text-minec-muted fw-light">Dirección</div>
                        <div className="fw-medium">{formData.direccion}</div>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              ) : (
                <CForm className="row g-3">
                  {PROFILE_FIELDS.map(field => (
                    <CCol md={field.md} key={field.name}>
                      <label className="form-label fw-semibold text-minec-muted">{field.label}</label>
                      <CFormInput
                        type={field.type || 'text'}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className={`input-minec ${formErrors[field.name] ? 'border-danger' : ''}`}
                      />
                      {formErrors[field.name] && (
                        <div className="text-danger small mt-1">{formErrors[field.name]}</div>
                      )}
                    </CCol>
                  ))}
                </CForm>
              )}
            </CCardBody>

            {/* Security note footer */}
            <div className="eco-surface border-top d-flex align-items-center gap-2 p-3 px-4">
              <CIcon icon={cilShieldAlt} className="text-eco" />
              <small className="text-minec-muted">
                Tus datos personales están protegidos bajo nuestra política de privacidad.
              </small>
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* ── PASSWORD MODAL ── */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}
        size="md" backdrop="static" className="modal-minec">
        <CModalHeader className="border-0 pb-0">
          <CModalTitle className="fw-bold text-montserrat w-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stats-icon-minec animate-pulse-eco">
                <CIcon icon={cilLockLocked} />
              </div>
              <div>
                <h5 className="mb-0">Cambiar Contraseña</h5>
                <small className="text-minec-muted fw-light">Actualice su contraseña de acceso</small>
              </div>
            </div>
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="pt-3">
          <CForm className="d-flex flex-column gap-3">
            {PASSWORD_FIELDS.map(f => (
              <div key={f.name}>
                <label className="form-label fw-semibold text-minec-muted">{f.label}</label>
                <CFormInput type="password" name={f.name}
                  value={pwd[f.name]} onChange={handlePwdChange}
                  placeholder={f.placeholder}
                  className={`input-minec ${pwdErrors[f.name] ? 'border-danger' : ''}`} />
                {pwdErrors[f.name] && (
                  <div className="text-danger small mt-1">{pwdErrors[f.name]}</div>
                )}
              </div>
            ))}
          </CForm>
        </CModalBody>

        <CModalFooter className="border-0 pt-0 gap-2">
          <CButton color="secondary" variant="outline" onClick={() => setShowModal(false)} className="btn-minec-outline">
            Cancelar
          </CButton>
          <CButton color="success" onClick={procesarCambioPwd} className="btn-minec-success">
            <CIcon icon={cilLockLocked} className="me-2" />Cambiar Contraseña
          </CButton>
        </CModalFooter>
      </CModal>

      <ToastContainer />
    </CContainer>
  );
};

export default PerfilUsuario;