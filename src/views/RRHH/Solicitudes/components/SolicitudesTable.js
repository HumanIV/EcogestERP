import React from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CAvatar,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoom, cilCalendar } from '@coreui/icons'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const SolicitudesTable = ({ data, onView }) => {
  const getPrioridadBadge = (prioridad) => {
    const map = { Baja: 'secondary', Media: 'info', Alta: 'warning', Urgente: 'danger' }
    return map[prioridad] || 'secondary'
  }

  if (data.length === 0) return null

  return (
    <CCard className="eco-card">
      <CCardBody className="p-0">
        <CTable hover responsive align="middle" className="table-minec mb-0">
          <CTableHead>
            <CTableRow
              style={{ background: 'linear-gradient(135deg, var(--eco-50), var(--eco-100))' }}
            >
              <CTableHeaderCell className="text-eco fw-semibold ps-4">Empleado</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Tipo</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Fecha Solicitud</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Período</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Prioridad</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Estado</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold text-end pe-4">
                Acciones
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((item) => (
              <CTableRow key={item.id} className="hover-lift">
                <CTableDataCell className="ps-4">
                  <div className="d-flex align-items-center">
                    <CAvatar size="md" color="primary" textColor="white" className="me-3">
                      {item.empleadoNombre?.charAt(0) || '?'}
                    </CAvatar>
                    <div>
                      <div className="fw-semibold text-eco">{item.empleadoNombre}</div>
                      <div className="small text-muted">{item.departamento}</div>
                    </div>
                  </div>
                </CTableDataCell>

                <CTableDataCell>
                  <span className="fw-medium">{item.tipo}</span>
                  {item.diasSolicitados > 0 && (
                    <div className="small text-muted">{item.diasSolicitados} días</div>
                  )}
                </CTableDataCell>

                <CTableDataCell>
                  <div className="fw-medium">{item.fechaSolicitud || item.fecha}</div>
                  <small className="text-muted">
                    {item.fechaRespuesta ? `Resp: ${item.fechaRespuesta}` : 'Sin respuesta'}
                  </small>
                </CTableDataCell>

                <CTableDataCell>
                  {item.detalles?.fechaInicio && item.detalles?.fechaFin ? (
                    <>
                      <div className="small fw-medium">
                        <CIcon icon={cilCalendar} size="sm" className="me-1" />
                        {item.detalles.fechaInicio}
                      </div>
                      <div className="small text-muted">→ {item.detalles.fechaFin}</div>
                    </>
                  ) : (
                    <span className="small text-muted">N/A</span>
                  )}
                </CTableDataCell>

                <CTableDataCell>
                  <CBadge color={getPrioridadBadge(item.prioridad)} className="fw-medium">
                    {item.prioridad}
                  </CBadge>
                </CTableDataCell>

                <CTableDataCell>
                  <RrhhBadgeEstado estado={item.estado} />
                </CTableDataCell>

                <CTableDataCell className="text-end pe-4">
                  <CTooltip content="Ver detalles">
                    <CButton
                      color="outline-primary"
                      onClick={() => onView(item)}
                      className="btn-icon-minec"
                    >
                      <CIcon icon={cilZoom} />
                    </CButton>
                  </CTooltip>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default SolicitudesTable
