import React from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilCalendar, cilGroup, cilInbox } from '@coreui/icons'

const PanelStats = ({ stats }) => {
  const {
    empleadosActivos = 0,
    permisosPendientes = 0,
    cuadrillasActivas = 0,
    solicitudesMes = 0,
  } = stats || {}

  const cards = [
    {
      label: 'Empleados Activos',
      value: empleadosActivos,
      icon: cilPeople,
      bg: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      shadow: '0 10px 20px -5px rgba(14, 165, 233, 0.3)',
      iconColor: '#0ea5e9',
      sub: 'Total en nómina',
    },
    {
      label: 'Permisos Pendientes',
      value: permisosPendientes,
      icon: cilCalendar,
      bg: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      shadow: '0 10px 20px -5px rgba(245, 158, 11, 0.3)',
      iconColor: '#f59e0b',
      sub: 'Por aprobar',
    },
    {
      label: 'Cuadrillas Activas',
      value: cuadrillasActivas,
      icon: cilGroup,
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)',
      iconColor: '#10b981',
      sub: 'Equipos de campo',
    },
    {
      label: 'Solicitudes del Mes',
      value: solicitudesMes,
      icon: cilInbox,
      bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      shadow: '0 10px 20px -5px rgba(139, 92, 246, 0.3)',
      iconColor: '#8b5cf6',
      sub: 'Este mes',
    },
  ]

  return (
    <CRow className="mb-4 g-4">
      {cards.map((card, i) => (
        <CCol xs={12} sm={6} xl={3} key={i}>
          <CCard
            className="exp-card border-0 h-100 overflow-hidden"
            style={{
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            }}
          >
            <CCardBody className="p-4 position-relative">
              {/* Ícono de fondo (Marca de agua) */}
              <div
                className="position-absolute"
                style={{
                  top: '-15%',
                  right: '-10%',
                  opacity: 0.08,
                  transform: 'rotate(-15deg)',
                  pointerEvents: 'none',
                }}
              >
                <CIcon icon={card.icon} size="9xl" style={{ color: card.iconColor }} />
              </div>

              <div className="d-flex align-items-start justify-content-between position-relative z-1 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: card.bg,
                    boxShadow: card.shadow,
                  }}
                >
                  <CIcon icon={card.icon} size="xl" />
                </div>
              </div>

              <div className="position-relative z-1 mt-4">
                <h2
                  className="fw-bolder mb-1"
                  style={{ fontSize: '2.5rem', color: '#1e293b', lineHeight: 1 }}
                >
                  {card.value}
                </h2>
                <div className="fw-medium" style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  {card.label}
                </div>
                <div className="mt-2 text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  {card.sub}
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

export default PanelStats
