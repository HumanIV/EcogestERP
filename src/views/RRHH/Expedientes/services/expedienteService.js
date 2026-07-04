import { api } from '../../../../services/api'

const PATH = '/expedientes'

async function obtenerExpedientes() {
  try {
    const data = await api(PATH)
    return { success: true, data, total: data.length }
  } catch (error) {
    return { success: false, error: error.message, data: [], total: 0 }
  }
}

async function obtenerExpedientePorId(id) {
  try {
    const data = await api(`${PATH}/${id}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Expediente no encontrado' }
  }
}

async function obtenerExpedientePorEmpleadoId(empleadoId) {
  try {
    const expedientes = await api(`${PATH}?empleadoId=${empleadoId}`)
    if (expedientes.length > 0) {
      return { success: true, data: expedientes[0] }
    }
    return { success: false, error: 'Expediente no encontrado para este empleado' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function crearExpediente(expedienteData) {
  if (!expedienteData.empleadoId) {
    return { success: false, error: 'Debe especificar un empleadoId válido' }
  }

  try {
    const existentes = await api(`${PATH}?empleadoId=${expedienteData.empleadoId}`)
    if (existentes.length > 0) {
      return { success: false, error: 'Este empleado ya tiene un expediente asignado' }
    }

    const nuevoExpediente = {
      empleadoId: Number(expedienteData.empleadoId),
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
      documentos: expedienteData.documentos || [],
      historial: expedienteData.historial || [
        {
          fecha: new Date().toISOString().split('T')[0],
          evento: 'Expediente creado',
          usuario: 'RRHH',
        },
      ],
      porcentajeCompletado: 0,
      estadoExp: 'Pendiente',
    }

    const data = await api(PATH, {
      method: 'POST',
      body: JSON.stringify(nuevoExpediente),
    })
    return { success: true, data, message: 'Expediente creado exitosamente' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function actualizarExpediente(id, datosActualizados) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...actual,
        ...datosActualizados,
        id: actual.id,
        ultimaActualizacion: new Date().toISOString().split('T')[0],
      }),
    })
    return { success: true, data, message: 'Expediente actualizado exitosamente' }
  } catch (error) {
    return { success: false, error: 'Expediente no encontrado' }
  }
}

async function eliminarExpediente(id) {
  try {
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true, message: 'Expediente eliminado exitosamente' }
  } catch (error) {
    return { success: false, error: 'Expediente no encontrado' }
  }
}

async function eliminarMultiplesExpedientes(ids) {
  try {
    for (const id of ids) {
      await api(`${PATH}/${id}`, { method: 'DELETE' })
    }
    return { success: true, message: `${ids.length} expedientes eliminados` }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function agregarDocumento(expedienteId, documento) {
  try {
    const expediente = await api(`${PATH}/${expedienteId}`)

    const nuevoDoc = {
      id: (expediente.documentos || []).length + 1,
      ...documento,
      fecha: documento.fecha || new Date().toISOString().split('T')[0],
    }

    const actualizado = {
      ...expediente,
      documentos: [...(expediente.documentos || []), nuevoDoc],
      historial: [
        ...(expediente.historial || []),
        {
          fecha: new Date().toISOString().split('T')[0],
          evento: `Documento añadido: ${documento.nombre}`,
          usuario: 'RRHH',
        },
      ],
      ultimaActualizacion: new Date().toISOString().split('T')[0],
    }

    const data = await api(`${PATH}/${expedienteId}`, {
      method: 'PUT',
      body: JSON.stringify(actualizado),
    })
    return { success: true, data, message: 'Documento agregado exitosamente' }
  } catch (error) {
    return { success: false, error: 'Expediente no encontrado' }
  }
}

async function obtenerEstadisticas() {
  try {
    const expedientes = await api(PATH)
    const total = expedientes.length
    const completos = expedientes.filter((e) => e.estadoExp === 'Completo').length
    const incompletos = expedientes.filter((e) => e.estadoExp === 'Incompleto').length
    const enRevision = expedientes.filter((e) => e.estadoExp === 'En revisión').length
    const pendientes = expedientes.filter((e) => e.estadoExp === 'Pendiente').length

    return {
      success: true,
      data: {
        total,
        completos,
        incompletos,
        enRevision,
        pendientes,
        promedioCompletado:
          total > 0
            ? Math.round(expedientes.reduce((s, e) => s + (e.porcentajeCompletado || 0), 0) / total)
            : 0,
      },
    }
  } catch (error) {
    return { success: false, error: error.message, data: {} }
  }
}

export const expedienteService = {
  obtenerExpedientes,
  obtenerExpedientePorId,
  obtenerExpedientePorEmpleadoId,
  crearExpediente,
  actualizarExpediente,
  eliminarExpediente,
  eliminarMultiplesExpedientes,
  agregarDocumento,
  obtenerEstadisticas,
}

export default expedienteService
