import React, { useState, useCallback } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CAlert,
  CBadge,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCircle,
  cilSearch,
  cilCalendar,
  cilSync,
  cilArrowBottom,
  cilPlus,
  cilUser,
  cilTask,
  cilDescription,
} from '@coreui/icons'

import TramitesStats from './components/TramitesStats'
import TramitesTabla from './components/TramitesTabla'
import TramitesModalDetalle from './components/TramitesModalDetalle'
import TramitesModalForm from './components/TramitesModalForm'
import useGestionTramites from './hooks/useGestionTramites'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'
import { TIPOS_TRAMITE, ESTADOS_TRAMITE, FORM_INICIAL_TRAMITE } from './constants/tramitesConstants'

const GestionTramites = () => {
  const { showToast } = useToast()
  const { ConfirmModal, confirm } = useConfirmModal()

  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    estado: 'todos',
    busqueda: '',
    fecha: '',
  })

  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null)
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false)
  const [modalFormVisible, setModalFormVisible] = useState(false)
  const [formData, setFormData] = useState({ ...FORM_INICIAL_TRAMITE })
  const [formError, setFormError] = useState(null)

  const {
    tramites,
    estadisticas,
    loading,
    error,
    crearTramite,
    actualizarTramite,
    eliminarTramite,
    cambiarEstado,
    asignarInspector,
    exportarReporte,
    refreshData,
  } = useGestionTramites(filtros)

  const handleFiltroChange = useCallback((nuevosFiltros) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }))
  }, [])

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const abrirModalCrear = useCallback(() => {
    setFormData({
      ...FORM_INICIAL_TRAMITE,
      fechaSolicitud: new Date().toISOString().split('T')[0],
    })
    setFormError(null)
    setModalFormVisible(true)
  }, [])

  const abrirModalEditar = useCallback((tramite) => {
    setFormData({ ...tramite })
    setFormError(null)
    setModalFormVisible(true)
  }, [])

  const handleGuardar = useCallback(async () => {
    if (!formData.solicitante || !formData.cedulaRif || !formData.subtipo) {
      setFormError('Complete los campos obligatorios: Solicitante, Cédula/RIF y Subtipo.')
      return
    }
    if (!formData.tipo) {
      setFormError('Seleccione un tipo de trámite.')
      return
    }
    if (!formData.municipio) {
      setFormError('Seleccione un municipio.')
      return
    }
    if (!formData.descripcion?.trim()) {
      setFormError('La descripción es obligatoria.')
      return
    }
    if (
      !/^[VJEG]\d{5,10}$/.test(formData.cedulaRif.replace(/-/g, '')) &&
      !/^[JGVEP]-\d{5,10}-\d$/.test(formData.cedulaRif)
    ) {
      setFormError('Formato de Cédula/RIF inválido.')
      return
    }

    if (formData.id) {
      const res = await actualizarTramite(formData.id, formData)
      if (res.success) {
        showToast('Trámite actualizado exitosamente', 'success')
        setModalFormVisible(false)
      } else {
        setFormError(res.error || 'Error al actualizar')
      }
    } else {
      const tipoPrefix = formData.tipo === TIPOS_TRAMITE.PERMISO ? 'PER' : 'LIC'
      const tramiteConId = {
        ...formData,
        id: `${tipoPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      }
      const res = await crearTramite(tramiteConId)
      if (res.success) {
        showToast('Trámite creado exitosamente', 'success')
        setModalFormVisible(false)
      } else {
        setFormError(res.error || 'Error al crear')
      }
    }
  }, [formData, crearTramite, actualizarTramite])

  const handleEliminar = useCallback(
    async (tramite) => {
      if (tramite.estado !== 'BORRADOR' && tramite.estado !== 'RECHAZADO') {
        showToast('Solo se pueden eliminar trámites en estado Borrador o Rechazado', 'warning')
        return
      }
      const ok = await confirm(
        '¿Eliminar Trámite?',
        `¿Estás seguro de eliminar "${tramite.id}"? Esta acción no se puede deshacer.`,
        { confirmLabel: 'Eliminar', variant: 'danger' },
      )
      if (!ok) return

      const res = await eliminarTramite(tramite.id)
      if (res.success) {
        showToast('Trámite eliminado', 'success')
      } else {
        showToast(res.error || 'Error al eliminar', 'danger')
      }
    },
    [eliminarTramite, confirm, showToast],
  )

  const handleVerDetalle = useCallback((tramite) => {
    setTramiteSeleccionado(tramite)
    setModalDetalleVisible(true)
  }, [])

  const handleCambiarEstado = useCallback(async (id, nuevoEstado) => {
    const res = await cambiarEstado(
      id,
      nuevoEstado,
      'Administración',
      `Estado cambiado a ${nuevoEstado}`,
    )
    if (res.success) {
      showToast(
        `Estado cambiado a ${ESTADOS_TRAMITE.find((e) => e.value === nuevoEstado)?.label || nuevoEstado}`,
        'success',
      )
      // Actualizar el tramite seleccionado si está en el modal
      setTramiteSeleccionado(prev => prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev)
    } else {
      showToast(res.error || 'Error al cambiar estado', 'danger')
    }
  }, [cambiarEstado, showToast])

  const handleAsignarInspector = useCallback(async (id, inspectorId, inspectorNombre) => {
    const res = await asignarInspector(id, inspectorId, inspectorNombre)
    if (res.success) {
      showToast(`Inspector ${inspectorNombre} asignado al trámite`, 'success')
      setTramiteSeleccionado(prev => prev && prev.id === id ? { ...prev, inspectorId: parseInt(inspectorId, 10), inspectorNombre, estado: 'INSPECCION' } : prev)
    } else {
      showToast(res.error || 'Error al asignar inspector', 'danger')
    }
  }, [asignarInspector, showToast])

  const handleExportar = useCallback(async () => {
    const resultado = await exportarReporte(filtros)
    if (resultado.success) {
      showToast('Reporte exportado exitosamente', 'success')
    } else {
      showToast('Error al exportar reporte', 'danger')
    }
  }, [exportarReporte, filtros, showToast])

  if (error) {
    return (
      <CContainer fluid className="py-5">
        <CAlert color="danger" className="text-center">
          <h4>Error al cargar trámites</h4>
          <p>{error}</p>
          <CButton color="danger" onClick={refreshData}>
            <CIcon icon={cilSync} className="me-2" />
            Reintentar
          </CButton>
        </CAlert>
      </CContainer>
    )
  }

  return (
    <CContainer fluid className="px-3 px-md-4">
      <ConfirmModal />

      {/* Header Premium */}
      <div className="premium-panel mb-4 px-4 py-4">
        <CRow className="align-items-center">
          <CCol md={6}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-eco-soft rounded-circle text-eco">
                <CIcon icon={cilTask} size="xl" />
              </div>
              <div>
                <h2 className="mb-1 fw-bold text-dark">Gestión de Trámites Ambientales</h2>
                <small className="text-muted d-block">
                  Panel unificado para permisos y licencias ambientales
                </small>
              </div>
            </div>
          </CCol>
          <CCol md={6} className="text-md-end mt-3 mt-md-0">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <CButton
                color="secondary"
                variant="outline"
                className="fw-semibold px-3"
                onClick={refreshData}
                disabled={loading}
              >
                <CIcon icon={cilSync} className={loading ? 'spin me-2' : 'me-2'} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </CButton>
              <CButton color="outline-eco" className="fw-semibold px-3" onClick={handleExportar}>
                <CIcon icon={cilArrowBottom} className="me-2" />
                Exportar
              </CButton>
            </div>
          </CCol>
        </CRow>
      </div>

      {/* Stats */}
      <TramitesStats estadisticas={estadisticas} />

      {/* Filtros rápidos */}
      <CCard className="border-0 shadow-sm mb-4">
        <CCardBody className="p-3">
          <CRow className="g-3 align-items-center">
            <CCol xs={12} md={4}>
              <CInputGroup className="bg-white rounded border overflow-hidden">
                <CInputGroupText className="bg-transparent border-0 text-muted">
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar trámite o solicitante..."
                  onChange={(e) => handleFiltroChange({ busqueda: e.target.value })}
                />
              </CInputGroup>
            </CCol>
            <CCol xs={6} md={2}>
              <CFormSelect
                value={filtros.estado}
                onChange={(e) => handleFiltroChange({ estado: e.target.value })}
              >
                <option value="todos">Todos los estados</option>
                {ESTADOS_TRAMITE.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={6} md={2}>
              <CInputGroup className="bg-white rounded border overflow-hidden">
                <CInputGroupText className="bg-transparent border-0 text-muted">
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => handleFiltroChange({ fecha: e.target.value })}
                />
              </CInputGroup>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Tabla principal */}
      <CCard className="border-0 shadow-sm">
        <CCardBody>
          <TramitesTabla
            tramites={tramites}
            busqueda={filtros.busqueda}
            onBusquedaChange={(val) => handleFiltroChange({ busqueda: val })}
            filtroEstado={filtros.estado}
            onFiltroEstadoChange={(val) => handleFiltroChange({ estado: val })}
            filtroTipo={filtros.tipo}
            onFiltroTipoChange={(val) => handleFiltroChange({ tipo: val })}
            onEditar={abrirModalEditar}
            onEliminar={handleEliminar}
            onVerDetalle={handleVerDetalle}
            onCambiarEstado={handleCambiarEstado}
            onAsignarInspector={handleAsignarInspector}
          />
        </CCardBody>
      </CCard>

      {/* Footer */}
      <CCard className="border-0 shadow-sm mt-4">
        <CCardBody className="text-center p-4">
          <div className="d-flex justify-content-center flex-wrap gap-3 mb-3">
            <CBadge color="primary" className="px-3 py-2 rounded-pill">
              Total: {estadisticas.total || 0}
            </CBadge>
            <CBadge color="primary" className="px-3 py-2 rounded-pill">
              Permisos: {estadisticas.porTipo?.PERMISO || 0}
            </CBadge>
            <CBadge color="info" className="px-3 py-2 rounded-pill">
              Licencias: {estadisticas.porTipo?.LICENCIA || 0}
            </CBadge>
            <CBadge color="success" className="px-3 py-2 rounded-pill">
              Aprobados: {estadisticas.aprobados || 0}
            </CBadge>
            <CBadge color="warning" className="px-3 py-2 rounded-pill">
              Pendientes: {estadisticas.pendientes || 0}
            </CBadge>
          </div>
          <p className="text-muted small mb-0">
            Ministerio del Ecosistema • Sistema de Gestión de Trámites Ambientales • Última
            actualización: {new Date().toLocaleDateString('es-VE')}
          </p>
        </CCardBody>
      </CCard>

      {/* Modal Detalle */}
      <TramitesModalDetalle
        visible={modalDetalleVisible}
        onClose={() => {
          setModalDetalleVisible(false)
          setTramiteSeleccionado(null)
        }}
        tramite={tramiteSeleccionado}
        onEstadoChange={handleCambiarEstado}
        onAsignarInspector={handleAsignarInspector}
      />

      {/* Modal Form */}
      <TramitesModalForm
        visible={modalFormVisible}
        onClose={() => {
          setModalFormVisible(false)
          setFormError(null)
        }}
        onGuardar={handleGuardar}
        formData={formData}
        onInputChange={handleFormChange}
        error={formError}
        isEdit={!!formData.id}
      />
    </CContainer>
  )
}

export default GestionTramites
