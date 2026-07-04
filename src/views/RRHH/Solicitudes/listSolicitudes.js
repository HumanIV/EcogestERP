import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CNav,
  CNavItem,
  CNavLink,
  CPagination,
  CPaginationItem,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilReload,
  cilListRich,
  cilCheckCircle,
  cilXCircle,
  cilClock,
  cilSearch,
  cilViewColumn,
  cilList,
} from '@coreui/icons'

import useToast from '../../usuarios/_shared/useToast'
import useSolicitudes from './hooks/useSolicitudes'
import { TIPOS_SOLICITUD, ESTADOS_SOLICITUD } from './constants/solicitudesConstants'

import RrhhPageHeader from '../_shared/RrhhPageHeader'
import SolicitudesStats from './components/SolicitudesStats'
import SolicitudesFilters from './components/SolicitudesFilters'
import SolicitudesTable from './components/SolicitudesTable'
import SolicitudesBoard from './components/SolicitudesBoard'
import SolicitudesModalCrear from './components/SolicitudesModalCrear'
import SolicitudesModalDetalle from './components/SolicitudesModalDetalle'
import RrhhEmptyState from '../_shared/RrhhEmptyState'

const ListSolicitudes = () => {
  const { showToast, ToastContainer } = useToast()
  const { solicitudes, loading, error, cargarSolicitudes, crearSolicitud, calcularStats } =
    useSolicitudes()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [activeTab, setActiveTab] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('board') // 'board' o 'list'
  const itemsPerPage = 8

  const [detailVisible, setDetailVisible] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterTipo, filterEstado, activeTab, viewMode])

  const dataFiltered = solicitudes.filter((s) => {
    const match =
      s.empleadoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
    const tipoMatch = !filterTipo || s.tipo === filterTipo
    const estadoMatch = !filterEstado || s.estado === filterEstado
    const tabMatch =
      activeTab === 'todos' ||
      (activeTab === 'pendientes' && s.estado === 'Pendiente') ||
      (activeTab === 'revision' && s.estado === 'En revisión') ||
      (activeTab === 'aprobadas' && s.estado === 'Aprobada') ||
      (activeTab === 'rechazadas' && s.estado === 'Rechazada')
    return match && tipoMatch && estadoMatch && tabMatch
  })

  const totalPages = Math.ceil(dataFiltered.length / itemsPerPage) || 1
  const paginatedData = dataFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const stats = calcularStats()

  const handleView = (item) => {
    setSelected(item)
    setDetailVisible(true)
  }

  const handleCreate = async (form) => {
    const data = {
      ...form,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
    }
    const res = await crearSolicitud(data)
    showToast(
      res.success ? 'Solicitud creada exitosamente' : res.error,
      res.success ? 'success' : 'danger',
    )
    if (res.success) setCreateVisible(false)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterTipo('')
    setFilterEstado('')
    setActiveTab('todos')
  }

  if (loading) {
    return (
      <CContainer
        fluid
        className="d-flex justify-content-center align-items-center fade-in"
        style={{ height: '70vh' }}
      >
        <div className="text-center">
          <CSpinner color="success" />
          <p className="text-muted mt-3">Cargando solicitudes...</p>
        </div>
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer fluid className="py-5 fade-in">
        <CCard className="eco-card text-center">
          <CCardBody className="py-5">
            <CIcon icon={cilSearch} size="3xl" className="text-danger mb-3" />
            <h5 className="text-danger">Error al cargar solicitudes</h5>
            <p className="text-muted">{error}</p>
            <CButton color="danger" onClick={cargarSolicitudes}>
              Reintentar
            </CButton>
          </CCardBody>
        </CCard>
      </CContainer>
    )
  }

  return (
    <>
      <CContainer fluid className="px-0 px-md-4 fade-in">
        <RrhhPageHeader
          icon={cilListRich}
          title="Gestión de Solicitudes"
          subtitle="Administra vacaciones, permisos, constancias y licencias del personal"
          badge={stats.total}
          actions={[
            {
              label: 'Actualizar',
              icon: cilReload,
              color: 'outline-secondary',
              onClick: cargarSolicitudes,
            },
            {
              label: 'Nueva Solicitud',
              icon: cilPlus,
              color: 'success',
              onClick: () => setCreateVisible(true),
            },
          ]}
        />

        {/* Stats con gradientes */}
        <SolicitudesStats estadisticas={stats} />

        {/* Tabs + Filtros en CCard */}
        <CCard className="eco-card mb-4 border-0 shadow-sm">
          <CCardBody className="pb-2">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
              <CNav variant="pills" className="flex-wrap">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'todos'}
                    onClick={() => setActiveTab('todos')}
                    className="fw-semibold"
                  >
                    Todas ({stats.total})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'pendientes'}
                    onClick={() => setActiveTab('pendientes')}
                    className="fw-semibold"
                  >
                    <CIcon icon={cilClock} className="me-1" size="sm" />
                    Pendientes ({stats.pendientes})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'revision'}
                    onClick={() => setActiveTab('revision')}
                    className="fw-semibold"
                  >
                    En Revisión ({stats.enRevision})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'aprobadas'}
                    onClick={() => setActiveTab('aprobadas')}
                    className="fw-semibold"
                  >
                    <CIcon icon={cilCheckCircle} className="me-1" size="sm" />
                    Aprobadas ({stats.aprobadas})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'rechazadas'}
                    onClick={() => setActiveTab('rechazadas')}
                    className="fw-semibold"
                  >
                    <CIcon icon={cilXCircle} className="me-1" size="sm" />
                    Rechazadas ({stats.rechazadas})
                  </CNavLink>
                </CNavItem>
              </CNav>

              {/* Selector de Vista */}
              <CButtonGroup role="group" aria-label="Selector de Vista">
                <CButton
                  color={viewMode === 'board' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('board')}
                  className="d-flex align-items-center px-3"
                  size="sm"
                >
                  <CIcon icon={cilViewColumn} className={viewMode === 'board' ? 'me-2 text-white' : 'me-2'} />
                  <span className={viewMode === 'board' ? 'text-white' : ''}>Tablero</span>
                </CButton>
                <CButton
                  color={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                  className="d-flex align-items-center px-3"
                  size="sm"
                >
                  <CIcon icon={cilList} className={viewMode === 'list' ? 'me-2 text-white' : 'me-2'} />
                  <span className={viewMode === 'list' ? 'text-white' : ''}>Lista</span>
                </CButton>
              </CButtonGroup>
            </div>

            <hr className="mt-0 mb-3" />

            <SolicitudesFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterTipo={filterTipo}
              onFilterTipoChange={setFilterTipo}
              filterEstado={filterEstado}
              onFilterEstadoChange={setFilterEstado}
              onClearFilters={clearFilters}
              totalResults={dataFiltered.length}
              totalSolicitudes={solicitudes.length}
              tipos={TIPOS_SOLICITUD}
              estados={ESTADOS_SOLICITUD}
            />
          </CCardBody>
        </CCard>

        {/* Renderizado de Vista (Tablero o Lista) */}
        {viewMode === 'board' ? (
          <SolicitudesBoard data={dataFiltered} onView={handleView} />
        ) : (
          <CCard className="eco-card border-0 shadow-sm">
            <CCardBody className="p-0">
              {dataFiltered.length === 0 ? (
                <RrhhEmptyState
                  icon={cilListRich}
                  title="No se encontraron solicitudes"
                  message="Intenta con otros filtros o crea una nueva solicitud"
                  actionLabel="Nueva Solicitud"
                  onAction={() => setCreateVisible(true)}
                />
              ) : (
                <SolicitudesTable data={paginatedData} onView={handleView} />
              )}
            </CCardBody>
          </CCard>
        )}

        {/* Paginación solo para vista Lista */}
        {viewMode === 'list' && totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 py-3 eco-surface rounded-3 px-3">
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
      </CContainer>

      <SolicitudesModalCrear
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreate}
      />

      <SolicitudesModalDetalle
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        solicitud={selected}
      />

      <ToastContainer />
    </>
  )
}

export default ListSolicitudes
