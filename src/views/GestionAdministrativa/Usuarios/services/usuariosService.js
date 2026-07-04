import { api } from '../../../../services/api'

const PATH = '/users'

async function obtenerTodos() {
  try {
    const data = await api(PATH)
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message, data: [] }
  }
}

async function crear(usuarioData) {
  try {
    const data = await api(PATH, {
      method: 'POST',
      body: JSON.stringify(usuarioData),
    })
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function actualizar(id, usuarioData) {
  try {
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuarioData),
    })
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function eliminar(id) {
  try {
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export const usuariosService = {
  obtenerTodos,
  crear,
  actualizar,
  eliminar,
}
