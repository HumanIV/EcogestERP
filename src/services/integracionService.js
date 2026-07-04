import { registrarAccion } from './AuditLogService'
import { empleadoService } from '../views/RRHH/Empleados/services/empleadoService'
import { expedienteService } from '../views/RRHH/Expedientes/services/expedienteService'
import { solicitudService } from '../views/RRHH/Solicitudes/services/solicitudService'
import { cuadrillaService } from '../views/GestionAdministrativa/cuadrillas/services/cuadrillaService'
import { solicitudActivosService } from '../views/GestionAdministrativa/SolicitudActivos/services/solicitudActivosService'
import { estructuraOrgService } from '../views/RRHH/EstructuraOrg/services/estructuraOrgService'
import { inventarioService } from '../views/GestionAdministrativa/Inventario/services/inventarioService'

// ===================== LECTURAS CROSS-MODULE =====================

export async function obtenerEmpleadoParaGA(empleadoId) {
  const res = await empleadoService.obtenerPorId(empleadoId)
  if (!res.success) return res
  const e = res.data
  return {
    success: true,
    data: {
      id: e.id,
      nombre: e.nombre,
      apellidos: e.apellidos,
      cedula: e.cedula,
      cargo: e.cargo,
      departamento: e.departamento,
      estado: e.estado,
      foto: e.foto,
      cuadrillaId: e.cuadrillaId,
    },
  }
}

export async function obtenerEmpleadosActivosParaGA() {
  const res = await empleadoService.obtenerActivos()
  if (!res.success) return res
  return {
    success: true,
    data: res.data.map((e) => ({
      id: e.id,
      nombre: `${e.nombre} ${e.apellidos || ''}`.trim(),
      cedula: e.cedula,
      cargo: e.cargo,
      departamento: e.departamento,
      cuadrillaId: e.cuadrillaId,
    })),
  }
}

export async function obtenerCuadrillasParaRRHH() {
  const [cuadRes, empRes] = await Promise.all([
    cuadrillaService.obtenerCuadrillas(),
    empleadoService.obtenerActivos(),
  ])
  if (!cuadRes.success) return cuadRes

  const empleados = empRes.success ? empRes.data : []

  return {
    success: true,
    data: cuadRes.data.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo,
      jefe: c.jefe,
      miembros: empleados.filter((e) => e.cuadrillaId === c.id).length,
      estado: c.estado,
    })),
  }
}

export async function obtenerCuadrillaDeEmpleado(empleadoId) {
  const empRes = await empleadoService.obtenerPorId(empleadoId)
  if (!empRes.success || !empRes.data.cuadrillaId) return { success: true, data: null }
  return cuadrillaService.obtenerCuadrillaPorId(empRes.data.cuadrillaId)
}

export async function obtenerSolicitudesRRHHPendientes() {
  const res = await solicitudService.obtenerSolicitudes()
  if (!res.success) {
    console.warn('[integracionService] obtenerSolicitudes falló:', res.error)
    return res
  }

  const todas = Array.isArray(res.data) ? res.data : []
  console.log(`[integracionService] Solicitudes totales obtenidas: ${todas.length}`)

  if (todas.length > 0) {
    const estados = todas.map((s) => s.estado)
    const tipos = todas.map((s) => s.tipo)
    console.log(`[integracionService] Estados:`, [...new Set(estados)], '| Tipos:', [
      ...new Set(tipos),
    ])
  }

  const pendientes = todas.filter((s) => s.estado === 'Pendiente' || s.estado === 'En revisión')

  console.log(`[integracionService] Solicitudes pendientes/en revisión: ${pendientes.length}`)

  return {
    success: true,
    data: pendientes.map((s) => ({
      id: s.id,
      tipo: s.tipo,
      empleado: s.empleadoNombre || s.empleado || s.usuario || 'Sin nombre',
      empleadoId: s.empleadoId || null,
      departamento: s.departamento || 'N/A',
      estado: s.estado,
      fecha: s.fecha || s.fechaSolicitud,
      prioridad: s.prioridad || 'media',
      diasSolicitados: s.diasSolicitados || 0,
    })),
  }
}

export async function obtenerTodasLasSolicitudesRRHH() {
  const res = await solicitudService.obtenerSolicitudes()
  if (!res.success) return res
  const todas = Array.isArray(res.data) ? res.data : []
  return {
    success: true,
    data: todas.map((s) => ({
      id: s.id,
      tipo: s.tipo,
      empleado: s.empleadoNombre || s.empleado || s.usuario || 'Sin nombre',
      empleadoId: s.empleadoId || null,
      departamento: s.departamento || 'N/A',
      estado: s.estado,
      fecha: s.fecha || s.fechaSolicitud,
      prioridad: s.prioridad || 'media',
      diasSolicitados: s.diasSolicitados || 0,
    })),
  }
}

export async function obtenerSolicitudesActivosPorCuadrilla(cuadrillaId) {
  const res = await solicitudActivosService.obtenerSolicitudes()
  if (!res.success) return res
  return {
    success: true,
    data: res.data.filter((s) => s.cuadrillaId === cuadrillaId && s.estado === 'Aprobado'),
  }
}

// ===================== ESCRITURAS CROSS-MODULE =====================

export async function asignarEmpleadoACuadrilla(empleadoId, cuadrillaId) {
  const empRes = await empleadoService.obtenerPorId(empleadoId)
  if (!empRes.success) return empRes
  const estadoAnterior = {
    cuadrillaId: empRes.data.cuadrillaId,
  }
  const res = await empleadoService.asignarCuadrilla(empleadoId, cuadrillaId)
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'GA',
      moduloDestino: 'RRHH',
      entidad: 'empleado',
      entidadId: empleadoId,
      accion: 'asignar',
      estadoAnterior,
      estadoNuevo: { cuadrillaId },
      detalles: `Empleado asignado a cuadrilla ${cuadrillaId}`,
    })
  }
  return res
}

export async function removerEmpleadoDeCuadrilla(empleadoId) {
  const empRes = await empleadoService.obtenerPorId(empleadoId)
  if (!empRes.success) return empRes
  const estadoAnterior = {
    cuadrillaId: empRes.data.cuadrillaId,
  }
  const res = await empleadoService.removerDeCuadrilla(empleadoId)
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'GA',
      moduloDestino: 'RRHH',
      entidad: 'empleado',
      entidadId: empleadoId,
      accion: 'desasignar',
      estadoAnterior,
      estadoNuevo: { cuadrillaId: null },
      detalles: 'Empleado removido de cuadrilla',
    })
  }
  return res
}

export async function aprobarSolicitudDesdeBandeja(solicitudId, comentario) {
  const solRes = await solicitudService.obtenerSolicitudPorId(solicitudId)
  if (!solRes.success) return solRes
  const estadoAnterior = { estado: solRes.data.estado }
  const res = await solicitudService.aprobarSolicitud(solicitudId, comentario)
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'GA',
      moduloDestino: 'RRHH',
      entidad: 'solicitud',
      entidadId: solicitudId,
      accion: 'aprobar',
      estadoAnterior,
      estadoNuevo: { estado: 'Aprobada' },
      detalles: comentario || 'Solicitud aprobada desde bandeja administrativa',
    })
  }
  return res
}

export async function rechazarSolicitudDesdeBandeja(solicitudId, motivo) {
  const solRes = await solicitudService.obtenerSolicitudPorId(solicitudId)
  if (!solRes.success) return solRes
  const estadoAnterior = { estado: solRes.data.estado }
  const res = await solicitudService.rechazarSolicitud(solicitudId, motivo)
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'GA',
      moduloDestino: 'RRHH',
      entidad: 'solicitud',
      entidadId: solicitudId,
      accion: 'rechazar',
      estadoAnterior,
      estadoNuevo: { estado: 'Rechazada' },
      detalles: motivo || 'Solicitud rechazada desde bandeja administrativa',
    })
  }
  return res
}

export async function enviarARevisionDesdeBandeja(solicitudId, comentario) {
  const solRes = await solicitudService.obtenerSolicitudPorId(solicitudId)
  if (!solRes.success) return solRes
  const estadoAnterior = { estado: solRes.data.estado }
  const res = await solicitudService.enviarARevision(solicitudId)
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'GA',
      moduloDestino: 'RRHH',
      entidad: 'solicitud',
      entidadId: solicitudId,
      accion: 'enviar_a_revision',
      estadoAnterior,
      estadoNuevo: { estado: 'En revisión' },
      detalles: comentario || 'Solicitud enviada a revisión desde bandeja administrativa',
    })
  }
  return res
}

export async function notificarCambioEstadoEmpleado(
  empleadoId,
  estadoAnterior,
  estadoNuevo,
  motivo,
) {
  const res = await empleadoService.actualizar(empleadoId, { estado: estadoNuevo })
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'RRHH',
      moduloDestino: 'GA',
      entidad: 'empleado',
      entidadId: empleadoId,
      accion: 'actualizar',
      estadoAnterior: { estado: estadoAnterior },
      estadoNuevo: { estado: estadoNuevo },
      detalles: motivo || `Estado cambiado de ${estadoAnterior} a ${estadoNuevo}`,
    })
  }
  return res
}

export async function cambiarDepartamentoEmpleado(empleadoId, deptoAnterior, deptoNuevo) {
  const res = await empleadoService.actualizar(empleadoId, { departamento: deptoNuevo })
  if (res.success) {
    await registrarAccion({
      moduloOrigen: 'RRHH',
      moduloDestino: 'GA',
      entidad: 'empleado',
      entidadId: empleadoId,
      accion: 'actualizar',
      estadoAnterior: { departamento: deptoAnterior },
      estadoNuevo: { departamento: deptoNuevo },
      detalles: `Departamento cambiado de ${deptoAnterior} a ${deptoNuevo}`,
    })
  }
  return res
}

export async function crearEmpleadoDesdeBandeja(solicitudId) {
  const solRes = await solicitudService.obtenerSolicitudPorId(solicitudId)
  if (!solRes.success) return solRes

  let datosEmpleado
  try {
    datosEmpleado = JSON.parse(solRes.data.detalles || '{}')
  } catch {
    return { success: false, error: 'Datos de empleado inválidos en la solicitud' }
  }

  const { datosPersonales = {}, datosLaborales = {}, datosDocumentales = [] } = datosEmpleado
  const plazaInfo = datosEmpleado.plaza || {}

  const nombreCompleto = [
    datosPersonales.nombre,
    datosPersonales.segundoNombre,
    datosPersonales.apellidos,
    datosPersonales.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')

  const fn = datosPersonales.fechaNacimiento
  const edad = fn
    ? Math.floor((new Date() - new Date(fn)) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const nuevoEmpleado = {
    nombre: nombreCompleto,
    apellidos: [datosPersonales.apellidos, datosPersonales.segundoApellido]
      .filter(Boolean)
      .join(' '),
    cedula: datosPersonales.cedula || '',
    email: datosPersonales.email || '',
    telefono: datosPersonales.telefono || '',
    fechaNacimiento: datosPersonales.fechaNacimiento || null,
    edad,
    genero: datosPersonales.genero || '',
    direccion: datosPersonales.direccion || '',
    ubicacion: [datosPersonales.estado, datosPersonales.municipio, datosPersonales.direccion]
      .filter(Boolean)
      .join(', ') || null,
    departamento: datosLaborales.departamento || plazaInfo.departamentoCodigo || '',
    cargo: plazaInfo.cargo || datosLaborales.cargo || '',
    tipoContrato: datosLaborales.tipoContrato || '',
    salario: plazaInfo.salario || null,
    plazaId: datosLaborales.plazaId || null,
    estado: 'Activo',
    fechaIngreso: new Date().toISOString().split('T')[0],
    documentos: datosDocumentales.map((d, i) => ({
      nombre: d.nombreArchivo || d.nombre || `Documento ${i + 1}`,
      tipo: d.tipo || 'Documento',
      dataUrl: d.dataUrl || null,
    })),
  }

  let empData
  try {
    const { api } = await import('./api')
    empData = await api('/empleados/bandeja', {
      method: 'POST',
      body: JSON.stringify(nuevoEmpleado),
    })
  } catch (e) {
    return { success: false, error: e.message }
  }

  // Asignar empleado a plaza si la solicitud incluye plazaId
  let plazaAsignada = null
  if (datosLaborales.plazaId) {
    const plazaRes = await estructuraOrgService.asignarEmpleadoAPlaza(
      datosLaborales.plazaId,
      empData.id,
      nombreCompleto,
    )
    if (plazaRes.success) {
      plazaAsignada = plazaRes.data
    }
  }

  await solicitudService.aprobarSolicitud(
    solicitudId,
    'Contratación aprobada — empleado y expediente creados',
  )

  await registrarAccion({
    moduloOrigen: 'GA',
    moduloDestino: 'RRHH',
    entidad: 'solicitud_contratacion',
    entidadId: solicitudId,
    accion: 'aprobar',
    estadoAnterior: { estado: 'Pendiente' },
    estadoNuevo: { estado: 'Aprobada', empleadoCreado: empData.id },
    detalles: `Empleado ${empData.nombre} ${empData.apellidos || ''} y su expediente creados desde Bandeja Administrativa${plazaAsignada ? `; plaza ${plazaAsignada.codigo} asignada` : ''}`,
  })

  return {
    success: true,
    data: empData,
    message: `Empleado y expediente creados exitosamente${plazaAsignada ? `; plaza ${plazaAsignada.codigo} asignada` : ''}`,
  }
}

// ===================== VALIDACIÓN PARA BAJAS / RENUNCIAS =====================

export async function validarDisponibilidadParaBaja(empleadoId) {
  const conflictos = []

  try {
    // 1. Verificar Cuadrilla
    const empRes = await empleadoService.obtenerPorId(empleadoId)
    if (!empRes.success) {
      return { success: false, error: 'No se pudo consultar el empleado', conflictos: [] }
    }
    const empleado = empRes.data

    if (empleado.cuadrillaId) {
      let cuadrillaNombre = `Cuadrilla ID: ${empleado.cuadrillaId}`
      try {
        const cuadRes = await cuadrillaService.obtenerCuadrillaPorId(empleado.cuadrillaId)
        if (cuadRes.success && cuadRes.data) {
          cuadrillaNombre = `Cuadrilla: ${cuadRes.data.nombre || cuadRes.data.id}`
        }
      } catch {}
      conflictos.push(cuadrillaNombre)
    }

    // 2. Verificar Plazas en Estructura Organizativa
    try {
      const plazasRes = await estructuraOrgService.obtenerPlazas()
      if (plazasRes.success) {
        const plazasOcupadas = plazasRes.data.filter(
          (p) => String(p.empleado_id) === String(empleadoId) && p.estado === 'ocupada',
        )
        plazasOcupadas.forEach((p) => {
          conflictos.push(`Plaza: ${p.codigo || p.id} — ${p.cargo || 'Sin cargo'}`)
        })
      }
    } catch {}

    // 3. Verificar Activos en Inventario
    try {
      const activosRes = await inventarioService.obtenerActivos()
      if (activosRes.success) {
        const activosAsignados = activosRes.data.filter(
          (a) =>
            (String(a.asignadoA) === String(empleadoId) ||
              String(a.responsable) === String(empleadoId) ||
              (a.asignadoA &&
                empleado.nombre &&
                String(a.asignadoA)
                  .toLowerCase()
                  .includes(empleado.nombre.toLowerCase()))) &&
            a.estado === 'En Uso',
        )
        activosAsignados.forEach((a) => {
          conflictos.push(`Activo: ${a.nombre || a.codigo} (${a.codigo || a.id})`)
        })
      }
    } catch {}

    if (conflictos.length > 0) {
      return {
        success: false,
        conflictos,
        message: `El empleado tiene ${conflictos.length} dependencia(s) activa(s) que deben resolverse antes de procesar la baja.`,
      }
    }

    return { success: true, conflictos: [] }
  } catch (e) {
    return {
      success: false,
      error: e.message,
      conflictos: [],
      message: 'Error inesperado al validar dependencias del empleado.',
    }
  }
}

export async function procesarBajaEmpleado(empleadoId, solicitudId) {
  // 1. Cambiar estado del empleado a Inactivo (Soft Delete)
  const res = await empleadoService.actualizar(empleadoId, { estado: 'Inactivo' })
  if (!res.success) return res

  // 2. Liberar plaza si la tiene
  try {
    const plazasRes = await estructuraOrgService.obtenerPlazas()
    if (plazasRes.success) {
      const plazasDelEmpleado = plazasRes.data.filter(
        (p) => String(p.empleadoId) === String(empleadoId) || String(p.empleado_id) === String(empleadoId),
      )
      for (const plaza of plazasDelEmpleado) {
        await estructuraOrgService.desocuparPlaza(plaza.id)
      }
    }
  } catch {}

  // 3. Archivar expediente del empleado
  let expedienteArchivado = false
  try {
    const expRes = await expedienteService.obtenerExpedientePorEmpleadoId(empleadoId)
    if (expRes.success && expRes.data) {
      const expediente = expRes.data
      const historialActual = expediente.historial || []
      await expedienteService.actualizarExpediente(expediente.id, {
        estadoExp: 'Archivado',
        historial: [
          ...historialActual,
          {
            fecha: new Date().toISOString().split('T')[0],
            evento: `Expediente archivado por baja/renuncia procesada (Solicitud #${solicitudId})`,
            usuario: 'RRHH — Sistema',
          },
        ],
      })
      expedienteArchivado = true
    }
  } catch {}

  // 4. Registrar en auditoría
  await registrarAccion({
    moduloOrigen: 'RRHH',
    moduloDestino: 'GA',
    entidad: 'empleado',
    entidadId: empleadoId,
    accion: 'baja',
    estadoAnterior: { estado: 'Activo' },
    estadoNuevo: { estado: 'Inactivo' },
    detalles: `Empleado dado de baja por solicitud #${solicitudId}. Estado cambiado a Inactivo.${expedienteArchivado ? ' Expediente archivado.' : ''}`,
  })

  return {
    success: true,
    message: `Empleado dado de baja exitosamente.${expedienteArchivado ? ' Expediente archivado.' : ''} Estado actualizado a Inactivo.`,
  }
}

export async function solicitarMovimientoActivo(movimientoData, activo) {
  const esCuadrilla = movimientoData.ubicacionDestino === 'Cuadrilla Asignada' && movimientoData.cuadrillaId

  const nuevaSolicitud = {
    activoId: activo.id,
    activoNombre: activo.nombre,
    activoCodigo: activo.codigo,
    cantidad: parseInt(movimientoData.cantidad) || 1,
    cuadrillaId: esCuadrilla ? String(movimientoData.cuadrillaId) : null,
    cuadrillaNombre: esCuadrilla ? movimientoData.cuadrillaNombre || null : null,
    solicitante: movimientoData.ubicacionDestino || 'Inventario Interno',
    motivo: movimientoData.motivo || `Solicitud de movimiento: ${movimientoData.tipo}`,
    tipoMovimiento: movimientoData.tipo,
    ubicacionDestino: movimientoData.ubicacionDestino,
    estado: 'Pendiente',
  }

  const resSol = await solicitudActivosService.crearSolicitud(nuevaSolicitud)
  if (!resSol.success) return resSol

  await registrarAccion({
    moduloOrigen: 'Inventario',
    moduloDestino: 'BandejaAdministrativa',
    entidad: 'MovimientoActivo',
    entidadId: activo.id,
    accion: 'SOLICITAR',
    detalles: `Movimiento de tipo ${movimientoData.tipo} para el activo ${activo.nombre} enviado a Bandeja Administrativa.`,
  })

  return { success: true, message: 'Solicitud de movimiento creada y enviada a Bandeja Administrativa.' }
}

export const integracionService = {
  obtenerEmpleadoParaGA,
  obtenerEmpleadosActivosParaGA,
  obtenerCuadrillasParaRRHH,
  obtenerCuadrillaDeEmpleado,
  obtenerTodasLasSolicitudesRRHH,
  obtenerSolicitudesActivosPorCuadrilla,
  asignarEmpleadoACuadrilla,
  removerEmpleadoDeCuadrilla,
  aprobarSolicitudDesdeBandeja,
  rechazarSolicitudDesdeBandeja,
  enviarARevisionDesdeBandeja,
  crearEmpleadoDesdeBandeja,
  notificarCambioEstadoEmpleado,
  cambiarDepartamentoEmpleado,
  validarDisponibilidadParaBaja,
  procesarBajaEmpleado,
  solicitarMovimientoActivo,
}

export default integracionService
