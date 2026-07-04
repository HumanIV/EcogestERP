import { api } from './api'

const PATH = '/auditLog'

async function obtenerTodos() {
  try {
    const data = await api(PATH)
    return data
  } catch {
    return []
  }
}

export async function registrarAccion({
  moduloOrigen,
  moduloDestino,
  entidad,
  entidadId,
  accion,
  estadoAnterior = null,
  estadoNuevo = null,
  detalles = '',
}) {
  let usuario = 'Administrador'
  try {
    const user = JSON.parse(localStorage.getItem('usuarioActual') || '{}')
    usuario = user.nombre || user.username || 'Administrador'
  } catch {}

  const entry = {
    timestamp: new Date().toISOString(),
    usuario,
    moduloOrigen: moduloOrigen || 'Sistema',
    moduloDestino: moduloDestino || 'Sistema',
    entidad,
    entidadId,
    accion,
    estadoAnterior,
    estadoNuevo,
    detalles,
  }

  try {
    await api(PATH, { method: 'POST', body: JSON.stringify(entry) })
  } catch {}

  return entry
}

export async function obtenerLog(filtros = {}) {
  let entries = await obtenerTodos()
  if (filtros.moduloOrigen) entries = entries.filter((e) => e.moduloOrigen === filtros.moduloOrigen)
  if (filtros.moduloDestino) entries = entries.filter((e) => e.moduloDestino === filtros.moduloDestino)
  if (filtros.entidad) entries = entries.filter((e) => e.entidad === filtros.entidad)
  if (filtros.entidadId) entries = entries.filter((e) => String(e.entidadId) === String(filtros.entidadId))
  if (filtros.accion) entries = entries.filter((e) => e.accion === filtros.accion)
  if (filtros.usuario) entries = entries.filter((e) => e.usuario.toLowerCase().includes(filtros.usuario.toLowerCase()))
  if (filtros.fechaDesde) entries = entries.filter((e) => e.timestamp >= filtros.fechaDesde)
  if (filtros.fechaHasta) entries = entries.filter((e) => e.timestamp <= filtros.fechaHasta)
  return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function obtenerHistorialEntidad(entidad, entidadId) {
  return obtenerLog({ entidad, entidadId })
}

export function exportarLogCSV(entries) {
  const headers = ['Fecha', 'Usuario', 'Módulo Origen', 'Módulo Destino', 'Entidad', 'ID Entidad', 'Acción', 'Detalles']
  const rows = entries.map((e) => [e.timestamp, e.usuario, e.moduloOrigen, e.moduloDestino, e.entidad, e.entidadId, e.accion, e.detalles])
  const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export async function obtenerEstadisticasLog() {
  const entries = await obtenerTodos()
  const porAccion = {}
  const porEntidad = {}
  const porModulo = {}
  const porUsuario = {}
  entries.forEach((e) => {
    porAccion[e.accion] = (porAccion[e.accion] || 0) + 1
    porEntidad[e.entidad] = (porEntidad[e.entidad] || 0) + 1
    porModulo[e.moduloOrigen] = (porModulo[e.moduloOrigen] || 0) + 1
    porUsuario[e.usuario] = (porUsuario[e.usuario] || 0) + 1
  })
  return {
    total: entries.length,
    porAccion,
    porEntidad,
    porModulo,
    porUsuario,
    ultimaAccion: entries.length > 0 ? entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] : null,
  }
}

export const AuditLogService = {
  registrarAccion,
  obtenerLog,
  obtenerHistorialEntidad,
  exportarLogCSV,
  obtenerEstadisticasLog,
}

export default AuditLogService
