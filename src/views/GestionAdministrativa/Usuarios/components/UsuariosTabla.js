import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilUser, cilShieldAlt, cilXCircle, cilCheckCircle } from '@coreui/icons'

const UsuariosTabla = ({ usuarios, onEditar, onEliminar, onCambiarEstado }) => {
  const getRoleColor = (rol) => {
    const colors = {
      admin: 'danger',
      director: 'warning',
      inspector: 'info',
      rrhh: 'primary',
      ciudadano: 'secondary',
    }
    return colors[rol?.toLowerCase()] || 'dark'
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="text-center py-5">
        <CIcon icon={cilUser} size="3xl" className="text-muted mb-3 opacity-50" />
        <h6 className="text-muted">No se encontraron usuarios</h6>
        <small className="text-muted">Intenta ajustando los filtros de búsqueda.</small>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <CTable hover align="middle" className="mb-0" responsive>
        <CTableHead className="bg-light rounded-top">
          <CTableRow>
            <CTableHeaderCell className="text-muted fw-semibold border-bottom-0 py-3 ps-4" style={{ width: '280px' }}>Usuario</CTableHeaderCell>
            <CTableHeaderCell className="text-muted fw-semibold border-bottom-0 py-3">Rol de Sistema</CTableHeaderCell>
            <CTableHeaderCell className="text-muted fw-semibold border-bottom-0 py-3">Cédula</CTableHeaderCell>
            <CTableHeaderCell className="text-muted fw-semibold border-bottom-0 py-3">Estado</CTableHeaderCell>
            <CTableHeaderCell className="text-end text-muted fw-semibold border-bottom-0 py-3 pe-4" style={{ width: '150px' }}>
              Acciones
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {usuarios.map((u) => (
            <CTableRow key={u.id} className="transition-all hover-shadow-sm cursor-default">
              <CTableDataCell className="py-3 border-bottom border-light ps-4">
                <div className="d-flex align-items-center gap-3">
                  <CAvatar
                    color={getRoleColor(u.rol)}
                    textColor="white"
                    size="md"
                    className="fw-bold fs-6 shadow-sm flex-shrink-0"
                  >
                    {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                  </CAvatar>
                  <div className="text-truncate">
                    <div className="fw-bold text-dark text-truncate" title={u.nombre}>{u.nombre}</div>
                    <small className="text-muted d-block text-truncate" title={u.email}>{u.email}</small>
                  </div>
                </div>
              </CTableDataCell>
              <CTableDataCell className="py-3 border-bottom border-light">
                <CBadge
                  color={getRoleColor(u.rol)}
                  className="px-3 py-2 text-uppercase fw-semibold"
                  shape="rounded-pill"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
                >
                  <CIcon icon={cilShieldAlt} size="sm" className="me-1" />
                  {u.rol}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell className="py-3 border-bottom border-light">
                <small className="text-muted fw-medium fs-6">{u.cedula || 'N/A'}</small>
              </CTableDataCell>
              <CTableDataCell className="py-3 border-bottom border-light">
                <CBadge
                  color={u.activo ? 'success' : 'danger'}
                  className="px-2 py-1"
                >
                  {u.activo ? 'Activo' : 'Inactivo'}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell className="text-end py-3 border-bottom border-light pe-4">
                <div className="d-flex justify-content-end gap-2">
                  <CButton
                    color={u.activo ? 'warning' : 'success'}
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-circle hover-bg-light"
                    title={u.activo ? 'Desactivar Usuario' : 'Activar Usuario'}
                    onClick={() => onCambiarEstado(u.id, !u.activo)}
                  >
                    <CIcon icon={u.activo ? cilXCircle : cilCheckCircle} size="lg" />
                  </CButton>
                  <CButton
                    color="primary"
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-circle hover-bg-light"
                    title="Editar Usuario"
                    onClick={() => onEditar(u)}
                  >
                    <CIcon icon={cilPencil} size="lg" />
                  </CButton>
                  <CButton
                    color="danger"
                    variant="ghost"
                    size="sm"
                    className="p-1 rounded-circle hover-bg-light"
                    title="Eliminar Usuario"
                    onClick={() => onEliminar(u)}
                    disabled={u.rol === 'admin'}
                  >
                    <CIcon icon={cilTrash} size="lg" />
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default UsuariosTabla
