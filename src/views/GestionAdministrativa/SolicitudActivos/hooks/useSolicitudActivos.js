import { useState, useEffect, useMemo, useCallback } from 'react'
import { DATOS_INICIALES_SOLICITUDES } from '../constants/solicitudActivosConstants'
import solicitudActivosService from '../services/solicitudActivosService'
import { cuadrillaService } from '../../cuadrillas/services/cuadrillaService'
import { inventarioService } from '../../Inventario/services/inventarioService'

const useSolicitudActivos = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [cuadrillas, setCuadrillas] = useState([])
  const [activos, setActivos] = useState([])
  const [bitacora, setBitacora] = useState([])
  const [formData, setFormData] = useState({
    cuadrillaId: '',
    cuadrillaNombre: '',
    activoId: '',
    activoNombre: '',
    activoCodigo: '',
    cantidad: 1,
    observaciones: '',
    tipoMovimiento: 'Asignacion',
  })

  useEffect(() => {
    const cargar = async () => {
      try {
        const solRes = await solicitudActivosService.obtenerSolicitudes()
        if (solRes.success) {
          setSolicitudes(solRes.data.length > 0 ? solRes.data : DATOS_INICIALES_SOLICITUDES)
        } else {
          setSolicitudes(DATOS_INICIALES_SOLICITUDES)
        }

        const cuadRes = await cuadrillaService.obtenerCuadrillas()
        if (cuadRes.success) {
          setCuadrillas(cuadRes.data)
        }

        const invRes = await inventarioService.obtenerInventario()
        if (invRes.success) {
          setActivos(invRes.data.activos || [])
        }

        const bitRes = await solicitudActivosService.obtenerBitacora()
        if (bitRes.success) {
          setBitacora(bitRes.data)
        }
      } catch (err) {
        console.error('Error cargando solicitudes de activos:', err)
      }
    }
    cargar()
  }, [])

  const agregarBitacora = useCallback((accion, solicitudId, detalles) => {
    solicitudActivosService.agregarEntradaBitacora(accion, solicitudId, detalles)
    setBitacora((prev) => {
      const entrada = {
        id: prev.length > 0 ? Math.max(...prev.map((b) => b.id)) + 1 : 1,
        fecha: new Date().toLocaleString(),
        accion,
        solicitudId,
        usuario: 'Administrador',
        detalles,
      }
      return [entrada, ...prev]
    })
  }, [])

  const estadisticas = useMemo(() => {
    const total = solicitudes.length
    const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length
    const aprobados = solicitudes.filter((s) => s.estado === 'Aprobado').length
    const rechazados = solicitudes.filter((s) => s.estado === 'Rechazado').length
    return { total, pendientes, aprobados, rechazados }
  }, [solicitudes])

  const crearSolicitud = useCallback(
    (datos) => {
      const nuevaSolicitud = {
        id: solicitudes.length > 0 ? Math.max(...solicitudes.map((s) => s.id)) + 1 : 1,
        ...datos,
        estado: 'Pendiente',
        origen: 'cuadrilla',
        origenDetalle: `Solicitado por ${datos.cuadrillaNombre}`,
        fechaSolicitud: new Date().toLocaleString(),
        fechaAprobacion: null,
        aprobadoPor: null,
        observaciones: datos.observaciones || '',
      }
      setSolicitudes((prev) => [nuevaSolicitud, ...prev])

      agregarBitacora('crear', nuevaSolicitud.id, {
        activo: datos.activoNombre,
        cuadrilla: datos.cuadrillaNombre,
        cantidad: datos.cantidad,
        origen: 'cuadrilla',
      })

      return nuevaSolicitud
    },
    [solicitudes, agregarBitacora],
  )

  const aprobarSolicitud = useCallback(
    async (id) => {
      const solicitud = solicitudes.find((s) => s.id === id)
      if (!solicitud) return { success: false, error: 'Solicitud no encontrada' }

      const referencia = `MOV-SOL-${String(id).padStart(4, '0')}`

      const invRes = await inventarioService.obtenerInventario()
      if (!invRes.success) return { success: false, error: 'Error accediendo al inventario' }

      const inventarioData = invRes.data

      const activoIndex = inventarioData.activos.findIndex(
        (a) => a.codigo === solicitud.codigoActivo || a.nombre === solicitud.activoNombre,
      )
      if (activoIndex === -1) {
        return { success: false, error: 'Activo no encontrado en inventario' }
      }
      const activo = inventarioData.activos[activoIndex]

      const ubicacionDestino =
        solicitud.ubicacionDestino === 'Cuadrilla Asignada'
          ? solicitud.cuadrillaNombre || 'Cuadrilla Asignada'
          : solicitud.ubicacionDestino || solicitud.cuadrillaNombre || 'No especificada'

      const nuevoMovimiento = {
        tipo: solicitud.tipoMovimiento || 'Asignacion',
        activoId: activo.id,
        activoNombre: solicitud.activoNombre,
        codigoActivo: solicitud.codigoActivo,
        cantidad: solicitud.cantidad,
        ubicacionOrigen: activo.ubicacion || 'Inventario Central',
        ubicacionDestino: ubicacionDestino,
        motivo: `Solicitud #${id}: ${solicitud.motivo || 'Aprobacion de solicitud'}`,
        usuario: 'Administrador',
        fecha: new Date().toISOString(),
        referencia: referencia,
      }

      const updates = {}
      if (solicitud.tipoMovimiento === 'Transferencia' || solicitud.tipoMovimiento === 'Asignacion' || !solicitud.tipoMovimiento) {
        updates.ubicacion = ubicacionDestino
      } else if (solicitud.tipoMovimiento === 'Mantenimiento' || solicitud.tipoMovimiento === 'Reparacion') {
        updates.estado = 'En Mantenimiento'
      } else if (solicitud.tipoMovimiento === 'Baja') {
        updates.estado = 'Baja'
      }

      if (activo.tipoItem === 'contable' || (activo.cantidad && activo.cantidad > 1)) {
        updates.cantidad = Math.max((activo.cantidad || 0) - (solicitud.cantidad || 1), 0)
      }

      const updRes = await inventarioService.actualizarActivo(activo.id, updates)
      if (!updRes.success) {
        return { success: false, error: 'Error al actualizar el activo: ' + (updRes.error || 'Error desconocido') }
      }

      const movRes = await inventarioService.registrarMovimiento(nuevoMovimiento)
      if (!movRes.success) {
        return { success: false, error: 'Error al registrar el movimiento: ' + (movRes.error || 'Error desconocido') }
      }

      const apiRes = await solicitudActivosService.aprobarSolicitud(id)
      if (!apiRes.success) {
        return { success: false, error: 'Error al aprobar la solicitud' }
      }

      const solicitudActualizada = {
        ...solicitud,
        estado: 'Aprobado',
        fechaAprobacion: new Date().toLocaleString(),
        aprobadoPor: 'Administrador',
        referencia: referencia,
      }

      setSolicitudes((prev) => prev.map((s) => (s.id === id ? solicitudActualizada : s)))

      agregarBitacora('aprobar', id, {
        activo: solicitud.activoNombre,
        activoCodigo: solicitud.codigoActivo,
        cuadrilla: solicitud.cuadrillaNombre,
        cantidad: solicitud.cantidad,
        referencia: referencia,
        motivo: solicitud.motivo,
      })

      return { success: true, solicitud: solicitudActualizada }
    },
    [solicitudes, agregarBitacora],
  )

  const rechazarSolicitud = useCallback(
    async (id) => {
      const solicitud = solicitudes.find((s) => s.id === id)
      if (!solicitud) return null

      const apiRes = await solicitudActivosService.actualizarSolicitud(id, { estado: 'Rechazado', aprobadoPor: 'Administrador', fechaAprobacion: new Date().toISOString().split('T')[0] })
      
      const solicitudActualizada = {
        ...solicitud,
        estado: 'Rechazado',
        fechaAprobacion: new Date().toLocaleString(),
        aprobadoPor: 'Administrador',
      }

      setSolicitudes((prev) => prev.map((s) => (s.id === id ? solicitudActualizada : s)))

      agregarBitacora('rechazar', id, {
        activo: solicitud.activoNombre,
        activoCodigo: solicitud.activoCodigo,
        cuadrilla: solicitud.cuadrillaNombre,
        cantidad: solicitud.cantidad,
        motivo: solicitud.observaciones,
      })

      return solicitudActualizada
    },
    [solicitudes, agregarBitacora],
  )

  const exportarCSV = useCallback(() => {
    const headers = [
      'ID',
      'Origen',
      'Cuadrilla',
      'Activo',
      'Codigo',
      'Cantidad',
      'Estado',
      'Fecha Solicitud',
      'Fecha Aprobacion',
      'Aprobado Por',
    ]
    const rows = solicitudes.map((s) => [
      s.id,
      s.origen || 'N/A',
      s.cuadrillaNombre || s.cuadrillaId || 'N/A',
      s.activoNombre,
      s.activoCodigo,
      s.cantidad,
      s.estado,
      s.fechaSolicitud,
      s.fechaAprobacion || 'N/A',
      s.aprobadoPor || 'N/A',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `solicitudes_activos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [solicitudes])

  return {
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
  }
}

export default useSolicitudActivos
