import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CButtonGroup,
  CTooltip,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilZoom, cilCloudUpload, cilTrash, cilFolder } from '@coreui/icons'

const STATUS_STYLE = {
  Completo: { background: '#2eb85c', color: '#fff' },
  'En revisión': { background: '#f9b115', color: '#1a1a1a' },
  Incompleto: { background: '#e55353', color: '#fff' },
  Pendiente: { background: '#9da5b1', color: '#fff' },
}

const getCompletionColor = (pct) => {
  if (pct >= 80) return '#2eb85c'
  if (pct >= 50) return '#f9b115'
  return '#e55353'
}

const CircularIndicator = ({ value }) => {
  const color = getCompletionColor(value)
  const size = 32
  const r = 13
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="d-flex align-items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--cui-border-color)"
          strokeWidth="2.5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="3"
          fill="var(--cui-body-color)"
          fontSize="8"
          fontWeight="bold"
        >
          {value}%
        </text>
      </svg>
    </div>
  )
}

const ExpedientesTable = ({
  data,
  empleados,
  selectedIds,
  onSelectAll,
  onSelectItem,
  onView,
  onUpload,
  onDelete,
}) => {
  const getEmpleado = (empleadoId) => empleados.find((e) => String(e.id) === String(empleadoId))

  if (data.length === 0) return null

  return (
    <div className="table-responsive">
      <CTable hover align="middle" className="table-minec mb-0">
        <CTableHead>
          <CTableRow
            style={{ background: 'linear-gradient(135deg, var(--eco-50), var(--eco-100))' }}
          >
            <CTableHeaderCell className="text-eco fw-semibold ps-3" style={{ width: '40px' }}>
              <CFormCheck
                checked={selectedIds.length === data.length && data.length > 0}
                onChange={onSelectAll}
              />
            </CTableHeaderCell>
            <CTableHeaderCell className="text-eco fw-semibold">Empleado</CTableHeaderCell>
            <CTableHeaderCell className="text-eco fw-semibold">Departamento</CTableHeaderCell>
            <CTableHeaderCell className="text-eco fw-semibold text-center">Docs</CTableHeaderCell>
            <CTableHeaderCell className="text-eco fw-semibold">Completado</CTableHeaderCell>
            <CTableHeaderCell className="text-eco fw-semibold">Estado</CTableHeaderCell>
            <CTableHeaderCell className="text-eco fw-semibold">Actualización</CTableHeaderCell>
            <CTableHeaderCell
              className="text-eco fw-semibold text-end pe-3"
              style={{ width: '120px' }}
            >
              Acciones
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {data.map((item) => {
            const emp = getEmpleado(item.empleadoId)
            const pct = item.porcentajeCompletado || 0
            const statusStyle = STATUS_STYLE[item.estadoExp] || STATUS_STYLE.Pendiente
            return (
              <CTableRow key={item.id} className="hover-lift align-middle">
                <CTableDataCell className="ps-3">
                  <CFormCheck
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onSelectItem(item.id)}
                  />
                </CTableDataCell>

                <CTableDataCell>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {emp?.nombre?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="fw-semibold text-eco small">
                        {emp?.nombre || 'Sin empleado'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#5c6b7a' }}>{emp?.cargo}</div>
                    </div>
                  </div>
                </CTableDataCell>

                <CTableDataCell>
                  <span
                    className="badge rounded-pill"
                    style={{
                      background: '#321fdb',
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      padding: '0.3em 0.65em',
                    }}
                  >
                    {emp?.departamento || 'N/A'}
                  </span>
                </CTableDataCell>

                <CTableDataCell className="text-center">
                  <div className="d-inline-flex align-items-center gap-1">
                    <CIcon icon={cilFolder} style={{ color: '#5c6b7a' }} size="sm" />
                    <span className="fw-medium small" style={{ color: '#2c384a' }}>
                      {item.documentos?.length || 0}
                    </span>
                  </div>
                </CTableDataCell>

                <CTableDataCell>
                  <CircularIndicator value={pct} />
                </CTableDataCell>

                <CTableDataCell>
                  <span
                    className="badge rounded-pill"
                    style={{
                      ...statusStyle,
                      fontWeight: 500,
                      fontSize: '0.7rem',
                      padding: '0.3em 0.65em',
                    }}
                  >
                    {item.estadoExp}
                  </span>
                </CTableDataCell>

                <CTableDataCell>
                  <small style={{ fontSize: '0.75rem', color: '#7d8b9c' }}>
                    {item.ultimaActualizacion}
                  </small>
                </CTableDataCell>

                <CTableDataCell className="text-end pe-3">
                  <CButtonGroup size="sm">
                    <CTooltip content="Ver expediente">
                      <CButton
                        color="outline-primary"
                        onClick={() => onView(item)}
                        className="btn-icon-minec"
                        size="sm"
                      >
                        <CIcon icon={cilZoom} size="sm" />
                      </CButton>
                    </CTooltip>
                    <CTooltip content="Subir documento">
                      <CButton
                        color="outline-success"
                        onClick={() => onUpload(item)}
                        className="btn-icon-minec"
                        size="sm"
                      >
                        <CIcon icon={cilCloudUpload} size="sm" />
                      </CButton>
                    </CTooltip>
                    <CTooltip content="Eliminar">
                      <CButton
                        color="outline-danger"
                        onClick={() => onDelete(item)}
                        className="btn-icon-minec"
                        size="sm"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </CButton>
                    </CTooltip>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            )
          })}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default ExpedientesTable
