import React, { useState } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSearch, cilFilter, cilPeople } from '@coreui/icons'

import { useUsuarios } from './hooks/useUsuarios'
import UsuariosTabla from './components/UsuariosTabla'
import UsuarioModal from './components/UsuarioModal'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'

const UsuariosList = () => {
  const { showToast, ToastContainer } = useToast()
  const { confirm, ConfirmModal } = useConfirmModal()

  const [filtros, setFiltros] = useState({ busqueda: '', rol: 'todos', estado: 'todos', tipoUsuario: 'erp' })
  const {
    usuarios,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario,
  } = useUsuarios(filtros)

  const [modalVisible, setModalVisible] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)

  const handleOpenModal = (usuario = null) => {
    setUsuarioSeleccionado(usuario)
    setModalVisible(true)
  }

  const handleGuardarUsuario = async (formData) => {
    const isEditing = !!usuarioSeleccionado
    const res = isEditing
      ? await actualizarUsuario(usuarioSeleccionado.id, formData)
      : await crearUsuario(formData)

    if (res.success) {
      showToast(
        isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
        'success'
      )
      setModalVisible(false)
    } else {
      showToast(res.error || 'Ocurrió un error', 'danger')
    }
  }

  const handleEliminar = async (usuario) => {
    const ok = await confirm(
      'Eliminar Usuario',
      `¿Estás seguro de que deseas eliminar permanentemente al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`
    )
    if (ok) {
      const res = await eliminarUsuario(usuario.id)
      if (res.success) showToast('Usuario eliminado', 'success')
      else showToast(res.error || 'Error al eliminar usuario', 'danger')
    }
  }

  const handleCambiarEstado = async (id, activo) => {
    const res = await cambiarEstadoUsuario(id, activo)
    if (res.success) showToast(activo ? 'Usuario activado' : 'Usuario desactivado', 'success')
    else showToast(res.error || 'Error al cambiar estado', 'danger')
  }

  return (
    <CContainer fluid className="px-4 py-3">
      <ToastContainer />
      <ConfirmModal />

      {/* Header Premium */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 bg-white p-4 rounded-4 shadow-sm border-0 position-relative overflow-hidden">
        <div 
          className="position-absolute bg-success rounded-circle opacity-10" 
          style={{ width: '150px', height: '150px', top: '-50px', right: '-20px', filter: 'blur(30px)' }}
        ></div>
        
        <div className="position-relative z-1 mb-3 mb-md-0">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div 
              className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
              style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)' }}
            >
              <CIcon icon={cilPeople} size="xl" className="text-white" />
            </div>
            <div>
              <h2 className="h3 mb-1 fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Gestión de Usuarios</h2>
              <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                Administra los accesos y roles del sistema (ERP).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <CNav variant="pills" className="bg-white p-2 rounded-4 shadow-sm d-inline-flex gap-2 border-0">
          <CNavItem>
            <CNavLink 
              active={filtros.tipoUsuario === 'erp'} 
              onClick={() => setFiltros({ ...filtros, tipoUsuario: 'erp', rol: 'todos' })}
              style={{ cursor: 'pointer', borderRadius: '12px', transition: 'all 0.3s ease' }}
              className={`fw-bold px-4 py-2 border-0 ${filtros.tipoUsuario === 'erp' ? 'bg-success text-white shadow' : 'text-muted bg-transparent'}`}
            >
              Usuarios del Sistema (ERP)
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              active={filtros.tipoUsuario === 'ciudadanos'} 
              onClick={() => setFiltros({ ...filtros, tipoUsuario: 'ciudadanos', rol: 'todos' })}
              style={{ cursor: 'pointer', borderRadius: '12px', transition: 'all 0.3s ease' }}
              className={`fw-bold px-4 py-2 border-0 ${filtros.tipoUsuario === 'ciudadanos' ? 'bg-success text-white shadow' : 'text-muted bg-transparent'}`}
            >
              Ciudadanos (Portal)
            </CNavLink>
          </CNavItem>
        </CNav>

        {filtros.tipoUsuario === 'erp' && (
          <CButton
            color="success"
            className="d-flex align-items-center gap-2 px-4 py-2 fw-bold shadow-sm rounded-pill text-white border-0"
            style={{ background: 'linear-gradient(135deg, #198754 0%, #157347 100%)', transition: 'all 0.3s ease' }}
            onClick={() => handleOpenModal()}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <CIcon icon={cilPlus} />
            Nuevo Usuario
          </CButton>
        )}
      </div>

      <CCard className="eco-card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
        <CCardBody className="p-4">
          <CRow className="g-3 align-items-center">
            <CCol md={6} lg={4}>
              <div className="position-relative">
                <CIcon
                  icon={cilSearch}
                  className="position-absolute text-muted"
                  style={{ top: '10px', left: '12px' }}
                />
                <CFormInput
                  placeholder="Buscar por nombre, correo o cédula..."
                  className="ps-5 bg-light border-0 shadow-none rounded-pill focus-ring focus-ring-success"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
              </div>
            </CCol>
            <CCol md={3} lg={2}>
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilFilter} className="text-muted" />
                <CFormSelect
                  className="bg-light border-0 shadow-none rounded-pill focus-ring focus-ring-success cursor-pointer"
                  value={filtros.rol}
                  onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
                  disabled={filtros.tipoUsuario === 'ciudadanos'}
                >
                  <option value="todos">Todos los Roles</option>
                  {filtros.tipoUsuario === 'erp' && (
                    <>
                      <option value="admin">Administrador</option>
                      <option value="inspector">Inspector</option>
                      <option value="rrhh">RRHH</option>
                      <option value="director">Director</option>
                    </>
                  )}
                  {filtros.tipoUsuario === 'ciudadanos' && (
                    <option value="ciudadano">Ciudadano</option>
                  )}
                </CFormSelect>
              </div>
            </CCol>
            <CCol md={3} lg={2}>
              <CFormSelect
                className="bg-light border-0 shadow-none rounded-pill focus-ring focus-ring-success cursor-pointer"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="todos">Cualquier Estado</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      <CCard className="eco-card border-0 shadow-sm rounded-4 overflow-hidden">
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" variant="grow" />
              <p className="text-muted mt-3">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <h6>{error}</h6>
            </div>
          ) : (
            <UsuariosTabla
              usuarios={usuarios}
              onEditar={handleOpenModal}
              onEliminar={handleEliminar}
              onCambiarEstado={handleCambiarEstado}
            />
          )}
        </CCardBody>
      </CCard>

      <UsuarioModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        usuario={usuarioSeleccionado}
        onGuardar={handleGuardarUsuario}
      />
    </CContainer>
  )
}

export default UsuariosList
