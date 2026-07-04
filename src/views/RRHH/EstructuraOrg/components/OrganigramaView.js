import React, { useState, useMemo } from 'react'
import { CRow, CCol, CCard, CCardBody, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilBriefcase, cilBuilding, cilChevronBottom, cilChevronTop } from '@coreui/icons'
import { resolverDepto } from '../constants/estructuraConstants'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const MAX_DOTS = 12
const DOT_SIZE = 8
const DOT_GAP = 3

const OrganigramaView = ({ plazas, onEmployeeClick }) => {
  const [expandedDeptos, setExpandedDeptos] = useState({})

  const toggleDepto = (id) => {
    setExpandedDeptos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const departamentosConPlazas = useMemo(() => {
    const agrupadas = {}
    plazas.forEach((p) => {
      const code = p.departamentoCodigo
      if (!code) return
      if (!agrupadas[code]) {
        const depto = resolverDepto(code)
        agrupadas[code] = {
          id: code,
          nombre: depto.nombre,
          nivel: depto.nivel,
          plazas: [],
        }
      }
      agrupadas[code].plazas.push(p)
    })
    return Object.values(agrupadas).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [plazas])

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-bolder text-eco d-flex align-items-center mb-0" style={{ color: '#0f172a' }}>
          <div 
            className="d-flex align-items-center justify-content-center rounded-circle me-3"
            style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)' }}
          >
            <CIcon icon={cilBriefcase} className="text-primary" />
          </div>
          Organigrama por Departamento
        </h5>
        <span className="badge rounded-pill fw-medium" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.85rem', padding: '0.5em 1em' }}>
          {departamentosConPlazas.length} departamentos
        </span>
      </div>

      {departamentosConPlazas.length === 0 ? (
        <div className="text-center py-5 text-muted d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px', background: '#f8fafc', borderRadius: '16px' }}>
          No hay plazas registradas
        </div>
      ) : (
        <CRow className="g-4">
          {departamentosConPlazas.map((depto) => {
            const plazasDepto = depto.plazas
            const ocupadas = plazasDepto.filter((p) => p.estado === 'ocupada').length
            const vacantes = plazasDepto.filter((p) => p.estado === 'vacante').length
            const total = plazasDepto.length
            const dotsUsed = Math.min(total, MAX_DOTS)
            const expanded = expandedDeptos[depto.id] || false
            const isFull = ocupadas === total

            return (
              <CCol xs={12} md={6} xl={4} key={depto.id}>
                <div
                  className="h-100 exp-card bg-white"
                  style={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div
                    style={{
                      height: '4px',
                      background: isFull 
                        ? 'linear-gradient(90deg, #10b981, #34d399)' // Green if full
                        : 'linear-gradient(90deg, #3b82f6, #60a5fa)', // Blue otherwise
                    }}
                  />

                  <div className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                        style={{
                          width: '48px',
                          height: '48px',
                          background: isFull ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        }}
                      >
                        <CIcon
                          icon={cilBuilding}
                          style={{ 
                            fontSize: '1.5rem', 
                            color: isFull ? '#10b981' : '#3b82f6' 
                          }}
                        />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6
                          className="fw-bold mb-1 text-truncate"
                          style={{ fontSize: '1.05rem', color: '#1e293b' }}
                        >
                          {depto.nombre}
                        </h6>
                        {depto.nivel && (
                          <span className="badge rounded-pill fw-medium" style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.7rem' }}>
                            Nivel {depto.nivel}
                          </span>
                        )}
                      </div>
                      <span
                        className="badge rounded-pill fw-bold flex-shrink-0 ms-2 shadow-sm"
                        style={{ background: '#0f172a', color: 'white', fontSize: '0.8rem' }}
                      >
                        {total}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-2">
                      {Array.from({ length: dotsUsed }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: DOT_SIZE,
                            height: DOT_SIZE,
                            borderRadius: '50%',
                            backgroundColor: i < ocupadas ? '#10b981' : '#f59e0b',
                            flexShrink: 0,
                            marginRight: DOT_GAP,
                            opacity: i < ocupadas ? 1 : 0.4,
                          }}
                        />
                      ))}
                      {total > MAX_DOTS && (
                        <small className="ms-1 fw-bold" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          +{total - MAX_DOTS}
                        </small>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="fw-bold" style={{ fontSize: '0.8rem', color: '#10b981' }}>
                        {ocupadas} ocupadas
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        •
                      </span>
                      <span className="fw-bold" style={{ fontSize: '0.8rem', color: '#f59e0b' }}>
                        {vacantes} vacantes
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between pt-3"
                      style={{
                        cursor: 'pointer',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#64748b',
                        transition: 'color 0.2s ease'
                      }}
                      onClick={() => toggleDepto(depto.id)}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      <span>
                        Ver {total} {total === 1 ? 'plaza' : 'plazas'}
                      </span>
                      <CIcon
                        icon={expanded ? cilChevronTop : cilChevronBottom}
                        size="sm"
                      />
                    </div>

                    {expanded && (
                      <div className="d-flex flex-column mt-3">
                        {plazasDepto.map((p, idx) => (
                          <div
                            key={p.id}
                            className="d-flex align-items-center py-2 px-2 rounded hover-lift mb-1"
                            style={{
                              background: p.estado === 'ocupada' ? '#f8fafc' : '#fffbeb',
                              transition: 'all 0.2s ease',
                              cursor: p.estado === 'ocupada' ? 'pointer' : 'default'
                            }}
                            onClick={() => p.estado === 'ocupada' && onEmployeeClick && onEmployeeClick(p.empleadoId)}
                          >
                            <div
                              className="d-flex align-items-center justify-content-center rounded flex-shrink-0 me-3"
                              style={{
                                width: '32px',
                                height: '32px',
                                background: p.estado === 'ocupada' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              }}
                            >
                              {p.empleadoId ? (
                                <CIcon icon={cilUser} size="sm" style={{ color: '#3b82f6' }} />
                              ) : (
                                <span className="fw-bold text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                              )}
                            </div>
                            <div className="flex-grow-1 min-w-0 lh-sm">
                              <div
                                className="fw-bold text-truncate"
                                style={{ fontSize: '0.85rem', color: '#334155' }}
                              >
                                {p.cargo}
                              </div>
                              <div className="fw-medium text-truncate mt-1" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                ID: {p.codigo}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ms-2">
                              <RrhhBadgeEstado estado={p.estado} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CCol>
            )
          })}
        </CRow>
      )}
    </>
  )
}

export default OrganigramaView
