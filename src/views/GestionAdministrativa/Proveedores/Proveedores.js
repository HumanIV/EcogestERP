import React from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CBadge,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CAlert,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilBuilding,
  cilTags,
  cilPeople,
  cilLocationPin,
  cilPhone,
  cilCheckCircle,
  cilWarning,
  cilSearch,
  cilSync,
  cilCloudDownload,
  cilEnvelopeClosed,
} from '@coreui/icons'
import useProveedores from './hooks/useProveedores'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'
import { CATEGORIAS_PROVEEDOR, ESTADOS_PROVEEDOR } from './constants/proveedoresConstants'

const ESTADO_COLORS = { Activo: 'success', Inactivo: 'secondary' }

const Proveedores = () => {
  const { showToast } = useToast()
  const { ConfirmModal, confirm } = useConfirmModal()
  const {
    loading,
    error: errores,
    showModal,
    modalMode,
    proveedorEditando,
    filtros,
    proveedores,
    todosProveedores,
    estadisticas,
    formData,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    handleFiltroChange,
    limpiarFiltros,
    handleInputChange,
    handleBlur,
    validarFormulario,
    agregarProveedor,
    editarProveedor,
    eliminarProveedor,
    exportarCSV,
    refreshData,
  } = useProveedores()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) return

    if (modalMode === 'create') {
      const res = await agregarProveedor(formData)
      if (res.success) {
        showToast('Proveedor registrado exitosamente', 'success')
        cerrarModal()
      } else {
        showToast(res.error || 'Error al crear proveedor', 'danger')
      }
    } else {
      const res = await editarProveedor(proveedorEditando.id, formData)
      if (res.success) {
        showToast('Proveedor actualizado exitosamente', 'success')
        cerrarModal()
      } else {
        showToast(res.error || 'Error al actualizar proveedor', 'danger')
      }
    }
  }

  const handleEliminar = async (prov) => {
    const ok = await confirm(
      'Eliminar proveedor',
      `¿Está seguro de eliminar el proveedor "${prov.nombre}"? Esta acción no se puede deshacer.`,
    )
    if (ok) {
      const resultado = await eliminarProveedor(prov.id)
      if (resultado.success) {
        showToast('Proveedor eliminado correctamente', 'success')
      } else {
        showToast(resultado.error || 'No se pudo eliminar el proveedor', 'danger')
      }
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="eco-card mb-4 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="h3 fw-bold mb-1">Gestión de Proveedores</h1>
            <p className="text-muted mb-0 small">
              Administra los proveedores que suministran activos e insumos al inventario.
            </p>
          </div>
          <div className="d-flex gap-2">
            <CButton
              color="success"
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <CIcon icon={cilSync} className="me-1" />
              {loading ? 'Cargando...' : 'Actualizar'}
            </CButton>
            <CButton color="success" size="sm" onClick={abrirModalCrear}>
              <CIcon icon={cilPlus} className="me-1" />
              Nuevo Proveedor
            </CButton>
          </div>
        </div>
      </div>

      {/* ── Métricas ── */}
      <CRow className="mb-4 g-3">
        <CCol xs={6} md={4}>
          <div className="eco-card p-3 text-center">
            <div className="fs-2 fw-bold text-success">{estadisticas.total}</div>
            <small className="text-muted">Total Proveedores</small>
          </div>
        </CCol>
        <CCol xs={6} md={4}>
          <div className="eco-card p-3 text-center">
            <div className="fs-2 fw-bold text-success">{estadisticas.activos}</div>
            <small className="text-muted">Activos</small>
          </div>
        </CCol>
        <CCol xs={6} md={4}>
          <div className="eco-card p-3 text-center">
            <div className="fs-2 fw-bold text-secondary">{estadisticas.inactivos}</div>
            <small className="text-muted">Inactivos</small>
          </div>
        </CCol>
      </CRow>

      {/* ── Filtros ── */}
      <CCard className="eco-card mb-4">
        <CCardBody>
          <CRow className="g-3 align-items-end">
            <CCol xs={12} md={4}>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar por nombre, RIF o contacto..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol xs={6} md={3}>
              <CFormSelect
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                {ESTADOS_PROVEEDOR.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={6} md={3}>
              <CFormSelect
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {CATEGORIAS_PROVEEDOR.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={2}>
              <CButton
                color="secondary"
                variant="outline"
                className="w-100"
                size="sm"
                onClick={limpiarFiltros}
                disabled={!filtros.busqueda && !filtros.estado && !filtros.categoria}
              >
                <CIcon icon={cilSync} className="me-1" />
                Limpiar
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* ── Lista de Proveedores ── */}
      {loading && proveedores.length === 0 ? (
        <div className="text-center py-5">
          <CSpinner color="success" />
          <p className="text-muted mt-3">Cargando proveedores...</p>
        </div>
      ) : proveedores.length === 0 ? (
        <div className="eco-card p-5 text-center">
          <CIcon icon={cilBuilding} size="4xl" className="text-muted mb-3" />
          <h5 className="text-muted">No se encontraron proveedores</h5>
          <p className="text-muted small mb-4">
            {filtros.busqueda || filtros.estado || filtros.categoria
              ? 'Intenta con otros términos de búsqueda o limpia los filtros.'
              : 'Registra tu primer proveedor para comenzar.'}
          </p>
          {!filtros.busqueda && !filtros.estado && !filtros.categoria && (
            <CButton color="success" onClick={abrirModalCrear}>
              <CIcon icon={cilPlus} className="me-1" />
              Registrar primer proveedor
            </CButton>
          )}
        </div>
      ) : (
        <>
          <CRow className="g-3">
            {proveedores.map((prov) => (
              <CCol md={6} lg={4} key={prov.id}>
                <CCard className="h-100 eco-card border-0">
                  <CCardBody className="d-flex flex-column">
                    {/* Card header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: 42,
                            height: 42,
                            backgroundColor: 'var(--eco-success-soft, rgba(16,185,129,0.12))',
                          }}
                        >
                          <CIcon icon={cilBuilding} size="lg" className="text-success" />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: 200 }}>
                            {prov.nombre}
                          </h6>
                          <small className="text-muted font-monospace">{prov.rif}</small>
                        </div>
                      </div>
                      <CBadge color={ESTADO_COLORS[prov.estado] || 'secondary'} shape="rounded-pill">
                        {prov.estado}
                      </CBadge>
                    </div>

                    {/* Card body info */}
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2 small">
                        <CIcon icon={cilTags} className="text-muted flex-shrink-0" />
                        <span className="text-truncate">{prov.categoria || 'Sin categoría'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2 small">
                        <CIcon icon={cilPeople} className="text-muted flex-shrink-0" />
                        <span className="text-truncate">{prov.contacto || '—'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2 small">
                        <CIcon icon={cilPhone} className="text-muted flex-shrink-0" />
                        <span>{prov.telefono || '—'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2 small">
                        <CIcon icon={cilEnvelopeClosed} className="text-muted flex-shrink-0" />
                        <span className="text-truncate">{prov.email || '—'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small text-muted">
                        <CIcon icon={cilLocationPin} className="flex-shrink-0" />
                        <span className="text-truncate">{prov.direccion || '—'}</span>
                      </div>
                    </div>

                    {/* Card footer actions */}
                    <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                      <CButton
                        size="sm"
                        color="warning"
                        variant="outline"
                        onClick={() => abrirModalEditar(prov)}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                        Editar
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="outline"
                        onClick={() => handleEliminar(prov)}
                      >
                        <CIcon icon={cilTrash} className="me-1" />
                        Eliminar
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <small className="text-muted">
              Mostrando {proveedores.length} de {todosProveedores.length} proveedores
            </small>
            <CButton color="outline-success" size="sm" onClick={exportarCSV}>
              <CIcon icon={cilCloudDownload} className="me-2" />
              Exportar CSV
            </CButton>
          </div>
        </>
      )}

      {/* ── Modal Crear/Editar ── */}
      <CModal visible={showModal} onClose={cerrarModal} size="lg" className="eco-modal">
        <CModalHeader closeButton className="eco-card-header">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilBuilding} className="me-2" />
            {modalMode === 'create' ? 'Registrar Nuevo Proveedor' : 'Editar Proveedor'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {errores && typeof errores === 'object' && Object.values(errores).some((v) => v) && (
              <CAlert color="danger" className="mb-3 d-flex align-items-center gap-2">
                <CIcon icon={cilWarning} />
                Por favor corrija los campos marcados en rojo.
              </CAlert>
            )}

            {/* ─── Sección: Datos de la Empresa ─── */}
            <div className="mb-4">
              <h6 className="text-success fw-bold mb-3 text-uppercase small">
                <CIcon icon={cilBuilding} className="me-2" />
                Datos de la Empresa
              </h6>
              <CRow className="g-3">
                <CCol md={12}>
                  <CFormLabel className="small fw-semibold">
                    Nombre o Razón Social <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    onBlur={() => handleBlur('nombre')}
                    placeholder="Ej: Tecnología Venezuela C.A."
                    maxLength={100}
                    invalid={!!errores?.nombre}
                  />
                  {errores?.nombre && <small className="text-danger">{errores.nombre}</small>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel className="small fw-semibold">
                    RIF / Cédula <span className="text-danger">*</span>
                  </CFormLabel>
                  <CInputGroup className={errores?.rifNumber ? 'has-validation' : ''}>
                    <CFormSelect
                      style={{ maxWidth: '80px' }}
                      value={formData.rifPrefix}
                      onChange={(e) => handleInputChange('rifPrefix', e.target.value)}
                    >
                      <option value="J">J</option>
                      <option value="V">V</option>
                      <option value="E">E</option>
                      <option value="G">G</option>
                      <option value="P">P</option>
                    </CFormSelect>
                    <CInputGroupText>-</CInputGroupText>
                    <CFormInput
                      value={formData.rifNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '') // Solo números
                        handleInputChange('rifNumber', val)
                      }}
                      onBlur={() => handleBlur('rifNumber')}
                      placeholder="12345678"
                      maxLength={9}
                      invalid={!!errores?.rifNumber}
                    />
                  </CInputGroup>
                  {errores?.rifNumber && <small className="text-danger mt-1">{errores.rifNumber}</small>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel className="small fw-semibold">
                    Categoría <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    onBlur={() => handleBlur('categoria')}
                    invalid={!!errores?.categoria}
                  >
                    <option value="">— Seleccionar categoría —</option>
                    {CATEGORIAS_PROVEEDOR.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </CFormSelect>
                  {errores?.categoria && (
                    <small className="text-danger">{errores.categoria}</small>
                  )}
                </CCol>

                <CCol md={12}>
                  <CFormLabel className="small fw-semibold">Dirección</CFormLabel>
                  <CFormInput
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    onBlur={() => handleBlur('direccion')}
                    placeholder="Av. Libertador, San Cristóbal, Táchira"
                    maxLength={200}
                    invalid={!!errores?.direccion}
                  />
                  {errores?.direccion && (
                    <small className="text-danger">{errores.direccion}</small>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel className="small fw-semibold">Estado</CFormLabel>
                  <CFormSelect
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                  >
                    {ESTADOS_PROVEEDOR.map((est) => (
                      <option key={est.value} value={est.value}>
                        {est.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
            </div>

            {/* ─── Sección: Datos de Contacto ─── */}
            <div>
              <h6 className="text-success fw-bold mb-3 text-uppercase small">
                <CIcon icon={cilPeople} className="me-2" />
                Datos de Contacto
              </h6>
              <CRow className="g-3">
                <CCol md={6}>
                  <CFormLabel className="small fw-semibold">Persona de Contacto</CFormLabel>
                  <CFormInput
                    value={formData.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
                    onBlur={() => handleBlur('contacto')}
                    placeholder="Ej: Ing. Roberto Sánchez"
                    maxLength={80}
                    invalid={!!errores?.contacto}
                  />
                  {errores?.contacto && (
                    <small className="text-danger">{errores.contacto}</small>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel className="small fw-semibold">Teléfono</CFormLabel>
                  <CInputGroup className={errores?.telNumber ? 'has-validation' : ''}>
                    <CFormSelect
                      style={{ maxWidth: '100px' }}
                      value={formData.telPrefix}
                      onChange={(e) => handleInputChange('telPrefix', e.target.value)}
                    >
                      <option value="0414">0414</option>
                      <option value="0424">0424</option>
                      <option value="0412">0412</option>
                      <option value="0416">0416</option>
                      <option value="0426">0426</option>
                      <option value="0276">0276</option>
                      <option value="0212">0212</option>
                    </CFormSelect>
                    <CInputGroupText>-</CInputGroupText>
                    <CFormInput
                      value={formData.telNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '') // Solo números
                        handleInputChange('telNumber', val)
                      }}
                      onBlur={() => handleBlur('telNumber')}
                      placeholder="1234567"
                      maxLength={7}
                      invalid={!!errores?.telNumber}
                    />
                  </CInputGroup>
                  {errores?.telNumber && (
                    <small className="text-danger mt-1">{errores.telNumber}</small>
                  )}
                </CCol>

                <CCol md={12}>
                  <CFormLabel className="small fw-semibold">Correo Electrónico</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="correo@empresa.com"
                    invalid={!!errores?.email}
                  />
                  {errores?.email && <small className="text-danger">{errores.email}</small>}
                </CCol>
              </CRow>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={cerrarModal}>
              Cancelar
            </CButton>
            <CButton type="submit" color="success" disabled={loading}>
              {loading ? (
                <CSpinner size="sm" className="me-2" />
              ) : (
                <CIcon icon={cilCheckCircle} className="me-2" />
              )}
              {modalMode === 'create' ? 'Registrar Proveedor' : 'Guardar Cambios'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
      <ConfirmModal />
    </>
  )
}

export default Proveedores
