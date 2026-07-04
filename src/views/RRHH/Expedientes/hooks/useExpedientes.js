import { useState, useCallback, useEffect } from 'react'
import { expedienteService } from '../services/expedienteService'

const useExpedientes = () => {
  const [expedientes, setExpedientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estadisticas, setEstadisticas] = useState({})

  const cargarExpedientes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await expedienteService.obtenerExpedientes()
      if (res.success) {
        setExpedientes(res.data)
        const resStats = await expedienteService.obtenerEstadisticas()
        if (resStats.success) setEstadisticas(resStats.data)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError('Error de conexión al cargar expedientes')
      console.error('Error en useExpedientes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarExpedientes()
  }, [cargarExpedientes])

  const obtenerExpedientePorId = useCallback(async (id) => {
    try {
      const res = await expedienteService.obtenerExpedientePorId(id)
      return res.success ? res.data : null
    } catch (err) {
      console.error('Error obteniendo expediente:', err)
      return null
    }
  }, [])

  const crearExpediente = useCallback(
    async (data) => {
      try {
        const res = await expedienteService.crearExpediente(data)
        if (res.success) {
          await cargarExpedientes()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error creando expediente:', err)
        return { success: false, error: 'Error creando expediente' }
      }
    },
    [cargarExpedientes],
  )

  const actualizarExpediente = useCallback(
    async (id, data) => {
      try {
        const res = await expedienteService.actualizarExpediente(id, data)
        if (res.success) {
          await cargarExpedientes()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error actualizando expediente:', err)
        return { success: false, error: 'Error actualizando expediente' }
      }
    },
    [cargarExpedientes],
  )

  const eliminarExpediente = useCallback(
    async (id) => {
      try {
        const res = await expedienteService.eliminarExpediente(id)
        if (res.success) {
          await cargarExpedientes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error eliminando expediente:', err)
        return { success: false, error: 'Error eliminando expediente' }
      }
    },
    [cargarExpedientes],
  )

  const eliminarMultiplesExpedientes = useCallback(
    async (ids) => {
      try {
        const res = await expedienteService.eliminarMultiplesExpedientes(ids)
        if (res.success) {
          await cargarExpedientes()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error eliminando expedientes:', err)
        return { success: false, error: 'Error eliminando expedientes' }
      }
    },
    [cargarExpedientes],
  )

  const agregarDocumento = useCallback(
    async (expedienteId, documento) => {
      try {
        const res = await expedienteService.agregarDocumento(expedienteId, documento)
        if (res.success) {
          await cargarExpedientes()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error agregando documento:', err)
        return { success: false, error: 'Error agregando documento' }
      }
    },
    [cargarExpedientes],
  )

  const calcularStats = useCallback(() => {
    const total = expedientes.length
    const completos = expedientes.filter((e) => e.estadoExp === 'Completo').length
    const incompletos = expedientes.filter((e) => e.estadoExp === 'Incompleto').length
    const pendientes = expedientes.filter((e) => e.estadoExp === 'Pendiente').length
    return { total, completos, incompletos, pendientes }
  }, [expedientes])

  const exportarCSV = useCallback(() => {
    const headers = [
      'ID',
      'Nombre',
      'Cargo',
      'Departamento',
      'Estado',
      'Completado %',
      'Fecha Creación',
    ]
    const rows = expedientes.map((e) => [
      e.id,
      e.nombre,
      e.cargo,
      e.departamento,
      e.estadoExp,
      e.porcentajeCompletado,
      e.fechaCreacion,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expedientes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [expedientes])

  return {
    expedientes,
    estadisticas,
    loading,
    error,
    cargarExpedientes,
    obtenerExpedientePorId,
    crearExpediente,
    actualizarExpediente,
    eliminarExpediente,
    eliminarMultiplesExpedientes,
    agregarDocumento,
    calcularStats,
    exportarCSV,
  }
}

export default useExpedientes
