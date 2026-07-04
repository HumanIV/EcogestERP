import React from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilSearch,
  cilSync,
  cilPlus,
  cilMagnifyingGlass,
  cilPencil,
  cilTruck,
  cilStorage
} from '@coreui/icons';
import {
  getEstadoColor,
  getCategoriaIconComponent,
  formatearMoneda
} from '../utils/inventarioUtils';
import { CATEGORIAS, ESTADOS_ACTIVO } from '../constants/inventarioConstants';
import useToast from '../../../usuarios/_shared/useToast';

const InventarioActivos = ({
  activos,
  filtros,
  onFiltroChange,
  onLimpiarFiltros,
  onVerDetalle,
  onEditar,
  onEliminar,
  onMovimiento,
  onAgregar,
  loading,
  proveedores = []
}) => {
  const { showToast } = useToast();
  const tieneFiltros = filtros.busqueda || filtros.categoria || filtros.estado;

  return (
    <>
      <CRow className="mb-4 align-items-center">
        <CCol xs={12} md={6}>
          <h5 className="mb-0 fw-bold">
            <CIcon icon={cilStorage} className="me-2 text-eco" />
            Catálogo de Activos
          </h5>
          <p className="text-muted mb-0">
            {activos.length} activos encontrados
          </p>
        </CCol>
        <CCol xs={12} md={6} className="text-md-end">
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            <CInputGroup style={{ width: '200px' }}>
              <CInputGroupText className="bg-eco-soft border-end-0">
                <CIcon icon={cilSearch} className="text-eco" />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar..."
                value={filtros.busqueda}
                onChange={(e) => onFiltroChange('busqueda', e.target.value)}
                className="border-start-0"
              />
            </CInputGroup>
            <CFormSelect
              value={filtros.categoria}
              onChange={(e) => onFiltroChange('categoria', e.target.value)}
              style={{ width: '150px' }}
              className="input-minec"
            >
              <option value="">Categorías</option>
              {CATEGORIAS.map(cat => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </CFormSelect>
            <CFormSelect
              value={filtros.estado}
              onChange={(e) => onFiltroChange('estado', e.target.value)}
              style={{ width: '150px' }}
              className="input-minec"
            >
              {ESTADOS_ACTIVO.map(est => (
                <option key={est.value} value={est.value}>{est.label}</option>
              ))}
            </CFormSelect>
            {tieneFiltros && (
              <CButton color="secondary" variant="outline" onClick={onLimpiarFiltros}>
                <CIcon icon={cilSync} className="me-2" />
                Limpiar Filtros
              </CButton>
            )}
            <CButton color="primary" onClick={onAgregar}>
              <CIcon icon={cilPlus} className="me-2" />
              Nuevo
            </CButton>
          </div>
        </CCol>
      </CRow>

      {activos.length === 0 ? (
        <CCard className="eco-card">
          <CCardBody className="text-center py-5">
            <CIcon icon={cilMagnifyingGlass} size="3xl" className="text-muted mb-3" />
            <h5 className="text-muted">No se encontraron activos</h5>
            <p className="text-muted">Intenta con otros términos de búsqueda</p>
          </CCardBody>
        </CCard>
      ) : (
        <CCard className="eco-card">
          <CCardBody className="p-0">
            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <CTable hover align="middle" className="mb-0">
<CTableHead>
                  <CTableRow className="table-header-eco">
                    <CTableHeaderCell className="ps-4">Codigo</CTableHeaderCell>
                    <CTableHeaderCell>Activo</CTableHeaderCell>
                    <CTableHeaderCell>Categoria</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Valor</CTableHeaderCell>
                    <CTableHeaderCell>Ubicacion</CTableHeaderCell>
                    <CTableHeaderCell>Proveedor</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-end" style={{ minWidth: '150px' }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {activos.map((activo, index) => {
                    const IconComp = getCategoriaIconComponent(activo.categoria);
                    return (
                      <CTableRow
                        key={activo.id}
                        className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                      >
                        <CTableDataCell className="ps-4">
                          <div className="fw-semibold">{activo.codigo}</div>
                          <small className="text-muted">S/N: {activo.serial || 'N/A'}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-semibold">{activo.nombre}</div>
                          <small className="text-muted">
                            {activo.marca} {activo.modelo}
                          </small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <CIcon icon={IconComp} className="text-info me-2" />
                            {activo.categoria}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-semibold text-eco">
                          {formatearMoneda(activo.valorActual)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <small>{activo.ubicacion}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          {activo.proveedorId ? (
                            (() => {
                              const prov = proveedores.find(p => p.id === activo.proveedorId);
                              return prov ? (
                                <CBadge color="success" className="px-2">{prov.nombre}</CBadge>
                              ) : (
                                <CBadge color="secondary" className="px-2">Proveedor ID: {activo.proveedorId}</CBadge>
                              );
                            })()
                          ) : (
                            <small className="text-muted">Sin proveedor</small>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getEstadoColor(activo.estado)} className="px-2">
                            {activo.estado}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end" style={{ whiteSpace: 'nowrap' }}>
                          <div className="d-flex gap-2 justify-content-end">
                            <CButton
                              size="sm"
                              color="info"
                              variant="ghost"
                              onClick={() => onVerDetalle(activo)}
                              title="Ver Detalle"
                            >
                              <CIcon icon={cilMagnifyingGlass} />
                            </CButton>
                            <CButton
                              size="sm"
                              color="warning"
                              variant="ghost"
                              onClick={() => onEditar(activo)}
                              title="Editar Activo"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              size="sm"
                              color="success"
                              variant="ghost"
                              onClick={() => onMovimiento(activo)}
                              title="Registrar Movimiento"
                            >
                              <CIcon icon={cilTruck} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      )}
    </>
  );
};

export default InventarioActivos;