import React, { useState, useMemo } from 'react';
import {
  CRow,
  CCol,
  CBadge,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CButton
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSearch,
  cilFilter,
  cilFire,
  cilUser,
  cilCircle
} from '@coreui/icons';
import ListaGestion from './listaGestion';

const SECCIONES = [
  { key: 'todas', label: 'Todas', color: 'primary' },
  { key: 'sin_asignar', label: 'Sin asignar', color: 'warning' },
  { key: 'asignadas', label: 'Asignadas', color: 'info' },
  { key: 'resuelta', label: 'Resueltas', color: 'success' },
];

const GestionUnificada = ({ denuncias, estadisticas, cuadrillas, loading, onSelectDenuncia, onEstadoChange, onAsignar }) => {
  const [seccion, setSeccion] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const sinAsignar = useMemo(() =>
    denuncias.filter(d => !d.cuadrillaId && d.estado !== 'resuelta').length,
    [denuncias]
  );

  const asignadas = useMemo(() =>
    denuncias.filter(d => d.cuadrillaId && d.estado !== 'resuelta').length,
    [denuncias]
  );

  const denunciasFiltradas = useMemo(() => {
    let filtered = [...denuncias];

    if (seccion === 'sin_asignar') {
      filtered = filtered.filter(d => !d.cuadrillaId && d.estado !== 'resuelta');
    } else if (seccion === 'asignadas') {
      filtered = filtered.filter(d => d.cuadrillaId && d.estado !== 'resuelta');
    } else if (seccion === 'resuelta') {
      filtered = filtered.filter(d => d.estado === 'resuelta');
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      filtered = filtered.filter(d =>
        d.titulo?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q) ||
        d.municipio?.toLowerCase().includes(q) ||
        d.tipo?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [denuncias, seccion, busqueda]);

  return (
    <>
      {/* KPIs compactos */}
      <CRow className="g-2 mb-3">
        <CCol xs={6} sm={3} lg={2}>
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--cui-card-cap-bg, rgba(0,0,0,0.03))' }}>
            <div className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--cui-primary, #5856d6)' }}>{estadisticas.total || 0}</div>
            <small className="text-muted">Total</small>
          </div>
        </CCol>
        <CCol xs={6} sm={3} lg={2}>
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--cui-card-cap-bg, rgba(0,0,0,0.03))' }}>
            <div className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--cui-warning, #f9b115)' }}>{sinAsignar}</div>
            <small className="text-muted">Sin asignar</small>
          </div>
        </CCol>
        <CCol xs={6} sm={3} lg={2}>
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--cui-card-cap-bg, rgba(0,0,0,0.03))' }}>
            <div className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--cui-info, #39f)' }}>{asignadas}</div>
            <small className="text-muted">Asignadas</small>
          </div>
        </CCol>
        <CCol xs={6} sm={3} lg={2}>
          <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--cui-card-cap-bg, rgba(0,0,0,0.03))' }}>
            <div className="fw-bold" style={{ fontSize: '1.25rem', color: 'var(--cui-success, #1b9e3e)' }}>{estadisticas.resuelta || 0}</div>
            <small className="text-muted">Resueltas</small>
          </div>
        </CCol>
      </CRow>

      {/* Secciones rápidas */}
      <div className="d-flex gap-1 mb-2 flex-wrap">
        {SECCIONES.map(s => (
          <CButton
            key={s.key}
            size="sm"
            color={s.color}
            variant={seccion === s.key ? undefined : 'outline'}
            className={`fw-medium ${seccion === s.key ? '' : ''}`}
            style={{ fontSize: '0.8rem' }}
            onClick={() => setSeccion(s.key)}
          >
            {s.label}
            {s.key === 'todas' && ` (${estadisticas.total || 0})`}
            {s.key === 'sin_asignar' && ` (${sinAsignar})`}
            {s.key === 'asignadas' && ` (${asignadas})`}
            {s.key === 'resuelta' && ` (${estadisticas.resuelta || 0})`}
          </CButton>
        ))}
        <CIcon icon={cilFilter} className="text-muted align-self-center ms-2" />
      </div>

      {/* Alerta de urgentes sin asignar */}
      {seccion === 'sin_asignar' && sinAsignar > 0 && (
        <div className="d-flex align-items-center gap-2 p-2 mb-3 rounded" style={{ backgroundColor: 'rgba(229, 83, 83, 0.1)', border: '1px solid rgba(229, 83, 83, 0.2)' }}>
          <CIcon icon={cilFire} className="text-danger" />
          <span className="fw-semibold small text-danger">{sinAsignar} denuncia(s) requieren asignación</span>
          <small className="text-muted ms-auto">Selecciona una denuncia para asignar cuadrilla</small>
        </div>
      )}

      {/* Búsqueda */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <CInputGroup size="sm" style={{ maxWidth: '320px' }}>
          <CInputGroupText className="bg-eco-soft border-end-0">
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar por título, ID, tipo..."
            className="input-minec border-start-0 ps-0"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </CInputGroup>
        <small className="text-muted">{denunciasFiltradas.length} resultado(s)</small>
      </div>

      {/* Tabla */}
      <ListaGestion
        denuncias={denunciasFiltradas}
        cuadrillas={cuadrillas}
        loading={loading}
        onSelectDenuncia={onSelectDenuncia}
        onEstadoChange={onEstadoChange}
        onAsignar={onAsignar}
      />
    </>
  );
};

export default GestionUnificada;
