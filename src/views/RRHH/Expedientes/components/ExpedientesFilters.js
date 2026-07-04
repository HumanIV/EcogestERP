import React from 'react'
import {
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CButton,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilX } from '@coreui/icons'

const ExpedientesFilters = ({
  searchTerm,
  onSearchChange,
  filterDept,
  onFilterDeptChange,
  filterStatus,
  onFilterStatusChange,
  onClearFilters,
  totalResults,
  totalExpedientes,
  departamentos = [],
  estados = [],
}) => {
  const hasFilters = searchTerm || filterDept || filterStatus

  return (
    <CRow className="g-2 mb-3">
      <CCol xs={12} md={5}>
        <CInputGroup>
          <CInputGroupText className="bg-eco-soft border-end-0">
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar empleado, cargo o departamento..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-minec border-start-0"
          />
        </CInputGroup>
      </CCol>

      <CCol xs={5} md={2}>
        <CFormSelect
          value={filterDept}
          onChange={(e) => onFilterDeptChange(e.target.value)}
          className="input-minec"
        >
          <option value="">Departamento</option>
          {departamentos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </CFormSelect>
      </CCol>

      <CCol xs={4} md={2}>
        <CFormSelect
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="input-minec"
        >
          <option value="">Estado</option>
          {estados.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </CFormSelect>
      </CCol>

      <CCol xs={3} md={2}>
        <CButton
          color="outline-secondary"
          className="w-100"
          onClick={onClearFilters}
          disabled={!hasFilters}
        >
          <CIcon icon={cilX} className="me-1" /> Limpiar
        </CButton>
      </CCol>

      <CCol xs={12}>
        <small className="text-muted">
          {totalResults} de {totalExpedientes} expedientes
          {searchTerm && (
            <CBadge color="info" className="ms-2 text-eco">{`"${searchTerm}"`}</CBadge>
          )}
          {filterDept && (
            <CBadge color="primary" className="ms-1 badge-eco">
              {filterDept}
            </CBadge>
          )}
          {filterStatus && (
            <CBadge color="warning" className="ms-1">
              {filterStatus}
            </CBadge>
          )}
        </small>
      </CCol>
    </CRow>
  )
}

export default ExpedientesFilters
