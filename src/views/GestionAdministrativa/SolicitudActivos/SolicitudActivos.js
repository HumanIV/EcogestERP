import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CBadge,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CButtonGroup,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CAlert,
  CFormLabel,
  CCardFooter,
  CProgress,
  CNav,
  CNavItem,
  CNavLink,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CTableHeaderCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilClipboard,
  cilCheckCircle,
  cilXCircle,
  cilWarning,
  cilSearch,
  cilSync,
  cilCloudDownload,
  cilPeople,
  cilTruck,
  cilArrowRight,
  cilClock,
  cilInfo,
  cilStorage,
  cilOptions,
} from '@coreui/icons'

import useSolicitudActivos from './hooks/useSolicitudActivos'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'
import { jsPDF } from 'jspdf'

const SolicitudActivos = () => {
  const { showToast } = useToast()
  const { ConfirmModal, confirm } = useConfirmModal()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [solicitudEditando, setSolicitudEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroOrigen, setFiltroOrigen] = useState('')
  const [showVerModal, setShowVerModal] = useState(false)
  const [solicitudVer, setSolicitudVer] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [solicitudConfirm, setSolicitudConfirm] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [activeTab, setActiveTab] = useState('solicitudes')
  const [bitacoraBusqueda, setBitacoraBusqueda] = useState('')
  const [bitacoraFiltroAccion, setBitacoraFiltroAccion] = useState('')
  const [bitacoraFiltroFecha, setBitacoraFiltroFecha] = useState('')

  const {
    solicitudes,
    estadisticas,
    cuadrillas,
    activos,
    formData,
    setFormData,
    crearSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    exportarCSV,
    bitacora,
  } = useSolicitudActivos()

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const matchBusqueda =
      sol.cuadrillaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.activoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.id.toString().includes(busqueda)
    const matchEstado = filtroEstado ? sol.estado === filtroEstado : true
    const matchOrigen = filtroOrigen ? sol.origen === filtroOrigen : true
    return matchBusqueda && matchEstado && matchOrigen
  })

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('')
    setFiltroOrigen('')
  }

  const abrirModalCrear = () => {
    setModalMode('create')
    setSolicitudEditando(null)
    setFormData({
      cuadrillaId: '',
      cuadrillaNombre: '',
      activoId: '',
      activoNombre: '',
      activoCodigo: '',
      cantidad: 1,
      observaciones: '',
    })
    setShowModal(true)
  }

  const abrirModalVer = (solicitud) => {
    setSolicitudVer(solicitud)
    setShowVerModal(true)
  }

  const handleCuadrillaChange = (e) => {
    const selectedId = e.target.value
    const cuadrilla = cuadrillas.find((c) => c.id === selectedId || c.nombre === selectedId)
    setFormData((prev) => ({
      ...prev,
      cuadrillaId: selectedId,
      cuadrillaNombre: cuadrilla ? cuadrilla.nombre : selectedId,
    }))
  }

  const handleActivoChange = (e) => {
    const selectedId = e.target.value
    const activo = activos.find((a) => a.id === parseInt(selectedId))
    if (activo) {
      setFormData((prev) => ({
        ...prev,
        activoId: selectedId,
        activoNombre: activo.nombre,
        activoCodigo: activo.codigo,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.cuadrillaId || !formData.activoId) {
      showToast('Complete todos los campos obligatorios', 'warning')
      return
    }
    if (!formData.cantidad || formData.cantidad < 1) {
      showToast('La cantidad debe ser mayor a 0', 'warning')
      return
    }
    const activoSeleccionado = activos.find(
      (a) => a.codigo === formData.activoId || a.id?.toString() === formData.activoId,
    )
    if (activoSeleccionado && formData.cantidad > (activoSeleccionado.cantidad || 0)) {
      showToast(`Stock insuficiente. Disponible: ${activoSeleccionado.cantidad || 0}`, 'warning')
      return
    }
    crearSolicitud(formData)
    showToast('Solicitud creada exitosamente', 'success')
    setShowModal(false)
  }

  const handleAprobar = async (solicitud) => {
    setSolicitudConfirm(solicitud)
    setConfirmAction('aprobar')
    setShowConfirmModal(true)
  }

  const handleRechazar = async (solicitud) => {
    setSolicitudConfirm(solicitud)
    setConfirmAction('rechazar')
    setShowConfirmModal(true)
  }

  const confirmarAccion = () => {
    if (confirmAction === 'aprobar') {
      const validacion = validarStock(solicitudConfirm)
      if (!validacion.valido) {
        showToast(validacion.mensaje, 'warning')
        return
      }
      const result = aprobarSolicitud(solicitudConfirm.id)
      if (result?.success) {
        showToast(`Solicitud aprobada. ${validacion.mensaje}`, 'success')
      } else {
        showToast(result?.error || 'Error al aprobar', 'danger')
      }
    } else if (confirmAction === 'rechazar') {
      rechazarSolicitud(solicitudConfirm.id)
      showToast('Solicitud rechazada', 'success')
    }
    setShowConfirmModal(false)
    setSolicitudConfirm(null)
    setConfirmAction(null)
  }

  const handleGestionar = (solicitud) => {
    setSolicitudConfirm(solicitud)
    setConfirmAction(null)
    setShowConfirmModal(true)
  }

  const generarOficio = (solicitud) => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('SOLICITUD DE ACTIVOS', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Oficio N°: ${solicitud.referencia || 'N/A'}`, 20, 35)
    doc.text(`Fecha: ${solicitud.fechaSolicitud}`, 20, 42)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DE LA SOLICITUD', 20, 55)

    doc.setFont('helvetica', 'normal')
    doc.text(`Estado: ${solicitud.estado}`, 20, 63)
    doc.text(`Tipo de Movimiento: ${solicitud.tipoMovimiento || 'Asignación'}`, 20, 70)
    doc.text(`Origen: ${solicitud.origen === 'inventario' ? 'Inventario' : 'Cuadrilla'}`, 20, 77)

    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DEL ACTIVO', 20, 90)

    doc.setFont('helvetica', 'normal')
    doc.text(`Activo: ${solicitud.activoNombre}`, 20, 98)
    doc.text(`Código: ${solicitud.activoCodigo}`, 20, 105)
    doc.text(`Cantidad: ${solicitud.cantidad}`, 20, 112)
    doc.text(`Destino: ${solicitud.cuadrillaNombre || solicitud.cuadrillaId || 'N/A'}`, 20, 119)

    if (solicitud.observaciones) {
      doc.setFont('helvetica', 'bold')
      doc.text('Observaciones:', 20, 130)
      doc.setFont('helvetica', 'normal')
      const splitObs = doc.splitTextToSize(solicitud.observaciones, 170)
      doc.text(splitObs, 20, 137)
    }

    if (solicitud.fechaAprobacion) {
      doc.setFont('helvetica', 'bold')
      doc.text('APROBACIÓN', 20, 155)
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha: ${solicitud.fechaAprobacion}`, 20, 162)
      doc.text(`Aprobado por: ${solicitud.aprobadoPor}`, 20, 169)
    }

    doc.setFontSize(10)
    doc.setTextColor(128)
    doc.text(`Documento generado el ${new Date().toLocaleString()}`, 105, 280, { align: 'center' })

    doc.save(`oficio_solicitud_${solicitud.id}_${new Date().toISOString().split('T')[0]}.pdf`)
    showToast('Oficio PDF generado correctamente', 'success')
  }

  const validarStock = (solicitud) => {
    const activo = activos.find((a) => a.codigo === solicitud.activoCodigo)
    if (!activo) return { valido: false, mensaje: 'Activo no encontrado en inventario' }
    const stock = parseInt(activo.cantidad) || 0
    if (stock < solicitud.cantidad) {
      return {
        valido: false,
        mensaje: `Stock insuficiente. Disponible: ${stock}, Solicitado: ${solicitud.cantidad}`,
      }
    }
    return { valido: true, mensaje: `Stock disponible: ${stock}` }
  }

  const exportarBitacora = () => {
    if (bitacora.length === 0) {
      showToast('No hay registros en la bitácora', 'warning')
      return
    }
    const headers = ['ID', 'Fecha', 'Acción', 'Usuario', 'Solicitud ID', 'Detalles']
    const rows = bitacora.map((b) => [
      b.id,
      b.fecha,
      b.accion,
      b.usuario,
      b.solicitudId,
      JSON.stringify(b.detalles),
    ])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bitacora_solicitudes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    showToast('Bitácora exportada correctamente', 'success')
  }

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return 'success'
      case 'Rechazado':
        return 'danger'
      case 'Pendiente':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getOrigenBadge = (origen) => {
    return origen === 'inventario' ? (
      <CBadge color="info" shape="rounded-pill">
        <CIcon icon={cilTruck} size="sm" className="me-1" />
        Inventario
      </CBadge>
    ) : (
      <CBadge color="primary" shape="rounded-pill">
        <CIcon icon={cilPeople} size="sm" className="me-1" />
        Cuadrilla
      </CBadge>
    )
  }

  const totalSolicitudes = solicitudes.length
  const porcentajePendientes =
    totalSolicitudes > 0 ? (estadisticas.pendientes / totalSolicitudes) * 100 : 0

  return (
    <>
      <ConfirmModal />

      <CRow className="mb-3 align-items-center">
        <CCol xs={12} md={6}>
          <h4 className="mb-0 fw-bold">
            <CIcon icon={cilClipboard} className="me-2 text-eco" />
            Solicitud de Activos
          </h4>
          <small className="text-muted">
            Centro de gestión de solicitudes y movimientos de inventario
          </small>
        </CCol>
        <CCol xs={12} md={6} className="text-md-end"></CCol>
      </CRow>

      <CCard className="eco-card mb-3">
        <CCardBody className="p-0">
          <CNav variant="pills" className="border-0 mb-0 flex-nowrap px-3 pt-3">
            <CNavItem>
              <CNavLink
                active={activeTab === 'solicitudes'}
                onClick={() => setActiveTab('solicitudes')}
                className={`fw-semibold px-3 py-2 ${activeTab === 'solicitudes' ? 'active bg-success text-white' : 'text-muted'}`}
              >
                <CIcon icon={cilClipboard} className="me-1" />
                Solicitudes
                <span className="badge bg-eco-soft text-success ms-2 px-2 py-1 rounded-pill">
                  {estadisticas.total}
                </span>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'bitacora'}
                onClick={() => setActiveTab('bitacora')}
                className={`fw-semibold px-3 py-2 ${activeTab === 'bitacora' ? 'active bg-success text-white' : 'text-muted'}`}
              >
                <CIcon icon={cilClock} className="me-1" />
                Historial / Bitácora
                <span className="badge bg-eco-soft text-success ms-2 px-2 py-1 rounded-pill">
                  {bitacora.length}
                </span>
              </CNavLink>
            </CNavItem>
          </CNav>
          <hr className="mt-2 mb-0" />
        </CCardBody>
      </CCard>

      {activeTab === 'solicitudes' && (
        <CCard className="eco-card mb-4">
          <CCardBody>
            <CRow className="mb-3 g-3">
              <CCol xs={12} md={4}>
                <CInputGroup>
                  <CInputGroupText className="bg-eco-soft border-end-0">
                    <CIcon icon={cilSearch} className="text-eco" />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Buscar por cuadrilla, activo o ID..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border-start-0"
                  />
                </CInputGroup>
              </CCol>
              <CCol xs={6} md={3}>
                <CFormSelect value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </CFormSelect>
              </CCol>
              <CCol xs={6} md={3}>
                <CFormSelect value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)}>
                  <option value="">Cualquier origen</option>
                  <option value="cuadrilla">Desde Cuadrillas</option>
                  <option value="inventario">Desde Inventario</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12} md={2}>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="w-100"
                  onClick={limpiarFiltros}
                  disabled={!busqueda && !filtroEstado && !filtroOrigen}
                >
                  <CIcon icon={cilSync} className="me-1" />
                  Limpiar
                </CButton>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={12}>
                <div className="d-flex gap-3 flex-wrap align-items-center">
                  <CBadge color="warning" className="px-3 py-2">
                    Pendientes: {estadisticas.pendientes}
                  </CBadge>
                  <CBadge color="success" className="px-3 py-2">
                    Aprobados: {estadisticas.aprobados}
                  </CBadge>
                  <CBadge color="danger" className="px-3 py-2">
                    Rechazados: {estadisticas.rechazados}
                  </CBadge>
                  <CBadge color="info" className="px-3 py-2">
                    Total: {totalSolicitudes}
                  </CBadge>
                  {porcentajePendientes > 0 && (
                    <CProgress
                      color="warning"
                      value={porcentajePendientes}
                      className="flex-grow-1"
                      style={{ minWidth: '100px' }}
                    />
                  )}
                </div>
              </CCol>
            </CRow>

            {solicitudesFiltradas.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilSearch} size="4xl" className="text-muted mb-3" />
                <h6 className="text-muted">No se encontraron solicitudes</h6>
                <p className="text-muted small">
                  Las solicitudes se crean desde el módulo de cuadrillas
                </p>
              </div>
            ) : (
              <CRow>
                {solicitudesFiltradas.map((sol) => (
                  <CCol md={6} lg={4} key={sol.id} className="mb-4">
                    <CCard className="h-100 eco-card">
                      <CCardHeader className="eco-card-header pt-3 pb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className={`rounded-circle d-flex p-2 ${
                                sol.estado === 'Aprobado'
                                  ? 'bg-success-subtle'
                                  : sol.estado === 'Rechazado'
                                    ? 'bg-danger-subtle'
                                    : 'bg-warning-subtle'
                              }`}
                            >
                              <CIcon
                                icon={
                                  sol.estado === 'Aprobado'
                                    ? cilCheckCircle
                                    : sol.estado === 'Rechazado'
                                      ? cilXCircle
                                      : cilClock
                                }
                                className={`m-auto ${
                                  sol.estado === 'Aprobado'
                                    ? 'text-success'
                                    : sol.estado === 'Rechazado'
                                      ? 'text-danger'
                                      : 'text-warning'
                                }`}
                              />
                            </div>
                            <div>
                              <span className="fw-bold">#{sol.id}</span>
                              <div className="small text-muted">
                                {new Date(sol.fechaSolicitud).toLocaleDateString('es-VE')}
                              </div>
                            </div>
                          </div>
                          <CBadge color={getBadgeColor(sol.estado)} className="px-2">
                            {sol.estado}
                          </CBadge>
                        </div>
                      </CCardHeader>
                      <CCardBody>
                        <div className="mb-3">{getOrigenBadge(sol.origen)}</div>

                        <h6 className="fw-bold mb-1">
                          {sol.activoNombre || 'Activo no especificado'}
                        </h6>
                        <small className="text-muted d-block mb-3">
                          {sol.activoCodigo || 'Sin código'}
                        </small>

                        <div className="small mb-2">
                          <CIcon icon={cilPeople} className="me-2 text-muted" />
                          {sol.cuadrillaNombre || sol.cuadrillaId || 'Sin cuadrilla'}
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="text-muted small">Cantidad:</span>
                            <CBadge color="secondary" className="ms-1 px-2">
                              {sol.cantidad}
                            </CBadge>
                          </div>
                          {sol.referencia && <small className="text-muted">{sol.referencia}</small>}
                        </div>

                        {sol.observaciones && (
                          <div className="small text-muted mt-2 border-top pt-2">
                            <CIcon icon={cilInfo} className="me-1" />
                            {sol.observaciones.length > 50
                              ? sol.observaciones.substring(0, 50) + '...'
                              : sol.observaciones}
                          </div>
                        )}
                      </CCardBody>
                      <CCardFooter className="eco-surface">
                        <div className="d-flex justify-content-between align-items-center">
                          {sol.estado === 'Pendiente' ? (
                            <CButton
                              size="sm"
                              color="primary"
                              variant="outline"
                              onClick={() => handleGestionar(sol)}
                            >
                              <CIcon icon={cilPencil} className="me-1" />
                              Gestionar
                            </CButton>
                          ) : (
                            <div className="small text-muted">
                              {sol.fechaAprobacion && (
                                <>
                                  <CIcon icon={cilCheckCircle} className="me-1" />
                                  {new Date(sol.fechaAprobacion).toLocaleDateString('es-VE')}
                                </>
                              )}
                            </div>
                          )}
                          <CButton
                            size="sm"
                            color="secondary"
                            variant="outline"
                            onClick={() => abrirModalVer(sol)}
                          >
                            <CIcon icon={cilInfo} className="me-1" />
                            Ver Detalles
                          </CButton>
                        </div>
                      </CCardFooter>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            )}

            {solicitudesFiltradas.length > 0 && (
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <CButton color="outline-success" onClick={exportarCSV}>
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Exportar CSV
                </CButton>
              </div>
            )}
          </CCardBody>
        </CCard>
      )}

      {activeTab === 'bitacora' &&
        (() => {
          const filtrarPorFecha = (entry) => {
            if (!bitacoraFiltroFecha) return true
            const fechaEntrada = new Date(entry.fecha)
            const ahora = new Date()
            const diferenciaDias = Math.floor((ahora - fechaEntrada) / (1000 * 60 * 60 * 24))

            switch (bitacoraFiltroFecha) {
              case 'hoy':
                return diferenciaDias === 0
              case 'ayer':
                return diferenciaDias === 1
              case 'semana':
                return diferenciaDias <= 7
              case 'mes':
                return diferenciaDias <= 30
              default:
                return true
            }
          }

          const bitacoraFiltrada = bitacora.filter((b) => {
            const matchBusqueda =
              !bitacoraBusqueda ||
              b.detalles?.activo?.toLowerCase().includes(bitacoraBusqueda.toLowerCase()) ||
              b.detalles?.cuadrilla?.toLowerCase().includes(bitacoraBusqueda.toLowerCase()) ||
              b.solicitudId.toString().includes(bitacoraBusqueda) ||
              b.usuario?.toLowerCase().includes(bitacoraBusqueda.toLowerCase()) ||
              b.accion?.toLowerCase().includes(bitacoraBusqueda.toLowerCase())
            const matchAccion = !bitacoraFiltroAccion || b.accion === bitacoraFiltroAccion
            const matchFecha = filtrarPorFecha(b)
            return matchBusqueda && matchAccion && matchFecha
          })

          const tieneFiltrosActivos =
            bitacoraBusqueda || bitacoraFiltroAccion || bitacoraFiltroFecha

          return (
            <CCard className="eco-card">
              <CCardHeader className="eco-card-header pb-2">
                <CRow className="align-items-center g-3 mb-2">
                  <CCol xs={12} md={6}>
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilClock} className="me-2 text-eco" size="lg" />
                      <div>
                        <span className="fw-bold fs-5">Historial de Acciones</span>
                        <div className="text-muted small">
                          {bitacoraFiltrada.length} de {bitacora.length} registros
                          {tieneFiltrosActivos && (
                            <CButton
                              size="sm"
                              variant="link"
                              className="text-danger p-0 ms-2"
                              onClick={() => {
                                setBitacoraBusqueda('')
                                setBitacoraFiltroAccion('')
                                setBitacoraFiltroFecha('')
                              }}
                            >
                              <CIcon icon={cilTrash} size="sm" /> Limpiar filtros
                            </CButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </CCol>
                  <CCol xs={12} md={6} className="text-md-end">
                    <CButton color="primary" variant="outline" onClick={exportarBitacora}>
                      <CIcon icon={cilCloudDownload} className="me-1" />
                      Exportar
                    </CButton>
                  </CCol>
                </CRow>

                <CRow className="g-2 align-items-center">
                  <CCol xs={12} md={4}>
                    <CInputGroup className="shadow-sm">
                      <CInputGroupText className="bg-eco-soft border-end-0">
                        <CIcon icon={cilSearch} className="text-eco" />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Buscar por activo, cuadrilla, usuario, ID..."
                        value={bitacoraBusqueda}
                        onChange={(e) => setBitacoraBusqueda(e.target.value)}
                        className="border-start-0"
                      />
                      {bitacoraBusqueda && (
                        <CButton
                          variant="outline"
                          className="border-start-0"
                          onClick={() => setBitacoraBusqueda('')}
                        >
                          <CIcon icon={cilXCircle} />
                        </CButton>
                      )}
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} md={8}>
                    <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                      <CFormSelect
                        size="sm"
                        style={{ width: '140px' }}
                        value={bitacoraFiltroFecha}
                        onChange={(e) => setBitacoraFiltroFecha(e.target.value)}
                      >
                        <option value="">Todas las fechas</option>
                        <option value="hoy">Hoy</option>
                        <option value="ayer">Ayer</option>
                        <option value="semana">Últimos 7 días</option>
                        <option value="mes">Últimos 30 días</option>
                      </CFormSelect>
                      <CFormSelect
                        size="sm"
                        style={{ width: '160px' }}
                        value={bitacoraFiltroAccion}
                        onChange={(e) => setBitacoraFiltroAccion(e.target.value)}
                      >
                        <option value="">Todas las acciones</option>
                        <option value="aprobar">Aprobaciones</option>
                        <option value="rechazar">Rechazos</option>
                      </CFormSelect>
                    </div>
                  </CCol>
                </CRow>
              </CCardHeader>
              <CCardBody className="p-0">
                {bitacoraFiltrada.length === 0 ? (
                  <div className="text-center py-5">
                    <CIcon icon={cilClock} size="4xl" className="text-muted mb-3" />
                    <h6 className="text-muted">No se encontraron registros</h6>
                    <p className="text-muted small">
                      Prueba con otros términos de búsqueda o filtros
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <CTable hover align="middle" className="mb-0">
                      <CTableHead className="table-light">
                        <CTableRow>
                          <CTableHeaderCell className="text-center" style={{ width: '60px' }}>
                            #
                          </CTableHeaderCell>
                          <CTableHeaderCell>Fecha y Hora</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
                          <CTableHeaderCell>Usuario</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Solicitud</CTableHeaderCell>
                          <CTableHeaderCell>Detalles del Movimiento</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {bitacoraFiltrada.map((entry) => {
                          const solicitudRelacionada = solicitudes.find(
                            (s) => s.id === entry.solicitudId,
                          )
                          return (
                            <CTableRow key={entry.id} className="position-relative">
                              <CTableDataCell className="text-center text-muted">
                                <CIcon icon={cilInfo} size="sm" />
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="fw-semibold">{entry.fecha.split(',')[0]}</div>
                                <small className="text-muted">
                                  {entry.fecha.split(',')[1]?.trim()}
                                </small>
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CBadge
                                  color={
                                    entry.accion === 'aprobar'
                                      ? 'success'
                                      : entry.accion === 'rechazar'
                                        ? 'danger'
                                        : entry.accion === 'crear'
                                          ? 'info'
                                          : 'secondary'
                                  }
                                  className="px-3 py-2"
                                >
                                  {entry.accion === 'aprobar' && (
                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                  )}
                                  {entry.accion === 'rechazar' && (
                                    <CIcon icon={cilXCircle} className="me-1" />
                                  )}
                                  {entry.accion === 'crear' && (
                                    <CIcon icon={cilPlus} className="me-1" />
                                  )}
                                  {entry.accion.charAt(0).toUpperCase() + entry.accion.slice(1)}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex align-items-center">
                                  <div className="bg-eco-soft rounded-circle p-1 me-2">
                                    <CIcon icon={cilPeople} size="sm" className="text-eco" />
                                  </div>
                                  <span className="fw-semibold">{entry.usuario}</span>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CButton
                                  size="sm"
                                  variant="outline"
                                  color="primary"
                                  onClick={() => {
                                    if (solicitudRelacionada) handleGestionar(solicitudRelacionada)
                                  }}
                                >
                                  <CIcon icon={cilClipboard} className="me-1" />#{entry.solicitudId}
                                </CButton>
                                {solicitudRelacionada && (
                                  <div className="mt-1">
                                    <CBadge
                                      color={
                                        solicitudRelacionada.estado === 'Aprobado'
                                          ? 'success'
                                          : solicitudRelacionada.estado === 'Rechazado'
                                            ? 'danger'
                                            : 'warning'
                                      }
                                      className="px-2 py-1"
                                    >
                                      {solicitudRelacionada.estado}
                                    </CBadge>
                                  </div>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex flex-column gap-1">
                                  {entry.detalles?.activo && (
                                    <div className="d-flex align-items-center">
                                      <CIcon
                                        icon={cilStorage}
                                        size="sm"
                                        className="text-muted me-2"
                                      />
                                      <span>{entry.detalles.activo}</span>
                                    </div>
                                  )}
                                  {entry.detalles?.cantidad && (
                                    <div className="d-flex align-items-center">
                                      <CIcon
                                        icon={cilOptions}
                                        size="sm"
                                        className="text-muted me-2"
                                      />
                                      <span>
                                        Cantidad: <strong>{entry.detalles.cantidad}</strong>
                                      </span>
                                    </div>
                                  )}
                                  {entry.detalles?.cuadrilla && (
                                    <div className="d-flex align-items-center">
                                      <CIcon
                                        icon={cilPeople}
                                        size="sm"
                                        className="text-muted me-2"
                                      />
                                      <span>
                                        Destino: <strong>{entry.detalles.cuadrilla}</strong>
                                      </span>
                                    </div>
                                  )}
                                  {entry.detalles?.referencia && (
                                    <div className="d-flex align-items-center">
                                      <CIcon
                                        icon={cilClipboard}
                                        size="sm"
                                        className="text-muted me-2"
                                      />
                                      <span>
                                        Ref: <strong>{entry.detalles.referencia}</strong>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
              </CCardBody>
            </CCard>
          )
        })()}

      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        className="eco-modal"
      >
        <CModalHeader closeButton className="eco-card-header">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilClipboard} className="me-2" />
            Detalle de Solicitud
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={12}>
                <CFormLabel>Cuadrilla Destino *</CFormLabel>
                <CFormSelect value={formData.cuadrillaId} onChange={handleCuadrillaChange}>
                  <option value="">Seleccionar cuadrilla</option>
                  {cuadrillas.length > 0 ? (
                    cuadrillas.map((c) => (
                      <option key={c.id || c.nombre} value={c.id || c.nombre}>
                        {c.nombre} {c.zona ? `- ${c.zona}` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Cuadrilla A">Cuadrilla A - Zona Norte</option>
                      <option value="Cuadrilla B">Cuadrilla B - Zona Sur</option>
                      <option value="Cuadrilla C">Cuadrilla C - Centro</option>
                    </>
                  )}
                </CFormSelect>
              </CCol>

              <CCol md={12}>
                <CFormLabel>Activo del Inventario *</CFormLabel>
                <CFormSelect value={formData.activoId} onChange={handleActivoChange}>
                  <option value="">Seleccionar activo</option>
                  {activos.length > 0 ? (
                    activos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.codigo} - {a.nombre} ({a.estado})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">MINECO-HER-001 - Taladro Industrial</option>
                      <option value="2">MINECO-VEH-001 - Camioneta Toyota Hilux</option>
                    </>
                  )}
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormLabel>Cantidad</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))
                  }
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Tipo de Movimiento</CFormLabel>
                <CFormSelect
                  value={formData.tipoMovimiento || 'Asignacion'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tipoMovimiento: e.target.value }))
                  }
                >
                  <option value="Asignacion">Asignación</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </CFormSelect>
              </CCol>

              <CCol md={12}>
                <CFormLabel>Observaciones / Motivo</CFormLabel>
                <textarea
                  className="form-control"
                  rows="3"
                  maxLength={100}
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, observaciones: e.target.value }))
                  }
                  placeholder="Motivo de la solicitud (máx 100 caracteres)"
                />
                <small className="text-muted">{formData.observaciones?.length || 0}/100</small>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </CButton>
            <CButton type="submit" color="success">
              <CIcon icon={cilCheckCircle} className="me-2" />
              Crear Solicitud
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal
        visible={showVerModal}
        onClose={() => setShowVerModal(false)}
        size="lg"
        className="eco-modal"
      >
        <CModalHeader closeButton className="eco-card-header">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilInfo} className="me-2" />
            Detalle de Solicitud #{solicitudVer?.id}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {solicitudVer && (
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Estado</small>
                  <div className="mt-1">
                    <CBadge color={getBadgeColor(solicitudVer.estado)} className="px-3 py-2">
                      {solicitudVer.estado}
                    </CBadge>
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Origen</small>
                  <div className="mt-1">{getOrigenBadge(solicitudVer.origen)}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Activo</small>
                  <div className="fw-bold">{solicitudVer.activoNombre}</div>
                  <small className="text-muted">{solicitudVer.activoCodigo}</small>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Cuadrilla Destino</small>
                  <div className="fw-bold">
                    {solicitudVer.cuadrillaNombre || solicitudVer.cuadrillaId}
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Cantidad</small>
                  <div className="fw-bold">{solicitudVer.cantidad}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Fecha Solicitud</small>
                  <div className="fw-bold">
                    {new Date(solicitudVer.fechaSolicitud).toLocaleString('es-VE')}
                  </div>
                </div>
              </CCol>
              {solicitudVer.observaciones && (
                <CCol md={12}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted">Observaciones</small>
                    <div>{solicitudVer.observaciones}</div>
                  </div>
                </CCol>
              )}
              {solicitudVer.referencia && (
                <CCol md={12}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted">Referencia de Movimiento</small>
                    <div className="fw-bold text-eco">{solicitudVer.referencia}</div>
                  </div>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowVerModal(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        size="lg"
        className="eco-modal"
      >
        <CModalHeader
          closeButton
          className={`${confirmAction === 'aprobar' ? 'bg-success-subtle' : confirmAction === 'rechazar' ? 'bg-danger-subtle' : 'eco-card-header'}`}
        >
          <CModalTitle className="fw-bold">
            {!confirmAction && <CIcon icon={cilClipboard} className="me-2" />}
            {confirmAction === 'aprobar' ? (
              <>
                <CIcon icon={cilCheckCircle} className="me-2 text-success" />
                Confirmar Aprobación
              </>
            ) : confirmAction === 'rechazar' ? (
              <>
                <CIcon icon={cilXCircle} className="me-2 text-danger" />
                Confirmar Rechazo
              </>
            ) : (
              <>
                <CIcon icon={cilClipboard} className="me-2" />
                Gestionar Solicitud
              </>
            )}
            {solicitudConfirm?.referencia && (
              <CBadge color="primary" className="ms-2 px-2 py-1">
                <CIcon icon={cilClipboard} className="me-1" size="sm" />
                {solicitudConfirm.referencia}
              </CBadge>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {solicitudConfirm && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <h5 className="mb-0 fw-bold">{solicitudConfirm.activoNombre}</h5>
                    <small className="text-muted">{solicitudConfirm.activoCodigo}</small>
                  </div>
                  <CBadge color={getBadgeColor(solicitudConfirm.estado)} className="px-3 py-2">
                    {solicitudConfirm.estado}
                  </CBadge>
                </div>
                {solicitudConfirm.referencia && (
                  <CBadge color="primary" className="px-2 py-1">
                    <CIcon icon={cilClipboard} className="me-1" size="sm" />
                    {solicitudConfirm.referencia}
                  </CBadge>
                )}
              </div>

              <CRow className="g-3">
                <CCol md={6}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted d-block mb-1">Estado Actual</small>
                    <CBadge
                      color={getBadgeColor(solicitudConfirm.estado)}
                      className="px-3 py-2 fs-6"
                    >
                      {solicitudConfirm.estado}
                    </CBadge>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted d-block mb-1">Origen</small>
                    {getOrigenBadge(solicitudConfirm.origen)}
                    {solicitudConfirm.origenDetalle && (
                      <small className="text-muted d-block mt-1">
                        {solicitudConfirm.origenDetalle}
                      </small>
                    )}
                  </div>
                </CCol>

                <CCol md={12}>
                  <div className="border rounded p-3 eco-surface">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <small className="text-muted d-block mb-1">Activo Solicitado</small>
                        <div className="fw-bold fs-5">
                          {solicitudConfirm.activoNombre || 'Activo no especificado'}
                        </div>
                        <CBadge color="secondary" className="mt-1">
                          {solicitudConfirm.activoCodigo || 'Sin código'}
                        </CBadge>
                      </div>
                      {solicitudConfirm.tipoMovimiento && (
                        <div className="text-end">
                          <small className="text-muted d-block mb-1">Tipo de Movimiento</small>
                          <CBadge color="info" className="px-3 py-2">
                            <CIcon icon={cilTruck} className="me-1" />
                            {solicitudConfirm.tipoMovimiento}
                          </CBadge>
                        </div>
                      )}
                    </div>
                  </div>
                </CCol>

                <CCol md={6}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted d-block mb-1">Cantidad Solicitada</small>
                    <div className="fw-bold fs-5">
                      <CBadge color="secondary" className="px-3">
                        {solicitudConfirm.cantidad}
                      </CBadge>
                    </div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted d-block mb-1">Cuadrilla Destino</small>
                    <div className="fw-bold">
                      {solicitudConfirm.cuadrillaNombre ||
                        solicitudConfirm.cuadrillaId ||
                        'Sin cuadrilla'}
                    </div>
                    {solicitudConfirm.cuadrillaId && (
                      <small className="text-muted">ID: {solicitudConfirm.cuadrillaId}</small>
                    )}
                  </div>
                </CCol>

                <CCol md={6}>
                  <div className="border rounded p-3 eco-surface">
                    <small className="text-muted d-block mb-1">Fecha de Solicitud</small>
                    <div className="fw-bold">
                      {new Date(solicitudConfirm.fechaSolicitud).toLocaleString('es-VE')}
                    </div>
                  </div>
                </CCol>
                {(solicitudConfirm.ubicacionOrigen || solicitudConfirm.ubicacionDestino) && (
                  <CCol md={12}>
                    <div className="border rounded p-3 eco-surface">
                      <small className="text-muted d-block mb-2">Ubicaciones del Movimiento</small>
                      <CRow>
                        <CCol md={6}>
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilArrowRight} className="text-muted me-2" />
                            <div>
                              <small className="text-muted">Origen</small>
                              <div className="fw-semibold">
                                {solicitudConfirm.ubicacionOrigen || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <div className="d-flex align-items-center">
                            <CIcon icon={cilArrowRight} className="text-success me-2" />
                            <div>
                              <small className="text-muted">Destino</small>
                              <div className="fw-semibold">
                                {solicitudConfirm.ubicacionDestino || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </CCol>
                      </CRow>
                    </div>
                  </CCol>
                )}

                {solicitudConfirm.observaciones && (
                  <CCol md={12}>
                    <div className="border rounded p-3 eco-surface">
                      <small className="text-muted d-block mb-1">Observaciones / Motivo</small>
                      <div>{solicitudConfirm.observaciones}</div>
                    </div>
                  </CCol>
                )}

                <CCol md={12}>
                  <div className="border rounded p-3 eco-surface">
                    <div className="d-flex align-items-center mb-2">
                      <CIcon icon={cilClock} className="text-muted me-2" />
                      <small className="text-muted fw-bold">HISTORIAL / BITÁCORA</small>
                    </div>
                    {bitacora.filter((b) => b.solicitudId === solicitudConfirm.id).length > 0 ? (
                      <div className="table-responsive" style={{ maxHeight: '200px' }}>
                        <table className="table table-sm table-striped mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Fecha</th>
                              <th>Acción</th>
                              <th>Usuario</th>
                              <th>Detalles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bitacora
                              .filter((b) => b.solicitudId === solicitudConfirm.id)
                              .map((entry) => (
                                <tr key={entry.id}>
                                  <td>
                                    <small>{entry.fecha}</small>
                                  </td>
                                  <td>
                                    <CBadge
                                      color={
                                        entry.accion === 'aprobar'
                                          ? 'success'
                                          : entry.accion === 'rechazar'
                                            ? 'danger'
                                            : 'info'
                                      }
                                    >
                                      {entry.accion}
                                    </CBadge>
                                  </td>
                                  <td>
                                    <small>{entry.usuario}</small>
                                  </td>
                                  <td>
                                    <small>
                                      {entry.detalles?.activo} - Cant: {entry.detalles?.cantidad}
                                    </small>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <small className="text-muted">
                        No hay historial registrado para esta solicitud.
                      </small>
                    )}
                  </div>
                </CCol>
              </CRow>

              {confirmAction === 'aprobar' && (
                <div className="mt-4 p-3 bg-success-subtle rounded border border-success">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilCheckCircle} className="text-success me-2" size="lg" />
                    <div>
                      <strong className="text-success">Al aprobar esta solicitud:</strong>
                      <ul className="mb-0 mt-1 small">
                        <li>Se registrará un movimiento en el Inventario</li>
                        <li>El activo será asignado a la cuadrilla seleccionada</li>
                        <li>La solicitud cambiará a estado "Aprobado"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {confirmAction === 'rechazar' && (
                <div className="mt-4 p-3 bg-danger-subtle rounded border border-danger">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilXCircle} className="text-danger me-2" size="lg" />
                    <div>
                      <strong className="text-danger">Al rechazar esta solicitud:</strong>
                      <ul className="mb-0 mt-1 small">
                        <li>La solicitud cambiará a estado "Rechazado"</li>
                        <li>No se realizará ningún movimiento en Inventario</li>
                        <li>Se notificará al solicitante</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={async () => {
              if (confirmAction) {
                if (
                  await confirm(
                    'Salir del proceso',
                    '¿Estás seguro de salir? El proceso de aprobación/rechazo comenzará de nuevo.',
                    { confirmLabel: 'Salir', variant: 'warning' },
                  )
                ) {
                  setConfirmAction(null)
                  setShowConfirmModal(false)
                }
              } else {
                setShowConfirmModal(false)
              }
            }}
          >
            {confirmAction ? 'Volver' : 'Cerrar'}
          </CButton>

          {solicitudConfirm?.estado === 'Pendiente' && !confirmAction && (
            <>
              <CButton
                color="danger"
                variant="outline"
                onClick={() => setConfirmAction('rechazar')}
              >
                <CIcon icon={cilXCircle} className="me-2" />
                Rechazar
              </CButton>
              <CButton color="success" onClick={() => setConfirmAction('aprobar')}>
                <CIcon icon={cilCheckCircle} className="me-2" />
                Aprobar
              </CButton>
            </>
          )}

          {confirmAction && (
            <CButton
              color="primary"
              variant="outline"
              onClick={() => generarOficio(solicitudConfirm)}
            >
              <CIcon icon={cilCloudDownload} className="me-2" />
              Generar Oficio PDF
            </CButton>
          )}

          {confirmAction === 'aprobar' && (
            <CButton color="success" onClick={confirmarAccion}>
              <CIcon icon={cilCheckCircle} className="me-2" />
              Confirmar Aprobación
            </CButton>
          )}
          {confirmAction === 'rechazar' && (
            <CButton color="danger" onClick={confirmarAccion}>
              <CIcon icon={cilXCircle} className="me-2" />
              Confirmar Rechazo
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SolicitudActivos
