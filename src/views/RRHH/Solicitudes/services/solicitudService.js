import { api } from '../../../../services/api'

const PATH = '/solicitudes'

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
      fecha: solicitudData.fecha || new Date().toISOString().split('T')[0],
      fechaSolicitud: solicitudData.fechaSolicitud || new Date().toISOString().split('T')[0],
      estado: solicitudData.estado || 'Pendiente',
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
      body: JSON.stringify({ ...actual, ...datosActualizados, id: actual.id }),
    })
    return { success: true, data, message: 'Solicitud actualizada exitosamente' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function aprobarSolicitud(id, comentario = '') {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...actual,
        estado: 'Aprobada',
        fechaRespuesta: new Date().toISOString().split('T')[0],
        comentarios: comentario || 'Aprobado por RRHH',
      }),
    })
    return { success: true, data, message: 'Solicitud aprobada exitosamente' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function rechazarSolicitud(id, motivo = '') {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...actual,
        estado: 'Rechazada',
        fechaRespuesta: new Date().toISOString().split('T')[0],
        comentarios: motivo || 'Rechazado',
      }),
    })
    return { success: true, data, message: 'Solicitud rechazada' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function enviarARevision(id) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...actual, estado: 'En revisión' }),
    })
    return { success: true, data, message: 'Solicitud enviada a revisión' }
  } catch (e) {
    return { success: false, error: 'Solicitud no encontrada' }
  }
}

async function aprobarMultiples(ids) {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    let count = 0
    for (const id of ids) {
      try {
        const actual = await api(`${PATH}/${id}`)
        await api(`${PATH}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...actual,
            estado: 'Aprobada',
            fechaRespuesta: hoy,
            comentarios: 'Aprobación masiva',
          }),
        })
        count++
      } catch {}
    }
    return { success: true, message: `${count} solicitudes aprobadas` }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function rechazarMultiples(ids) {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    let count = 0
    for (const id of ids) {
      try {
        const actual = await api(`${PATH}/${id}`)
        await api(`${PATH}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...actual,
            estado: 'Rechazada',
            fechaRespuesta: hoy,
            comentarios: 'Rechazo masivo',
          }),
        })
        count++
      } catch {}
    }
    return { success: true, message: `${count} solicitudes rechazadas` }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function obtenerEstadisticas() {
  try {
    const solicitudes = await api(PATH)
    const total = solicitudes.length
    return {
      success: true,
      data: {
        total,
        pendientes: solicitudes.filter((s) => s.estado === 'Pendiente').length,
        enRevision: solicitudes.filter((s) => s.estado === 'En revisión').length,
        aprobadas: solicitudes.filter((s) => s.estado === 'Aprobada').length,
        rechazadas: solicitudes.filter((s) => s.estado === 'Rechazada').length,
        porTipo: solicitudes.reduce((acc, s) => {
          acc[s.tipo] = (acc[s.tipo] || 0) + 1
          return acc
        }, {}),
      },
    }
  } catch (e) {
    return { success: false, error: e.message, data: {} }
  }
}

export const solicitudService = {
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  actualizarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  enviarARevision,
  aprobarMultiples,
  rechazarMultiples,
  obtenerEstadisticas,
}

export default solicitudService
