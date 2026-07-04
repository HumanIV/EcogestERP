import { api } from '../../../../services/api'

const PATH = '/empleados'

async function obtenerTodos() {
  try {
    const data = await api(PATH)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
}

async function obtenerPorId(id) {
  try {
    const data = await api(`${PATH}/${id}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Empleado no encontrado' }
  }
}

async function obtenerPorCedula(cedula) {
  try {
    const empleados = await api(`${PATH}?cedula=${cedula}`)
    if (empleados.length > 0) {
      return { success: true, data: empleados[0] }
    }
    return { success: false, error: 'Empleado no encontrado' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function obtenerActivos() {
  try {
    const data = await api(`${PATH}?estado=Activo`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
}

async function obtenerPorDepartamento(departamento) {
  try {
    const data = await api(`${PATH}?departamento=${encodeURIComponent(departamento)}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
}

async function obtenerPorCuadrilla(cuadrillaId) {
  try {
    const data = await api(`${PATH}?cuadrillaId=${cuadrillaId}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
}

async function crear(empleado) {
  try {
    const nuevoEmpleado = {
      ...empleado,
    }
    const data = await api(PATH, {
      method: 'POST',
      body: JSON.stringify(nuevoEmpleado),
    })
    return { success: true, data, message: 'Empleado creado exitosamente' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function actualizar(id, datos) {
  try {
    const actual = await api(`${PATH}/${id}`)
    const data = await api(`${PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...actual,
        ...datos,
      }),
    })
    return { success: true, data, message: 'Empleado actualizado exitosamente' }
  } catch (error) {
    return { success: false, error: 'Empleado no encontrado' }
  }
}

async function eliminar(id) {
  try {
    const eliminado = await api(`${PATH}/${id}`)
    await api(`${PATH}/${id}`, { method: 'DELETE' })
    return { success: true, data: eliminado, message: 'Empleado eliminado exitosamente' }
  } catch (error) {
    return { success: false, error: 'Empleado no encontrado' }
  }
}

async function asignarCuadrilla(empleadoId, cuadrillaId) {
  return actualizar(empleadoId, { cuadrillaId })
}

async function removerDeCuadrilla(empleadoId) {
  return actualizar(empleadoId, { cuadrillaId: null })
}

async function buscar(query) {
  try {
    const empleados = await api(PATH)
    const q = query.toLowerCase()
    const resultados = empleados.filter(
      (e) =>
        `${e.nombre} ${e.apellidos || ''}`.toLowerCase().includes(q) ||
        (e.cedula || '').includes(q) ||
        (e.departamento || '').toLowerCase().includes(q) ||
        (e.cargo || '').toLowerCase().includes(q),
    )
    return { success: true, data: resultados }
  } catch (error) {
    return { success: false, error: error.message, data: [] }
  }
}

async function obtenerEstadisticas() {
  try {
    const data = await api(PATH)
    const porEstado = {}
    const porDepartamento = {}
    const porTipoContrato = {}

    data.forEach((e) => {
      porEstado[e.estado] = (porEstado[e.estado] || 0) + 1
      porDepartamento[e.departamento] = (porDepartamento[e.departamento] || 0) + 1
      porTipoContrato[e.tipoContrato] = (porTipoContrato[e.tipoContrato] || 0) + 1
    })

    return {
      success: true,
      data: {
        total: data.length,
        activos: porEstado['Activo'] || 0,
        porEstado,
        porDepartamento,
        porTipoContrato,
      },
    }
  } catch (error) {
    return { success: false, error: error.message, data: {} }
  }
}

export const empleadoService = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorCedula,
  obtenerActivos,
  obtenerPorDepartamento,
  obtenerPorCuadrilla,
  crear,
  actualizar,
  eliminar,
  asignarCuadrilla,
  removerDeCuadrilla,
  buscar,
  obtenerEstadisticas,
}

export default empleadoService
