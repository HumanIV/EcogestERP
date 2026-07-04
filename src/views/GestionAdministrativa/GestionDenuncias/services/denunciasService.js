import { api, getCurrentUser } from '../../../../services/api'
import { toCamelCase, toSnakeCase } from '../../../../utils/formatters'

const PATH = '/denuncias'

async function obtenerDenuncias(filtros = {}) {
  try {
    let url = PATH
    const params = new URLSearchParams()
    if (filtros.estado && filtros.estado !== 'todas') params.append('estado', filtros.estado)
    if (filtros.tipo && filtros.tipo !== 'todos') params.append('tipo', filtros.tipo)
    if (filtros.prioridad && filtros.prioridad !== 'todas') params.append('prioridad', filtros.prioridad)
    if (params.toString()) url += `?${params.toString()}`

    const rawData = await api(url)
    const data = toCamelCase(rawData)

    let denuncias = data
    if (filtros.estado && filtros.estado !== 'todas') {
      denuncias = denuncias.filter((d) => d.estado === filtros.estado)
    }
    if (filtros.tipo && filtros.tipo !== 'todos') {
      denuncias = denuncias.filter((d) => d.tipo === filtros.tipo)
    }
    if (filtros.prioridad && filtros.prioridad !== 'todas') {
      denuncias = denuncias.filter((d) => d.prioridad === filtros.prioridad)
    }

    return {
      success: true,
      data: denuncias,
      total: denuncias.length,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return { success: false, error: 'No se pudieron cargar las denuncias', data: [], total: 0 }
  }
}

async function obtenerEstadisticas(filtros = {}) {
  try {
    const respuesta = await obtenerDenuncias(filtros)
    const denuncias = respuesta.data

    const estadisticas = {
      total: denuncias.length,
      pendiente: denuncias.filter((d) => d.estado === 'pendiente').length,
      investigando: denuncias.filter((d) => d.estado === 'investigando').length,
      asignada: denuncias.filter((d) => d.estado === 'asignada').length,
      en_proceso: denuncias.filter((d) => d.estado === 'en_proceso').length,
      resuelta: denuncias.filter((d) => d.estado === 'resuelta').length,
      alta: denuncias.filter((d) => d.prioridad === 'alta').length,
      media: denuncias.filter((d) => d.prioridad === 'media').length,
      baja: denuncias.filter((d) => d.prioridad === 'baja').length,
      denunciasEsteMes: denuncias.filter((d) => {
        const fecha = new Date(d.fecha)
        const ahora = new Date()
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
      }).length,
    }

    return { success: true, data: estadisticas, timestamp: new Date().toISOString() }
  } catch (error) {
    return { success: false, error: 'No se pudieron cargar las estadísticas', data: {} }
  }
}

async function actualizarEstado(id, nuevoEstado, detalle = '', datosResolucion = null) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const actualData = toCamelCase(actual)
    
    const entry = {
      tipo: nuevoEstado === 'resuelta' ? 'resolucion' : 'estado',
      accion: nuevoEstado === 'resuelta' ? 'Denuncia resuelta' : `Estado cambiado a ${nuevoEstado}`,
      fecha: new Date().toISOString(),
      detalle: detalle || (datosResolucion?.descripcionResolucion) || `Cambio de estado: ${actualData.estado} → ${nuevoEstado}`,
    }

    const actualizacion = {
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString(),
      historial: [...(actualData.historial || []), entry]
    }

    if (nuevoEstado === 'resuelta') {
      actualizacion.fechaResolucion = new Date().toISOString()
      if (datosResolucion) {
        actualizacion.resolucion = datosResolucion
      }
    }

    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase({ ...actualData, ...actualizacion })),
    })

    return {
      success: true,
      data: toCamelCase(data),
      message: `Estado actualizado a: ${nuevoEstado}`,
    }
  } catch (error) {
    return { success: false, error: 'No se pudo actualizar el estado' }
  }
}

async function asignarDenuncia(id, cuadrillaId, datosAdicionales = {}) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const actualData = toCamelCase(actual)

    const entry = {
      tipo: 'asignacion',
      accion: `Asignada a ${cuadrillaId}`,
      fecha: new Date().toISOString(),
      detalle: datosAdicionales.razonAsignacion || `Cuadrilla ${cuadrillaId} asignada`,
    }

    const actualizacion = {
      cuadrillaId,
      estado: 'asignada',
      fechaAsignacion: new Date().toISOString(),
      historial: [...(actualData.historial || []), entry],
      ...datosAdicionales
    }

    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase({ ...actualData, ...actualizacion })),
    })

    return {
      success: true,
      data: toCamelCase(data),
      message: `Denuncia asignada a cuadrilla ${cuadrillaId}`,
    }
  } catch (error) {
    return { success: false, error: 'No se pudo asignar la denuncia' }
  }
}

async function agregarComentario(id, texto, autor = 'Operador') {
  try {
    const actual = await api(`${PATH}/${id}`)
    const actualData = toCamelCase(actual)

    const comentario = {
      id: Date.now().toString(),
      texto,
      autor,
      fecha: new Date().toISOString(),
    }

    const entry = {
      tipo: 'comentario',
      accion: 'Comentario agregado',
      fecha: new Date().toISOString(),
      detalle: texto.substring(0, 80) + (texto.length > 80 ? '...' : ''),
    }

    const actualizacion = {
      comentarios: [...(actualData.comentarios || []), comentario],
      historial: [...(actualData.historial || []), entry]
    }

    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase({ ...actualData, ...actualizacion })),
    })

    return {
      success: true,
      data: toCamelCase(data),
    }
  } catch (error) {
    return { success: false, error: 'No se pudo agregar el comentario' }
  }
}

async function generarReporte(filtros = {}) {
  try {
    const respuesta = await obtenerDenuncias(filtros)
    const denuncias = respuesta.data

    const reporte = {
      metadata: {
        titulo: 'Reporte de Denuncias Ambientales',
        fechaGeneracion: new Date().toISOString(),
        filtrosAplicados: filtros,
        totalRegistros: denuncias.length,
      },
      datos: denuncias,
      resumen: generarResumenReporte(denuncias),
      recomendaciones: generarRecomendacionesReporte(denuncias),
    }

    return { success: true, data: reporte, message: 'Reporte generado exitosamente' }
  } catch (error) {
    return { success: false, error: 'No se pudo generar el reporte' }
  }
}

async function obtenerCuadrillas() {
  try {
    const data = await api('/cuadrillas')
    return { success: true, data: toCamelCase(data), total: data.length }
  } catch (error) {
    return { success: false, error: 'No se pudieron cargar las cuadrillas', data: [], total: 0 }
  }
}

async function obtenerNotificaciones() {
  try {
    const data = await api('/notificaciones')
    const notif = toCamelCase(data)
    return {
      success: true,
      data: notif,
      totalNoLeidas: notif.filter((n) => !n.leida).length,
    }
  } catch (error) {
    return {
      success: false,
      error: 'No se pudieron cargar las notificaciones',
      data: [],
      totalNoLeidas: 0,
    }
  }
}

function generarResumenReporte(denuncias) {
  const total = denuncias.length
  const resueltas = denuncias.filter((d) => d.estado === 'resuelta').length
  const pendientes = denuncias.filter((d) => d.estado === 'pendiente').length

  const denunciasResueltas = denuncias.filter(
    (d) => d.estado === 'resuelta' && d.fechaResolucion,
  )
  const tiempoPromedio =
    denunciasResueltas.length > 0
      ? denunciasResueltas.reduce((sum, d) => {
          const inicio = new Date(d.fecha)
          const fin = new Date(d.fechaResolucion)
          return sum + (fin - inicio)
        }, 0) /
        denunciasResueltas.length /
        (1000 * 60 * 60 * 24)
      : 0

  return {
    total,
    resueltas,
    pendientes,
    tiempoPromedioResolucion: Math.round(tiempoPromedio),
    eficiencia: total > 0 ? Math.round((resueltas / total) * 100) : 0,
  }
}

function generarRecomendacionesReporte(denuncias) {
  const recomendaciones = []

  const pendientesAltas = denuncias.filter(
    (d) => d.estado === 'pendiente' && d.prioridad === 'alta',
  ).length

  if (pendientesAltas > 5) {
    recomendaciones.push('Asignar más recursos a denuncias de alta prioridad pendientes')
  }

  const resumen = generarResumenReporte(denuncias)
  const tiempoPromedio = resumen.tiempoPromedioResolucion
  if (tiempoPromedio > 30) {
    recomendaciones.push('Optimizar procesos para reducir tiempos de respuesta')
  }

  const denunciasSinUbicacion = denuncias.filter(
    (d) => !d.latitud || !d.longitud,
  ).length
  if (denunciasSinUbicacion > 0) {
    recomendaciones.push(
      `Solicitar ubicación precisa para ${denunciasSinUbicacion} denuncias`,
    )
  }

  return recomendaciones.length > 0
    ? recomendaciones
    : ['Situación bajo control. Mantener estrategias actuales.']
}

async function eliminarDenuncia(id) {
  try {
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

function generarId(denuncias) {
  const ahora = new Date()
  const yy = String(ahora.getFullYear()).slice(2)
  const mm = String(ahora.getMonth() + 1).padStart(2, '0')
  const count = denuncias.filter((d) => d.id?.startsWith(`DEN-${yy}${mm}-`)).length
  return `DEN-${yy}${mm}-${String(count + 1).padStart(5, '0')}`
}

async function crearDenuncia(datos) {
  try {
    const denuncias = await api(PATH)
    const { id: userId } = getCurrentUser()
    const ahora = new Date()
    const nueva = {
      ...datos,
      id: datos.id || generarId(denuncias),
      userId: datos.userId || userId || null,
      fecha: datos.fecha || ahora.toISOString().split('T')[0],
      estado: datos.estado || 'pendiente',
      prioridad: datos.prioridad || 'media',
      fechaIncidente: datos.fechaIncidente || ahora.toISOString().split('T')[0],
      evidencia: datos.evidencia || [],
      origen: datos.origen || 'admin',
    }
    const data = await api(PATH, { method: 'POST', body: JSON.stringify(toSnakeCase(nueva)) })
    return { success: true, data: toCamelCase(data) }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const denunciasService = {
  obtenerDenuncias,
  obtenerEstadisticas,
  actualizarEstado,
  asignarDenuncia,
  generarReporte,
  obtenerCuadrillas,
  obtenerNotificaciones,
  crearDenuncia,
  eliminarDenuncia,
  agregarComentario,
}

export default denunciasService
