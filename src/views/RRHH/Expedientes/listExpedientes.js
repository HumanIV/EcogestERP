import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CButton, CNav, CNavItem, CNavLink } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFolder, cilReload, cilGrid, cilList } from '@coreui/icons'
import expedienteService from './services/expedienteService'
import empleadoService from '../Empleados/services/empleadoService'
import { EXP_ESTADOS } from './constants/expedientesConstants'
import ExpedientesStats from './components/ExpedientesStats'
import ExpedientesFilters from './components/ExpedientesFilters'
import ExpedientesTable from './components/ExpedientesTable'
import ExpedientesGrid from './components/ExpedientesGrid'
import ExpedientesModalUpload from './components/ExpedientesModalUpload'
import ExpedientesVisor from './components/ExpedientesVisor'
import RrhhPageHeader from '../_shared/RrhhPageHeader'
import RrhhEmptyState from '../_shared/RrhhEmptyState'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'

const Expedientes = () => {
  const { showToast, ToastContainer } = useToast()
  const { confirm, ConfirmModal } = useConfirmModal()
  const [expedientes, setExpedientes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [modalUpload, setModalUpload] = useState(false)
  const [visor, setVisor] = useState(false)
  const [currentExp, setCurrentExp] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [activeTab, setActiveTab] = useState('activos')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const expRes = await expedienteService.obtenerExpedientes()
      const empRes = await empleadoService.obtenerTodos()
      if (expRes.success && empRes.success) {
        let expedientesActuales = [...expRes.data]

        // Auto-sincronización: crear expediente si el empleado no tiene
        for (const emp of empRes.data) {
          const hasExp = expedientesActuales.find((ex) => String(ex.empleadoId) === String(emp.id))
          if (!hasExp) {
            const newExpRes = await expedienteService.crearExpediente({ empleadoId: emp.id })
            if (newExpRes.success) {
              expedientesActuales.push(newExpRes.data)
            }
          }
        }

        setExpedientes(expedientesActuales)
        setEmpleados(empRes.data)
      }
    } catch (error) {
      console.error('Error cargando expedientes:', error)
    }
    setLoading(false)
  }

  const handleUpload = async (expId, docData) => {
    const res = await expedienteService.agregarDocumento(expId, docData)
    if (res.success) {
      showToast(res.message, 'success')
      await loadData()
      if (res.data) setCurrentExp(res.data)
    } else {
      showToast(res.error, 'danger')
    }
  }

  const handleDelete = async (exp) => {
    const ok = await confirm(
      '¿Eliminar expediente?',
      `¿Está seguro de eliminar el expediente de ${getEmpleadoName(exp.empleadoId)}?`,
      { confirmLabel: 'Eliminar', variant: 'danger' },
    )
    if (!ok) return
    const res = await expedienteService.eliminarExpediente(exp.id)
    if (res.success) {
      showToast(res.message, 'success')
      await loadData()
    } else {
      showToast(res.error, 'danger')
    }
  }

  const getEmpleadoName = (id) =>
    empleados.find((e) => String(e.id) === String(id))?.nombre || 'Desconocido'

  const filtered = expedientes.filter((exp) => {
    const emp = empleados.find((e) => String(e.id) === String(exp.empleadoId))
    const matchesSearch =
      !searchTerm ||
      emp?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp?.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = !filterDept || emp?.departamento === filterDept
    const matchesStatus = !filterStatus || exp.estadoExp === filterStatus
    const tabMatch =
      activeTab === 'todos' ||
      (activeTab === 'activos' && emp?.estado === 'Activo') ||
      (activeTab === 'inactivos' && emp?.estado === 'Inactivo')

    return matchesSearch && matchesDept && matchesStatus && tabMatch
  })

  const departamentos = [...new Set(empleados.map((e) => e.departamento).filter(Boolean))].sort()

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filtered.map((e) => e.id) : [])
  }

  const handleSelectItem = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleRefresh = async () => {
    await loadData()
    showToast('Datos actualizados', 'info')
  }

  const empleadosSinExp = empleados.filter(
    (emp) => !expedientes.find((ex) => String(ex.empleadoId) === String(emp.id)),
  ).length

  return (
    <div className="fade-in">
      <RrhhPageHeader
        icon={cilFolder}
        title="Expedientes"
        subtitle="Biblioteca documental del personal"
        badge={expedientes.length}
        actions={[
          {
            label: viewMode === 'grid' ? 'Tabla' : 'Tarjetas',
            icon: viewMode === 'grid' ? cilList : cilGrid,
            color: 'outline-secondary',
            onClick: () => setViewMode(viewMode === 'grid' ? 'table' : 'grid'),
          },
          {
            label: 'Actualizar',
            icon: cilReload,
            color: 'outline-success',
            onClick: handleRefresh,
          },
        ]}
      />

      <ExpedientesStats
        expedientes={expedientes}
        empleados={empleados}
        sinExpediente={empleadosSinExp}
      />

      <div className="mt-4 mb-3">
        <CNav variant="pills" className="eco-nav-pills">
          <CNavItem>
            <CNavLink
              active={activeTab === 'activos'}
              onClick={() => setActiveTab('activos')}
              style={{ cursor: 'pointer' }}
            >
              Expedientes Activos
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeTab === 'inactivos'}
              onClick={() => setActiveTab('inactivos')}
              style={{ cursor: 'pointer' }}
            >
              Archivo Muerto (Inactivos)
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeTab === 'todos'}
              onClick={() => setActiveTab('todos')}
              style={{ cursor: 'pointer' }}
            >
              Todos
            </CNavLink>
          </CNavItem>
        </CNav>
      </div>

      <CCard className="eco-card mt-3">
        <CCardBody>
          <ExpedientesFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterDept={filterDept}
            onFilterDeptChange={setFilterDept}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            onClearFilters={() => {
              setSearchTerm('')
              setFilterDept('')
              setFilterStatus('')
            }}
            totalResults={filtered.length}
            totalExpedientes={expedientes.length}
            departamentos={departamentos}
            estados={EXP_ESTADOS}
          />

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-eco" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <RrhhEmptyState
              icon={cilFolder}
              title="No se encontraron expedientes"
              message={
                expedientes.length === 0
                  ? 'No hay empleados registrados en el sistema'
                  : 'Intenta ajustar los filtros de búsqueda'
              }
              actionLabel={null}
              onAction={null}
            />
          ) : viewMode === 'grid' ? (
            <ExpedientesGrid
              data={filtered}
              empleados={empleados}
              onView={(exp) => {
                setCurrentExp(exp)
                setVisor(true)
              }}
              onUpload={(exp) => {
                setCurrentExp(exp)
                setModalUpload(true)
              }}
            />
          ) : (
            <ExpedientesTable
              data={filtered}
              empleados={empleados}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectItem={handleSelectItem}
              onView={(exp) => {
                setCurrentExp(exp)
                setVisor(true)
              }}
              onUpload={(exp) => {
                setCurrentExp(exp)
                setModalUpload(true)
              }}
              onDelete={handleDelete}
            />
          )}
        </CCardBody>
      </CCard>

      {currentExp && (
        <>
          <ExpedientesModalUpload
            visible={modalUpload}
            onClose={() => {
              setModalUpload(false)
              setCurrentExp(null)
            }}
            onUpload={handleUpload}
            expediente={currentExp}
            empleado={empleados.find((e) => String(e.id) === String(currentExp.empleadoId))}
          />
          <ExpedientesVisor
            visible={visor}
            onClose={() => {
              setVisor(false)
              setCurrentExp(null)
            }}
            expediente={currentExp}
            empleado={empleados.find((e) => String(e.id) === String(currentExp.empleadoId))}
            onUpload={handleUpload}
          />
        </>
      )}
      <ConfirmModal />
      <ToastContainer />
    </div>
  )
}

export default Expedientes
