import { api } from '../../../../services/api'

const PATH = '/proveedores'

async function obtenerProveedores() {
  try {
    const data = await api(PATH)
    return { success: true, data, total: data.length }
  } catch (e) {
    return { success: false, error: e.message, data: [], total: 0 }
  }
}

async function obtenerProveedorPorId(id) {
  try {
    const data = await api(`${PATH}/${id}`)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Proveedor no encontrado' }
  }
}

async function crearProveedor(proveedorData) {
  try {
    const data = await api(PATH, {
      method: 'POST',
      body: JSON.stringify(proveedorData),
    })
    return { success: true, data, message: 'Proveedor creado exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function actualizarProveedor(id, datosActualizados) {
  try {
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosActualizados),
    })
    return { success: true, data, message: 'Proveedor actualizado exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function eliminarProveedor(id) {
  try {
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true, message: 'Proveedor eliminado exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export const proveedoresService = {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
}
