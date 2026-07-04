import React, { useState, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CRow,
  CCol,
  CButton,
  CBadge,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilInbox,
  cilSearch,
  cilSync,
  cilUser,
  cilFile,
  cilCheckCircle,
  cilXCircle,
  cilCloudDownload,
  cilInfo,
  cilTask,
  cilClipboard,
  cilClock,
  cilBriefcase,
  cilHistory,
} from '@coreui/icons'

import useBandejaAdministrativa from './hooks/useBandejaAdministrativa'
import useSolicitudActivos from './hooks/useSolicitudActivos'
import useCuadrillas from '../cuadrillas/hooks/useCuadrillas'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'
import { integracionService } from '../../../services/integracionService'
import estructuraOrgService from '../../RRHH/EstructuraOrg/services/estructuraOrgService'
import { tramitesService } from '../Tramites/services/tramitesService'
import { denunciasService } from '../GestionDenuncias/services/denunciasService'
import { cuadrillaService } from '../cuadrillas/services/cuadrillaService'
import { generarProvidencia } from './utils/generarProvidencia'
import ModalAsignarInspector from './components/ModalAsignarInspector'
import ModalRegistrarFirma from './components/ModalRegistrarFirma'
import {
  NIVELES_EDUCATIVOS,
  EXPERIENCIA_OPCIONES,
  TIPOS_JORNADA,
} from '../../RRHH/EstructuraOrg/constants/estructuraConstants'

const obtenerLabelNivelEducativo = (v) => {
  const item = NIVELES_EDUCATIVOS.find((e) => e.value === v)
  return item ? item.label : v || '—'
}

const obtenerLabelExperiencia = (v) => {
  const item = EXPERIENCIA_OPCIONES.find((e) => e.value === String(v))
  return item ? item.label : v || '—'
}

const obtenerLabelJornada = (v) => {
  const item = TIPOS_JORNADA.find((j) => j.value === v)
  return item ? item.label : v || '—'
}

const BandejaAdministrativa = () => {
  const { showToast } = useToast()
  const { ConfirmModal, confirm } = useConfirmModal()

  // Bandeja (agregador)
  const {
    tareas,
    bitacoraGlobal,
    loading: loadingBandeja,
    error: bandejaError,
    refreshBandeja,
  } = useBandejaAdministrativa()

  // SolicitudActivos (funcionalidad existente)
  const {
    solicitudes,
    estadisticas,
    formData,
    setFormData,
    aprobarSolicitud,
    rechazarSolicitud,
    exportarCSV,
  } = useSolicitudActivos()

  // Cuadrillas (para inspectores)
  const { cuadrillas, marcarInspectorOcupado } = useCuadrillas()

  const [activeTab, setActiveTab] = useState('bandeja')
  const [busqueda, setBusqueda] = useState('')
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // Modals
  const [modalInspectorVisible, setModalInspectorVisible] = useState(false)
  const [tramiteParaInspector, setTramiteParaInspector] = useState(null)
  const [modalFirmaVisible, setModalFirmaVisible] = useState(false)
  const [tramiteParaFirma, setTramiteParaFirma] = useState(null)
  const [modalSolicitudDetalle, setModalSolicitudDetalle] = useState(false)
  const [solicitudParaDetalle, setSolicitudParaDetalle] = useState(null)
  const [modalTramiteDetalle, setModalTramiteDetalle] = useState(false)
  const [tramiteParaDetalle, setTramiteParaDetalle] = useState(null)
  const [modalRRHHDetalle, setModalRRHHDetalle] = useState(false)
  const [solicitudRRHHParaDetalle, setSolicitudRRHHParaDetalle] = useState(null)
  const [modalPlazaDetalle, setModalPlazaDetalle] = useState(false)
  const [solicitudPlazaParaDetalle, setSolicitudPlazaParaDetalle] = useState(null)

  // ── Tareas de la bandeja ──
  const tareasFiltradas = tareas.filter((t) => {
    if (filtroModulo && t.moduloOrigen !== filtroModulo) return false
    if (filtroEstado && t.estado !== filtroEstado) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        t.solicitante?.toLowerCase().includes(q) ||
        t.tipo?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ── Solicitudes filtradas ──
  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (filtroEstado && s.estado !== filtroEstado) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        s.cuadrillaNombre?.toLowerCase().includes(q) ||
        s.activoNombre?.toLowerCase().includes(q) ||
        s.id?.toString().includes(q)
      )
    }
    return true
  })

  // ── Acciones ──
  const handleAsignarInspector = useCallback((tarea) => {
    setTramiteParaInspector(tarea)
    setModalInspectorVisible(true)
  }, [])

  const handleConfirmarInspector = useCallback(
    async (tarea, inspector) => {
      const tramiteData = tarea.tramiteData
      const res = await marcarInspectorOcupado(inspector.id)
      if (res.success) {
        const result = await tramitesService.actualizarTramite(tramiteData.id, {
          inspectorId: inspector.id,
          inspectorNombre: inspector.nombre,
          estado: 'INSPECCION',
          fechaInspeccion: new Date().toISOString().split('T')[0],
          historial: [
            ...(tramiteData.historial || []),
            {
              estado: 'INSPECCION',
              fecha: new Date().toISOString(),
              usuario: 'Bandeja Admin',
              nota: `Inspector ${inspector.nombre} asignado`,
            },
          ],
        })
        if (result.success) {
          showToast(
            `Inspector ${inspector.nombre} asignado al trámite ${tramiteData.id}`,
            'success',
          )
          setModalInspectorVisible(false)
          setTramiteParaInspector(null)
          refreshBandeja()
        } else {
          showToast(result.error || 'Error al actualizar trámite', 'danger')
        }
      } else {
        showToast(res.error || 'Error al asignar inspector', 'danger')
      }
    },
    [marcarInspectorOcupado, showToast, refreshBandeja],
  )

  const handleGenerarPDF = useCallback(
    (tarea) => {
      const tramiteData = tarea.tramiteData
      const resultado = generarProvidencia(tramiteData)
      if (resultado.success) {
        tramitesService.actualizarTramite(tramiteData.id, {
          estado: 'DOCUMENTO_GENERADO',
          fechaDocumento: new Date().toISOString().split('T')[0],
          numProvidencia: resultado.numProvidencia,
          historial: [
            ...(tramiteData.historial || []),
            {
              estado: 'DOCUMENTO_GENERADO',
              fecha: new Date().toISOString(),
              usuario: 'Bandeja Admin',
              nota: `Providencia ${resultado.numProvidencia} generada`,
            },
          ],
        })
        showToast(
          `Providencia ${resultado.numProvidencia} generada. Imprima y lleve al Director para firmar.`,
          'success',
        )
        refreshBandeja()
      } else {
        showToast('Error al generar la providencia', 'danger')
      }
    },
    [showToast, refreshBandeja],
  )

  const handleRegistrarFirma = useCallback((tarea) => {
    setTramiteParaFirma(tarea)
    setModalFirmaVisible(true)
  }, [])

  const handleConfirmarFirma = useCallback(
    async (tarea, archivo) => {
      const tramiteData = tarea.tramiteData

      // Liberar inspector via cuadrillaService
      if (tramiteData.inspectorId) {
        const resCuadrilla = await cuadrillaService.actualizarCuadrilla(tramiteData.inspectorId, {
          estado: 'activa',
          disponible: true,
        })
        if (!resCuadrilla.success) {
          console.warn('No se pudo liberar inspector:', resCuadrilla.error)
        }
      }

      // Actualizar trámite via tramitesService
      const result = await tramitesService.actualizarTramite(tramiteData.id, {
        estado: 'APROBADO',
        fechaAprobacion: new Date().toISOString().split('T')[0],
        documentoFirmado: archivo.name,
        historial: [
          ...(tramiteData.historial || []),
          {
            estado: 'APROBADO',
            fecha: new Date().toISOString(),
            usuario: 'Bandeja Admin',
            nota: `Documento firmado y aprobado. Archivo: ${archivo.name}`,
          },
        ],
      })

      if (result.success) {
        showToast('Trámite aprobado. Notificación enviada al solicitante.', 'success')
        setModalFirmaVisible(false)
        setTramiteParaFirma(null)
        refreshBandeja()
      } else {
        showToast(result.error || 'Error al actualizar trámite', 'danger')
      }
    },
    [showToast, refreshBandeja],
  )

  const handleAprobarSolicitud = useCallback(
    async (solicitud) => {
      const ok = await confirm(
        '¿Aprobar Solicitud?',
        `¿Aprobar la solicitud #${solicitud.id} de ${solicitud.activoNombre} para ${solicitud.cuadrillaNombre}?`,
        { confirmLabel: 'Aprobar', variant: 'success' },
      )
      if (!ok) return

      const result = await aprobarSolicitud(solicitud.id)
      if (result?.success) {
        showToast(`Solicitud #${solicitud.id} aprobada exitosamente`, 'success')
        refreshBandeja()
      } else {
        showToast(result?.error || 'Error al aprobar', 'danger')
      }
    },
    [aprobarSolicitud, confirm, showToast, refreshBandeja],
  )

  const handleRechazarSolicitud = useCallback(
    async (solicitud) => {
      const ok = await confirm(
        '¿Rechazar Solicitud?',
        `¿Rechazar la solicitud #${solicitud.id}? Esta acción no se puede deshacer.`,
        { confirmLabel: 'Rechazar', variant: 'danger' },
      )
      if (!ok) return

      await rechazarSolicitud(solicitud.id)
      showToast(`Solicitud #${solicitud.id} rechazada`, 'success')
      refreshBandeja()
    },
    [rechazarSolicitud, confirm, showToast, refreshBandeja],
  )

  const handleAprobarRRHH = useCallback(
    async (tarea) => {
      const s = tarea.solicitudRRHHData
      const ok = await confirm(
        '¿Aprobar Solicitud RRHH?',
        `¿Aprobar ${s.tipo} de ${s.empleado || s.usuario}?`,
        { confirmLabel: 'Aprobar', variant: 'success' },
      )
      if (!ok) return

      let result
      if (s.tipo === 'Solicitud de Contratación') {
        result = await integracionService.crearEmpleadoDesdeBandeja(s.id)
      } else {
        result = await integracionService.aprobarSolicitudDesdeBandeja(
          s.id,
          'Aprobado por Gestión Administrativa',
        )
      }

      if (result.success) {
        showToast(
          s.tipo === 'Solicitud de Contratación'
            ? `Contratación aprobada — empleado creado`
            : `Solicitud RRHH de ${s.empleado || s.usuario} aprobada`,
          'success',
        )
        refreshBandeja()
      } else {
        showToast(result.error || 'Error al aprobar', 'danger')
      }
    },
    [confirm, showToast, refreshBandeja],
  )

  const handleRechazarRRHH = useCallback(
    async (tarea) => {
      const s = tarea.solicitudRRHHData
      const ok = await confirm(
        '¿Rechazar Solicitud RRHH?',
        `¿Rechazar ${s.tipo} de ${s.empleado || s.usuario}?`,
        { confirmLabel: 'Rechazar', variant: 'danger' },
      )
      if (!ok) return
      const result = await integracionService.rechazarSolicitudDesdeBandeja(
        s.id,
        'Rechazado por Gestión Administrativa',
      )
      if (result.success) {
        showToast(`Solicitud RRHH rechazada`, 'success')
        refreshBandeja()
      } else {
        showToast(result.error || 'Error al rechazar', 'danger')
      }
    },
    [confirm, showToast, refreshBandeja],
  )

  const handleRevisionRRHH = useCallback(
    async (tarea) => {
      const s = tarea.solicitudRRHHData
      const result = await integracionService.enviarARevisionDesdeBandeja(s.id)
      if (result.success) {
        showToast(`Solicitud RRHH enviada a revisión`, 'info')
        refreshBandeja()
      }
    },
    [showToast, refreshBandeja],
  )

  const handleAprobarPlaza = useCallback(
    async (tarea) => {
      const s = tarea.solicitudPlazaData
      const ok = await confirm(
        '¿Aprobar solicitud de plaza?',
        `¿Aprobar la plaza ${s.codigo} (${s.cargo}) para el departamento ${s.departamentoCodigo}?`,
        { confirmLabel: 'Aprobar', variant: 'success' },
      )
      if (!ok) return

      const plazaData = {
        codigo: s.codigo,
        departamentoCodigo: s.departamentoCodigo,
        cargo: s.cargo,
        nivel: s.nivel,
        estado: 'vacante',
        nivelEducativo: s.nivelEducativo || '',
        experienciaMinima: s.experienciaMinima || '0',
        tipoJornada: s.tipoJornada || 'completo',
        certificaciones: s.certificaciones || '',
      }

      const crearRes = await estructuraOrgService.crearPlaza(plazaData)
      if (!crearRes.success) {
        showToast(crearRes.error || 'Error al crear la plaza', 'danger')
        return
      }

      const actualizarRes = await estructuraOrgService.actualizarSolicitudPlaza(s.id, {
        estado: 'Aprobada',
      })
      if (!actualizarRes.success) {
        showToast(
          actualizarRes.error || 'Plaza creada pero error al actualizar solicitud',
          'warning',
        )
        return
      }

      showToast(`Plaza ${s.codigo} aprobada y creada`, 'success')
      refreshBandeja()
    },
    [confirm, showToast, refreshBandeja],
  )

  const handleRechazarPlaza = useCallback(
    async (tarea) => {
      const s = tarea.solicitudPlazaData
      const ok = await confirm(
        '¿Rechazar solicitud de plaza?',
        `¿Rechazar la plaza ${s.codigo} (${s.cargo})?`,
        { confirmLabel: 'Rechazar', variant: 'danger' },
      )
      if (!ok) return

      const result = await estructuraOrgService.actualizarSolicitudPlaza(s.id, {
        estado: 'Rechazada',
      })
      if (result.success) {
        showToast(`Solicitud de plaza ${s.codigo} rechazada`, 'success')
        refreshBandeja()
      } else {
        showToast(result.error || 'Error al rechazar', 'danger')
      }
    },
    [confirm, showToast, refreshBandeja],
  )

  const handleAprobarDenuncia = useCallback(
    async (tarea) => {
      const d = tarea.denunciaData
      const ok = await confirm(
        '¿Aprobar asignación?',
        `¿Aprobar el inicio de investigación para la denuncia ${d.id}?`,
        { confirmLabel: 'Aprobar', variant: 'success' },
      )
      if (!ok) return
      const res = await denunciasService.actualizarEstado(d.id, 'investigando')
      if (res.success) {
        showToast('Denuncia aprobada para investigación', 'success')
        refreshBandeja()
      } else {
        showToast(res.error || 'Error', 'danger')
      }
    },
    [confirm, showToast, refreshBandeja],
  )

  const handleRechazarDenuncia = useCallback(
    async (tarea) => {
      const d = tarea.denunciaData
      const ok = await confirm(
        '¿Rechazar asignación?',
        `¿Devolver la denuncia ${d.id} a estado pendiente?`,
        { confirmLabel: 'Rechazar', variant: 'danger' },
      )
      if (!ok) return
      const res = await denunciasService.actualizarEstado(d.id, 'pendiente')
      if (res.success) {
        showToast('Denuncia devuelta a pendiente', 'success')
        refreshBandeja()
      } else {
        showToast(res.error || 'Error', 'danger')
      }
    },
    [confirm, showToast, refreshBandeja],
  )

  const getBadgeModulo = (modulo) => {
    switch (modulo) {
      case 'Tramites':
        return (
          <CBadge color="primary" shape="rounded-pill">
            Trámites
          </CBadge>
        )
      case 'Denuncias':
        return (
          <CBadge color="danger" shape="rounded-pill">
            Denuncias
          </CBadge>
        )
      case 'SolicitudActivos':
        return (
          <CBadge color="info" shape="rounded-pill">
            Solicitud Activos
          </CBadge>
        )
      case 'RRHH':
        return (
          <CBadge color="warning" shape="rounded-pill">
            RRHH
          </CBadge>
        )
      case 'EstructuraOrg':
        return (
          <CBadge color="success" shape="rounded-pill">
            Estructura Org
          </CBadge>
        )
      default:
        return (
          <CBadge color="secondary" shape="rounded-pill">
            {modulo}
          </CBadge>
        )
    }
  }

  const getBadgeEstado = (estado, modulo) => {
    if (modulo === 'Tramites') {
      const colors = {
        REVISION: 'info',
        INSPECCION: 'warning',
        DOCUMENTO_GENERADO: 'primary',
        APROBADO: 'success',
        RECHAZADO: 'danger',
      }
      const labels = {
        REVISION: 'En Revisión',
        INSPECCION: 'En Inspección',
        DOCUMENTO_GENERADO: 'Doc. Generado',
        APROBADO: 'Aprobado',
        RECHAZADO: 'Rechazado',
      }
      return (
        <CBadge color={colors[estado] || 'secondary'} className="px-2 py-1">
          {labels[estado] || estado}
        </CBadge>
      )
    }
    if (modulo === 'Denuncias') {
      const colors = {
        pendiente: 'warning',
        investigando: 'info',
        asignada: 'primary',
        en_proceso: 'primary',
        resuelta: 'success',
      }
      return (
        <CBadge color={colors[estado] || 'secondary'} className="px-2 py-1">
          {estado}
        </CBadge>
      )
    }
    const colors = {
      Pendiente: 'warning',
      'En revisión': 'info',
      Aprobado: 'success',
      Aprobada: 'success',
      Rechazado: 'danger',
      Rechazada: 'danger',
    }
    return (
      <CBadge color={colors[estado] || 'secondary'} className="px-2 py-1">
        {estado}
      </CBadge>
    )
  }

  const getAccionesFila = (tarea) => {
    const acciones = []
    if (tarea.moduloOrigen === 'Tramites') {
      if (tarea.estado === 'REVISION')
        acciones.push({
          label: 'Asignar Inspector',
          icon: cilUser,
          action: () => handleAsignarInspector(tarea),
          color: 'success',
        })
      if (tarea.estado === 'INSPECCION')
        acciones.push({
          label: 'Generar PDF',
          icon: cilFile,
          action: () => handleGenerarPDF(tarea),
          color: 'primary',
        })
      if (tarea.estado === 'DOCUMENTO_GENERADO')
        acciones.push({
          label: 'Registrar Firma',
          icon: cilCheckCircle,
          action: () => handleRegistrarFirma(tarea),
          color: 'success',
        })
      acciones.push({
        label: 'Ver Detalle',
        icon: cilInfo,
        action: () => {
          setTramiteParaDetalle(tarea.tramiteData)
          setModalTramiteDetalle(true)
        },
        color: 'info',
      })
    } else if (tarea.moduloOrigen === 'SolicitudActivos') {
      if (tarea.estado === 'Pendiente') {
        acciones.push({
          label: 'Aprobar',
          icon: cilCheckCircle,
          action: () => handleAprobarSolicitud(tarea.solicitudData),
          color: 'success',
        })
        acciones.push({
          label: 'Rechazar',
          icon: cilXCircle,
          action: () => handleRechazarSolicitud(tarea.solicitudData),
          color: 'danger',
        })
      }
      acciones.push({
        label: 'Ver',
        icon: cilInfo,
        action: () => {
          setSolicitudParaDetalle(tarea.solicitudData)
          setModalSolicitudDetalle(true)
        },
        color: 'info',
      })
    } else if (tarea.moduloOrigen === 'Denuncias') {
      if (tarea.estado === 'asignada') {
        acciones.push({
          label: 'Aprobar',
          icon: cilCheckCircle,
          action: () => handleAprobarDenuncia(tarea),
          color: 'success',
        })
        acciones.push({
          label: 'Rechazar',
          icon: cilXCircle,
          action: () => handleRechazarDenuncia(tarea),
          color: 'danger',
        })
      }
      acciones.push({
        label: 'Ver Detalle',
        icon: cilInfo,
        action: () => {
          showToast('Esta acción requiere ir al módulo de Denuncias', 'info')
        },
        color: 'info',
      })
    } else if (tarea.moduloOrigen === 'RRHH') {
      if (tarea.estado === 'Pendiente') {
        acciones.push({
          label: 'Aprobar',
          icon: cilCheckCircle,
          action: () => handleAprobarRRHH(tarea),
          color: 'success',
        })
        acciones.push({
          label: 'Rechazar',
          icon: cilXCircle,
          action: () => handleRechazarRRHH(tarea),
          color: 'danger',
        })
        acciones.push({
          label: 'Enviar a Revisión',
          icon: cilInfo,
          action: () => handleRevisionRRHH(tarea),
          color: 'warning',
        })
      } else if (tarea.estado === 'En revisión') {
        acciones.push({
          label: 'Aprobar',
          icon: cilCheckCircle,
          action: () => handleAprobarRRHH(tarea),
          color: 'success',
        })
        acciones.push({
          label: 'Rechazar',
          icon: cilXCircle,
          action: () => handleRechazarRRHH(tarea),
          color: 'danger',
        })
      }
      acciones.push({
        label: 'Ver Detalle',
        icon: cilInfo,
        action: () => {
          setSolicitudRRHHParaDetalle(tarea.solicitudRRHHData)
          setModalRRHHDetalle(true)
        },
        color: 'info',
      })
    } else if (tarea.moduloOrigen === 'EstructuraOrg') {
      if (tarea.estado === 'Pendiente') {
        acciones.push({
          label: 'Aprobar',
          icon: cilCheckCircle,
          action: () => handleAprobarPlaza(tarea),
          color: 'success',
        })
        acciones.push({
          label: 'Rechazar',
          icon: cilXCircle,
          action: () => handleRechazarPlaza(tarea),
          color: 'danger',
        })
      }
      acciones.push({
        label: 'Ver',
        icon: cilInfo,
        action: () => {
          setSolicitudPlazaParaDetalle(tarea.solicitudPlazaData)
          setModalPlazaDetalle(true)
        },
        color: 'info',
      })
    }
    return acciones
  }

  if (loadingBandeja) {
    return (
      <CCardBody className="text-center py-5">
        <CIcon icon={cilInbox} size="4xl" className="text-muted mb-3" />
        <p className="text-muted">Cargando bandeja administrativa...</p>
      </CCardBody>
    )
  }

  return (
    <>
      <ConfirmModal />

      <ConfirmModal />

      <div className="premium-panel mb-4 px-4 py-4">
        <CRow className="align-items-center">
          <CCol xs={12} md={8}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-eco-soft rounded-circle text-eco">
                <CIcon icon={cilInbox} size="xl" />
              </div>
              <div>
                <h4 className="mb-1 fw-bold text-dark">Bandeja Administrativa</h4>
                <small className="text-muted d-block">
                  Centro de tareas pendientes — Trámites, Solicitudes y más
                </small>
              </div>
            </div>
          </CCol>
          <CCol xs={12} md={4} className="text-md-end mt-3 mt-md-0">
            <CButton color="success" onClick={refreshBandeja} className="text-white px-4">
              <CIcon icon={cilSync} className="me-2" />
              Actualizar Bandeja
            </CButton>
          </CCol>
        </CRow>
      </div>

      {/* Tabs */}
      <CCard className="eco-card mb-3">
        <CCardBody className="p-0">
          <CNav variant="pills" className="border-0 mb-0 flex-nowrap px-3 pt-3">
            <CNavItem>
              <CNavLink
                active={activeTab === 'bandeja'}
                onClick={() => setActiveTab('bandeja')}
                className={`fw-semibold px-3 py-2 ${activeTab === 'bandeja' ? 'active bg-success text-white' : 'text-muted'}`}
              >
                <CIcon icon={cilInbox} className="me-1" />
                Bandeja de Tareas
                <span className="badge bg-eco-soft text-success ms-2 px-2 py-1 rounded-pill">
                  {tareas.length}
                </span>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'solicitudes'}
                onClick={() => setActiveTab('solicitudes')}
                className={`fw-semibold px-3 py-2 ${activeTab === 'solicitudes' ? 'active bg-success text-white' : 'text-muted'}`}
              >
                <CIcon icon={cilClipboard} className="me-1" />
                Solicitudes de Activos
                <span className="badge bg-eco-soft text-success ms-2 px-2 py-1 rounded-pill">
                  {estadisticas.total || 0}
                </span>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'bitacora'}
                onClick={() => setActiveTab('bitacora')}
                className={`fw-semibold px-3 py-2 ${activeTab === 'bitacora' ? 'active bg-success text-white' : 'text-muted'}`}
              >
                <CIcon icon={cilHistory} className="me-2" />
                Bitácora <CBadge color="success" shape="rounded-pill" className="ms-2">{bitacoraGlobal.length}</CBadge>
              </CNavLink>
            </CNavItem>
          </CNav>
          <hr className="mt-2 mb-0" />
        </CCardBody>
      </CCard>

      {/* ── TAB: BANDEJA ── */}
      {activeTab === 'bandeja' && (
        <CCard className="eco-card mb-4">
          <CCardBody>
            {bandejaError && bandejaError.length > 0 && (
              <CAlert color="warning" dismissible>
                <CIcon icon={cilWarning} className="me-2" />
                Algunos módulos no pudieron cargarse:
                <ul className="mb-0 mt-1">
                  {bandejaError.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </CAlert>
            )}
            {/* Filtros */}
            <CRow className="mb-3 g-3">
              <CCol xs={12} md={4}>
                <CInputGroup>
                  <CInputGroupText className="bg-eco-soft border-end-0">
                    <CIcon icon={cilSearch} className="text-eco" />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Buscar por solicitante, tipo o ID..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border-start-0"
                  />
                </CInputGroup>
              </CCol>
              <CCol xs={6} md={3}>
                <CFormSelect value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)}>
                  <option value="">Todos los módulos</option>
                  <option value="Tramites">Trámites</option>
                  <option value="Denuncias">Denuncias</option>
                  <option value="SolicitudActivos">Solicitud de Activos</option>
                  <option value="RRHH">RRHH</option>
                  <option value="EstructuraOrg">Estructura Org</option>
                </CFormSelect>
              </CCol>
              <CCol xs={6} md={3}>
                <CFormSelect value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  {(filtroModulo === '' || filtroModulo === 'Tramites') && (
                    <>
                      <option value="REVISION">Trámites - En Revisión</option>
                      <option value="INSPECCION">Trámites - En Inspección</option>
                      <option value="DOCUMENTO_GENERADO">Trámites - Doc. Generado</option>
                    </>
                  )}
                  {(filtroModulo === '' || filtroModulo === 'Denuncias') && (
                    <>
                      <option value="asignada">Denuncias - Asignadas</option>
                    </>
                  )}
                  {(filtroModulo === '' || filtroModulo === 'SolicitudActivos') && (
                    <>
                      <option value="Pendiente">Solicitudes - Pendiente</option>
                      <option value="Aprobado">Solicitudes - Aprobado</option>
                      <option value="Rechazado">Solicitudes - Rechazado</option>
                    </>
                  )}
                  {(filtroModulo === '' || filtroModulo === 'RRHH') && (
                    <>
                      <option value="Pendiente">RRHH - Pendiente</option>
                      <option value="En revisión">RRHH - En Revisión</option>
                      <option value="Aprobada">RRHH - Aprobada</option>
                      <option value="Rechazada">RRHH - Rechazada</option>
                    </>
                  )}
                  {(filtroModulo === '' || filtroModulo === 'EstructuraOrg') && (
                    <>
                      <option value="Pendiente">Estructura Org - Pendiente</option>
                      <option value="Aprobada">Estructura Org - Aprobada</option>
                      <option value="Rechazada">Estructura Org - Rechazada</option>
                    </>
                  )}
                </CFormSelect>
              </CCol>
              <CCol xs={12} md={2}>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="w-100"
                  onClick={() => {
                    setBusqueda('')
                    setFiltroModulo('')
                    setFiltroEstado('')
                  }}
                >
                  <CIcon icon={cilSync} className="me-1" />
                  Limpiar
                </CButton>
              </CCol>
            </CRow>

            {/* Tabla ERP agnóstica */}
            {tareasFiltradas.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilInbox} size="4xl" className="text-muted mb-3 opacity-50" />
                <h6 className="text-muted">No hay tareas pendientes</h6>
                <p className="text-muted small">
                  Las tareas aparecerán aquí cuando requieran revisión humana.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover responsive align="middle" className="table-minec mb-0">
                  <CTableHead>
                    <CTableRow style={{ background: 'linear-gradient(135deg, #F0FBF0, #FAFAFA)' }}>
                      <CTableHeaderCell className="text-eco fw-semibold ps-4">Módulo</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Tipo</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Solicitante</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Estado</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Fecha</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold text-end pe-4">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {tareasFiltradas.map((tarea) => {
                      const acciones = getAccionesFila(tarea)
                      return (
                        <CTableRow key={tarea.id} className="hover-lift">
                          <CTableDataCell className="ps-4">{getBadgeModulo(tarea.moduloOrigen)}</CTableDataCell>
                          <CTableDataCell>
                            <small className="fw-semibold">{tarea.tipo}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <span className="fw-medium text-dark">{tarea.solicitante}</span>
                              <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                {tarea.cedulaRif}
                              </small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {getBadgeEstado(tarea.estado, tarea.moduloOrigen)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <small className="text-muted fw-medium">
                              {tarea.fecha
                                ? new Date(tarea.fecha).toLocaleDateString('es-VE')
                                : '—'}
                            </small>
                          </CTableDataCell>
                          <CTableDataCell className="text-end pe-4">
                            <div className="d-flex gap-2 justify-content-end flex-wrap">
                              {acciones.map((acc, idx) => (
                                <CButton
                                  key={idx}
                                  size="sm"
                                  color={`outline-${acc.color || 'primary'}`}
                                  className="btn-icon-minec border-0 shadow-sm"
                                  onClick={acc.action}
                                >
                                  <CIcon icon={acc.icon} size="sm" className="me-1" />
                                  {acc.label}
                                </CButton>
                              ))}
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
      )}

      {/* ── TAB: SOLICITUDES DE ACTIVOS ── */}
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
              <CCol xs={12} md={2}>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="w-100"
                  onClick={() => {
                    setBusqueda('')
                    setFiltroEstado('')
                  }}
                >
                  <CIcon icon={cilSync} className="me-1" />
                  Limpiar
                </CButton>
              </CCol>
              <CCol xs={12} md={3} className="text-md-end">
                <CButton color="outline-success" onClick={exportarCSV}>
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Exportar CSV
                </CButton>
              </CCol>
            </CRow>

            {solicitudesFiltradas.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilClipboard} size="4xl" className="text-muted mb-3 opacity-50" />
                <h6 className="text-muted">No se encontraron solicitudes</h6>
              </div>
            ) : (
              <CRow>
                {solicitudesFiltradas.map((sol) => (
                  <CCol md={6} lg={4} key={sol.id} className="mb-4">
                    <CCard className="h-100 eco-card">
                      <CCardHeader className="eco-card-header pt-3 pb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-bold">#{sol.id}</span>
                            <small className="text-muted d-block">{sol.activoNombre}</small>
                          </div>
                          <CBadge
                            color={
                              sol.estado === 'Aprobado'
                                ? 'success'
                                : sol.estado === 'Rechazado'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {sol.estado}
                          </CBadge>
                        </div>
                      </CCardHeader>
                      <CCardBody>
                        <small className="text-muted">
                          Cuadrilla: {sol.cuadrillaNombre || sol.cuadrillaId}
                        </small>
                        <div className="mt-2">
                          <small className="text-muted">
                            Cantidad: <strong>{sol.cantidad}</strong>
                          </small>
                        </div>
                        {sol.observaciones && (
                          <small className="text-muted d-block mt-2">{sol.observaciones}</small>
                        )}
                      </CCardBody>
                      <CCardFooter className="eco-surface">
                        {sol.estado === 'Pendiente' ? (
                          <div className="d-flex gap-2">
                            <CButton
                              size="sm"
                              color="success"
                              onClick={() => handleAprobarSolicitud(sol)}
                            >
                              <CIcon icon={cilCheckCircle} className="me-1" />
                              Aprobar
                            </CButton>
                            <CButton
                              size="sm"
                              color="danger"
                              variant="outline"
                              onClick={() => handleRechazarSolicitud(sol)}
                            >
                              <CIcon icon={cilXCircle} className="me-1" />
                              Rechazar
                            </CButton>
                          </div>
                        ) : (
                          <small className="text-muted">
                            {sol.fechaAprobacion && `Aprobado: ${sol.fechaAprobacion}`}
                          </small>
                        )}
                      </CCardFooter>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* ── TAB: BITÁCORA ── */}
      {activeTab === 'bitacora' && (
        <CCard className="eco-card">
          <CCardBody>
            {bitacoraGlobal.length === 0 ? (
              <div className="text-center py-5">
                <CIcon icon={cilHistory} size="4xl" className="text-muted mb-3 opacity-50" />
                <h6 className="text-muted">No hay registros en la bitácora</h6>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover responsive align="middle" className="table-minec mb-0">
                  <CTableHead>
                    <CTableRow style={{ background: 'linear-gradient(135deg, #F0FBF0, #FAFAFA)' }}>
                      <CTableHeaderCell className="text-eco fw-semibold ps-4">ID</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Fecha</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Tipo</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Estado Final</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {bitacoraGlobal.map((entry) => (
                      <CTableRow key={entry.id} className="hover-lift">
                        <CTableDataCell className="ps-4 fw-medium text-dark">{entry.id}</CTableDataCell>
                        <CTableDataCell>
                          <small className="text-muted fw-medium">{new Date(entry.fecha).toLocaleDateString()}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <small className="text-muted">{entry.tipo}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge
                            color={
                              entry.estado === 'Aprobado' || entry.estado === 'Aprobada'
                                ? 'success'
                                : entry.estado === 'Rechazado' || entry.estado === 'Rechazada'
                                  ? 'danger'
                                  : 'info'
                            }
                            className="badge-eco px-2 py-1"
                          >
                            {entry.estado}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* ── MODALS ── */}
      <ModalAsignarInspector
        visible={modalInspectorVisible}
        onClose={() => {
          setModalInspectorVisible(false)
          setTramiteParaInspector(null)
        }}
        onAsignar={handleConfirmarInspector}
        tramite={tramiteParaInspector}
        cuadrillas={cuadrillas}
      />

      <ModalRegistrarFirma
        visible={modalFirmaVisible}
        onClose={() => {
          setModalFirmaVisible(false)
          setTramiteParaFirma(null)
        }}
        onConfirmar={handleConfirmarFirma}
        tramite={tramiteParaFirma}
      />

      {/* Modal Detalle Trámite */}
      <CModal
        visible={modalTramiteDetalle}
        onClose={() => {
          setModalTramiteDetalle(false)
          setTramiteParaDetalle(null)
        }}
        size="lg"
      >
        <CModalHeader closeButton>
          <CModalTitle>
            <CIcon icon={cilTask} className="me-2" />
            Detalle del Trámite
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {tramiteParaDetalle && (
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">ID</small>
                  <div className="fw-bold">{tramiteParaDetalle.id}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Tipo</small>
                  <div className="fw-bold">
                    {tramiteParaDetalle.tipo} — {tramiteParaDetalle.subtipo}
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Solicitante</small>
                  <div className="fw-bold">{tramiteParaDetalle.solicitante}</div>
                  <small>{tramiteParaDetalle.cedulaRif}</small>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Estado</small>
                  <div className="fw-bold">{tramiteParaDetalle.estado}</div>
                </div>
              </CCol>
              <CCol md={12}>
                <div className="border rounded p-3">
                  <small className="text-muted">Descripción</small>
                  <div>{tramiteParaDetalle.descripcion}</div>
                </div>
              </CCol>
              {tramiteParaDetalle.historial && tramiteParaDetalle.historial.length > 0 && (
                <CCol md={12}>
                  <div className="border rounded p-3">
                    <small className="text-muted fw-bold">Historial</small>
                    {tramiteParaDetalle.historial.map((h, i) => (
                      <div key={i} className="mt-2 pb-2 border-bottom">
                        <CBadge
                          color={
                            h.estado === 'APROBADO'
                              ? 'success'
                              : h.estado === 'RECHAZADO'
                                ? 'danger'
                                : 'info'
                          }
                          className="me-2"
                        >
                          {h.estado}
                        </CBadge>
                        <small>{h.nota}</small>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(h.fecha).toLocaleString('es-VE')} — {h.usuario}
                        </div>
                      </div>
                    ))}
                  </div>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalTramiteDetalle(false)
              setTramiteParaDetalle(null)
            }}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Detalle Solicitud */}
      <CModal
        visible={modalSolicitudDetalle}
        onClose={() => {
          setModalSolicitudDetalle(false)
          setSolicitudParaDetalle(null)
        }}
        size="lg"
      >
        <CModalHeader closeButton>
          <CModalTitle>
            <CIcon icon={cilClipboard} className="me-2" />
            Detalle de Solicitud #{solicitudParaDetalle?.id}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {solicitudParaDetalle && (
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Activo</small>
                  <div className="fw-bold">{solicitudParaDetalle.activoNombre}</div>
                  <small>{solicitudParaDetalle.activoCodigo}</small>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Cuadrilla</small>
                  <div className="fw-bold">
                    {solicitudParaDetalle.cuadrillaNombre || solicitudParaDetalle.cuadrillaId}
                  </div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="border rounded p-3">
                  <small className="text-muted">Cantidad</small>
                  <div className="fw-bold">{solicitudParaDetalle.cantidad}</div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="border rounded p-3">
                  <small className="text-muted">Estado</small>
                  <div className="fw-bold">{solicitudParaDetalle.estado}</div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="border rounded p-3">
                  <small className="text-muted">Fecha</small>
                  <div className="fw-bold">{solicitudParaDetalle.fechaSolicitud}</div>
                </div>
              </CCol>
              {solicitudParaDetalle.observaciones && (
                <CCol md={12}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Observaciones</small>
                    <div>{solicitudParaDetalle.observaciones}</div>
                  </div>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalSolicitudDetalle(false)
              setSolicitudParaDetalle(null)
            }}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Detalle Solicitud RRHH */}
      <CModal
        visible={modalRRHHDetalle}
        onClose={() => {
          setModalRRHHDetalle(false)
          setSolicitudRRHHParaDetalle(null)
        }}
        size="lg"
      >
        <CModalHeader closeButton>
          <CModalTitle>
            <CIcon icon={cilUser} className="me-2" />
            Solicitud RRHH — {solicitudRRHHParaDetalle?.tipo}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {solicitudRRHHParaDetalle && (
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Empleado</small>
                  <div className="fw-bold">
                    {solicitudRRHHParaDetalle.empleado || solicitudRRHHParaDetalle.usuario}
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Departamento</small>
                  <div className="fw-bold">{solicitudRRHHParaDetalle.departamento || 'N/A'}</div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="border rounded p-3">
                  <small className="text-muted">Tipo</small>
                  <div className="fw-bold">{solicitudRRHHParaDetalle.tipo}</div>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="border rounded p-3">
                  <small className="text-muted">Estado</small>
                  <CBadge
                    color={
                      solicitudRRHHParaDetalle.estado === 'Pendiente'
                        ? 'warning'
                        : solicitudRRHHParaDetalle.estado === 'En revisión'
                          ? 'info'
                          : solicitudRRHHParaDetalle.estado === 'Aprobada'
                            ? 'success'
                            : 'danger'
                    }
                    className="mt-1"
                  >
                    {solicitudRRHHParaDetalle.estado}
                  </CBadge>
                </div>
              </CCol>
              <CCol md={4}>
                <div className="border rounded p-3">
                  <small className="text-muted">Prioridad</small>
                  <CBadge
                    color={
                      solicitudRRHHParaDetalle.prioridad === 'Alta'
                        ? 'danger'
                        : solicitudRRHHParaDetalle.prioridad === 'Media'
                          ? 'warning'
                          : 'secondary'
                    }
                    className="mt-1"
                  >
                    {solicitudRRHHParaDetalle.prioridad || 'Normal'}
                  </CBadge>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Fecha Solicitud</small>
                  <div className="fw-bold">
                    {solicitudRRHHParaDetalle.fechaSolicitud || solicitudRRHHParaDetalle.fecha}
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Fecha Respuesta</small>
                  <div className="fw-bold">{solicitudRRHHParaDetalle.fechaRespuesta || '—'}</div>
                </div>
              </CCol>
              {solicitudRRHHParaDetalle.diasSolicitados > 0 && (
                <CCol md={4}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Días Solicitados</small>
                    <div className="fw-bold">{solicitudRRHHParaDetalle.diasSolicitados}</div>
                  </div>
                </CCol>
              )}
              {solicitudRRHHParaDetalle.fechaInicio && (
                <CCol md={4}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Fecha Inicio</small>
                    <div className="fw-bold">{solicitudRRHHParaDetalle.fechaInicio}</div>
                  </div>
                </CCol>
              )}
              {solicitudRRHHParaDetalle.fechaFin && (
                <CCol md={4}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Fecha Fin</small>
                    <div className="fw-bold">{solicitudRRHHParaDetalle.fechaFin}</div>
                  </div>
                </CCol>
              )}
              {(solicitudRRHHParaDetalle.motivo || solicitudRRHHParaDetalle.descripcion) && (
                <CCol md={12}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Motivo / Descripción</small>
                    <div>
                      {solicitudRRHHParaDetalle.motivo || solicitudRRHHParaDetalle.descripcion}
                    </div>
                  </div>
                </CCol>
              )}
              {solicitudRRHHParaDetalle.detalles && (
                <CCol md={12}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Detalles</small>
                    <div>{solicitudRRHHParaDetalle.detalles}</div>
                  </div>
                </CCol>
              )}
              {solicitudRRHHParaDetalle.comentarios && (
                <CCol md={12}>
                  <div className="border rounded p-3">
                    <small className="text-muted">Comentarios</small>
                    <div>{solicitudRRHHParaDetalle.comentarios}</div>
                  </div>
                </CCol>
              )}
              {solicitudRRHHParaDetalle.documentos &&
                solicitudRRHHParaDetalle.documentos.length > 0 && (
                  <CCol md={12}>
                    <div className="border rounded p-3">
                      <small className="text-muted fw-bold">Documentos Adjuntos</small>
                      <div className="mt-2">
                        {solicitudRRHHParaDetalle.documentos.map((doc, i) => (
                          <CBadge key={i} color="light" className="text-dark me-2 mb-1">
                            <CIcon icon={cilFile} className="me-1" />
                            {doc}
                          </CBadge>
                        ))}
                      </div>
                    </div>
                  </CCol>
                )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalRRHHDetalle(false)
              setSolicitudRRHHParaDetalle(null)
            }}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Detalle Solicitud de Plaza */}
      <CModal
        visible={modalPlazaDetalle}
        onClose={() => {
          setModalPlazaDetalle(false)
          setSolicitudPlazaParaDetalle(null)
        }}
        size="lg"
      >
        <CModalHeader closeButton>
          <CModalTitle>
            <CIcon icon={cilBriefcase} className="me-2" />
            Solicitud de Plaza — {solicitudPlazaParaDetalle?.codigo}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {solicitudPlazaParaDetalle && (
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Código</small>
                  <div className="fw-bold">{solicitudPlazaParaDetalle.codigo}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Cargo</small>
                  <div className="fw-bold">{solicitudPlazaParaDetalle.cargo}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Departamento</small>
                  <div className="fw-bold">{solicitudPlazaParaDetalle.departamento}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Nivel Jerárquico</small>
                  <div className="fw-bold">{solicitudPlazaParaDetalle.nivel || 'N/A'}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Estado</small>
                  <div>
                    <CBadge
                      color={
                        solicitudPlazaParaDetalle.estado === 'Pendiente'
                          ? 'warning'
                          : solicitudPlazaParaDetalle.estado === 'Aprobada'
                            ? 'success'
                            : 'danger'
                      }
                      className="mt-1"
                    >
                      {solicitudPlazaParaDetalle.estado}
                    </CBadge>
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3">
                  <small className="text-muted">Fecha Solicitud</small>
                  <div className="fw-bold">
                    {new Date(solicitudPlazaParaDetalle.fechaSolicitud).toLocaleString()}
                  </div>
                </div>
              </CCol>
              {(solicitudPlazaParaDetalle.nivelEducativo ||
                solicitudPlazaParaDetalle.experienciaMinima != null ||
                solicitudPlazaParaDetalle.tipoJornada) && (
                <CCol md={12}>
                  <div className="border rounded p-3">
                    <small className="text-muted fw-semibold d-block mb-2">
                      Requisitos de la Plaza
                    </small>
                    <CRow className="g-2">
                      {solicitudPlazaParaDetalle.nivelEducativo && (
                        <CCol xs={6} md={4}>
                          <small className="text-muted">Nivel Educativo</small>
                          <div className="fw-medium">
                            {obtenerLabelNivelEducativo(solicitudPlazaParaDetalle.nivelEducativo)}
                          </div>
                        </CCol>
                      )}
                      {solicitudPlazaParaDetalle.experienciaMinima != null &&
                        solicitudPlazaParaDetalle.experienciaMinima !== '' && (
                          <CCol xs={6} md={4}>
                            <small className="text-muted">Experiencia</small>
                            <div className="fw-medium">
                              {obtenerLabelExperiencia(solicitudPlazaParaDetalle.experienciaMinima)}
                            </div>
                          </CCol>
                        )}
                      {solicitudPlazaParaDetalle.tipoJornada && (
                        <CCol xs={6} md={4}>
                          <small className="text-muted">Jornada</small>
                          <div className="fw-medium">
                            {obtenerLabelJornada(solicitudPlazaParaDetalle.tipoJornada)}
                          </div>
                        </CCol>
                      )}
                      {solicitudPlazaParaDetalle.certificaciones && (
                        <CCol xs={12} className="mt-2">
                          <small className="text-muted">Certificaciones / Habilidades</small>
                          <div className="fw-medium">
                            {solicitudPlazaParaDetalle.certificaciones}
                          </div>
                        </CCol>
                      )}
                    </CRow>
                  </div>
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalPlazaDetalle(false)
              setSolicitudPlazaParaDetalle(null)
            }}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default BandejaAdministrativa
