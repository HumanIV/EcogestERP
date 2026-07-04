import React from 'react'
import { CButton, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'

/**
 * Header unificado para todos los módulos de RRHH.
 * Reemplaza los 3 estilos inconsistentes actuales (gradient inline, CCardHeader, div).
 *
 * Props:
 *   icon      - Icono de CoreUI (cilUser, cilPeople, etc.)
 *   title     - Título principal del módulo
 *   subtitle  - Subtítulo descriptivo (opcional)
 *   badge     - Número o texto en badge verde (opcional)
 *   actions   - Array de objetos { label, icon, color, onClick, disabled } para botones derechos
 */
const RrhhPageHeader = ({ icon, title, subtitle, badge, actions = [] }) => {
  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div className="d-flex align-items-center gap-2">
        <div className="bg-eco-soft rounded-circle p-2">
          <CIcon icon={icon} className="text-eco" />
        </div>
        <div>
          <h1 className="h4 fw-bold text-montserrat mb-0">
            {title}
            {badge !== undefined && badge !== null && (
              <CBadge color="success" className="badge-eco ms-2">
                {badge}
              </CBadge>
            )}
          </h1>
          {subtitle && <small className="text-minec-muted">{subtitle}</small>}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="d-flex gap-2 flex-wrap">
          {actions.map((action, i) => (
            <CButton
              key={i}
              size="sm"
              color={action.color || 'success'}
              variant={action.variant || undefined}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <CIcon icon={action.icon} className="me-2" />}
              {action.label}
            </CButton>
          ))}
        </div>
      )}
    </div>
  )
}

export default RrhhPageHeader
