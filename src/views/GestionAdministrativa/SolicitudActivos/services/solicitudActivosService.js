import { api } from '../../../../services/api'

const PATH = '/solicitudActivos'
const BITACORA_PATH = '/bitacoraSolicitudes'

async function obtenerSolicitudes() {
  try {
    const data = await api(PATH)
    return { success: true, data, total: data.length }
  } catch (e) {
    return { success: false, error: e.message, data: [], total: 0 }
  }
}

async function obtenerSolicitudPorId(id) {
  try {
    const data = await api(`${PATH}/${id}`)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function crearSolicitud(solicitudData) {
  try {
    const nuevaSolicitud = {
      ...solicitudData,
      estado: solicitudData.estado || 'Pendiente',
      fechaSolicitud: solicitudData.fechaSolicitud || new Date().toISOString().split('T')[0],
      fechaAprobacion: null,
      aprobadoPor: null,
    }
    const data = await api(PATH, { method: 'POST', body: JSON.stringify(nuevaSolicitud) })
    return { success: true, data, message: 'Solicitud creada exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function actualizarSolicitud(id, datosActualizados) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...actual, ...datosActualizados }),
    })
    return { success: true, data, message: 'Solicitud actualizada' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function aprobarSolicitud(id) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...actual, estado: 'Aprobado', fechaAprobacion: new Date().toISOString().split('T')[0], aprobadoPor: 'Administrador' }),
    })
    return { success: true, data, message: 'Solicitud aprobada' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function rechazarSolicitud(id) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...actual, estado: 'Rechazado', fechaAprobacion: new Date().toISOString().split('T')[0], aprobadoPor: 'Administrador' }),
    })
    return { success: true, data, message: 'Solicitud rechazada' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function obtenerEstadisticas() {
  try {
    const solicitudes = await api(PATH)
    return {
      success: true,
      data: {
        total: solicitudes.length,
        pendientes: solicitudes.filter((s) => s.estado === 'Pendiente').length,
        aprobados: solicitudes.filter((s) => s.estado === 'Aprobado').length,
        rechazados: solicitudes.filter((s) => s.estado === 'Rechazado').length,
      },
    }
  } catch (e) {
    return { success: false, error: e.message, data: {} }
  }
}

async function obtenerBitacora() {
  try {
    const data = await api(BITACORA_PATH)
    return { success: true, data }
  } catch (e) {
    return { success: true, data: [] }
  }
}

async function agregarEntradaBitacora(accion, solicitudId, detalles) {
  try {
    const bitacora = await api(BITACORA_PATH)
    const entrada = {
      fecha: new Date().toISOString(),
      accion,
      solicitud_id: solicitudId,
      usuario: 'Administrador',
      detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
    }
    const data = await api(BITACORA_PATH, { method: 'POST', body: JSON.stringify(entrada) })
    return { success: true, data: entrada }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export const solicitudActivosService = {
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  actualizarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  obtenerEstadisticas,
  obtenerBitacora,
  agregarEntradaBitacora,
}

export default solicitudActivosService
