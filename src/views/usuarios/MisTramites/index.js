import React, { useState, useCallback } from 'react';
import {
  CContainer, CRow, CCol, CCard, CCardBody, CButton,
  CAlert, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTask, cilCheckCircle, cilClock, cilXCircle, cilPlus, cilSync } from '@coreui/icons';

import { useMisTramites } from './hooks/useMisTramites';
import NuevoTramiteForm from './components/NuevoTramiteForm';
import MisTramitesTabla from './components/MisTramitesTabla';
import DetalleTramiteModal from './components/DetalleTramiteModal';
import useToast from '../_shared/useToast';
import useConfirmModal from '../_shared/useConfirmModal';

const MisTramites = () => {
  const { showToast } = useToast();
  const { ConfirmModal, confirm } = useConfirmModal();

  const {
    tramites,
    loading,
    error,
    estadisticas,
    crearTramite,
    cancelarTramite,
    recargar,
  } = useMisTramites();

  const [filtro, setFiltro] = useState('todos');
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);

  const handleNuevoTramite = useCallback(async (formData) => {
    const res = await crearTramite(formData);
    if (res.success) {
      showToast('Trámite enviado exitosamente. Será revisado por la administración.', 'success');
      setModalFormVisible(false);
    } else {
      showToast(res.error || 'Error al enviar el trámite', 'danger');
    }
  }, [crearTramite, showToast]);

  const handleCancelar = useCallback(async (id) => {
    const ok = await confirm(
      '¿Cancelar Trámite?',
      'Esta acción no se puede deshacer. ¿Estás seguro?',
      { confirmLabel: 'Cancelar', variant: 'danger' }
    );
    if (!ok) return;

    const res = await cancelarTramite(id);
    if (res.success) {
      showToast('Trámite cancelado', 'success');
    } else {
      showToast(res.error || 'Error al cancelar', 'danger');
    }
  }, [cancelarTramite, confirm, showToast]);

  const handleVerDetalle = useCallback((tramite) => {
    setTramiteSeleccionado(tramite);
    setModalDetalleVisible(true);
  }, []);

  if (error) {
    return (
      <CContainer fluid className="py-5">
        <CAlert color="danger" className="text-center">
          <h4>Error al cargar trámites</h4>
          <p>{error}</p>
          <CButton color="danger" onClick={recargar}>
            <CIcon icon={cilSync} className="me-2" />
            Reintentar
          </CButton>
        </CAlert>
      </CContainer>
    );
  }

  return (
    <CContainer fluid className="px-3 px-md-4">
      <ConfirmModal />

      {/* Page Header */}
      <div className="eco-card mb-4 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center">
            <h1 className="h2 fw-bold mb-0 me-3">
              <CIcon icon={cilTask} className="me-2 text-eco" />
              Mis Trámites Ambientales
            </h1>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <CButton color="outline-success" onClick={recargar} disabled={loading}>
              <CIcon icon={cilSync} className={loading ? 'spin me-2' : 'me-2'} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </CButton>
            <CButton color="success" onClick={() => setModalFormVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" />
              Nuevo Trámite
            </CButton>
          </div>
        </div>
        <small className="text-muted d-block mt-2">
          Permisos y Licencias · Seguimiento en tiempo real
        </small>
      </div>

      {/* KPI Strip */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} lg={3}>
          <div className="eco-card p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mb-2 bg-primary bg-opacity-10" style={{ width: '48px', height: '48px' }}>
              <CIcon icon={cilTask} size="lg" className="text-primary" />
            </div>
            <h3 className="mb-0 fw-bold">{estadisticas.total || 0}</h3>
            <small className="text-muted fw-semibold">Total</small>
          </div>
        </CCol>
        <CCol xs={6} lg={3}>
          <div className="eco-card p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mb-2 bg-success bg-opacity-10" style={{ width: '48px', height: '48px' }}>
              <CIcon icon={cilCheckCircle} size="lg" className="text-success" />
            </div>
            <h3 className="mb-0 fw-bold">{estadisticas.aprobados || 0}</h3>
            <small className="text-muted fw-semibold">Aprobados</small>
          </div>
        </CCol>
        <CCol xs={6} lg={3}>
          <div className="eco-card p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mb-2 bg-warning bg-opacity-10" style={{ width: '48px', height: '48px' }}>
              <CIcon icon={cilClock} size="lg" className="text-warning" />
            </div>
            <h3 className="mb-0 fw-bold">{estadisticas.pendientes || 0}</h3>
            <small className="text-muted fw-semibold">En Revisión</small>
          </div>
        </CCol>
        <CCol xs={6} lg={3}>
          <div className="eco-card p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mb-2 bg-danger bg-opacity-10" style={{ width: '48px', height: '48px' }}>
              <CIcon icon={cilXCircle} size="lg" className="text-danger" />
            </div>
            <h3 className="mb-0 fw-bold">{estadisticas.rechazados || 0}</h3>
            <small className="text-muted fw-semibold">Rechazados</small>
          </div>
        </CCol>
      </CRow>

      {/* Tabla principal */}
      <CCard className="eco-card">
        <CCardBody>
          <MisTramitesTabla
            tramites={tramites}
            filtro={filtro}
            onFiltroChange={setFiltro}
            onCancelar={handleCancelar}
            onVerDetalle={handleVerDetalle}
          />
        </CCardBody>
      </CCard>

      {/* Footer */}
      <CCard className="eco-card mt-4">
        <CCardBody className="text-center p-4">
          <div className="d-flex justify-content-center flex-wrap gap-3 mb-3">
            <CBadge color="primary" className="px-3 py-2 rounded-pill">
              Permisos: {tramites.filter(t => t.tipo === 'PERMISO').length}
            </CBadge>
            <CBadge color="info" className="px-3 py-2 rounded-pill">
              Licencias: {tramites.filter(t => t.tipo === 'LICENCIA').length}
            </CBadge>
          </div>
          <p className="text-muted small mb-0">
            Portal Ciudadano · Ministerio del Ecosocialismo ·
            Última actualización: {new Date().toLocaleDateString('es-VE')}
          </p>
        </CCardBody>
      </CCard>

      {/* Modales */}
      <NuevoTramiteForm
        visible={modalFormVisible}
        onClose={() => setModalFormVisible(false)}
        onSave={handleNuevoTramite}
      />

      <DetalleTramiteModal
        visible={modalDetalleVisible}
        onClose={() => { setModalDetalleVisible(false); setTramiteSeleccionado(null); }}
        tramite={tramiteSeleccionado}
      />
    </CContainer>
  );
};

export default MisTramites;
