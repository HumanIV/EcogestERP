import { useState, useCallback, useEffect } from 'react'
import { solicitudService } from '../services/solicitudService'

const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estadisticas, setEstadisticas] = useState({})

  const cargarSolicitudes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await solicitudService.obtenerSolicitudes()
      if (res.success) {
        setSolicitudes(res.data)
        const resStats = await solicitudService.obtenerEstadisticas()
        if (resStats.success) setEstadisticas(resStats.data)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError('Error de conexión al cargar solicitudes')
      console.error('Error en useSolicitudes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarSolicitudes()
  }, [cargarSolicitudes])

  const crearSolicitud = useCallback(
    async (data) => {
      try {
        const res = await solicitudService.crearSolicitud(data)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error creando solicitud:', err)
        return { success: false, error: 'Error creando solicitud' }
      }
    },
    [cargarSolicitudes],
  )

  const actualizarSolicitud = useCallback(
    async (id, data) => {
      try {
        const res = await solicitudService.actualizarSolicitud(id, data)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error actualizando solicitud:', err)
        return { success: false, error: 'Error actualizando solicitud' }
      }
    },
    [cargarSolicitudes],
  )

  const aprobarSolicitud = useCallback(
    async (id, comentario) => {
      try {
        const res = await solicitudService.aprobarSolicitud(id, comentario)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error aprobando solicitud:', err)
        return { success: false, error: 'Error aprobando solicitud' }
      }
    },
    [cargarSolicitudes],
  )

  const rechazarSolicitud = useCallback(
    async (id, motivo) => {
      try {
        const res = await solicitudService.rechazarSolicitud(id, motivo)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error rechazando solicitud:', err)
        return { success: false, error: 'Error rechazando solicitud' }
      }
    },
    [cargarSolicitudes],
  )

  const enviarARevision = useCallback(
    async (id) => {
      try {
        const res = await solicitudService.enviarARevision(id)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error enviando a revisión:', err)
        return { success: false, error: 'Error enviando a revisión' }
      }
    },
    [cargarSolicitudes],
  )

  const aprobarMultiples = useCallback(
    async (ids) => {
      try {
        const res = await solicitudService.aprobarMultiples(ids)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error aprobando múltiples:', err)
        return { success: false, error: 'Error aprobando múltiples' }
      }
    },
    [cargarSolicitudes],
  )

  const rechazarMultiples = useCallback(
    async (ids) => {
      try {
        const res = await solicitudService.rechazarMultiples(ids)
        if (res.success) {
          await cargarSolicitudes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error rechazando múltiples:', err)
        return { success: false, error: 'Error rechazando múltiples' }
      }
    },
    [cargarSolicitudes],
  )

  const getPorEmpleado = useCallback(
    (empleado) => {
      return solicitudes.filter((s) => s.empleadoNombre === empleado || s.usuario === empleado)
    },
    [solicitudes],
  )

  const getPorEstado = useCallback(
    (estado) => {
      return solicitudes.filter((s) => s.estado === estado)
    },
    [solicitudes],
  )

  const getPorTipo = useCallback(
    (tipo) => {
      return solicitudes.filter((s) => s.tipo === tipo)
    },
    [solicitudes],
  )

  const calcularStats = useCallback(() => {
    const total = solicitudes.length
    const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length
    const aprobadas = solicitudes.filter((s) => s.estado === 'Aprobada').length
    const rechazadas = solicitudes.filter((s) => s.estado === 'Rechazada').length
    const enRevision = solicitudes.filter((s) => s.estado === 'En revisión').length
    return { total, pendientes, aprobadas, rechazadas, enRevision }
  }, [solicitudes])

  return {
    solicitudes,
    estadisticas,
    loading,
    error,
    cargarSolicitudes,
    crearSolicitud,
    actualizarSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    enviarARevision,
    aprobarMultiples,
    rechazarMultiples,
    getPorEmpleado,
    getPorEstado,
    getPorTipo,
    calcularStats,
  }
}

export default useSolicitudes
