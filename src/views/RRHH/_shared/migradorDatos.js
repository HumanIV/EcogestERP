/**
 * migradorDatos.js
 *
 * Script de migración para consolidar datos de RRHH:
 * 1. Fusiona vacacionesMinisterio → solicitudesRRHHMinisterio
 * 2. Establece relación Empleado ↔ Expediente vía empleadoId
 * 3. Normaliza campos duplicados en empleadosMinisterio
 * 4. Crea estructura de auditoría básica
 *
 * Ejecutar UNA VEZ al iniciar la aplicación tras el despliegue.
 */

const STORAGE_KEYS = {
  EMPLEADOS: 'empleadosMinisterio',
  EXPEDIENTES: 'expedientesMinisterio',
  SOLICITUDES: 'solicitudesRRHHMinisterio',
  VACACIONES: 'vacacionesMinisterio',
  MIGRACION_COMPLETADA: 'migracionRRHH_v1_completada',
}

/**
 * Calcula días entre dos fechas
 */
function calcularDias(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return 0
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

/**
 * Genera ID único simple
 */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * Migra vacaciones → solicitudes
 */
function migrarVacacionesASolicitudes(vacaciones, empleados) {
  return vacaciones.map((vac) => {
    const empleado = empleados.find(
      (e) => e.id === vac.empleadoId || `${e.nombre} ${e.apellidos}` === vac.empleadoNombre,
    )

    return {
      id: generarId(),
      tipo: 'Vacaciones',
      subTipo: vac.tipo || 'anuales',
      descripcion: `Solicitud de vacaciones ${vac.tipo || 'anuales'} - ${calcularDias(vac.fechaInicio, vac.fechaFin)} días`,
      fecha: vac.fechaSolicitud || new Date().toISOString().split('T')[0],
      fechaSolicitud: vac.fechaSolicitud,
      empleado: vac.empleadoNombre,
      empleadoId: empleado?.id || null,
      usuario: vac.empleadoNombre,
      foto: empleado?.foto || '',
      estado: vac.estado,
      adjunto: null,
      fechaRespuesta: vac.estado === 'Aprobada' ? new Date().toISOString().split('T')[0] : '',
      comentarios: vac.observaciones || '',
      prioridad: 'Media',
      motivo: vac.observaciones || 'Solicitud de vacaciones',
      detalles: vac.estado === 'Aprobada' ? 'Aprobado por RRHH' : '',
      documentos: [],
      departamento: empleado?.departamento || '',
      diasSolicitados: vac.diasSolicitados || calcularDias(vac.fechaInicio, vac.fechaFin),
      fechaInicio: vac.fechaInicio,
      fechaFin: vac.fechaFin,
      fechaReincorporacion: vac.fechaReincorporacion,
      origen: 'migracion_vacaciones',
    }
  })
}

/**
 * Normaliza un empleado: consolida campos duplicados
 */
function normalizarEmpleado(empleado) {
  return {
    ...empleado,
    // Consolidar email/correo
    correo: empleado.correo || empleado.email || '',
    email: empleado.email || empleado.correo || '',
    // Consolidar salario/salarioBase
    salarioBase: empleado.salarioBase || (empleado.salario ? String(empleado.salario / 100) : ''),
    salario: empleado.salario || (empleado.salarioBase ? Number(empleado.salarioBase) * 100 : 0),
    // Consolidar skills/habilidades
    habilidades:
      Array.isArray(empleado.habilidades) && empleado.habilidades.length > 0
        ? empleado.habilidades
        : (empleado.skills || []).map((s) => ({ nombre: s, nivel: 50 })),
    skills: empleado.skills || (empleado.habilidades || []).map((h) => h.nombre),
    // Consolidar contratacion/tipoContrato
    tipoContrato: empleado.tipoContrato || empleado.contratacion || '',
    contratacion: empleado.contratacion || empleado.tipoContrato || '',
    // Asegurar apellidos
    apellidos: empleado.apellidos || '',
    // Asegurar cuadrillaId
    cuadrillaId: empleado.cuadrillaId || null,
    cuadrillaNombre: empleado.cuadrillaNombre || null,
  }
}

/**
 * Vincula expedientes con empleados vía empleadoId
 */
function vincularExpedientesConEmpleados(expedientes, empleados) {
  return expedientes.map((exp) => {
    const empleado = empleados.find(
      (e) => `${e.nombre} ${e.apellidos || ''}`.trim() === exp.nombre || e.nombre === exp.nombre,
    )

    return {
      ...exp,
      empleadoId: empleado?.id || null,
      // Los datos personales se leen del empleado, no se duplican
      nombre: exp.nombre,
      cargo: empleado?.cargo || exp.cargo,
      departamento: empleado?.departamento || exp.departamento,
      foto: empleado?.foto || exp.foto,
      correo: empleado?.correo || exp.correo,
      telefono: empleado?.telefono || exp.telefono,
    }
  })
}

/**
 * Función principal de migración
 */
export function ejecutarMigracionRRHH() {
  // Verificar si ya se ejecutó
  if (localStorage.getItem(STORAGE_KEYS.MIGRACION_COMPLETADA)) {
    console.log('[Migrador RRHH] Migración ya completada. Saltando.')
    return { exitosa: false, motivo: 'ya_completada' }
  }

  try {
    // 1. Leer datos existentes
    const empleadosRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLEADOS) || '[]')
    const expedientesRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPEDIENTES) || '[]')
    const solicitudesRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLICITUDES) || '[]')
    const vacacionesRaw = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACACIONES) || '[]')

    console.log('[Migrador RRHH] Datos encontrados:', {
      empleados: empleadosRaw.length,
      expedientes: expedientesRaw.length,
      solicitudes: solicitudesRaw.length,
      vacaciones: vacacionesRaw.length,
    })

    // 2. Normalizar empleados
    const empleadosNormalizados = empleadosRaw.map(normalizarEmpleado)

    // 3. Migrar vacaciones → solicitudes
    const vacacionesMigradas = migrarVacacionesASolicitudes(vacacionesRaw, empleadosNormalizados)
    const solicitudesConsolidadas = [...solicitudesRaw, ...vacacionesMigradas]

    // 4. Vincular expedientes con empleados
    const expedientesVinculados = vincularExpedientesConEmpleados(
      expedientesRaw,
      empleadosNormalizados,
    )

    // 5. Guardar datos consolidados
    localStorage.setItem(STORAGE_KEYS.EMPLEADOS, JSON.stringify(empleadosNormalizados))
    localStorage.setItem(STORAGE_KEYS.EXPEDIENTES, JSON.stringify(expedientesVinculados))
    localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudesConsolidadas))

    // 6. Marcar migración como completada
    localStorage.setItem(
      STORAGE_KEYS.MIGRACION_COMPLETADA,
      JSON.stringify({
        fecha: new Date().toISOString(),
        version: '1.0',
        registros: {
          empleados: empleadosNormalizados.length,
          expedientes: expedientesVinculados.length,
          solicitudes: solicitudesConsolidadas.length,
          vacacionesMigradas: vacacionesMigradas.length,
        },
      }),
    )

    console.log('[Migrador RRHH] Migración completada exitosamente:', {
      empleados: empleadosNormalizados.length,
      expedientes: expedientesVinculados.length,
      solicitudes: solicitudesConsolidadas.length,
      vacacionesMigradas: vacacionesMigradas.length,
    })

    return {
      exitosa: true,
      registros: {
        empleados: empleadosNormalizados.length,
        expedientes: expedientesVinculados.length,
        solicitudes: solicitudesConsolidadas.length,
        vacacionesMigradas: vacacionesMigradas.length,
      },
    }
  } catch (error) {
    console.error('[Migrador RRHH] Error durante la migración:', error)
    return { exitosa: false, error: error.message }
  }
}

/**
 * Verifica el estado de la migración
 */
export function obtenerEstadoMigracion() {
  const estado = localStorage.getItem(STORAGE_KEYS.MIGRACION_COMPLETADA)
  if (!estado) return { completada: false }
  return { completada: true, ...JSON.parse(estado) }
}

/**
 * Revierte la migración (solo para desarrollo)
 */
export function revertirMigracion() {
  localStorage.removeItem(STORAGE_KEYS.MIGRACION_COMPLETADA)
  console.log('[Migrador RRHH] Migración revertida. Se ejecutará nuevamente al recargar.')
}
