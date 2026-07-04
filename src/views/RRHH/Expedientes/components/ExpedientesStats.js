import React from 'react'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFolder, cilCheckCircle, cilWarning, cilFolderOpen } from '@coreui/icons'

const ExpedientesStats = ({ expedientes, empleados, sinExpediente = 0 }) => {
  const total = expedientes?.length || 0
  const completos = expedientes?.filter((e) => e.estadoExp === 'Completo').length || 0
  const enRevision = expedientes?.filter((e) => e.estadoExp === 'En revisión').length || 0
  const incompletos = expedientes?.filter((e) => e.estadoExp === 'Incompleto').length || 0

  const stats = [
    {
      label: 'Total Expedientes',
      value: total,
      icon: cilFolder,
      color: '#0ea5e9', // Sky blue
      bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))',
    },
    {
      label: 'Completos',
      value: completos,
      icon: cilCheckCircle,
      color: '#10b981', // Emerald green
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
    },
    {
      label: 'Pendientes',
      value: incompletos + enRevision,
      icon: cilWarning,
      color: '#f59e0b', // Amber
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
    },
    {
      label: 'Sin expediente',
      value: sinExpediente,
      icon: cilFolderOpen,
      color: '#ef4444', // Red
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
    },
  ]

  const getProgressPercent = (value) => {
    const base = expedientes.length + sinExpediente
    return base > 0 ? Math.round((value / base) * 100) : 0
  }

  return (
    <CRow className="g-3">
      {stats.map((stat, i) => {
        const pct = getProgressPercent(stat.value)
        return (
          <CCol xs={12} sm={6} lg={3} key={i}>
            <CCard 
              className="border-0 h-100 position-relative overflow-hidden" 
              style={{ 
                background: stat.bgGradient,
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
            >
              <CCardBody className="p-4">
                {/* Background Floating Icon */}
                <CIcon 
                  icon={stat.icon} 
                  className="position-absolute"
                  style={{ 
                    top: '-15%', 
                    right: '-10%', 
                    width: '120px', 
                    height: '120px', 
                    opacity: 0.08, 
                    color: stat.color,
                    transform: 'rotate(-15deg)'
                  }} 
                />
                
                <div className="d-flex align-items-center justify-content-between mb-3 position-relative z-1">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      color: stat.color,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <CIcon icon={stat.icon} size="xl" />
                  </div>
                  <h2 className="mb-0 fw-bolder" style={{ color: stat.color, fontSize: '2rem' }}>
                    {stat.value}
                  </h2>
                </div>
                
                <div className="position-relative z-1">
                  <h6 className="text-muted fw-semibold mb-2">{stat.label}</h6>
                  {/* Premium Progress Bar */}
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: stat.color,
                        borderRadius: '10px',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        )
      })}
    </CRow>
  )
}

export default ExpedientesStats
