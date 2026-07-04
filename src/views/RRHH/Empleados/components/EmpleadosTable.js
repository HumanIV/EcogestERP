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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoom, cilEnvelopeOpen } from '@coreui/icons'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const EmpleadosTable = ({ data, onView }) => {
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
              <CTableHeaderCell className="text-eco fw-semibold">Cédula</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Cargo</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Departamento</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">T. Contrato</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">Estado</CTableHeaderCell>
              <CTableHeaderCell className="text-eco fw-semibold">F. Ingreso</CTableHeaderCell>
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
                    <CAvatar
                      size="md"
                      src={item.foto}
                      color="primary"
                      textColor="white"
                      className="me-3"
                    >
                      {item.nombre?.charAt(0) || '?'}
                    </CAvatar>
                    <div>
                      <div className="fw-semibold text-eco">
                        {item.nombre} {item.apellidos || ''}
                      </div>
                      <div className="small text-muted d-flex align-items-center">
                        <CIcon icon={cilEnvelopeOpen} className="me-1" size="sm" />
                        {item.email || '—'}
                      </div>
                    </div>
                  </div>
                </CTableDataCell>

                <CTableDataCell>
                  <span className="fw-medium">{item.cedula || '—'}</span>
                </CTableDataCell>

                <CTableDataCell>
                  <div className="fw-medium">{item.cargo || '—'}</div>
                </CTableDataCell>

                <CTableDataCell>
                  <CBadge color="primary" className="badge-eco">
                    {item.departamento || '—'}
                  </CBadge>
                </CTableDataCell>

                <CTableDataCell>
                  <small>{item.tipoContrato || '—'}</small>
                </CTableDataCell>

                <CTableDataCell>
                  <RrhhBadgeEstado estado={item.estado} />
                </CTableDataCell>

                <CTableDataCell>
                  <div className="fw-medium">{item.fechaIngreso || '—'}</div>
                </CTableDataCell>

                <CTableDataCell className="text-end pe-4">
                  <CButton
                    size="sm"
                    color="outline-primary"
                    onClick={() => onView(item)}
                    className="btn-icon-minec"
                  >
                    <CIcon icon={cilZoom} className="me-1" /> Ver
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default EmpleadosTable
