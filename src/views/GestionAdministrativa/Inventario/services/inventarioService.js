import { api } from '../../../../services/api'

const ACTIVOS_PATH = '/activos'
const MOVIMIENTOS_PATH = '/movimientos'
const ALERTAS_PATH = '/alertas'

async function obtenerInventario() {
  try {
    const [activos, movimientos, alertas] = await Promise.all([
      api(ACTIVOS_PATH),
      api(MOVIMIENTOS_PATH),
      api(ALERTAS_PATH),
    ])
    return { success: true, data: { activos, movimientos, alertas } }
  } catch (e) {
    return { success: false, error: e.message, data: { activos: [], movimientos: [], alertas: [] } }
  }
}

async function obtenerActivos() {
  try {
    const data = await api(ACTIVOS_PATH)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

async function obtenerActivoPorId(id) {
  try {
    const data = await api(`${ACTIVOS_PATH}/${id}`)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Activo no encontrado' }
  }
}

async function crearActivo(activoData) {
  try {
    const nuevoActivo = {
      nombre: activoData.nombre,
      codigo: activoData.codigo,
      categoria: activoData.categoria,
      marca: activoData.marca || null,
      modelo: activoData.modelo || null,
      serial: activoData.serial || null,
      estado: activoData.estado || 'Disponible',
      ubicacion: activoData.ubicacion,
      valor_compra: activoData.valorCompra ? parseFloat(activoData.valorCompra) : null,
      valor_actual: activoData.valorActual ? parseFloat(activoData.valorActual) : (activoData.valorCompra ? parseFloat(activoData.valorCompra) : null),
      fecha_registro: activoData.fechaRegistro || new Date().toISOString().split('T')[0],
      fecha_adquisicion: activoData.fechaAdquisicion || null,
      cantidad: activoData.cantidad || 1,
      proveedor_id: activoData.proveedorId ? parseInt(activoData.proveedorId, 10) : null
    }
    const data = await api(ACTIVOS_PATH, { method: 'POST', body: JSON.stringify(nuevoActivo) })

    const nuevoMovimiento = {
      tipo: 'Asignacion',
      activo_id: data.id,
      activo_nombre: nuevoActivo.nombre,
      codigo_activo: nuevoActivo.codigo,
      cantidad: 1,
      ubicacion_origen: 'Nuevo Ingreso',
      ubicacion_destino: nuevoActivo.ubicacion,
      motivo: 'Alta de nuevo activo',
      usuario: 'Administrador',
      fecha: new Date().toISOString(),
      referencia: 'ALTA-ACTIVO',
    }
    await api(MOVIMIENTOS_PATH, { method: 'POST', body: JSON.stringify(nuevoMovimiento) })

    return { success: true, data, message: 'Activo creado exitosamente' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function actualizarActivo(id, datosActualizados) {
  try {
    const actual = await api(`${ACTIVOS_PATH}/${id}`)
    
    // Map camelCase fields to snake_case for the update
    const updatePayload = {
      ...actual,
      nombre: datosActualizados.nombre !== undefined ? datosActualizados.nombre : actual.nombre,
      codigo: datosActualizados.codigo !== undefined ? datosActualizados.codigo : actual.codigo,
      categoria: datosActualizados.categoria !== undefined ? datosActualizados.categoria : actual.categoria,
      marca: datosActualizados.marca !== undefined ? datosActualizados.marca : actual.marca,
      modelo: datosActualizados.modelo !== undefined ? datosActualizados.modelo : actual.modelo,
      estado: datosActualizados.estado !== undefined ? datosActualizados.estado : actual.estado,
      ubicacion: datosActualizados.ubicacion !== undefined ? datosActualizados.ubicacion : actual.ubicacion,
      valor_compra: datosActualizados.valorCompra !== undefined ? (datosActualizados.valorCompra ? parseFloat(datosActualizados.valorCompra) : null) : actual.valor_compra,
      valor_actual: datosActualizados.valorActual !== undefined ? (datosActualizados.valorActual ? parseFloat(datosActualizados.valorActual) : null) : actual.valor_actual,
      proveedor_id: datosActualizados.proveedorId !== undefined ? (datosActualizados.proveedorId ? parseInt(datosActualizados.proveedorId, 10) : null) : actual.proveedor_id,
    }

    const data = await api(`${ACTIVOS_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    })
    return { success: true, data, message: 'Activo actualizado exitosamente' }
  } catch (e) {
    return { success: false, error: 'Activo no encontrado o error en actualizacion' }
  }
}

async function eliminarActivo(id) {
  try {
    await api(`${ACTIVOS_PATH}/${id}`, { method: 'DELETE' })
    return { success: true, message: 'Activo eliminado exitosamente' }
  } catch (e) {
    return { success: false, error: 'Activo no encontrado' }
  }
}

async function registrarMovimiento(movimientoData) {
  try {
    const nuevoMovimiento = {
      tipo: movimientoData.tipo,
      activo_id: movimientoData.activoId ? parseInt(movimientoData.activoId, 10) : null,
      activo_nombre: movimientoData.activoNombre || '',
      codigo_activo: movimientoData.codigoActivo || '',
      cantidad: movimientoData.cantidad || 1,
      ubicacion_origen: movimientoData.ubicacionOrigen,
      ubicacion_destino: movimientoData.ubicacionDestino,
      motivo: movimientoData.motivo,
      usuario: movimientoData.usuario || 'Administrador',
      fecha: movimientoData.fecha || new Date().toISOString(),
      referencia: movimientoData.referencia,
      cuadrilla_id: movimientoData.cuadrillaId ? parseInt(movimientoData.cuadrillaId, 10) : null
    }
    const data = await api(MOVIMIENTOS_PATH, { method: 'POST', body: JSON.stringify(nuevoMovimiento) })
    return { success: true, data, message: 'Movimiento registrado' }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function obtenerMovimientos() {
  try {
    const data = await api(MOVIMIENTOS_PATH)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

async function obtenerAlertas() {
  try {
    const data = await api(ALERTAS_PATH)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e.message, data: [] }
  }
}

async function obtenerEstadisticas() {
  try {
    const [activos, movimientos, alertas] = await Promise.all([
      api(ACTIVOS_PATH),
      api(MOVIMIENTOS_PATH),
      api(ALERTAS_PATH),
    ])
    return {
      success: true,
      data: {
        totalActivos: activos.length,
        valorTotalActivos: activos.reduce((sum, a) => sum + (a.valorActual || 0), 0),
        activosEnUso: activos.filter((a) => a.estado === 'En Uso').length,
        activosMantenimiento: activos.filter((a) => a.estado === 'En Mantenimiento').length,
        totalMovimientos: movimientos.length,
        totalAlertas: alertas.length,
      },
    }
  } catch (e) {
    return { success: false, error: e.message, data: {} }
  }
}

export const inventarioService = {
  obtenerInventario,
  obtenerActivos,
  obtenerActivoPorId,
  crearActivo,
  actualizarActivo,
  eliminarActivo,
  registrarMovimiento,
  obtenerMovimientos,
  obtenerAlertas,
  obtenerEstadisticas,
}

export default inventarioService
