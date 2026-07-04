import React from 'react'
import {
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilSync } from '@coreui/icons'

const EmpleadosFilters = ({
  searchTerm,
  onSearchChange,
  filterDept,
  onFilterDeptChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  totalResults,
  totalEmpleados,
  departamentos = [],
  estados = [],
}) => {
  const hasFilters = searchTerm || filterDept || filterStatus

  return (
    <CRow className="g-2 mb-4">
      <CCol xs={12} md={5}>
        <CInputGroup>
          <CInputGroupText className="bg-eco-soft border-end-0">
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar por nombre, cargo o email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-minec border-start-0"
          />
        </CInputGroup>
      </CCol>

      <CCol xs={6} md={3}>
        <CFormSelect
          value={filterDept}
          onChange={(e) => onFilterDeptChange(e.target.value)}
          className="input-minec"
        >
          <option value="">Todos los departamentos</option>
          {departamentos.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </CFormSelect>
      </CCol>

      <CCol xs={6} md={2}>
        <CFormSelect
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="input-minec"
        >
          <option value="">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.value}
            </option>
          ))}
        </CFormSelect>
      </CCol>

      <CCol xs={6} md={1}>
        <CFormSelect
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="input-minec"
          title="Ordenar por"
        >
          <option value="nombre">Nombre</option>
          <option value="ingreso">Ingreso</option>
        </CFormSelect>
      </CCol>

      <CCol xs={6} md={1}>
        <CButton
          color="outline-secondary"
          className="w-100"
          size="sm"
          onClick={onClearFilters}
          disabled={!hasFilters}
        >
          <CIcon icon={cilSync} />
        </CButton>
      </CCol>

      {hasFilters && (
        <CCol xs={12}>
          <small className="text-muted">
            Mostrando {totalResults} de {totalEmpleados} empleados
            {searchTerm && ` • Búsqueda: "${searchTerm}"`}
            {filterDept && ` • Departamento: ${filterDept}`}
            {filterStatus && ` • Estado: ${filterStatus}`}
          </small>
        </CCol>
      )}
    </CRow>
  )
}

export default EmpleadosFilters
