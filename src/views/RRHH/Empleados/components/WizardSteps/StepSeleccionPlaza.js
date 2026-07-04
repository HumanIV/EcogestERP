import React, { useState, useMemo } from 'react'
import {
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import {
  DEPARTAMENTOS_OFICIALES,
  resolverDepto,
} from '../../../EstructuraOrg/constants/estructuraConstants'
import { TIPOS_CONTRATO } from '../../constants/empleadosConstants'

const StepSeleccionPlaza = ({ plazasVacantes, loading, onSelect, selected }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepto, setFilterDepto] = useState('')

  const filtered = useMemo(() => {
    return (plazasVacantes || []).filter((p) => {
      const matchSearch =
        !searchTerm ||
        (p.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchDepto = !filterDepto || p.departamentoCodigo === filterDepto
      return matchSearch && matchDepto
    })
  }, [plazasVacantes, searchTerm, filterDepto])

  const plazaSeleccionada = plazasVacantes?.find((p) => p.id === selected.plazaId)

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="success" />
        <p className="text-muted mt-3">Cargando plazas vacantes...</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <h5 className="mb-3 text-eco">Selección de Plaza Vacante</h5>

      <CRow className="g-3 mb-3">
        <CCol md={6}>
          <CFormInput
            placeholder="Buscar por código o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-minec"
          />
        </CCol>
        <CCol md={6}>
          <CFormSelect
            value={filterDepto}
            onChange={(e) => setFilterDepto(e.target.value)}
            className="input-minec"
          >
            <option value="">Todos los departamentos</option>
            {DEPARTAMENTOS_OFICIALES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </CFormSelect>
        </CCol>
      </CRow>

      {filtered.length === 0 ? (
        <p className="text-muted text-center py-4">No se encontraron plazas vacantes</p>
      ) : (
        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          <CTable hover responsive className="table-minec mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Cargo</CTableHeaderCell>
                <CTableHeaderCell>Departamento</CTableHeaderCell>
                <CTableHeaderCell>Jornada</CTableHeaderCell>
                <CTableHeaderCell>Salario</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.map((p) => (
                <CTableRow
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className="hover-lift"
                  style={{
                    cursor: 'pointer',
                    background: selected.plazaId === p.id ? 'var(--eco-50)' : undefined,
                    fontWeight: selected.plazaId === p.id ? 600 : undefined,
                  }}
                >
                  <CTableDataCell>
                    <CIcon icon={cilSearch} className="me-1 text-muted" size="sm" />
                    <strong className="text-eco">{p.codigo}</strong>
                  </CTableDataCell>
                  <CTableDataCell>{p.cargo}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="primary" className="badge-eco">
                      {resolverDepto(p.departamentoCodigo).nombre}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small className="text-muted">{p.tipoJornada || '—'}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    {p.salario ? (
                      <span className="fw-semibold text-eco">
                        {Number(p.salario).toLocaleString('es-VE', {
                          style: 'currency',
                          currency: 'VES',
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}

      {plazaSeleccionada && (
        <div className="mt-4 p-3 border rounded eco-surface">
          <h6 className="fw-bold text-eco mb-3">Plaza Seleccionada</h6>
          <CRow className="g-2 small">
            <CCol md={4}>
              <span className="text-muted">Código:</span>
              <div className="fw-semibold">{plazaSeleccionada.codigo}</div>
            </CCol>
            <CCol md={4}>
              <span className="text-muted">Cargo:</span>
              <div className="fw-semibold">{plazaSeleccionada.cargo}</div>
            </CCol>
            <CCol md={4}>
              <span className="text-muted">Departamento:</span>
              <div className="fw-semibold">
                {resolverDepto(plazaSeleccionada.departamentoCodigo).nombre}
              </div>
            </CCol>
            <CCol md={4}>
              <span className="text-muted">Nivel:</span>
              <div className="fw-semibold">{plazaSeleccionada.nivel || '—'}</div>
            </CCol>
            <CCol md={4}>
              <span className="text-muted">Jornada:</span>
              <div className="fw-semibold">{plazaSeleccionada.tipoJornada || '—'}</div>
            </CCol>
            <CCol md={4}>
              <span className="text-muted">Salario:</span>
              <div className="fw-semibold text-eco">
                {plazaSeleccionada.salario
                  ? Number(plazaSeleccionada.salario).toLocaleString('es-VE', {
                      style: 'currency',
                      currency: 'VES',
                      minimumFractionDigits: 0,
                    })
                  : '—'}
              </div>
            </CCol>
          </CRow>

          <div className="mt-3 pt-3 border-top">
            <CFormSelect
              label="Tipo de Contrato"
              value={selected.tipoContrato}
              onChange={(e) => onSelect(selected.plazaId, e.target.value)}
              className="input-minec"
            >
              <option value="">Seleccionar tipo de contrato...</option>
              {TIPOS_CONTRATO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </CFormSelect>
          </div>
        </div>
      )}

      {plazasVacantes && plazasVacantes.length === 0 && !loading && (
        <p className="text-muted text-center py-4">
          No hay plazas vacantes disponibles. Cree una plaza primero en Estructura Organizativa.
        </p>
      )}
    </div>
  )
}

export default StepSeleccionPlaza
