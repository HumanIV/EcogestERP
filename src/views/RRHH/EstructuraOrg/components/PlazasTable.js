import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CButtonGroup,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilSync, cilPencil, cilTrash, cilX, cilUser } from '@coreui/icons'
import {
  DEPARTAMENTOS_OFICIALES,
  ESTADOS_PLAZA,
  NIVELES_JERARQUICOS,
  resolverDepto,
} from '../constants/estructuraConstants'
import RrhhBadgeEstado from '../../_shared/RrhhBadgeEstado'

const PlazasTable = ({ plazas, estadisticas, onEdit, onDelete, onDesocupar, onEmployeeClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepto, setFilterDepto] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const getDeptoNombre = (codigo) => resolverDepto(codigo).nombre

  const getNivelLabel = (nivel) => {
    const niv = NIVELES_JERARQUICOS.find((n) => n.value === Number(nivel))
    return niv ? niv.label : nivel
  }

  const filtered = plazas.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepto = !filterDepto || p.departamentoCodigo === filterDepto
    const matchesEstado = !filterEstado || p.estado === filterEstado
    return matchesSearch && matchesDepto && matchesEstado
  })

  return (
    <>
      <div className="exp-card bg-white p-4 mb-4 shadow-sm" style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <CRow className="g-3">
          <CCol xs={12} md={5}>
            <CInputGroup>
              <CInputGroupText className="bg-light border-end-0 text-muted">
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar por código o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 bg-light"
                style={{ boxShadow: 'none' }}
              />
            </CInputGroup>
          </CCol>
          <CCol xs={6} md={3}>
            <CFormSelect
              value={filterDepto}
              onChange={(e) => setFilterDepto(e.target.value)}
              className="bg-light text-dark"
              style={{ boxShadow: 'none', border: '1px solid #dee2e6' }}
            >
              <option value="">Todos los departamentos</option>
              {DEPARTAMENTOS_OFICIALES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol xs={6} md={2}>
            <CFormSelect
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="bg-light text-dark"
              style={{ boxShadow: 'none', border: '1px solid #dee2e6' }}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_PLAZA.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
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
                setFilterDepto('')
                setFilterEstado('')
              }}
              disabled={!searchTerm && !filterDepto && !filterEstado}
            >
              <CIcon icon={cilSync} className="me-1" /> Limpiar
            </CButton>
          </CCol>
        </CRow>
      </div>

      <div className="exp-card bg-white overflow-hidden shadow-sm mb-4" style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}>
        <CTable hover responsive align="middle" className="mb-0 border-0">
          <CTableHead>
            <CTableRow style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3 px-4" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Código</CTableHeaderCell>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Departamento</CTableHeaderCell>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Cargo</CTableHeaderCell>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Nivel</CTableHeaderCell>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Estado</CTableHeaderCell>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Empleado</CTableHeaderCell>
              <CTableHeaderCell className="text-uppercase text-muted fw-bold py-3 text-end pe-4" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filtered.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="7" className="text-center py-5 text-muted">
                  No se encontraron plazas
                </CTableDataCell>
              </CTableRow>
            ) : (
              filtered.map((p) => (
                <CTableRow key={p.id} className="hover-lift" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <CTableDataCell className="px-4 py-3">
                    <strong style={{ color: '#1e293b' }}>{p.codigo}</strong>
                  </CTableDataCell>
                  <CTableDataCell className="py-3">
                    <span className="badge rounded-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                      {getDeptoNombre(p.departamentoCodigo)}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell className="py-3 fw-medium text-dark">{p.cargo}</CTableDataCell>
                  <CTableDataCell className="py-3">
                    <small className="text-muted fw-medium">{getNivelLabel(p.nivel)}</small>
                  </CTableDataCell>
                  <CTableDataCell className="py-3">
                    <RrhhBadgeEstado estado={p.estado} />
                  </CTableDataCell>
                  <CTableDataCell className="py-3">
                    {p.empleadoId ? (
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: onEmployeeClick ? 'pointer' : 'default', color: '#3b82f6' }}
                        onClick={() => onEmployeeClick && onEmployeeClick(p.empleadoId)}
                      >
                        <CIcon icon={cilUser} size="sm" />
                        <span className={onEmployeeClick ? 'text-decoration-underline fw-medium' : 'fw-medium'}>
                          Ver empleado
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted fw-medium" style={{ opacity: 0.6 }}>—</span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-end pe-4 py-3">
                    <CButtonGroup size="sm" className="shadow-sm">
                      <CButton
                        color="light"
                        onClick={() => onEdit(p)}
                        className="text-warning border"
                        title="Editar"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      {p.estado === 'ocupada' && (
                        <CButton
                          color="light"
                          onClick={() => onDesocupar(p)}
                          className="text-secondary border"
                          title="Desocupar"
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      )}
                      {p.estado === 'vacante' && (
                        <CButton
                          color="light"
                          onClick={() => onDelete(p)}
                          className="text-danger border"
                          title="Eliminar"
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      )}
                    </CButtonGroup>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3 px-2 mb-4">
        <div className="d-flex gap-3">
          <span className="fw-bold" style={{ color: '#10b981', fontSize: '0.9rem' }}>
            {estadisticas?.vacantes || 0} vacantes
          </span>
          <span className="text-muted">•</span>
          <span className="fw-bold" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
            {estadisticas?.ocupadas || 0} ocupadas
          </span>
        </div>
        <span className="badge rounded-pill fw-bold shadow-sm" style={{ background: '#0f172a', color: 'white', padding: '0.5em 1em' }}>
          Total plazas: {estadisticas?.total || 0}
        </span>
      </div>
    </>
  )
}

export default PlazasTable
