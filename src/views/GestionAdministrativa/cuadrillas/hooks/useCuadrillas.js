// src/views/GestionAdministrativa/cuadrillas/hooks/useCuadrillas.js
import { useState, useCallback, useEffect } from 'react'
import { cuadrillaService } from '../services/cuadrillaService'
import { solicitudActivosService } from '../../SolicitudActivos/services/solicitudActivosService'
import { inventarioService } from '../../Inventario/services/inventarioService'
import { DATOS_INICIALES_CUADRILLAS, ROLES_EQUIPO } from '../constants/cuadrillasConstants'
import { parseResponsables, exportarCuadrillasCSV } from '../utils/cuadrillasUtils'
import integracionService from '../../../../services/integracionService'

const useCuadrillas = () => {
  const [cuadrillas, setCuadrillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estadisticas, setEstadisticas] = useState({})
  // Activos del inventario para solicitudes
  const [activosInventario, setActivosInventario] = useState([])

  // ---------- Cargar datos ----------
  const cargarCuadrillas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await cuadrillaService.obtenerCuadrillas()
      if (res.success) {
        setCuadrillas(res.data)
        const resStats = await cuadrillaService.obtenerEstadisticasCuadrillas()
        if (resStats.success) setEstadisticas(resStats.data)
      } else {
        setError(res.error || 'Error cargando cuadrillas')
      }
    } catch (err) {
      setError('Error de conexión al cargar cuadrillas')
      console.error('Error en useCuadrillas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar activos desde inventario (para el modal de solicitud)
  const cargarActivosInventario = useCallback(async () => {
    try {
      const res = await inventarioService.obtenerActivos()
      if (res.success) {
        setActivosInventario(res.data)
      }
    } catch (e) {
      console.error('Error cargando activos del inventario:', e)
    }
  }, [])

  useEffect(() => {
    cargarCuadrillas()
    cargarActivosInventario()
  }, [cargarCuadrillas, cargarActivosInventario])

  // ---------- Sincronización Empleados ↔ Cuadrillas usando integracionService ----------
  const sincronizarEmpleadosConCuadrilla = useCallback(
    async (cuadrillaId, cuadrillaNombre, supervisorId, integrantesIds) => {
      try {
        // Asignar supervisor
        if (supervisorId) {
          await integracionService.asignarEmpleadoACuadrilla(supervisorId, cuadrillaId)
        }
        // Asignar integrantes
        for (const id of integrantesIds || []) {
          await integracionService.asignarEmpleadoACuadrilla(id, cuadrillaId)
        }
      } catch (e) {
        console.error('Error sincronizando empleados con cuadrilla:', e)
      }
    },
    [],
  )

  const limpiarEmpleadosDeCuadrilla = useCallback(async (cuadrillaId) => {
    try {
      const empleadosRes = await integracionService.obtenerEmpleadosActivosParaGA()
      if (empleadosRes.success) {
        const empleadosDeCuadrilla = empleadosRes.data.filter((e) => e.cuadrillaId === cuadrillaId)
        for (const emp of empleadosDeCuadrilla) {
          await integracionService.removerEmpleadoDeCuadrilla(emp.id)
        }
      }
    } catch (e) {
      console.error('Error limpiando empleados de cuadrilla:', e)
    }
  }, [])

  // ---------- CRUD ----------
  const crearCuadrilla = useCallback(
    async (cuadrillaData) => {
      try {
        const empleadosRes = await integracionService.obtenerEmpleadosActivosParaGA()
        const empleadosData = empleadosRes.success ? empleadosRes.data : []

        const supervisor = empleadosData.find((e) => String(e.id) === String(cuadrillaData.supervisorId))
        const integrantes = (cuadrillaData.integrantes || []).map((id) => {
          const emp = empleadosData.find((e) => String(e.id) === String(id))
          return emp ? emp.nombre : `Empleado ${id}`
        })

        const data = {
          ...cuadrillaData,
          supervisor: supervisor ? supervisor.nombre : '',
          jefe: supervisor ? supervisor.nombre : '',
          telefono: supervisor?.telefono || '',
          responsables: supervisor ? [supervisor.nombre, ...integrantes] : integrantes,
          tareasActuales: [],
          disponible: true,
        }
        const res = await cuadrillaService.crearCuadrilla(data)
        if (res.success) {
          await sincronizarEmpleadosConCuadrilla(
            res.data.id,
            res.data.nombre,
            cuadrillaData.supervisorId,
            cuadrillaData.integrantes,
          )
          await cargarCuadrillas()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error creando cuadrilla:', err)
        return { success: false, error: 'Error creando cuadrilla' }
      }
    },
    [cargarCuadrillas, sincronizarEmpleadosConCuadrilla],
  )

  const actualizarCuadrilla = useCallback(
    async (id, datosActualizados) => {
      try {
        const empleadosRes = await integracionService.obtenerEmpleadosActivosParaGA()
        const empleadosData = empleadosRes.success ? empleadosRes.data : []

        const supervisor = empleadosData.find((e) => String(e.id) === String(datosActualizados.supervisorId))
        const integrantes = (datosActualizados.integrantes || []).map((id) => {
          const emp = empleadosData.find((e) => String(e.id) === String(id))
          return emp ? emp.nombre : `Empleado ${id}`
        })

        const data = {
          ...datosActualizados,
          supervisor: supervisor ? supervisor.nombre : datosActualizados.supervisor || '',
          jefe: supervisor ? supervisor.nombre : datosActualizados.jefe || '',
          telefono: supervisor?.telefono || datosActualizados.telefono || '',
          responsables: supervisor ? [supervisor.nombre, ...integrantes] : integrantes,
        }
        const res = await cuadrillaService.actualizarCuadrilla(id, data)
        if (res.success) {
          await sincronizarEmpleadosConCuadrilla(
            id,
            res.data.nombre,
            datosActualizados.supervisorId,
            datosActualizados.integrantes,
          )
          await cargarCuadrillas()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error actualizando cuadrilla:', err)
        return { success: false, error: 'Error actualizando cuadrilla' }
      }
    },
    [cargarCuadrillas, sincronizarEmpleadosConCuadrilla],
  )

  const eliminarCuadrilla = useCallback(
    async (id) => {
      try {
        const cuadrilla = cuadrillas.find((c) => c.id === id)
        if (cuadrilla?.estado === 'activa') {
          return { success: false, error: 'No se puede eliminar una cuadrilla activa' }
        }
        const res = await cuadrillaService.eliminarCuadrilla(id)
        if (res.success) {
          await limpiarEmpleadosDeCuadrilla(id)
          await cargarCuadrillas()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error eliminando cuadrilla:', err)
        return { success: false, error: 'Error eliminando cuadrilla' }
      }
    },
    [cuadrillas, cargarCuadrillas, limpiarEmpleadosDeCuadrilla],
  )

  // ---------- Fase 2: Solicitar activos al HUB ----------
  const solicitarActivo = useCallback(
    async (cuadrilla, formSolicitud) => {
      try {
        const solicitudesRes = await solicitudActivosService.obtenerSolicitudes()
        const solicitudes = solicitudesRes.success ? solicitudesRes.data : []

        const nuevaSolicitud = {
          id: solicitudes.length > 0 ? Math.max(...solicitudes.map((s) => s.id)) + 1 : 1,
          cuadrillaId: cuadrilla.id,
          cuadrillaNombre: cuadrilla.nombre,
          activoId: formSolicitud.activoId,
          activoNombre: formSolicitud.activoNombre || `Activo ${formSolicitud.activoId}`,
          activoCodigo: formSolicitud.activoCodigo || 'N/D',
          cantidad: formSolicitud.cantidad || 1,
          observaciones: formSolicitud.observaciones || '',
          estado: 'Pendiente',
          origen: 'cuadrilla',
          origenDetalle: `Cuadrilla: ${cuadrilla.nombre} (${cuadrilla.zona})`,
          fechaSolicitud: new Date().toLocaleString(),
          fechaAprobacion: null,
          aprobadoPor: null,
        }

        const res = await solicitudActivosService.crearSolicitud(nuevaSolicitud)
        if (res.success) {
          await cargarCuadrillas()
          return { success: true, message: 'Solicitud enviada al HUB de Solicitud de Activos' }
        }
        return { success: false, error: 'Error al crear solicitud' }
      } catch (err) {
        console.error(err)
        return { success: false, error: 'Error al enviar la solicitud' }
      }
    },
    [cargarCuadrillas],
  )

  // ---------- Fase 3: Gestión de Tareas (asignadas desde otros módulos) ----------
  /**
   * Asigna una tarea a una cuadrilla desde otro módulo.
   * @param {string} cuadrillaId
   * @param {string} moduloOrigen  'denuncias' | 'permisos' | 'licencias'
   * @param {string} tareaId
   * @param {string} descripcion
   */
  const asignarTarea = useCallback(
    async (cuadrillaId, moduloOrigen, tareaId, descripcion) => {
      const cuadrilla = cuadrillas.find((c) => c.id === cuadrillaId)
      if (!cuadrilla) return { success: false, error: 'Cuadrilla no encontrada' }

      const tareasActuales = cuadrilla.tareasActuales || []
      if (tareasActuales.length >= cuadrilla.capacidad) {
        return {
          success: false,
          error: `${cuadrilla.nombre} ha alcanzado su capacidad máxima de ${cuadrilla.capacidad} tareas`,
        }
      }

      const nuevasTareas = [...tareasActuales, { moduloOrigen, tareaId, descripcion }]
      const nuevoEstado = nuevasTareas.length >= cuadrilla.capacidad ? 'ocupada' : 'activa'
      const nuevaDisponibilidad = nuevasTareas.length < cuadrilla.capacidad

      const datosActualizados = {
        ...cuadrilla,
        tareasActuales: nuevasTareas,
        estado: nuevoEstado,
        disponible: nuevaDisponibilidad,
      }

      return await actualizarCuadrilla(cuadrillaId, datosActualizados)
    },
    [cuadrillas, actualizarCuadrilla],
  )

  /**
   * Libera una tarea de una cuadrilla cuando se cierra o resuelve.
   */
  const liberarTarea = useCallback(
    async (cuadrillaId, tareaId) => {
      const cuadrilla = cuadrillas.find((c) => c.id === cuadrillaId)
      if (!cuadrilla) return { success: false, error: 'Cuadrilla no encontrada' }

      const nuevasTareas = (cuadrilla.tareasActuales || []).filter((t) => t.tareaId !== tareaId)
      const nuevoEstado = nuevasTareas.length === 0 ? 'activa' : cuadrilla.estado

      const datosActualizados = {
        ...cuadrilla,
        tareasActuales: nuevasTareas,
        estado: nuevoEstado,
        disponible: true,
      }

      return await actualizarCuadrilla(cuadrillaId, datosActualizados)
    },
    [cuadrillas, actualizarCuadrilla],
  )

  // ---------- Helpers ----------
  const obtenerCuadrillasDisponibles = useCallback(() => {
    return cuadrillas.filter((c) => c.estado === 'activa' && c.disponible !== false)
  }, [cuadrillas])

  const obtenerCuadrillasPorZona = useCallback(
    (zona) => {
      return cuadrillas.filter((c) => c.zona === zona)
    },
    [cuadrillas],
  )

  // ---------- Inspectores (Fase ECOGEST) ----------
  const getInspectoresDisponibles = useCallback(() => {
    return cuadrillas.filter(
      (c) =>
        c.rol === ROLES_EQUIPO.TECNICO_INSPECTOR && c.estado === 'activa' && c.disponible !== false,
    )
  }, [cuadrillas])

  const marcarInspectorOcupado = useCallback(
    async (id) => {
      const inspector = cuadrillas.find((c) => c.id === id)
      if (!inspector) return { success: false, error: 'Inspector no encontrado' }
      if (inspector.rol !== ROLES_EQUIPO.TECNICO_INSPECTOR)
        return { success: false, error: 'No es un inspector' }

      const datosActualizados = {
        ...inspector,
        estado: 'ocupada',
        disponible: false,
      }
      return await actualizarCuadrilla(id, datosActualizados)
    },
    [cuadrillas, actualizarCuadrilla],
  )

  const marcarInspectorDisponible = useCallback(
    async (id) => {
      const inspector = cuadrillas.find((c) => c.id === id)
      if (!inspector) return { success: false, error: 'Inspector no encontrado' }
      if (inspector.rol !== ROLES_EQUIPO.TECNICO_INSPECTOR)
        return { success: false, error: 'No es un inspector' }

      const datosActualizados = {
        ...inspector,
        estado: 'activa',
        disponible: true,
      }
      return await actualizarCuadrilla(id, datosActualizados)
    },
    [cuadrillas, actualizarCuadrilla],
  )

  const calcularStats = useCallback(() => {
    const total = cuadrillas.length
    const activas = cuadrillas.filter((c) => c.estado === 'activa').length
    const disponibles = obtenerCuadrillasDisponibles().length
    return {
      totalCuadrillas: total,
      activas,
      inactivas: total - activas,
      cuadrillasDisponibles: disponibles,
    }
  }, [cuadrillas, obtenerCuadrillasDisponibles])

  const exportarDatos = useCallback(() => {
    exportarCuadrillasCSV(cuadrillas)
  }, [cuadrillas])

  return {
    cuadrillas,
    estadisticas,
    activosInventario,
    loading,
    error,
    // CRUD
    cargarCuadrillas,
    crearCuadrilla,
    actualizarCuadrilla,
    eliminarCuadrilla,
    // Integración HUB
    solicitarActivo,
    // Gestión de Tareas (Fases 3 y 4)
    asignarTarea,
    liberarTarea,
    // Helpers
    obtenerCuadrillasDisponibles,
    obtenerCuadrillasPorZona,
    calcularStats,
    exportarDatos,
    // Inspectores (ECOGEST)
    getInspectoresDisponibles,
    marcarInspectorOcupado,
    marcarInspectorDisponible,
  }
}

export default useCuadrillas
