import React, { useState, useMemo, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CAlert,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilPlus, cilCloudDownload, cilList, cilChart, cilClock } from '@coreui/icons'

import useCuadrillas from './hooks/useCuadrillas'
import useEmpleados from './hooks/useEmpleados'
import useActividadCuadrillas from './hooks/useActividadCuadrillas'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'

import CuadrillasStats from './components/CuadrillasStats'
import CuadrillasTabla from './components/CuadrillasTabla'
import CuadrillasGraficos from './components/CuadrillasGraficos'
import CuadrillasModalForm from './components/CuadrillasModalForm'
import CuadrillasModalSolicitarActivo from './components/CuadrillasModalSolicitarActivo'
import CuadrillasModalTareas from './components/CuadrillasModalTareas'
import CuadrillasModalHistorial from './components/CuadrillasModalHistorial'
import CuadrillasModalEquipos from './components/CuadrillasModalEquipos'
import ActividadGeneral from './components/ActividadGeneral'
import { FORM_INICIAL, ROLES_EQUIPO } from './constants/cuadrillasConstants'
import { solicitudActivosService } from '../SolicitudActivos/services/solicitudActivosService'

const Cuadrillas = () => {
  const { showToast } = useToast()
  const { ConfirmModal, confirm } = useConfirmModal()
  const { getSupervisores, getObreros } = useEmpleados()
  const { agregarEvento, actividad, cargarActividad } = useActividadCuadrillas()

  const {
    cuadrillas,
    estadisticas,
    activosInventario,
    loading,
    error,
    cargarCuadrillas,
    crearCuadrilla,
    actualizarCuadrilla,
    eliminarCuadrilla,
    solicitarActivo,
    calcularStats,
    exportarDatos,
  } = useCuadrillas({ agregarEvento })

  // ---------- Estado local UI ----------
  const [activeTab, setActiveTab] = useState('lista')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroRol, setFiltroRol] = useState('')

  // Modal form (crear / editar)
  const [modalFormVisible, setModalFormVisible] = useState(false)
  const [formData, setFormData] = useState({ ...FORM_INICIAL })
  const [formError, setFormError] = useState(null)
  const isEdit = !!formData.id

  // Modal solicitar activo
  const [modalSolicitudVisible, setModalSolicitudVisible] = useState(false)
  const [cuadrillaParaSolicitud, setCuadrillaParaSolicitud] = useState(null)

  // Modal ver tareas
  const [modalTareasVisible, setModalTareasVisible] = useState(false)
  const [cuadrillaParaTareas, setCuadrillaParaTareas] = useState(null)

  // Modal historial
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false)
  const [cuadrillaParaHistorial, setCuadrillaParaHistorial] = useState(null)

  // Modal equipos
  const [modalEquiposVisible, setModalEquiposVisible] = useState(false)
  const [cuadrillaParaEquipos, setCuadrillaParaEquipos] = useState(null)

  // ---------- Filtro de cuadrillas ----------
  const cuadrillasFiltradas = useMemo(() => {
    let result = cuadrillas

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(q) ||
          c.zona?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q),
      )
    }

    if (filtroEstado) {
      result = result.filter((c) => c.estado === filtroEstado)
    }

    if (filtroRol) {
      result = result.filter((c) => c.rol === filtroRol)
    }

    return result
  }, [cuadrillas, busqueda, filtroEstado, filtroRol])

  // Leer equipos aprobados desde el backend
  const [equiposSolicitados, setEquiposSolicitados] = useState([])
  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        const res = await solicitudActivosService.obtenerSolicitudes()
        if (res.success) {
          setEquiposSolicitados(res.data.filter((s) => s.estado === 'Aprobado'))
        }
      } catch {
        setEquiposSolicitados([])
      }
    }
    cargarEquipos()
  }, [cuadrillas])

  const stats = useMemo(() => {
    const s = calcularStats()
    const inspectores = cuadrillas.filter((c) => c.rol === 'TECNICO_INSPECTOR').length
    return {
      ...s,
      inspectores,
      tareasCompletadas: cuadrillas.reduce((sum, c) => sum + (c.tareasCompletadas || 0), 0),
      totalEquipos: equiposSolicitados.length,
    }
  }, [calcularStats, cuadrillas, equiposSolicitados])

  // ---------- Handlers del formulario ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEspecialidadChange = (esp) => {
    setFormData((prev) => {
      const actual = prev.especialidad || []
      return {
        ...prev,
        especialidad: actual.includes(esp) ? actual.filter((e) => e !== esp) : [...actual, esp],
      }
    })
  }

  const handleSupervisorSelect = (supervisorId) => {
    setFormData((prev) => ({
      ...prev,
      supervisorId: supervisorId || '',
      nombre: supervisorId ? `${prev.zona || 'CUADRILLA'}-OBREROS` : prev.nombre,
    }))
  }

  const handleIntegranteToggle = (integranteId) => {
    setFormData((prev) => {
      const actuales = prev.integrantes || []
      const nuevos = actuales.includes(integranteId)
        ? actuales.filter((id) => id !== integranteId)
        : [...actuales, integranteId]
      return { ...prev, integrantes: nuevos }
    })
  }

  const abrirModalCrear = () => {
    setFormData({
      ...FORM_INICIAL,
      supervisorId: '',
      integrantes: [],
    })
    setFormError(null)
    setModalFormVisible(true)
  }

  const abrirModalEditar = (cuadrilla) => {
    const supervisorName = cuadrilla.jefe || cuadrilla.supervisor || '';
    const supervisorIdEncontrado = getSupervisores.find((e) => e.nombre === supervisorName)?.id || '';
    
    const integrantesIds = (cuadrilla.integrantes || []).map((i) => {
      if (typeof i === 'object') return i.empleadoId || i.id;
      const emp = getObreros.find((e) => e.nombre === i);
      return emp ? emp.id : (typeof i === 'string' && !isNaN(i) ? Number(i) : '');
    }).filter(Boolean);

    setFormData({
      ...cuadrilla,
      supervisorId: supervisorIdEncontrado,
      integrantes: integrantesIds,
    })
    setFormError(null)
    setModalFormVisible(true)
  }

  const handleGuardar = async () => {
    if (!formData.zona) {
      setFormError('Debe seleccionar una zona de operación.')
      return
    }
    if (formData.rol === ROLES_EQUIPO.OPERATIVO && !formData.supervisorId) {
      setFormError('Debe seleccionar un supervisor o jefe de cuadrilla.')
      return
    }
    if ((formData.integrantes || []).length === 0) {
      setFormError(
        formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR
          ? 'Debe seleccionar al inspector.'
          : 'Debe agregar al menos un integrante a la cuadrilla.',
      )
      return
    }

    const tipoNombre = formData.rol === ROLES_EQUIPO.TECNICO_INSPECTOR ? 'INSPECTOR' : 'OBREROS'
    let contador = cuadrillas.length + 1
    let nombreGenerado
    do {
      nombreGenerado = `${formData.zona.toUpperCase()}-${tipoNombre}-${String(contador).padStart(3, '0')}`
      contador++
    } while (cuadrillas.some((c) => c.nombre === nombreGenerado))
    const formDataConNombre = { ...formData, nombre: nombreGenerado }

    if (isEdit) {
      const res = await actualizarCuadrilla(formData.id, formDataConNombre)
      if (res.success) {
        agregarEvento(formData.id, 'edicion', `Se editó la cuadrilla ${formDataConNombre.nombre}`)
        showToast('Cuadrilla actualizada exitosamente', 'success')
        setModalFormVisible(false)
      } else {
        setFormError(res.error || 'Error al actualizar')
      }
    } else {
      const res = await crearCuadrilla(formDataConNombre)
      if (res.success) {
        agregarEvento(
          res.data?.id || nombreGenerado,
          'creacion',
          `Se creó la cuadrilla ${nombreGenerado} en ${formData.zona}`,
        )
        showToast('Cuadrilla creada exitosamente', 'success')
        setModalFormVisible(false)
      } else {
        setFormError(res.error || 'Error al crear')
      }
    }
  }

  // ---------- Handlers eliminar ----------
  const handleEliminar = async (cuadrilla) => {
    const ok = await confirm(
      '¿Eliminar Cuadrilla?',
      `¿Estás seguro de eliminar "${cuadrilla.nombre}"? Esta acción no se puede deshacer.`,
      { confirmLabel: 'Eliminar', variant: 'danger' },
    )
    if (!ok) return

    const res = await eliminarCuadrilla(cuadrilla.id)
    if (res.success) {
      agregarEvento(cuadrilla.id, 'eliminacion', `Se eliminó la cuadrilla ${cuadrilla.nombre}`)
      showToast('Cuadrilla eliminada', 'success')
    } else {
      showToast(res.error || 'Error al eliminar', 'danger')
    }
  }

  // ---------- Handlers solicitar activo ----------
  const handleAbrirSolicitud = (cuadrilla) => {
    setCuadrillaParaSolicitud(cuadrilla)
    setModalSolicitudVisible(true)
  }

  const handleEnviarSolicitud = (cuadrilla, formSolicitud) => {
    const res = solicitarActivo(cuadrilla, formSolicitud)
    if (res.success) {
      agregarEvento(
        cuadrilla.id,
        'solicitud_activo',
        `Solicitó: ${formSolicitud.activoNombre || 'Activo #' + formSolicitud.activoId} (x${formSolicitud.cantidad})`,
      )
      showToast('Solicitud enviada al HUB. Pendiente de aprobación.', 'info')
      setModalSolicitudVisible(false)
      setCuadrillaParaSolicitud(null)
    } else {
      showToast(res.error || 'Error al enviar la solicitud', 'danger')
    }
  }

  // ---------- Handlers ver tareas ----------
  const handleVerTareas = (cuadrilla) => {
    setCuadrillaParaTareas(cuadrilla)
    setModalTareasVisible(true)
  }

  // ---------- Handlers historial ----------
  const handleVerHistorial = (cuadrilla) => {
    setCuadrillaParaHistorial(cuadrilla)
    setModalHistorialVisible(true)
  }

  // ---------- Handlers equipos ----------
  const handleAbrirEquipos = (cuadrilla) => {
    setCuadrillaParaEquipos(cuadrilla)
    setModalEquiposVisible(true)
  }

  // ---------- Exportar ----------
  const handleExportar = () => {
    exportarDatos()
    showToast('Archivo CSV exportado exitosamente', 'success')
  }

  // ---------- Loading / Error states ----------
  if (loading) {
    return (
      <CContainer
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: '70vh' }}
      >
        <CSpinner color="success" />
        <span className="ms-3 text-muted">Cargando cuadrillas...</span>
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer fluid className="py-5">
        <CAlert color="danger" className="text-center">
          <h5>Error al cargar cuadrillas</h5>
          <p>{error}</p>
          <CButton color="danger" onClick={cargarCuadrillas}>
            Reintentar
          </CButton>
        </CAlert>
      </CContainer>
    )
  }

  // ---------- Render ----------
  return (
    <>
      <ConfirmModal />

      {/* Header */}
      <div className="eco-card mb-4 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center">
            <h1 className="h2 fw-bold mb-0 me-3">
              <CIcon icon={cilPeople} className="me-2 text-eco" />
              Equipos de Campo
            </h1>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <CButton color="outline-success" onClick={handleExportar}>
              <CIcon icon={cilCloudDownload} className="me-2" />
              Exportar
            </CButton>
            <CButton color="success" onClick={abrirModalCrear}>
              <CIcon icon={cilPlus} className="me-2" />
              Nuevo Equipo
            </CButton>
          </div>
        </div>
        <small className="text-muted d-block mt-2">
          Motor operativo — Cuadrillas e Inspectores asignados a Permisos, Denuncias y Licencias
        </small>
      </div>

      {/* KPIs */}
      <CuadrillasStats stats={stats} />

      {/* Tabs */}
      <div className="eco-card">
        <div className="px-3 pt-3">
          <CNav variant="pills" className="nav-eco-tabs mb-0">
            <CNavItem>
              <CNavLink
                active={activeTab === 'lista'}
                onClick={() => setActiveTab('lista')}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilList} className="me-2" />
                Equipos
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'estadisticas'}
                onClick={() => setActiveTab('estadisticas')}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilChart} className="me-2" />
                Estadísticas
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'actividad'}
                onClick={() => setActiveTab('actividad')}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilClock} className="me-2" />
                Actividad General
              </CNavLink>
            </CNavItem>
          </CNav>
        </div>
        <div className="p-3">
          <CTabContent>
            <CTabPane visible={activeTab === 'lista'}>
              <CuadrillasTabla
                cuadrillas={cuadrillasFiltradas}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                filtroEstado={filtroEstado}
                onFiltroEstadoChange={setFiltroEstado}
                filtroRol={filtroRol}
                onFiltroRolChange={setFiltroRol}
                onEditar={abrirModalEditar}
                onEliminar={handleEliminar}
                onSolicitarActivo={handleAbrirSolicitud}
                onVerTareas={handleVerTareas}
                onVerHistorial={handleVerHistorial}
                onAbrirEquipos={handleAbrirEquipos}
              />
            </CTabPane>

            <CTabPane visible={activeTab === 'estadisticas'}>
              <CuadrillasGraficos cuadrillas={cuadrillas} equipos={equiposSolicitados} />
            </CTabPane>

            <CTabPane visible={activeTab === 'actividad'}>
              <ActividadGeneral actividad={actividad} cargarActividad={cargarActividad} />
            </CTabPane>
          </CTabContent>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <CuadrillasModalForm
        visible={modalFormVisible}
        onClose={() => setModalFormVisible(false)}
        onGuardar={handleGuardar}
        formData={formData}
        onInputChange={handleInputChange}
        onEspecialidadChange={handleEspecialidadChange}
        onSupervisorSelect={handleSupervisorSelect}
        onIntegranteToggle={handleIntegranteToggle}
        supervisores={getSupervisores}
        obreros={getObreros}
        error={formError}
        isEdit={isEdit}
      />

      {/* Modal Solicitar Activo → HUB */}
      <CuadrillasModalSolicitarActivo
        visible={modalSolicitudVisible}
        onClose={() => {
          setModalSolicitudVisible(false)
          setCuadrillaParaSolicitud(null)
        }}
        onEnviarSolicitud={handleEnviarSolicitud}
        cuadrilla={cuadrillaParaSolicitud}
        activos={activosInventario}
      />

      {/* Modal Ver Tareas */}
      <CuadrillasModalTareas
        visible={modalTareasVisible}
        onClose={() => {
          setModalTareasVisible(false)
          setCuadrillaParaTareas(null)
        }}
        cuadrilla={cuadrillaParaTareas}
      />

      {/* Modal Historial por cuadrilla */}
      <CuadrillasModalHistorial
        visible={modalHistorialVisible}
        onClose={() => {
          setModalHistorialVisible(false)
          setCuadrillaParaHistorial(null)
        }}
        cuadrilla={cuadrillaParaHistorial}
        actividad={actividad}
        cargarActividad={cargarActividad}
      />

      {/* Modal Equipos (solo lectura: equipos aprobados desde SolicitudActivos) */}
      <CuadrillasModalEquipos
        visible={modalEquiposVisible}
        onClose={() => {
          setModalEquiposVisible(false)
          setCuadrillaParaEquipos(null)
        }}
        cuadrilla={cuadrillaParaEquipos}
      />
    </>
  )
}

export default Cuadrillas
