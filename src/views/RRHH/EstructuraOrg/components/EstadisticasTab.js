import React from 'react'
import { CRow, CCol, CCard, CCardBody, CBadge, CProgress } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBriefcase, cilCheckCircle, cilUser } from '@coreui/icons'
import { DEPARTAMENTOS_OFICIALES } from '../constants/estructuraConstants'

const EstadisticasTab = ({ estadisticas }) => {
  if (!estadisticas) return null

  const stats = [
    {
      label: 'Total Plazas',
      value: estadisticas.total,
      icon: cilBriefcase,
      color: '#0ea5e9', // Sky blue
      bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05))',
    },
    {
      label: 'Vacantes',
      value: estadisticas.vacantes,
      icon: cilCheckCircle,
      color: '#10b981', // Emerald green
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
    },
    {
      label: 'Ocupadas',
      value: estadisticas.ocupadas,
      icon: cilUser,
      color: '#8b5cf6', // Purple
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
    },
  ]

  return (
    <>
      <CRow className="g-3 mb-4">
        {stats.map((stat, i) => (
          <CCol xs={12} sm={6} md={4} key={i}>
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
                
                <div className="d-flex align-items-center justify-content-between mb-2 position-relative z-1">
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
                
                <div className="position-relative z-1 mt-3">
                  <h6 className="text-muted fw-semibold mb-0">{stat.label}</h6>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CCard className="border-0 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
        <CCardBody className="p-4">
          <h5 className="fw-bolder mb-4 pb-3 border-bottom" style={{ color: '#0f172a' }}>
            Distribución por Departamento
          </h5>
          <CRow className="g-3">
            {DEPARTAMENTOS_OFICIALES.map((depto) => {
              const total = estadisticas.porDepartamento?.[depto.id] || 0
              const pct =
                estadisticas.total > 0 ? Math.round((total / estadisticas.total) * 100) : 0
              return (
                <CCol xs={12} sm={6} md={4} lg={3} key={depto.id}>
                  <div className="p-3 h-100 d-flex flex-column" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <strong className="small text-truncate" style={{ color: '#334155' }} title={depto.nombre}>
                        {depto.nombre}
                      </strong>
                      <span className="badge rounded-pill" style={{ background: '#3b82f6', color: 'white' }}>
                        {total}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <div className="exp-progress-wrapper mb-2" style={{ height: '6px' }}>
                        <div 
                          className="exp-progress-bar" 
                          style={{ width: `${pct}%`, background: '#3b82f6' }}
                        />
                      </div>
                      <small className="text-muted fw-medium">{pct}% del total</small>
                    </div>
                  </div>
                </CCol>
              )
            })}
          </CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default EstadisticasTab
