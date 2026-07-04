import React from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilListRich, cilClock, cilCheckCircle, cilXCircle, cilInfo } from '@coreui/icons'

const SolicitudesStats = ({ estadisticas }) => {
  const {
    total = 0,
    pendientes = 0,
    enRevision = 0,
    aprobadas = 0,
    rechazadas = 0,
  } = estadisticas || {}

  const stats = [
    {
      label: 'Total',
      value: total,
      icon: cilListRich,
      color: '#0ea5e9', // Sky blue
      bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))',
    },
    {
      label: 'Pendientes',
      value: pendientes,
      icon: cilClock,
      color: '#f59e0b', // Amber
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
    },
    {
      label: 'En Revisión',
      value: enRevision,
      icon: cilInfo,
      color: '#8b5cf6', // Purple
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
    },
    {
      label: 'Aprobadas',
      value: aprobadas,
      icon: cilCheckCircle,
      color: '#10b981', // Emerald green
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
    },
    {
      label: 'Rechazadas',
      value: rechazadas,
      icon: cilXCircle,
      color: '#ef4444', // Red
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
    },
  ]

  return (
    <CRow className="g-3 mb-4">
      {stats.map((stat, i) => (
        <CCol xs={12} sm={6} md key={i}>
          <CCard 
            className="border-0 h-100 position-relative overflow-hidden" 
            style={{ 
              background: stat.bgGradient,
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}
          >
            <CCardBody className="p-3 p-md-4">
              {/* Background Floating Icon */}
              <CIcon 
                icon={stat.icon} 
                className="position-absolute"
                style={{ 
                  top: '-15%', 
                  right: '-10%', 
                  width: '100px', 
                  height: '100px', 
                  opacity: 0.08, 
                  color: stat.color,
                  transform: 'rotate(-15deg)'
                }} 
              />
              
              <div className="d-flex align-items-center justify-content-between mb-2 position-relative z-1">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '42px',
                    height: '42px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: stat.color,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <CIcon icon={stat.icon} size="lg" />
                </div>
                <h2 className="mb-0 fw-bolder" style={{ color: stat.color, fontSize: '1.75rem' }}>
                  {stat.value}
                </h2>
              </div>
              
              <div className="position-relative z-1 mt-3">
                <h6 className="text-muted fw-semibold mb-0" style={{ fontSize: '0.85rem' }}>
                  {stat.label}
                </h6>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

export default SolicitudesStats
