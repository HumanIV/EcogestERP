import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilPlus, cilBriefcase, cilChart, cilList } from '@coreui/icons'
import estructuraOrgService from './services/estructuraOrgService'
import useToast from '../../usuarios/_shared/useToast'
import useConfirmModal from '../../usuarios/_shared/useConfirmModal'
import RrhhPageHeader from '../_shared/RrhhPageHeader'
import OrganigramaView from './components/OrganigramaView'
import PlazasTable from './components/PlazasTable'
import EstadisticasTab from './components/EstadisticasTab'
import PlazasModal from './components/PlazasModal'
import { DEPARTAMENTOS_OFICIALES, resolverDepto } from './constants/estructuraConstants'

const EstructuraOrg = () => {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { confirm, ConfirmModal } = useConfirmModal()

  const [activeTab, setActiveTab] = useState('organigrama')
  const [activePlazasSubTab, setActivePlazasSubTab] = useState('aprobadas')
  const [plazas, setPlazas] = useState([])
  const [solicitudesPlaza, setSolicitudesPlaza] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPlaza, setEditingPlaza] = useState(null)

  const tabs = [
    { key: 'organigrama', label: 'Organigrama', icon: cilBuilding },
    { key: 'plazas', label: 'Plazas', icon: cilBriefcase },
    { key: 'estadisticas', label: 'Estadísticas', icon: cilChart },
  ]

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    const resPlazas = await estructuraOrgService.obtenerPlazas()
    const resStats = await estructuraOrgService.obtenerEstadisticas()

    if (resPlazas.success && resPlazas.data.length > 0) {
      setPlazas(resPlazas.data)
    } else {
      const resEstructura = await estructuraOrgService.obtenerDatos()
      if (resEstructura.success) {
        setPlazas(resEstructura.data.plazas || [])
      }
    }

    if (resStats.success) setEstadisticas(resStats.data)
    setLoading(false)
  }, [])

  const cargarSolicitudes = useCallback(async () => {
    const res = await estructuraOrgService.obtenerSolicitudesPlaza()
    if (res.success) setSolicitudesPlaza(res.data)
  }, [])

  useEffect(() => {
    cargarDatos()
    cargarSolicitudes()
  }, [cargarDatos, cargarSolicitudes])

  const handleNewPlaza = () => {
    setEditingPlaza(null)
    setModalVisible(true)
  }

  const handleEditPlaza = (plaza) => {
    setEditingPlaza(plaza)
    setModalVisible(true)
  }

  const handleSavePlaza = async (formData) => {
    if (editingPlaza) {
      const res = await estructuraOrgService.actualizarPlaza(editingPlaza.id, formData)
      if (res.success) {
        showToast('Plaza actualizada exitosamente', 'success')
        setModalVisible(false)
        cargarDatos()
      } else {
        showToast(res.error, 'danger')
      }
    } else {
      const res = await estructuraOrgService.solicitarPlaza(formData)
      if (res.success) {
        showToast(res.message, 'success')
        setModalVisible(false)
        cargarSolicitudes()
      } else {
        showToast(res.error, 'danger')
      }
    }
  }

  const handleDeletePlaza = async (plaza) => {
    const ok = await confirm(
      '¿Eliminar plaza?',
      `¿Está seguro de eliminar la plaza ${plaza.codigo} (${plaza.cargo})?`,
      { confirmLabel: 'Eliminar', variant: 'danger' },
    )
    if (!ok) return
    const res = await estructuraOrgService.eliminarPlaza(plaza.id)
    if (res.success) {
      showToast('Plaza eliminada', 'success')
      cargarDatos()
    } else {
      showToast(res.error, 'danger')
    }
  }

  const handleDesocuparPlaza = async (plaza) => {
    const ok = await confirm(
      '¿Desocupar plaza?',
      `¿Desocupar la plaza ${plaza.codigo}? El empleado ${plaza.empleadoNombre} quedará sin plaza asignada.`,
      { confirmLabel: 'Desocupar', variant: 'warning' },
    )
    if (!ok) return
    const res = await estructuraOrgService.desocuparPlaza(plaza.id)
    if (res.success) {
      showToast(res.message, 'success')
      cargarDatos()
    } else {
      showToast(res.error, 'danger')
    }
  }

  if (loading) {
    return (
      <CContainer
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: '50vh' }}
      >
        <div className="spinner-border text-eco" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="ms-3">Cargando estructura organizativa...</span>
      </CContainer>
    )
  }

  return (
    <CContainer fluid className="px-0 px-md-4 fade-in">
      <RrhhPageHeader
        icon={cilBuilding}
        title="Estructura Organizativa"
        subtitle="Organigrama, plazas presupuestadas y asignación de personal"
        badge={estadisticas?.total}
        actions={[
          {
            label: 'Solicitar Plaza',
            icon: cilPlus,
            color: 'success',
            onClick: handleNewPlaza,
          },
        ]}
      />

      <div className="mb-4">
        <CNav variant="pills" className="mb-3">
          {tabs.map((tab) => (
            <CNavItem key={tab.key}>
              <CNavLink
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={tab.icon} size="sm" />
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>
      </div>

      {activeTab === 'organigrama' && (
        <OrganigramaView
          plazas={plazas}
          onEmployeeClick={(id) => navigate('/perfilEmpleado/' + id)}
        />
      )}

      {activeTab === 'plazas' && (
        <>
          <CNav variant="tabs" className="mb-3">
            <CNavItem>
              <CNavLink
                active={activePlazasSubTab === 'aprobadas'}
                onClick={() => setActivePlazasSubTab('aprobadas')}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={cilBriefcase} size="sm" />
                Plazas Aprobadas
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activePlazasSubTab === 'solicitudes'}
                onClick={() => setActivePlazasSubTab('solicitudes')}
                className="d-flex align-items-center gap-2"
              >
                <CIcon icon={cilList} size="sm" />
                Solicitudes
                {solicitudesPlaza.length > 0 && (
                  <CBadge color="warning" shape="rounded-pill" className="ms-1">
                    {solicitudesPlaza.length}
                  </CBadge>
                )}
              </CNavLink>
            </CNavItem>
          </CNav>

          {activePlazasSubTab === 'aprobadas' && (
            <PlazasTable
              plazas={plazas}
              estadisticas={estadisticas}
              onEdit={handleEditPlaza}
              onDelete={handleDeletePlaza}
              onDesocupar={handleDesocuparPlaza}
              onEmployeeClick={(id) => navigate('/perfilEmpleado/' + id)}
            />
          )}

          {activePlazasSubTab === 'solicitudes' && (
            <CCard className="eco-card">
              <CCardBody className="p-0">
                <CTable hover responsive align="middle" className="table-minec mb-0">
                  <CTableHead>
                    <CTableRow
                      style={{
                        background: 'linear-gradient(135deg, var(--eco-50), var(--eco-100))',
                      }}
                    >
                      <CTableHeaderCell className="text-eco fw-semibold">Código</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">
                        Departamento
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Cargo</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">Estado</CTableHeaderCell>
                      <CTableHeaderCell className="text-eco fw-semibold">
                        Fecha Solicitud
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {solicitudesPlaza.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center py-5 text-muted">
                          No hay solicitudes de plaza pendientes
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      solicitudesPlaza.map((s) => (
                        <CTableRow key={s.id}>
                          <CTableDataCell>
                            <strong className="text-eco">{s.codigo}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            {resolverDepto(s.departamentoCodigo).nombre}
                          </CTableDataCell>
                          <CTableDataCell>{s.cargo}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="warning" className="px-2 py-1">
                              {s.estado}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small className="text-muted">
                              {new Date(s.fechaSolicitud).toLocaleDateString()}
                            </small>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          )}
        </>
      )}

      {activeTab === 'estadisticas' && <EstadisticasTab estadisticas={estadisticas} />}

      <PlazasModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSavePlaza}
        editingPlaza={editingPlaza}
        plazas={plazas}
        solicitudesPlaza={solicitudesPlaza}
      />

      <ConfirmModal />
      <ToastContainer />
    </CContainer>
  )
}

export default EstructuraOrg
