/**
 * Mapa unificado de colores por estado para todo el módulo RRHH.
 * Cada componente importa de aquí en vez de definir su propio getEstadoColor().
 *
 * Uso:
 *   import { COLOR_ESTADO } from '_shared/estadosColores'
 *   <CBadge color={COLOR_ESTADO[estado] || 'secondary'}>{estado}</CBadge>
 */

export const COLOR_ESTADO = {
  // Estados de empleado
  Activo: 'success',
  Vacaciones: 'warning',
  'Reposo médico': 'info',
  Suspendido: 'danger',
  Jubilado: 'secondary',
  Baja: 'dark',

  // Estados de solicitud
  Pendiente: 'warning',
  'En revisión': 'info',
  Aprobada: 'success',
  Rechazada: 'danger',

  // Estados de expediente
  Completo: 'success',
  Incompleto: 'danger',

  // Estados de plaza
  vacante: 'warning',
  ocupada: 'success',
  suspendida: 'secondary',
  eliminada: 'danger',
}

/**
 * Devuelve el color CoreUI para un estado dado.
 * Si el estado no está en el mapa, retorna 'secondary'.
 */
export function getEstadoColor(estado) {
  return COLOR_ESTADO[estado] || 'secondary'
}
