import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CProgress,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilSync,
  cilCalendar,
  cilUser,
  cilDescription,
  cilChevronBottom,
  cilChevronTop,
  cilSettings
} from '@coreui/icons'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const PRIORIDAD_COLORS = {
  Baja: 'secondary',
  Media: 'info',
  Alta: 'warning',
  Urgente: 'danger',
}

const PanelProcesos = ({ solicitudes, empleados }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [expandedSolId, setExpandedSolId] = useState(null)

  const getEmpleado = (nombre) => empleados.find((e) => e.nombre === nombre)

  const tipos = [...new Set(solicitudes.map((s) => s.tipo).filter(Boolean))].sort()

  const filtered = solicitudes.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      s.empleadoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || s.estado === statusFilter
    const matchesTipo = !tipoFilter || s.tipo === tipoFilter
    return matchesSearch && matchesStatus && matchesTipo
  })

  const handleToggleDetail = (sol) => {
    setExpandedSolId(expandedSolId === sol.id ? null : sol.id)
  }

  const getEmpleadoName = (sol) => {
    const emp = getEmpleado(sol.empleadoNombre)
    return emp ? emp.nombre : sol.empleadoNombre || 'Sin asignar'
  }

  const getEmpleadoCargo = (sol) => {
    const emp = getEmpleado(sol.empleadoNombre)
    return emp?.cargo || ''
  }

  // Resumen estadístico
  const totalSolicitudes = solicitudes.length
  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length
  const aprobadas = solicitudes.filter((s) => s.estado === 'Aprobada').length
  const rechazadas = solicitudes.filter((s) => s.estado === 'Rechazada').length

  const resumenCards = [
    {
      label: 'Total Solicitudes',
      value: totalSolicitudes,
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.1)',
      icon: cilDescription,
    },
    {
      label: 'Pendientes',
      value: pendientes,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: cilCalendar,
    },
    {
      label: 'Aprobadas',
      value: aprobadas,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: cilDescription,
    },
    {
      label: 'Rechazadas',
      value: rechazadas,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: cilDescription,
    },
  ]

  return (
    <div className="fade-in">
      {/* Resumen de Procesos — 4 tarjetas compactas */}
      <CRow className="g-3 mb-4">
        {resumenCards.map((card, i) => (
          <CCol xs={6} md={3} key={i}>
            <div 
              className="exp-card h-100 bg-white p-3"
              style={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', background: card.bg, color: card.color }}
                >
                  <CIcon icon={card.icon} size="lg" />
                </div>
                <div className="flex-grow-1">
                  <div className="h3 fw-bolder mb-0" style={{ color: '#1e293b', lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <small className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                    {card.label}
                  </small>
                </div>
              </div>
              <CProgress
                value={totalSolicitudes > 0 ? Math.round((card.value / totalSolicitudes) * 100) : 0}
                style={{ height: '6px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}
                color={i === 0 ? 'info' : i === 1 ? 'warning' : i === 2 ? 'success' : 'danger'}
              />
              <small className="text-muted mt-2 d-block fw-medium" style={{ fontSize: '0.7rem' }}>
                {totalSolicitudes > 0
                  ? `${Math.round((card.value / totalSolicitudes) * 100)}% del total`
                  : 'Sin datos'}
              </small>
            </div>
          </CCol>
        ))}
      </CRow>

      {/* Tabla de Procesos */}
      <div 
        className="exp-card bg-white p-4"
        style={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 pb-3 border-bottom">
          <h5 className="fw-bolder mb-0 d-flex align-items-center" style={{ color: '#1e293b' }}>
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle me-3" 
              style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}
            >
              <CIcon icon={cilSettings} size="sm" />
            </div>
            Gestión de Procesos
          </h5>
          <span className="badge rounded-pill fw-medium" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.5em 1em' }}>
            {filtered.length} de {totalSolicitudes} registros
          </span>
        </div>

        {/* Filtros */}
        <CRow className="g-3 mb-4">
          <CCol xs={12} md={5}>
            <CInputGroup>
              <CInputGroupText className="bg-light border-end-0 text-muted">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por empleado, tipo o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-light border-start-0"
                style={{ boxShadow: 'none' }}
              />
            </CInputGroup>
          </CCol>
          <CCol xs={6} md={3}>
            <CFormSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-light text-dark"
              style={{ boxShadow: 'none', border: '1px solid #dee2e6' }}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </CFormSelect>
          </CCol>
          <CCol xs={6} md={2}>
            <CFormSelect
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="bg-light text-dark"
              style={{ boxShadow: 'none', border: '1px solid #dee2e6' }}
            >
              <option value="">Todos los tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol xs={6} md={2}>
            <CButton
              color="light"
              className="w-100 text-muted border fw-medium"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setTipoFilter('')
              }}
              disabled={!searchTerm && !statusFilter && !tipoFilter}
            >
              <CIcon icon={cilSync} className="me-1" /> Limpiar
            </CButton>
          </CCol>
        </CRow>

        {/* Tabla o vacío */}
        <div className="rounded-4 overflow-hidden" style={{ border: '1px solid #f1f5f9' }}>
          {filtered.length === 0 ? (
            <div className="text-center py-5 bg-light">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
              >
                <CIcon icon={cilDescription} size="xl" />
              </div>
              <h5 className="fw-bolder" style={{ color: '#1e293b' }}>No se encontraron procesos</h5>
              <p className="text-muted fw-medium mb-0">
                {searchTerm || statusFilter || tipoFilter
                  ? 'Intenta con otros filtros.'
                  : 'No hay solicitudes registradas.'}
              </p>
            </div>
          ) : (
            <CTable hover responsive align="middle" className="mb-0 border-0">
              <CTableHead>
                <CTableRow style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3 px-4" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Empleado</CTableHeaderCell>
                  <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tipo</CTableHeaderCell>
                  <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Fechas</CTableHeaderCell>
                  <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Prioridad</CTableHeaderCell>
                  <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3 text-end pe-4"></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filtered.map((sol) => (
                  <React.Fragment key={sol.id}>
                    <CTableRow
                      className="hover-lift"
                      style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      onClick={() => handleToggleDetail(sol)}
                    >
                      <CTableDataCell className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                            style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', fontSize: '1rem' }}
                          >
                            {sol.empleadoNombre?.charAt(0) || <CIcon icon={cilUser} size="sm" />}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1e293b' }}>{getEmpleadoName(sol)}</div>
                            <small className="text-muted fw-medium">{getEmpleadoCargo(sol)}</small>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="py-3">
                        <CBadge color="light" className="text-primary border border-primary-subtle px-2 py-1">
                          {sol.tipo}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="py-3">
                        <div className="d-flex align-items-center">
                          <CIcon icon={cilCalendar} className="text-muted me-2" size="sm" />
                          <div>
                            <div className="fw-medium small text-dark">
                              {(() => {
                                const d =
                                  typeof sol.detalles === 'string'
                                    ? JSON.parse(sol.detalles || '{}')
                                    : sol.detalles || {}
                                return d.fechaInicio
                                  ? `${d.fechaInicio} → ${d.fechaFin}`
                                  : sol.fechaSolicitud || sol.fecha
                              })()}
                            </div>
                            {sol.diasSolicitados > 0 && (
                              <small className="text-muted fw-medium">{sol.diasSolicitados} días</small>
                            )}
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="py-3">
                        <CBadge
                          color={PRIORIDAD_COLORS[sol.prioridad] || 'secondary'}
                          className="px-2 py-1"
                        >
                          {sol.prioridad || 'Media'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="py-3">
                        <RrhhBadgeEstado estado={sol.estado} />
                      </CTableDataCell>
                      <CTableDataCell className="text-end pe-4 py-3">
                        <CButton
                          size="sm"
                          color={expandedSolId === sol.id ? 'primary' : 'light'}
                          className={expandedSolId === sol.id ? '' : 'text-secondary border'}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleDetail(sol)
                          }}
                        >
                          <CIcon
                            icon={expandedSolId === sol.id ? cilChevronTop : cilChevronBottom}
                          />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                    {/* Panel inline de detalle */}
                    {expandedSolId === sol.id && (
                      <CTableRow>
                        <CTableDataCell colSpan={6} className="p-0 border-0">
                          <div className="py-4 px-4" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.05)' }}>
                            <div className="d-flex gap-2 mb-4 flex-wrap">
                              <RrhhBadgeEstado estado={sol.estado} />
                              <CBadge color="primary" className="px-2 py-1">
                                {sol.tipo}
                              </CBadge>
                              <CBadge
                                color={PRIORIDAD_COLORS[sol.prioridad] || 'secondary'}
                                className="px-2 py-1"
                              >
                                {sol.prioridad || 'Media'}
                              </CBadge>
                            </div>
                            <CRow className="g-4 mb-4">
                              <CCol md={6}>
                                <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Empleado</small>
                                <p className="fw-bold mb-0" style={{ color: '#1e293b' }}>{getEmpleadoName(sol)}</p>
                              </CCol>
                              <CCol md={6}>
                                <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Departamento</small>
                                <p className="fw-bold mb-0" style={{ color: '#1e293b' }}>{sol.departamento || 'N/A'}</p>
                              </CCol>
                              <CCol md={6}>
                                <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Fecha de Solicitud</small>
                                <p className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                  {sol.fechaSolicitud || sol.fecha}
                                </p>
                              </CCol>
                              <CCol md={6}>
                                <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Período</small>
                                <p className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                                  {(() => {
                                    const d =
                                      typeof sol.detalles === 'string'
                                        ? JSON.parse(sol.detalles || '{}')
                                        : sol.detalles || {}
                                    return d.fechaInicio && d.fechaFin
                                      ? `${d.fechaInicio} → ${d.fechaFin}`
                                      : 'N/A'
                                  })()}
                                </p>
                              </CCol>
                              {sol.diasSolicitados > 0 && (
                                <CCol md={6}>
                                  <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Días Solicitados</small>
                                  <p className="fw-bold mb-0" style={{ color: '#1e293b' }}>{sol.diasSolicitados}</p>
                                </CCol>
                              )}
                              {sol.fechaRespuesta && (
                                <CCol md={6}>
                                  <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Fecha de Respuesta</small>
                                  <p className="fw-bold mb-0" style={{ color: '#1e293b' }}>{sol.fechaRespuesta}</p>
                                </CCol>
                              )}
                            </CRow>
                            {sol.descripcion && (
                              <div className="mb-3">
                                <small className="text-muted d-block fw-bold text-uppercase mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Descripción</small>
                                <div className="p-3 bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                  <p className="mb-0 fw-medium" style={{ color: '#475569', fontSize: '0.9rem' }}>{sol.descripcion}</p>
                                </div>
                              </div>
                            )}
                            {sol.comentarios && (
                              <div>
                                <small className="text-muted d-block fw-bold text-uppercase mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Comentarios de Revisión</small>
                                <div className="p-3" style={{ borderRadius: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                  <p className="mb-0 fw-medium" style={{ color: '#475569', fontSize: '0.9rem' }}>{sol.comentarios}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </React.Fragment>
                ))}
              </CTableBody>
            </CTable>
          )}
        </div>
      </div>
    </div>
  )
}

export default PanelProcesos
