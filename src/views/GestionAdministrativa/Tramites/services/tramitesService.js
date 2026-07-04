import { api, getCurrentUser } from '../../../../services/api'
import { toCamelCase, toSnakeCase } from '../../../../utils/formatters'

const PATH = '/tramites'

async function obtenerTramites() {
  try {
    const data = await api(PATH)
    return { success: true, data: toCamelCase(data) }
  } catch (err) {
    return { success: false, error: err.message, data: [] }
  }
}

async function obtenerTramitePorId(id) {
  try {
    const data = await api(`${PATH}/${id}`)
    return { success: true, data: toCamelCase(data) }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function generarId(tramites, tipo) {
  const year = new Date().getFullYear()
  const prefix = tipo === 'LICENCIA' ? 'LIC' : 'PER'
  const count = tramites.filter((t) => t.id?.startsWith(`${prefix}-${year}-`)).length
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`
}

async function crearTramite(tramiteData) {
  try {
    const tramites = await api(PATH)
    const { id: userId } = getCurrentUser()
    const nuevo = {
      ...tramiteData,
      id: tramiteData.id || generarId(tramites, tramiteData.tipo),
      userId: tramiteData.userId || userId || null,
      fechaSolicitud: tramiteData.fechaSolicitud || new Date().toISOString().split('T')[0],
      historial: [
        {
          estado: tramiteData.estado || 'REVISION',
          fecha: new Date().toISOString(),
          usuario: 'Sistema',
          nota: 'Solicitud recibida',
        },
      ],
    }
    const data = await api(PATH, { method: 'POST', body: JSON.stringify(toSnakeCase(nuevo)) })
    return { success: true, data: toCamelCase(data) }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function actualizarTramite(id, datosActualizados) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase({ ...actual, ...datosActualizados })),
    })
    return { success: true, data: toCamelCase(data) }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function eliminarTramite(id) {
  try {
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function cambiarEstado(id, nuevoEstado, usuario = 'Sistema', nota = '') {
  try {
    const actual = await api(`${PATH}/${id}`)
    const now = new Date().toISOString()
    const historialEntry = { estado: nuevoEstado, fecha: now, usuario, nota }

    const actualizacion = {
      estado: nuevoEstado,
      historial: [...(actual.historial || []), historialEntry],
    }

    if (nuevoEstado === 'INSPECCION') actualizacion.fechaInspeccion = now.split('T')[0]
    if (nuevoEstado === 'DOCUMENTO_GENERADO') actualizacion.fechaDocumento = now.split('T')[0]
    if (nuevoEstado === 'APROBADO') actualizacion.fechaAprobacion = now.split('T')[0]
    if (nuevoEstado === 'REVISION') actualizacion.fechaRevision = now.split('T')[0]

    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase({ ...actual, ...actualizacion })),
    })
    return { success: true, data: toCamelCase(data) }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function obtenerEstadisticas() {
  try {
    const data = await api(PATH)
    const tramites = toCamelCase(data)
    const stats = {
      total: tramites.length,
      porTipo: {
        PERMISO: tramites.filter((t) => t.tipo === 'PERMISO').length,
        LICENCIA: tramites.filter((t) => t.tipo === 'LICENCIA').length,
      },
      porEstado: {},
      pendientes: tramites.filter((t) => ['REVISION', 'INSPECCION'].includes(t.estado)).length,
      aprobados: tramites.filter((t) => t.estado === 'APROBADO').length,
      rechazados: tramites.filter((t) => t.estado === 'RECHAZADO').length,
    }

    tramites.forEach((t) => {
      stats.porEstado[t.estado] = (stats.porEstado[t.estado] || 0) + 1
    })

    return { success: true, data: stats }
  } catch (err) {
    return { success: false, error: err.message, data: {} }
  }
}

export const tramitesService = {
  obtenerTramites,
  obtenerTramitePorId,
  crearTramite,
  actualizarTramite,
  eliminarTramite,
  cambiarEstado,
  obtenerEstadisticas,
}
