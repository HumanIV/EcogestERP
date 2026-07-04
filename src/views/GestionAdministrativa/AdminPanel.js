import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CInputGroupText,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilChart,
  cilSearch,
  cilCalendar,
  cilCheckCircle,
  cilWarning,
  cilSync,
  cilBuilding,
  cilFile,
  cilPeople,
  cilUser,
  cilTask,
  cilInbox,
  cilShieldAlt,
  cilApplications,
  cilSpeedometer,
  cilMagnifyingGlass,
} from '@coreui/icons'

import useToast from '../usuarios/_shared/useToast'
import { denunciasService } from './GestionDenuncias/services/denunciasService'
import { tramitesService } from './Tramites/services/tramitesService'
import { cuadrillaService } from './cuadrillas/services/cuadrillaService'
import { inventarioService } from './Inventario/services/inventarioService'
import empleadoService from '../RRHH/Empleados/services/empleadoService'
import { solicitudService } from '../RRHH/Solicitudes/services/solicitudService'

const AdminPanel = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [vista, setVista] = useState('cards')

  const [filtros, setFiltros] = useState({
    busqueda: '',
    modulo: '',
    estado: '',
  })

  const [estadisticasGlobales, setEstadisticasGlobales] = useState({
    denuncias: { total: 0, pendientes: 0, resueltas: 0 },
    tramites: { total: 0, pendientes: 0, aprobados: 0, permisos: 0, licencias: 0 },
    cuadrillas: { total: 0, activas: 0, inactivas: 0 },
    inventario: { total: 0, bajoStock: 0 },
    rrhh: { total: 0, empleadosActivos: 0, solicitudesPendientes: 0 },
  })

  useEffect(() => {
    const calcularEstadisticas = async () => {
      try {
        const denunciasRes = await denunciasService.obtenerDenuncias()
        const denunciasData = denunciasRes.success ? denunciasRes.data : []

        const tramitesRes = await tramitesService.obtenerTramites()
        const tramitesData = tramitesRes.success ? tramitesRes.data : []

        const cuadrillasRes = await cuadrillaService.obtenerCuadrillas()
        const cuadrillasData = cuadrillasRes.success ? cuadrillasRes.data : []

        const inventarioRes = await inventarioService.obtenerActivos()
        const activos = inventarioRes.success ? inventarioRes.data : []

        const empleadosRes = await empleadoService.obtenerTodos()
        const empleadosLista = empleadosRes.success ? empleadosRes.data : []

        const solicitudesRRHHRes = await solicitudService.obtenerSolicitudes()
        const solicitudesRRHHLista = solicitudesRRHHRes.success ? solicitudesRRHHRes.data : []

        setEstadisticasGlobales({
          denuncias: {
            total: denunciasData.length,
            pendientes: denunciasData.filter(
              (d) => d.estado === 'pendiente' || d.estado === 'Pendiente',
            ).length,
            resueltas: denunciasData.filter(
              (d) => d.estado === 'resuelta' || d.estado === 'resuelto' || d.estado === 'Resuelta',
            ).length,
          },
          tramites: {
            total: tramitesData.length,
            pendientes: tramitesData.filter((t) => ['REVISION', 'INSPECCION', 'ESPERA_PAGO'].includes(t.estado)).length,
            aprobados: tramitesData.filter((t) => t.estado === 'APROBADO' || t.estado === 'DOCUMENTO_GENERADO').length,
            permisos: tramitesData.filter((t) => t.tipo === 'PERMISO').length,
            licencias: tramitesData.filter((t) => t.tipo === 'LICENCIA').length,
          },
          cuadrillas: {
            total: cuadrillasData.length,
            activas: cuadrillasData.filter((c) => c.estado === 'Activa' || c.estado === 'activa')
              .length,
            inactivas: cuadrillasData.filter(
              (c) => c.estado === 'Inactiva' || c.estado === 'inactiva',
            ).length,
          },
          inventario: {
            total: activos.reduce((sum, a) => sum + (a.cantidad || 0), 0),
            bajoStock: activos.filter((a) => (a.cantidad || 0) < 5).length,
          },
          rrhh: {
            total: empleadosLista.length + solicitudesRRHHLista.length,
            empleadosActivos: empleadosLista.filter((e) => e.estado === 'Activo').length,
            solicitudesPendientes: solicitudesRRHHLista.filter(
              (s) => s.estado === 'Pendiente' || s.estado === 'En revisión',
            ).length,
          },
        })
      } catch {
        // Mantener valores por defecto si no hay datos
      }
    }

    calcularEstadisticas()
    const interval = setInterval(calcularEstadisticas, 10000)
    return () => clearInterval(interval)
  }, [])

  const datosRecientes = useMemo(
    () => [
      {
        id: 1,
        tipo: 'denuncia',
        modulo: 'Denuncias',
        titulo: 'Vertimiento en quebrada Los Salados',
        estado: 'investigando',
        fecha: '2026-05-09',
        responsable: 'Luis Hernández',
        prioridad: 'alta',
      },
      {
        id: 2,
        tipo: 'permiso',
        modulo: 'Trámites',
        titulo: 'AprovechamientoForestal - Empresa Maderera C.A.',
        estado: 'pendiente',
        fecha: '2026-05-08',
        responsable: 'María González',
        prioridad: 'media',
      },
      {
        id: 3,
        tipo: 'licencia',
        modulo: 'Trámites',
        titulo: 'Operación continua - Minera Andina C.A.',
        estado: 'revision',
        fecha: '2026-05-08',
        responsable: 'Carlos Pérez',
        prioridad: 'alta',
      },
      {
        id: 4,
        tipo: 'denuncia',
        modulo: 'Denuncias',
        titulo: 'Deforestación en sector Montana Alta',
        estado: 'asignada',
        fecha: '2026-05-07',
        responsable: 'Ana Rodríguez',
        prioridad: 'alta',
      },
      {
        id: 5,
        tipo: 'cuadrilla',
        modulo: 'Cuadrillas',
        titulo: 'Cuadrilla Norte-01 asignada a denuncia #127',
        estado: 'activa',
        fecha: '2026-05-07',
        responsable: 'Pedro Martínez',
        prioridad: 'normal',
      },
      {
        id: 6,
        tipo: 'inventario',
        modulo: 'Inventario',
        titulo: 'Equipos GPS recebos - Almacén Central',
        estado: 'bajo_stock',
        fecha: '2026-05-06',
        responsable: 'Sofía Ramírez',
        prioridad: 'baja',
      },
      {
        id: 7,
        tipo: 'permiso',
        modulo: 'Trámites',
        titulo: 'Vertimiento controlado - Industrias Químicas',
        estado: 'aprobado',
        fecha: '2026-05-06',
        responsable: 'Roberto Díaz',
        prioridad: 'media',
      },
      {
        id: 8,
        tipo: 'licencia',
        modulo: 'Trámites',
        titulo: 'Construcción nueva - Constructora Urbana S.A.',
        estado: 'pendiente',
        fecha: '2026-05-05',
        responsable: 'Laura Jiménez',
        prioridad: 'alta',
      },
      {
        id: 9,
        tipo: 'denuncia',
        modulo: 'Denuncias',
        titulo: 'Quema no autorizada en zona periurbana',
        estado: 'pendiente',
        fecha: '2026-05-05',
        responsable: 'Miguel Torres',
        prioridad: 'media',
      },
      {
        id: 10,
        tipo: 'cuadrilla',
        modulo: 'Cuadrillas',
        titulo: 'Cuadrilla Sur-02 en mantenimiento',
        estado: 'inactiva',
        fecha: '2026-05-04',
        responsable: 'Pablo Ortega',
        prioridad: 'normal',
      },
    ],
    [],
  )

  const modulCards = useMemo(
    () => [
      {
        id: 'denuncias',
        titulo: 'Gestión de Denuncias',
        descripcion:
          'Panel administrativo para gestionar denuncias ambientales, seguimiento e investigación',
        icono: cilShieldAlt,
        color: 'danger',
        colorSoft: 'bg-danger-subtle',
        colorText: 'text-danger',
        ruta: '/gestionDenuncias',
        estadisticas: estadisticasGlobales.denuncias,
        badges: [
          { label: 'Pendientes', valor: 'pendientes', color: 'warning' },
          { label: 'Resueltas', valor: 'resueltas', color: 'success' },
        ],
        features: ['Mapa de calor', 'Dashboard', 'Panel de gestión', 'Lista completa'],
      },
      {
        id: 'tramites',
        titulo: 'Gestión de Trámites',
        descripcion: 'Revisar, aprobar y gestionar permisos y licencias (ambientales, forestales, hídricos)',
        icono: cilFile,
        color: 'success',
        colorSoft: 'bg-success-subtle',
        colorText: 'text-success',
        ruta: '/gestionTramites',
        estadisticas: estadisticasGlobales.tramites,
        badges: [
          { label: 'Permisos', valor: 'permisos', color: 'info' },
          { label: 'Licencias', valor: 'licencias', color: 'primary' },
          { label: 'Pendientes', valor: 'pendientes', color: 'warning' },
        ],
        features: ['Dashboard', 'Panel de gestión', 'Aprobaciones', 'Expedientes'],
      },
      {
        id: 'cuadrillas',
        titulo: 'Gestión de Cuadrillas',
        descripcion: 'Administración de equipos de trabajo de campo, asignaciones y ubicaciones',
        icono: cilPeople,
        color: 'primary',
        colorSoft: 'bg-primary-subtle',
        colorText: 'text-primary',
        ruta: '/cuadrillas',
        estadisticas: estadisticasGlobales.cuadrillas,
        badges: [
          { label: 'Activas', valor: 'activas', color: 'success' },
          { label: 'Inactivas', valor: 'inactivas', color: 'secondary' },
        ],
        features: ['Lista de cuadrillas', 'Gestión integral', 'Mapa de ubicaciones'],
      },
      {
        id: 'inventario',
        titulo: 'Inventario',
        descripcion: 'Control de equipos, materiales, insumos y suministros del Ministerio',
        icono: cilSpeedometer,
        color: 'warning',
        colorSoft: 'bg-warning-subtle',
        colorText: 'text-warning',
        ruta: '/Inventario',
        estadisticas: estadisticasGlobales.inventario,
        badges: [{ label: 'Bajo Stock', valor: 'bajoStock', color: 'danger' }],
        features: ['Control de stock', 'Reportes', 'Gestión de materiales'],
      },
      {
        id: 'rrhh',
        titulo: 'Recursos Humanos',
        descripcion: 'Gestión integral del talento humano, empleados, solicitudes y vacaciones',
        icono: cilUser,
        color: 'info',
        colorSoft: 'bg-info-subtle',
        colorText: 'text-info',
        ruta: '/PanelRRHH',
        estadisticas: estadisticasGlobales.rrhh,
        badges: [
          { label: 'Empleados Activos', valor: 'empleadosActivos', color: 'success' },
          { label: 'Solicitudes Pendientes', valor: 'solicitudesPendientes', color: 'warning' },
        ],
        features: ['Panel RRHH', 'Empleados', 'Expedientes', 'Solicitudes', 'Vacaciones'],
      },
    ],
    [],
  )

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      showToast('Datos actualizados correctamente', 'success')
    } catch (err) {
      showToast('Error al actualizar datos', 'danger')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const handleFiltroChange = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
    if (campo === 'modulo' && valor) {
      setVista('busqueda')
    } else if (campo === 'busqueda' && valor) {
      setVista('busqueda')
    }
  }, [])

  const modulosFiltrados = useMemo(() => {
    return modulCards.filter((modulo) => {
      if (filtros.busqueda) {
        const texto = `${modulo.titulo} ${modulo.descripcion}`.toLowerCase()
        if (!texto.includes(filtros.busqueda.toLowerCase())) return false
      }
      if (filtros.modulo && modulo.id !== filtros.modulo) return false
      return true
    })
  }, [modulCards, filtros])

  const datosFiltrados = useMemo(() => {
    if (!filtros.modulo && !filtros.busqueda) return []

    return datosRecientes.filter((item) => {
      if (filtros.modulo) {
        const moduloMap = {
          denuncias: 'Denuncias',
          tramites: 'Trámites',
          cuadrillas: 'Cuadrillas',
          inventario: 'Inventario',
          rrhh: 'Recursos Humanos',
        }
        if (item.modulo !== moduloMap[filtros.modulo]) return false
      }
      if (filtros.busqueda) {
        const texto = `${item.titulo} ${item.responsable} ${item.modulo}`.toLowerCase()
        if (!texto.includes(filtros.busqueda.toLowerCase())) return false
      }
      return true
    })
  }, [datosRecientes, filtros])

  const handleAccederModulo = useCallback(
    (modulo) => {
      showToast(`Abriendo ${modulo.titulo}...`, 'info', 2000)
      navigate(modulo.ruta)
    },
    [navigate, showToast],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const totalTramites = Object.values(estadisticasGlobales).reduce(
    (acc, mod) => acc + (mod.total || 0),
    0,
  )
  const totalPendientes = Object.values(estadisticasGlobales).reduce(
    (acc, mod) => acc + (mod.pendientes || 0),
    0,
  )

  const getEstadoBadge = (estado) => {
    const estados = {
      investigando: { color: 'warning', texto: 'Investigando' },
      pendiente: { color: 'secondary', texto: 'Pendiente' },
      revision: { color: 'info', texto: 'En revisión' },
      asignada: { color: 'primary', texto: 'Asignada' },
      activa: { color: 'success', texto: 'Activa' },
      bajo_stock: { color: 'danger', texto: 'Bajo stock' },
      aprobado: { color: 'success', texto: 'Aprobado' },
      inactiva: { color: 'secondary', texto: 'Inactiva' },
    }
    return estados[estado] || { color: 'secondary', texto: estado }
  }

  const getPrioridadBadge = (prioridad) => {
    const prioridades = {
      alta: { color: 'danger', texto: 'Alta' },
      media: { color: 'warning', texto: 'Media' },
      baja: { color: 'info', texto: 'Baja' },
      normal: { color: 'secondary', texto: 'Normal' },
    }
    return prioridades[prioridad] || { color: 'secondary', texto: prioridad }
  }

  const modulSeleccionado = modulosFiltrados.length === 1 ? modulosFiltrados[0] : null

  return (
    <CContainer fluid className="px-3 px-md-4 py-4 animate-fade-eco">
      <CCard className="eco-card mb-4">
        <CCardHeader className="eco-card-header">
          <CRow className="align-items-center">
            <CCol md={6}>
              <h1 className="h2 fw-bold mb-2">
                <CIcon icon={cilBuilding} className="me-3 text-eco" />
                Panel de Gestión Administrativa
              </h1>
              <p className="mb-0 text-muted">
                Control centralizado de todos los módulos administrativos
              </p>
            </CCol>
            <CCol md={6} className="text-md-end">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <CButton
                  color="success"
                  className="text-white fw-semibold"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <CIcon icon={cilSync} className={loading ? 'spin me-2' : 'me-2'} />
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CCardHeader>
      </CCard>

      <CRow className="mb-4 g-3">
        <CCol xs={12} md={4}>
          <CCard className="eco-card h-100">
            <CCardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-success-subtle rounded-circle p-3 me-3">
                  <CIcon icon={cilTask} className="text-success" size="xl" />
                </div>
                <div>
                  <h2 className="fw-bold display-6 mb-0">{totalTramites}</h2>
                  <small className="text-muted">Total Registros</small>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={4}>
          <CCard className="eco-card h-100">
            <CCardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-warning-subtle rounded-circle p-3 me-3">
                  <CIcon icon={cilWarning} className="text-warning" size="xl" />
                </div>
                <div>
                  <h2 className="fw-bold display-6 mb-0">{totalPendientes}</h2>
                  <small className="text-muted">Pendientes de Atención</small>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12} md={4}>
          <CCard className="eco-card h-100">
            <CCardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-success-subtle rounded-circle p-3 me-3">
                  <CIcon icon={cilCheckCircle} className="text-success" size="xl" />
                </div>
                <div>
                  <h2 className="fw-bold display-6 mb-0">{totalTramites - totalPendientes}</h2>
                  <small className="text-muted">Procesados</small>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard className="eco-card mb-4">
        <CCardBody className="p-3">
          <CRow className="g-3 align-items-center">
            <CCol xs={12} md={4}>
              <CInputGroup>
                <CInputGroupText className="bg-eco-soft border-end-0">
                  <CIcon icon={cilSearch} className="text-eco" />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar módulo o palabra clave..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  className="border-start-0"
                />
              </CInputGroup>
            </CCol>
            <CCol xs={6} md={2}>
              <CFormSelect
                value={filtros.modulo}
                onChange={(e) => handleFiltroChange('modulo', e.target.value)}
                className="input-minec"
              >
                <option value="">Todos los módulos</option>
                <option value="denuncias">Denuncias</option>
                <option value="tramites">Trámites (Permisos/Licencias)</option>
                <option value="cuadrillas">Cuadrillas</option>
                <option value="inventario">Inventario</option>
                <option value="rrhh">Recursos Humanos</option>
              </CFormSelect>
            </CCol>
            <CCol xs={12} md={3}>
              <CButton
                color="success"
                variant="outline"
                size="sm"
                className="text-success border-success w-100"
                onClick={() => {
                  setFiltros({ busqueda: '', modulo: '', estado: '' })
                  setVista('cards')
                }}
                disabled={!filtros.busqueda && !filtros.modulo}
              >
                <CIcon icon={cilSync} className="me-1" />
                Limpiar filtros
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {filtros.modulo || filtros.busqueda ? (
        <div className="mb-4">
          {modulSeleccionado && (
            <CCard className="eco-card mb-4">
              <CCardBody className="p-4">
                <CRow className="align-items-center">
                  <CCol xs={12} md={8}>
                    <div className="d-flex align-items-center">
                      <div className={`${modulSeleccionado.colorSoft} rounded-circle p-3 me-3`}>
                        <CIcon
                          icon={modulSeleccionado.icono}
                          className={`${modulSeleccionado.colorText}`}
                          size="2xl"
                        />
                      </div>
                      <div>
                        <h3 className="fw-bold mb-1">{modulSeleccionado.titulo}</h3>
                        <p className="text-muted mb-0">{modulSeleccionado.descripcion}</p>
                        <div className="d-flex gap-2 mt-2">
                          {modulSeleccionado.badges.map((badge, idx) => (
                            <span
                              key={idx}
                              className={`badge bg-${badge.color}-subtle ${badge.color !== 'warning' ? `text-${badge.color}` : ''}`}
                            >
                              {badge.label}: {modulSeleccionado.estadisticas[badge.valor]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CCol>
                  <CCol xs={12} md={4} className="text-md-end mt-3 mt-md-0">
                    <CButton
                      color={modulSeleccionado.color}
                      className="fw-semibold px-4"
                      onClick={() => handleAccederModulo(modulSeleccionado)}
                    >
                      <CIcon icon={cilArrowRight} className="me-2" />
                      Ir al Módulo
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          )}

          <CCard className="eco-card">
            <CCardHeader className="eco-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">
                  <CIcon icon={cilChart} className="me-2 text-eco" />
                  Vista Previa - Últimos Registros
                </h5>
                <span className="badge bg-success-subtle text-success">
                  {datosFiltrados.length} resultados
                </span>
              </div>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <CTable hover align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow className="table-header-eco">
                      <CTableHeaderCell className="ps-4">Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Módulo</CTableHeaderCell>
                      <CTableHeaderCell>Título</CTableHeaderCell>
                      <CTableHeaderCell>Estado</CTableHeaderCell>
                      <CTableHeaderCell>Prioridad</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Responsable</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {datosFiltrados.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center py-5">
                          <CIcon icon={cilMagnifyingGlass} size="3xl" className="text-muted mb-3" />
                          <h5 className="text-muted">No se encontraron registros</h5>
                          <p className="text-muted">Intenta con otros términos de búsqueda</p>
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      datosFiltrados.map((item, index) => {
                        const estadoInfo = getEstadoBadge(item.estado)
                        const prioridadInfo = getPrioridadBadge(item.prioridad)
                        return (
                          <CTableRow
                            key={item.id}
                            className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                          >
                            <CTableDataCell className="ps-4">
                              <span
                                className={`badge bg-success-subtle text-success text-capitalize`}
                              >
                                {item.tipo}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span className="fw-semibold">{item.modulo}</span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div
                                style={{
                                  maxWidth: '250px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.titulo}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span
                                className={`badge bg-${estadoInfo.color}-subtle ${estadoInfo.color !== 'warning' ? `text-${estadoInfo.color}` : ''}`}
                              >
                                {estadoInfo.texto}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <span
                                className={`badge bg-${prioridadInfo.color}-subtle ${prioridadInfo.color !== 'warning' ? `text-${prioridadInfo.color}` : ''}`}
                              >
                                {prioridadInfo.texto}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <small className="text-muted">{item.fecha}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <small>{item.responsable}</small>
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>
        </div>
      ) : (
        <CRow className="g-4">
          {modulCards.map((modulo) => (
            <CCol key={modulo.id} xs={12} md={6} lg={4}>
              <CCard className="eco-card h-100 hover-lift">
                <CCardBody className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className={`${modulo.colorSoft} rounded-circle p-3`}>
                      <CIcon icon={modulo.icono} className={`${modulo.colorText}`} size="xl" />
                    </div>
                    <CBadge color={modulo.color} className="px-3 py-2">
                      {modulo.estadisticas.total} registros
                    </CBadge>
                  </div>

                  <h5 className="fw-bold mb-2">{modulo.titulo}</h5>
                  <p className="text-muted small mb-3">{modulo.descripcion}</p>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {modulo.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className={`badge bg-${badge.color}-subtle ${badge.color !== 'warning' ? `text-${badge.color}` : ''} border border-${badge.color}`}
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                      >
                        {badge.label}: {modulo.estadisticas[badge.valor]}
                      </span>
                    ))}
                  </div>

                  <div className="mb-3">
                    <small className="text-muted fw-semibold d-block mb-2">Características:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {modulo.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="badge bg-success-subtle text-success"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="d-grid">
                    <CButton
                      color={modulo.color}
                      className="fw-semibold py-2"
                      onClick={() => handleAccederModulo(modulo)}
                    >
                      <CIcon icon={cilArrowRight} className="me-2" />
                      Acceder al Módulo
                      <CIcon icon={cilArrowRight} className="ms-2" />
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      )}
    </CContainer>
  )
}

export default AdminPanel
