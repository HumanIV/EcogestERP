import { useState, useCallback, useEffect } from 'react'
import { empleadoService } from '../services/empleadoService'
import { solicitudService } from '../../Solicitudes/services/solicitudService'
import { ESTADOS_EMPLEADO, DEPARTAMENTOS } from '../constants/empleadosConstants'

const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estadisticas, setEstadisticas] = useState({})
  const [renunciasPendientes, setRenunciasPendientes] = useState([])

  const cargarEmpleados = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await empleadoService.obtenerTodos()
      if (res.success) {
        setEmpleados(res.data)
        const resStats = await empleadoService.obtenerEstadisticas()
        if (resStats.success) setEstadisticas(resStats.data)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError('Error de conexión al cargar empleados')
      console.error('Error en useEmpleados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const cargarRenunciasPendientes = useCallback(async () => {
    try {
      const [empRes, solRes] = await Promise.all([
        empleadoService.obtenerTodos(),
        solicitudService.obtenerSolicitudes(),
      ])
      if (!empRes.success || !solRes.success) return

      const solicitudesRenuncia = solRes.data.filter(
        (s) => s.tipo === 'Baja / Renuncia' && s.estado === 'Aprobada',
      )

      const empleadosConRenuncia = solicitudesRenuncia
        .map((sol) => {
          const emp = empRes.data.find(
            (e) =>
              String(e.id) === String(sol.empleadoId) && e.estado === 'Activo',
          )
          if (!emp) return null
          return {
            ...emp,
            solicitudId: sol.id,
            fechaSolicitud: sol.fecha || sol.fechaSolicitud,
            motivoRenuncia: sol.descripcion || sol.comentarios || '',
          }
        })
        .filter(Boolean)

      setRenunciasPendientes(empleadosConRenuncia)
    } catch (err) {
      console.error('Error cargando renuncias pendientes:', err)
    }
  }, [])

  useEffect(() => {
    cargarEmpleados()
  }, [cargarEmpleados])

  const procesarBaja = useCallback(
    async (empleadoId, solicitudId) => {
      try {
        const { integracionService } = await import('../../../../services/integracionService')

        // 1. Validar dependencias cruzadas
        const validacion = await integracionService.validarDisponibilidadParaBaja(empleadoId)
        if (!validacion.success) {
          return {
            success: false,
            error: validacion.message,
            conflictos: validacion.conflictos,
          }
        }

        // 2. Ejecutar la baja (Soft Delete + Archivar Expediente + Liberar Plaza)
        const res = await integracionService.procesarBajaEmpleado(empleadoId, solicitudId)
        if (res.success) {
          await cargarEmpleados()
          await cargarRenunciasPendientes()
        }
        return res
      } catch (err) {
        console.error('Error procesando baja:', err)
        return { success: false, error: 'Error inesperado al procesar la baja' }
      }
    },
    [cargarEmpleados, cargarRenunciasPendientes],
  )

  const crearEmpleado = useCallback(
    async (data) => {
      try {
        const res = await empleadoService.crear(data)
        if (res.success) {
          await cargarEmpleados()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error creando empleado:', err)
        return { success: false, error: 'Error creando empleado' }
      }
    },
    [cargarEmpleados],
  )

  const actualizarEmpleado = useCallback(
    async (id, data) => {
      try {
        const res = await empleadoService.actualizar(id, data)
        if (res.success) {
          await cargarEmpleados()
          return { success: true, data: res.data, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error actualizando empleado:', err)
        return { success: false, error: 'Error actualizando empleado' }
      }
    },
    [cargarEmpleados],
  )

  const eliminarEmpleado = useCallback(
    async (id) => {
      try {
        const res = await empleadoService.eliminar(id)
        if (res.success) {
          await cargarEmpleados()
          return { success: true, message: res.message }
        }
        return { success: false, error: res.error }
      } catch (err) {
        console.error('Error eliminando empleado:', err)
        return { success: false, error: 'Error eliminando empleado' }
      }
    },
    [cargarEmpleados],
  )

  const obtenerEmpleadoPorId = useCallback(async (id) => {
    try {
      const res = await empleadoService.obtenerPorId(id)
      return res.success ? res.data : null
    } catch (err) {
      console.error('Error obteniendo empleado:', err)
      return null
    }
  }, [])

  const getSupervisores = useCallback(() => {
    return empleados.filter((e) =>
      ['Supervisor', 'Coordinador', 'Gerente', 'Director', 'Jefe'].some((c) =>
        e.cargo?.toLowerCase().includes(c.toLowerCase()),
      ),
    )
  }, [empleados])

  const getObreros = useCallback(() => {
    return empleados.filter((e) =>
      ['Obrero', 'Operario', 'Técnico', 'Auxiliar'].some((c) =>
        e.cargo?.toLowerCase().includes(c.toLowerCase()),
      ),
    )
  }, [empleados])

  const getPorDepartamento = useCallback(
    (dept) => {
      return empleados.filter((e) => e.departamento === dept)
    },
    [empleados],
  )

  const getPorEstado = useCallback(
    (estado) => {
      return empleados.filter((e) => e.estado === estado)
    },
    [empleados],
  )

  const calcularStats = useCallback(() => {
    const total = empleados.length
    const activos = empleados.filter((e) => e.estado === 'Activo').length
    const vacaciones = empleados.filter((e) => e.estado === 'Vacaciones').length
    const suspendidos = empleados.filter((e) => e.estado === 'Suspendido').length
    return { total, activos, vacaciones, suspendidos }
  }, [empleados])

  const exportarCSV = useCallback(() => {
    const headers = [
      'ID',
      'Nombre',
      'Apellidos',
      'Cédula',
      'Cargo',
      'Departamento',
      'Estado',
      'Ingreso',
      'Email',
      'Teléfono',
    ]
    const rows = empleados.map((e) => [
      e.id,
      e.nombre,
      e.apellidos,
      e.cedula,
      e.cargo,
      e.departamento,
      e.estado,
      e.fechaIngreso,
      e.email,
      e.telefono,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `empleados_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [empleados])

  const validarEmpleado = useCallback((formData) => {
    const errors = {}
    if (!formData.nombre?.trim()) errors.nombre = 'Requerido'
    if (!formData.cedula?.trim()) errors.cedula = 'Requerido'
    if (!formData.email?.trim()) errors.email = 'Requerido'
    else if (!formData.email.includes('@')) errors.email = 'Inválido'
    if (!formData.departamento) errors.departamento = 'Seleccione'
    if (!formData.cargo) errors.cargo = 'Seleccione'
    if (!formData.tipoContrato) errors.tipoContrato = 'Seleccione'
    return errors
  }, [])

  return {
    empleados,
    estadisticas,
    loading,
    error,
    renunciasPendientes,
    cargarEmpleados,
    cargarRenunciasPendientes,
    procesarBaja,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    obtenerEmpleadoPorId,
    getSupervisores,
    getObreros,
    getPorDepartamento,
    getPorEstado,
    calcularStats,
    exportarCSV,
    validarEmpleado,
  }
}

export default useEmpleados

