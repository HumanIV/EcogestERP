import React from 'react'
import {
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilSync } from '@coreui/icons'

const SolicitudesFilters = ({
  searchTerm,
  onSearchChange,
  filterTipo,
  onFilterTipoChange,
  filterEstado,
  onFilterEstadoChange,
  onClearFilters,
  totalResults,
  totalSolicitudes,
  tipos = [],
  estados = [],
}) => {
  const hasFilters = searchTerm || filterTipo || filterEstado

  return (
    <CRow className="g-2 mb-4">
      <CCol xs={12} md={5}>
        <CInputGroup>
          <CInputGroupText className="bg-eco-soft border-end-0">
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar por empleado o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-minec border-start-0"
          />
        </CInputGroup>
      </CCol>

      <CCol xs={6} md={3}>
        <CFormSelect
          value={filterTipo}
          onChange={(e) => onFilterTipoChange(e.target.value)}
          className="input-minec"
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
        <CFormSelect
          value={filterEstado}
          onChange={(e) => onFilterEstadoChange(e.target.value)}
          className="input-minec"
        >
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </CFormSelect>
      </CCol>

      <CCol xs={6} md={2}>
        <CButton
          color="outline-secondary"
          className="w-100"
          size="sm"
          onClick={onClearFilters}
          disabled={!hasFilters}
        >
          <CIcon icon={cilSync} className="me-1" /> Limpiar
        </CButton>
      </CCol>

      {hasFilters && (
        <CCol xs={12}>
          <small className="text-muted">
            Mostrando {totalResults} de {totalSolicitudes} solicitudes
            {searchTerm && ` • Búsqueda: "${searchTerm}"`}
            {filterTipo && ` • Tipo: ${filterTipo}`}
            {filterEstado && ` • Estado: ${filterEstado}`}
          </small>
        </CCol>
      )}
    </CRow>
  )
}

export default SolicitudesFilters
