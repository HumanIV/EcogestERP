import { api } from '../../../../services/api'

const PATH = '/cuadrillas'

async function obtenerCuadrillas() {
  try {
    const data = await api(PATH)
    return { success: true, data, total: data.length }
  } catch (e) {
    return { success: false, error: e.message, data: [], total: 0 }
  }
}

async function obtenerCuadrillaPorId(id) {
  try {
    const data = await api(`${PATH}/${id}`)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Cuadrilla no encontrada' }
  }
}

async function crearCuadrilla(cuadrillaData) {
  try {
    const cuadrillas = await api(PATH)
    const zonaPrefix = (cuadrillaData.zona || 'GEN').replace('Zona ', '').toUpperCase()
    const count = cuadrillas.filter((c) => c.zona === cuadrillaData.zona).length + 1

    const nuevaCuadrilla = {
      ...cuadrillaData,
      id: cuadrillaData.id || `${zonaPrefix}-OBREROS-${String(count).padStart(3, '0')}`,
      nombre: cuadrillaData.nombre || `${zonaPrefix}-OBREROS-${String(count).padStart(3, '0')}`,
      fechaCreacion: new Date().toISOString(),
      estado: cuadrillaData.estado || 'activa',
      disponible: true,
      tareasActuales: cuadrillaData.tareasActuales || [],
      integrantes: cuadrillaData.integrantes || [],
      especialidad: cuadrillaData.especialidad || [],
      jefe: cuadrillaData.jefe || cuadrillaData.supervisor || null,
    }

    const data = await api(PATH, { method: 'POST', body: JSON.stringify(nuevaCuadrilla) })
    return { success: true, data, message: 'Cuadrilla creada exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function actualizarCuadrilla(id, datosActualizados) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...actual, ...datosActualizados, fechaActualizacion: new Date().toISOString() }),
    })
    return { success: true, data, message: 'Cuadrilla actualizada exitosamente' }
  } catch (e) {
    return { success: false, error: 'Cuadrilla no encontrada' }
  }
}

async function eliminarCuadrilla(id) {
  try {
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true, message: 'Cuadrilla eliminada exitosamente' }
  } catch (e) {
    return { success: false, error: 'Cuadrilla no encontrada' }
  }
}

async function obtenerEstadisticasCuadrillas() {
  try {
    const cuadrillas = await api(PATH)
    const total = cuadrillas.length
    const activas = cuadrillas.filter((c) => c.estado === 'activa').length
    return {
      success: true,
      data: {
        total,
        activas,
        inactivas: total - activas,
        capacidadTotal: cuadrillas.reduce((s, c) => s + (c.capacidad || 0), 0),
        cuadrillasPorZona: cuadrillas.reduce((acc, c) => {
          acc[c.zona] = (acc[c.zona] || 0) + 1
          return acc
        }, {}),
      },
    }
  } catch (e) {
    return { success: false, error: e.message, data: {} }
  }
}

export const cuadrillaService = {
  obtenerCuadrillas,
  obtenerCuadrillaPorId,
  crearCuadrilla,
  actualizarCuadrilla,
  eliminarCuadrilla,
  obtenerEstadisticasCuadrillas,
}

export default cuadrillaService
