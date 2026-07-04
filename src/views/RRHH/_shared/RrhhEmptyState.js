import React from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilPlus } from '@coreui/icons'

/**
 * Estado vacío reutilizable para tablas y listas en RRHH.
 *
 * Props:
 *   icon        - Icono de CoreUI (default: cilUser)
 *   title       - Título principal (default: 'Sin resultados')
 *   message     - Mensaje descriptivo (default: 'No hay datos registrados')
 *   actionLabel - Texto del botón de acción (opcional, ej: 'Crear nuevo')
 *   onAction    - Handler del botón de acción
 *
 * Uso:
 *   <RrhhEmptyState
 *     icon={cilUser}
 *     title="No se encontraron empleados"
 *     message="Intenta con otros filtros"
 *     actionLabel="Nuevo Empleado"
 *     onAction={abrirModalCrear}
 *   />
 */
const RrhhEmptyState = ({
  icon = cilUser,
  title = 'Sin resultados',
  message = 'No hay datos registrados',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-5">
      <div className="bg-eco-soft rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3">
        <CIcon icon={icon} size="xl" className="text-eco" />
      </div>
      <h5 className="text-eco mb-2">{title}</h5>
      <p className="text-muted mb-3">{message}</p>
      {actionLabel && onAction && (
        <CButton color="success" onClick={onAction}>
          <CIcon icon={cilPlus} className="me-1" />
          {actionLabel}
        </CButton>
      )}
    </div>
  )
}

export default RrhhEmptyState
