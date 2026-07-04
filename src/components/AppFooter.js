import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  const year = new Date().getFullYear()

  return (
    <CFooter className="px-4">
      <div>
        <span className="fw-medium" style={{ color: 'var(--eco-700)' }}>ECOGEST</span>
        <span className="ms-1 text-muted">© {year} Ministerio del Ecosocialismo.</span>
      </div>
      <div className="ms-auto">
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          Sistema de Gestión Administrativa v1.0.0
        </span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
