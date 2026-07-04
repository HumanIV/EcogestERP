import { api } from '../../../../services/api'

const PATH = '/estructuraOrg'

async function obtenerDatos() {
  try {
    const data = await api(PATH)
    if (Array.isArray(data) && data.length > 0) {
      return { success: true, data: data[0] }
    }
    return { success: false, error: 'Estructura vacía' }
  } catch (e) {
    return { success: false, error: 'Error leyendo estructura organizativa' }
  }
}

async function guardarDatos(data) {
  return api(`${PATH}/${data.id}`, { method: 'PUT', body: JSON.stringify(data) })
}

const SOLICITUDES_PATH = '/solicitudesPlaza'

async function solicitarPlaza(datos) {
  try {
    const payload = {
      ...datos,
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString(),
    }
    const data = await api(SOLICITUDES_PATH, { method: 'POST', body: JSON.stringify(payload) })
    return { success: true, data, message: 'Solicitud de plaza enviada a Bandeja Administrativa' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function obtenerSolicitudesPlaza(estado) {
  try {
    const qs = estado ? `?estado=${estado}` : ''
    const data = await api(`${SOLICITUDES_PATH}${qs}`)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

async function actualizarSolicitudPlaza(id, cambios) {
  try {
    const data = await api(`${SOLICITUDES_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cambios),
    })
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function obtenerPlazas() {
  try {
    const data = await api('/plazas')
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

async function obtenerPlazasPorDepartamento(departamento) {
  const res = await obtenerPlazas()
  if (!res.success) return res
  return { success: true, data: res.data.filter((p) => p.departamentoCodigo === departamento) }
}

async function obtenerPlazasVacantes() {
  const res = await obtenerPlazas()
  if (!res.success) return res
  return { success: true, data: res.data.filter((p) => p.estado === 'vacante') }
}

async function obtenerPlazaPorId(id) {
  const res = await obtenerPlazas()
  if (!res.success) return res
  const plaza = res.data.find((p) => p.id === id)
  return plaza ? { success: true, data: plaza } : { success: false, error: 'Plaza no encontrada' }
}

async function obtenerPlazaPorCodigo(codigo) {
  const res = await obtenerPlazas()
  if (!res.success) return res
  const plaza = res.data.find((p) => p.codigo === codigo)
  return plaza ? { success: true, data: plaza } : { success: false, error: 'Plaza no encontrada' }
}

async function crearPlaza(plaza) {
  try {
    const plazasRes = await obtenerPlazas()
    if (!plazasRes.success) return plazasRes
    const plazasExistentes = plazasRes.data

    const maxNum = plazasExistentes.reduce((max, p) => {
      const match = (p.id || '').match(/^PLZ-(\d+)$/)
      return match ? Math.max(max, parseInt(match[1])) : max
    }, 0)

    const nuevoCodigo = `PLZ-${String(maxNum + 1).padStart(3, '0')}`
    const nuevaPlaza = {
      ...plaza,
      id: nuevoCodigo,
      codigo: plaza.codigo || nuevoCodigo,
      departamentoCodigo: plaza.departamentoCodigo || plaza.departamento,
      empleado_id: null,
      estado: 'vacante',
    }
    const created = await api('/plazas', { method: 'POST', body: JSON.stringify(nuevaPlaza) })

    try {
      await api('/estructuraOrg/historial', {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          accion: 'Plaza creada',
          usuario: 'Administrador',
          detalles: `Plaza ${nuevaPlaza.codigo} - ${nuevaPlaza.cargo}`,
        }),
      })
    } catch {}

    return { success: true, data: created, message: 'Plaza creada exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function actualizarPlaza(id, datos) {
  try {
    const data = await api(`/plazas/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
    try {
      await api('/estructuraOrg/historial', {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          accion: 'Plaza actualizada',
          usuario: 'Administrador',
          detalles: `Plaza actualizada`,
        }),
      })
    } catch {}
    return { success: true, data, message: 'Plaza actualizada' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function eliminarPlaza(id) {
  try {
    const data = await api(`/plazas/${id}`, { method: 'DELETE' })
    try {
      await api('/estructuraOrg/historial', {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          accion: 'Plaza eliminada',
          usuario: 'Administrador',
          detalles: `Plaza eliminada`,
        }),
      })
    } catch {}
    return { success: true, data, message: 'Plaza eliminada' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function asignarEmpleadoAPlaza(plazaId, empleadoId, empleadoNombre) {
  try {
    const data = await api(`/plazas/${plazaId}`, {
      method: 'PUT',
      body: JSON.stringify({
        estado: 'ocupada',
        empleado_id: empleadoId,
        fecha_ocupacion: new Date().toISOString(),
      }),
    })
    try {
      await api('/estructuraOrg/historial', {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          accion: 'Plaza ocupada',
          usuario: 'Administrador',
          detalles: `Plaza asignada a ${empleadoNombre}`,
        }),
      })
    } catch {}
    return { success: true, data, message: `Empleado asignado a plaza` }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function desocuparPlaza(plazaId) {
  try {
    const data = await api(`/plazas/${plazaId}`, {
      method: 'PUT',
      body: JSON.stringify({
        estado: 'vacante',
        empleado_id: null,
        fecha_ocupacion: null,
      }),
    })
    try {
      await api('/estructuraOrg/historial', {
        method: 'POST',
        body: JSON.stringify({
          fecha: new Date().toISOString(),
          accion: 'Plaza desocupada',
          usuario: 'Administrador',
          detalles: `Plaza desocupada`,
        }),
      })
    } catch {}
    return { success: true, data, message: `Plaza ahora está vacante` }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function obtenerEstadisticas() {
  try {
    const res = await obtenerPlazas()
    if (!res.success) return res
    const plazas = res.data
    const porEstado = {}
    const porDepartamento = {}
    const totalSalario = plazas.reduce((sum, p) => sum + (Number(p.salario) || 0), 0)
    plazas.forEach((p) => {
      porEstado[p.estado] = (porEstado[p.estado] || 0) + 1
      porDepartamento[p.departamentoCodigo] = (porDepartamento[p.departamentoCodigo] || 0) + 1
    })
    return {
      success: true,
      data: {
        total: plazas.length,
        vacantes: porEstado['vacante'] || 0,
        ocupadas: porEstado['ocupada'] || 0,
        suspendidas: porEstado['suspendida'] || 0,
        porEstado,
        porDepartamento,
        totalSalarioPresupuestado: totalSalario,
      },
    }
  } catch (e) {
    return { success: false, error: e.message, data: {} }
  }
}

async function obtenerOrganigrama() {
  try {
    const res = await obtenerDatos()
    if (!res.success) return res
    const plazas = res.data.plazas || []
    return {
      success: true,
      data: plazas.reduce((acc, p) => {
        const depto = acc.find((d) => d.id === p.departamentoCodigo)
        if (depto) {
          depto.plazas.push(p)
          depto.totalPlazas++
          if (p.estado === 'ocupada') depto.plazasOcupadas++
          if (p.estado === 'vacante') depto.plazasVacantes++
        } else {
          acc.push({
            id: p.departamentoCodigo,
            nombre: p.departamentoCodigo,
            plazas: [p],
            totalPlazas: 1,
            plazasOcupadas: p.estado === 'ocupada' ? 1 : 0,
            plazasVacantes: p.estado === 'vacante' ? 1 : 0,
          })
        }
        return acc
      }, []),
    }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

function inicializar() {
  return { success: true, message: 'Inicialización manejada por el backend' }
}

export const estructuraOrgService = {
  inicializar,
  obtenerDatos,
  solicitarPlaza,
  obtenerSolicitudesPlaza,
  actualizarSolicitudPlaza,
  obtenerPlazas,
  obtenerPlazasPorDepartamento,
  obtenerPlazasVacantes,
  obtenerPlazaPorId,
  obtenerPlazaPorCodigo,
  crearPlaza,
  actualizarPlaza,
  eliminarPlaza,
  asignarEmpleadoAPlaza,
  desocuparPlaza,
  obtenerEstadisticas,
  obtenerOrganigrama,
}

export default estructuraOrgService
