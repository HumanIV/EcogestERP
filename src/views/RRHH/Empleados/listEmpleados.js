import React, { useState, useEffect, useCallback } from 'react'
import {
  CContainer,
  CNav,
  CNavItem,
  CNavLink,
  CPagination,
  CPaginationItem,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilReload,
  cilCloudDownload,
  cilList,
  cilGrid,
  cilUserUnfollow,
  cilWarning,
  cilCheckCircle,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'
import useEmpleados from './hooks/useEmpleados'

import RrhhPageHeader from '../_shared/RrhhPageHeader'
import EmpleadosStats from './components/EmpleadosStats'
import EmpleadosFilters from './components/EmpleadosFilters'
import EmpleadosTable from './components/EmpleadosTable'
import EmpleadosGrid from './components/EmpleadosGrid'
import EmpleadosEmptyState from './components/EmpleadosEmptyState'

import { DEPARTAMENTOS, ESTADOS_EMPLEADO } from './constants/empleadosConstants'

const ListEmpleados = () => {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { confirm, ConfirmModal } = useConfirmModal()
  const {
    empleados,
    loading,
    cargarEmpleados,
    exportarCSV,
    renunciasPendientes,
    cargarRenunciasPendientes,
    procesarBaja,
  } = useEmpleados()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('nombre')
  const [activeTab, setActiveTab] = useState('todos')
  const [viewMode, setViewMode] = useState('table')

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal de conflictos
  const [conflictosModal, setConflictosModal] = useState({ visible: false, conflictos: [], empleadoNombre: '' })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterDept, filterStatus, activeTab])

  useEffect(() => {
    if (activeTab === 'renuncias') {
      cargarRenunciasPendientes()
    }
  }, [activeTab, cargarRenunciasPendientes])

  const dataFiltered = empleados
    .filter((emp) => {
      const match =
        emp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const deptMatch = !filterDept || emp.departamento === filterDept
      const statusMatch = !filterStatus || emp.estado === filterStatus
      const tabMatch =
        activeTab === 'todos' ||
        (activeTab === 'activos' && emp.estado === 'Activo') ||
        (activeTab === 'inactivos' && emp.estado === 'Inactivo')
      return match && deptMatch && statusMatch && tabMatch
    })
    .sort((a, b) => {
      if (sortBy === 'nombre') return a.nombre?.localeCompare(b.nombre || '')
      if (sortBy === 'ingreso') return new Date(a.fechaIngreso) - new Date(b.fechaIngreso)
      return 0
    })

  const totalPages = Math.ceil(dataFiltered.length / itemsPerPage) || 1
  const paginatedData = dataFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const estadisticas = {
    total: empleados.length,
    activos: empleados.filter((e) => e.estado === 'Activo').length,
    inactivos: empleados.filter((e) => e.estado === 'Inactivo').length,
  }

  const handleView = (item) => {
    navigate(`/perfilEmpleado/${item.id}`)
  }

  const handleExport = () => {
    exportarCSV()
    showToast('Datos exportados exitosamente', 'success')
  }

  const handleRefresh = async () => {
    await cargarEmpleados()
    if (activeTab === 'renuncias') await cargarRenunciasPendientes()
    showToast('Datos actualizados', 'info')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterDept('')
    setFilterStatus('')
    setActiveTab('todos')
  }

  const handleProcesarBaja = useCallback(
    async (emp) => {
      const confirmado = await confirm(
        `¿Estás seguro de procesar la baja definitiva de ${emp.nombre}?`,
        'Esta acción cambiará su estado a Inactivo, liberará sus plazas y archivará su expediente. Esta operación no se puede deshacer fácilmente.',
      )
      if (!confirmado) return

      const result = await procesarBaja(emp.id, emp.solicitudId)

      if (result.success) {
        showToast(result.message || 'Baja procesada exitosamente', 'success')
      } else if (result.conflictos && result.conflictos.length > 0) {
        setConflictosModal({
          visible: true,
          conflictos: result.conflictos,
          empleadoNombre: emp.nombre || 'Empleado',
        })
      } else {
        showToast(result.error || 'Error al procesar la baja', 'danger')
      }
    },
    [confirm, procesarBaja, showToast],
  )

  const renderRenunciasPendientes = () => {
    if (renunciasPendientes.length === 0) {
      return (
        <div className="text-center py-5">
          <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
          <h5 className="text-muted">No hay renuncias pendientes de procesar</h5>
          <p className="text-muted">
            Todas las solicitudes de baja aprobadas ya han sido gestionadas.
          </p>
        </div>
      )
    }

    return (
      <div className="row g-3">
        {renunciasPendientes.map((emp) => (
          <div key={emp.id} className="col-12 col-md-6 col-xl-4">
            <div
              className="eco-card p-3 h-100"
              style={{
                borderLeft: '4px solid var(--eco-danger, #e55353)',
                position: 'relative',
              }}
            >
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div>
                  <h6 className="mb-1 fw-bold">{emp.nombre}</h6>
                  <small className="text-muted d-block">{emp.cargo || 'Sin cargo'}</small>
                  <small className="text-muted d-block">{emp.departamento || 'Sin depto.'}</small>
                </div>
                <CBadge
                  style={{
                    background: 'rgba(229, 83, 83, 0.15)',
                    color: '#e55353',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                >
                  Renuncia Aprobada
                </CBadge>
              </div>

              <div className="mb-3" style={{ fontSize: '0.82rem' }}>
                <div className="d-flex justify-content-between text-muted mb-1">
                  <span>Cédula:</span>
                  <span className="fw-semibold">{emp.cedula || '—'}</span>
                </div>
                <div className="d-flex justify-content-between text-muted mb-1">
                  <span>Solicitud:</span>
                  <span className="fw-semibold">#{emp.solicitudId}</span>
                </div>
                <div className="d-flex justify-content-between text-muted mb-1">
                  <span>Fecha solicitud:</span>
                  <span className="fw-semibold">{emp.fechaSolicitud || '—'}</span>
                </div>
                {emp.motivoRenuncia && (
                  <div className="mt-2 p-2 rounded" style={{ background: 'rgba(229,83,83,0.06)', fontSize: '0.78rem' }}>
                    <strong>Motivo:</strong> {emp.motivoRenuncia}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  className="flex-fill"
                  onClick={() => handleView(emp)}
                >
                  Ver Perfil
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  className="flex-fill text-white"
                  onClick={() => handleProcesarBaja(emp)}
                >
                  <CIcon icon={cilUserUnfollow} size="sm" className="me-1" />
                  Procesar Baja
                </CButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <CContainer fluid className="px-0 px-md-4">
        <RrhhPageHeader
          icon={cilList}
          title="Gestión de Empleados"
          subtitle="Administra y visualiza toda la información del personal"
          badge={estadisticas.total}
          actions={[
            {
              label: 'Actualizar',
              icon: cilReload,
              color: 'outline-secondary',
              onClick: handleRefresh,
              disabled: loading,
            },
            {
              label: 'Exportar',
              icon: cilCloudDownload,
              color: 'outline-success',
              onClick: handleExport,
            },
            {
              label: 'Nuevo Empleado',
              icon: cilPlus,
              color: 'success',
              onClick: () => navigate('/nuevoEmpleado'),
            },
          ]}
        />

        <EmpleadosStats estadisticas={estadisticas} />

        <CNav variant="pills" className="mb-3">
          <CNavItem>
            <CNavLink active={activeTab === 'todos'} onClick={() => setActiveTab('todos')}>
              Todos ({estadisticas.total})
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 'activos'} onClick={() => setActiveTab('activos')}>
              Activos ({estadisticas.activos})
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 'inactivos'} onClick={() => setActiveTab('inactivos')}>
              Inactivos ({estadisticas.inactivos})
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeTab === 'renuncias'}
              onClick={() => setActiveTab('renuncias')}
              style={
                activeTab === 'renuncias'
                  ? { background: '#e55353', color: '#fff', borderColor: '#e55353' }
                  : { color: '#e55353' }
              }
            >
              <CIcon icon={cilUserUnfollow} size="sm" className="me-1" />
              Renuncias por Procesar
              {renunciasPendientes.length > 0 && (
                <CBadge
                  className="ms-2"
                  style={{
                    background: activeTab === 'renuncias' ? '#fff' : '#e55353',
                    color: activeTab === 'renuncias' ? '#e55353' : '#fff',
                    fontSize: '0.7rem',
                  }}
                >
                  {renunciasPendientes.length}
                </CBadge>
              )}
            </CNavLink>
          </CNavItem>
        </CNav>

        {activeTab === 'renuncias' ? (
          renderRenunciasPendientes()
        ) : (
          <>
            <EmpleadosFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterDept={filterDept}
              onFilterDeptChange={setFilterDept}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onClearFilters={clearFilters}
              totalResults={dataFiltered.length}
              totalEmpleados={empleados.length}
              departamentos={DEPARTAMENTOS}
              estados={ESTADOS_EMPLEADO}
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <small className="text-muted">
                {paginatedData.length > 0
                  ? `Mostrando ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, dataFiltered.length)} de ${dataFiltered.length}`
                  : 'Sin resultados'}
              </small>
              <CButton
                size="sm"
                color="outline-secondary"
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              >
                <CIcon icon={viewMode === 'table' ? cilGrid : cilList} className="me-1" />
                {viewMode === 'table' ? 'Tarjetas' : 'Tabla'}
              </CButton>
            </div>

            {dataFiltered.length === 0 ? (
              <EmpleadosEmptyState onCrear={() => navigate('/nuevoEmpleado')} />
            ) : viewMode === 'table' ? (
              <EmpleadosTable data={paginatedData} onView={handleView} />
            ) : (
              <EmpleadosGrid data={paginatedData} onView={handleView} />
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 py-3 eco-surface rounded-3 px-3">
                <small className="text-muted">
                  Página {currentPage} de {totalPages}
                </small>
                <CPagination>
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Anterior
                  </CPaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <CPaginationItem
                      key={i}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Siguiente
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </>
        )}
      </CContainer>

      {/* Modal de Conflictos — Bloquea la baja */}
      <CModal
        visible={conflictosModal.visible}
        onClose={() => setConflictosModal({ visible: false, conflictos: [], empleadoNombre: '' })}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle className="d-flex align-items-center gap-2">
            <CIcon icon={cilWarning} style={{ color: '#e55353' }} />
            No se puede procesar la baja
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color="danger" className="mb-3">
            <strong>{conflictosModal.empleadoNombre}</strong> tiene dependencias activas que deben
            resolverse antes de procesar su desincorporación.
          </CAlert>
          <p className="fw-semibold mb-2">Conflictos detectados:</p>
          <ul className="list-unstyled">
            {conflictosModal.conflictos.map((c, i) => (
              <li key={i} className="d-flex align-items-center gap-2 mb-2 p-2 rounded" style={{ background: 'rgba(229,83,83,0.08)' }}>
                <CIcon icon={cilWarning} size="sm" style={{ color: '#e55353' }} />
                <span style={{ fontSize: '0.88rem' }}>{c}</span>
              </li>
            ))}
          </ul>
          <CAlert color="info" className="mt-3 mb-0">
            <strong>Acción requerida:</strong> Solicite a Gestión Administrativa que desasigne al
            empleado de sus cuadrillas, devuelva los activos a inventario y/o libere su plaza antes
            de intentar nuevamente.
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setConflictosModal({ visible: false, conflictos: [], empleadoNombre: '' })}
          >
            Entendido
          </CButton>
        </CModalFooter>
      </CModal>

      <ToastContainer />
      <ConfirmModal />
    </>
  )
}

export default ListEmpleados
