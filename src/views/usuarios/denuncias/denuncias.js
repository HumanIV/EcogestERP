import React, { useState, useCallback } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CBadge,
  CTooltip
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilCheckCircle,
  cilClock,
  cilSearch,
  cilShieldAlt,
  cilEco,
  cilBullhorn
} from '@coreui/icons';

import DenunciasTable from './components/denunciasTable';
import DenunciaForm from './components/denunciasForm';
import useMisDenuncias from '../MisDenuncias/hooks/useMisDenuncias';
import useToast from '../_shared/useToast';
import useConfirmModal from '../_shared/useConfirmModal';

const Denuncias = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { confirm, ConfirmModal } = useConfirmModal();
  const {
    filteredDenuncias,
    stats,
    loading,
    filter,
    setFilter,
    agregarDenuncia,
    eliminarDenuncia
  } = useMisDenuncias();

  const handleNuevaDenuncia = useCallback(async (nuevaDenuncia) => {
    try {
      const resultado = agregarDenuncia(nuevaDenuncia);
      if (resultado) {
        showToast(
          `🌿 ¡Denuncia registrada! Código: ${resultado.id}. Revisión en 72 horas.`,
          'success',
          6000
        );
        setModalVisible(false);
      }
    } catch (error) {
      showToast('Error al procesar la denuncia. Inténtalo de nuevo.', 'error');
    }
  }, [agregarDenuncia, showToast]);

  const handleEliminarDenuncia = useCallback(async (id) => {
    const ok = await confirm(
      'Eliminar Denuncia',
      '¿Eliminar esta denuncia? Esta acción no se puede deshacer.',
      { confirmLabel: 'Eliminar', variant: 'danger' }
    );
    if (!ok) return;

    try {
      await eliminarDenuncia(id);
      showToast('Denuncia eliminada correctamente.', 'success');
    } catch (error) {
      showToast('Error al eliminar la denuncia.', 'error');
    }
  }, [eliminarDenuncia, confirm, showToast]);

  return (
    <CContainer fluid className="px-3 px-md-4 pb-5 animate-fade-eco">

      {/* ── PAGE HEADER ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 pt-2">
        <div className="mb-3 mb-md-0">
          <div className="d-flex align-items-center gap-3">
            <div className="stats-icon-minec">
              <CIcon icon={cilBullhorn} />
            </div>
            <div>
              <h1 className="h3 fw-bold mb-0 text-montserrat text-eco">Denuncias Ambientales</h1>
              <p className="text-minec-muted small mb-0 fw-light">
                <CIcon icon={cilShieldAlt} className="me-1" />
                Reportes confidenciales · 100% anónimo y seguro
              </p>
            </div>
          </div>
        </div>
        <CButton
          color="success"
          size="lg"
          onClick={() => setModalVisible(true)}
          className="btn-minec-success fw-bold px-4"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Nueva Denuncia
        </CButton>
      </div>

      {/* ── KPI STRIP ── */}
      <CRow className="g-3 mb-4">
        {[
          { label: 'Total', value: stats.total, color: 'eco', icon: cilSearch },
          { label: 'Resueltas', value: stats.resueltas, color: 'nature', icon: cilCheckCircle },
          { label: 'Pendientes', value: stats.pendientes, color: 'warning', icon: cilClock },
        ].map((kpi, i) => (
          <CCol xs={6} md={4} key={i}>
            <CCard className="eco-card border-0 h-100">
              <CCardBody className="d-flex align-items-center gap-3 p-3">
                <div className={`bg-${kpi.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <CIcon icon={kpi.icon} className={`text-${kpi.color}`} />
                </div>
                <div>
                  <div className="h4 fw-bold mb-0 text-eco">{kpi.value}</div>
                  <div className="small text-minec-muted">{kpi.label}</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* ── MAIN PANEL ── */}
      <CCard id="mis-denuncias" className="eco-card">
        <CCardHeader className="eco-card-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h4 className="fw-bold text-montserrat mb-1 text-eco">Mis Denuncias</h4>
            <p className="text-minec-muted mb-0 small">Seguimiento de tus reportes ambientales</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {[
              { key: 'todas',     label: 'Todas',      icon: cilSearch,       color: 'primary' },
              { key: 'pendiente', label: 'Pendientes', icon: cilClock,        color: 'warning' },
              { key: 'resuelta',  label: 'Resueltas',  icon: cilCheckCircle,  color: 'success' },
            ].map(f => (
              <CTooltip key={f.key} content={`Filtrar: ${f.label}`}>
                <CButton
                  size="sm"
                  color={filter === f.key ? f.color : `outline-${f.color}`}
                  onClick={() => setFilter(f.key)}
                  className="rounded-pill px-3"
                >
                  <CIcon icon={f.icon} className="me-1" />
                  {f.label}
                </CButton>
              </CTooltip>
            ))}
          </div>
        </CCardHeader>

        <CCardBody className="p-3 p-md-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-grow text-success mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-minec-muted">Consultando tus denuncias…</p>
            </div>
          ) : filteredDenuncias.length === 0 ? (
            <div className="text-center py-5 px-3">
              <div className="bg-nature-soft rounded-circle p-4 d-inline-block mb-4">
                <CIcon icon={cilEco} size="2xl" className="text-nature" />
              </div>
              <h4 className="mb-2 fw-bold text-eco">
                {filter !== 'todas'
                  ? `Sin denuncias ${filter === 'pendiente' ? 'pendientes' : 'resueltas'}`
                  : '¡Bienvenido, Ciudadano Ambiental!'}
              </h4>
              <p className="text-minec-muted mb-4">
                {filter !== 'todas'
                  ? 'Pronto tendrás actualizaciones sobre tus reportes.'
                  : 'No has realizado ninguna denuncia todavía. Reporta un incidente ahora.'}
              </p>
              <CButton
                color="success"
                size="lg"
                onClick={() => setModalVisible(true)}
                className="btn-minec-success fw-bold px-4"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Comenzar Mi Primera Denuncia
              </CButton>
            </div>
          ) : (
            <DenunciasTable
              denuncias={filteredDenuncias}
              onDelete={handleEliminarDenuncia}
            />
          )}
        </CCardBody>

        {/* Footer strip */}
        <div className="eco-surface border-top d-flex flex-column flex-md-row justify-content-between align-items-center p-3 px-md-4 gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-nature-soft rounded-circle p-2">
              <CIcon icon={cilShieldAlt} className="text-nature" />
            </div>
            <small className="text-minec-muted">
              <strong>Tu privacidad está protegida</strong> · Denuncias 100% confidenciales
            </small>
          </div>
          <CButton
            color="success"
            onClick={() => setModalVisible(true)}
            className="btn-minec-success fw-bold px-4"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Nueva Denuncia
          </CButton>
        </div>
      </CCard>

      {/* Modal */}
      <DenunciaForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleNuevaDenuncia}
      />

      {/* Shared UI */}
      <ToastContainer />
      <ConfirmModal />
    </CContainer>
  );
};

export default Denuncias;