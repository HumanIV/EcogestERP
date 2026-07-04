import React, { useState, useCallback, useRef } from 'react'
import {
  CContainer,
  CButton,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMap, cilChart, cilList, cilWarning, cilSync, cilArrowBottom } from '@coreui/icons'
import useToast from '../../usuarios/_shared/useToast'

import MapaCalor from './components/mapaCalor'
import DashboardEstadisticas from './components/dashBoardEstadisticas'
import GestionUnificada from './components/GestionUnificada'
import DetallesGestionModal from './components/detallesGestionModal'
import useGestionDenuncias from './hooks/useGestionDenuncias'

const GestionDenuncias = () => {
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('gestion')
  const [denunciaSeleccionada, setDenunciaSeleccionada] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  
  // Lazy mount: solo montar MapaCalor la primera vez que el usuario abre el tab
  const [mapaVisitado, setMapaVisitado] = useState(false)

  // Actualizar estado de visita cuando se abre el tab de mapa
  if (activeTab === 'mapa' && !mapaVisitado) {
    setMapaVisitado(true)
  }

  const {
    denuncias,
    estadisticas,
    cuadrillas,
    loading,
    error,
    actualizarEstadoDenuncia,
    asignarDenuncia,
    exportarReporte,
    refreshData,
    obtenerCuadrillasDisponibles,
    obtenerCuadrillaOptima,
    agregarComentario,
    resolverDenuncia,
    exportarDenunciaIndividual,
  } = useGestionDenuncias({})

  const handleSelectDenuncia = useCallback((denuncia) => {
    setDenunciaSeleccionada(denuncia)
    setModalVisible(true)
  }, [])

  const handleEstadoChange = useCallback(
    async (id, nuevoEstado) => {
      const resultado = await actualizarEstadoDenuncia(id, nuevoEstado)
      if (resultado) {
        showToast(`Estado actualizado a: ${nuevoEstado}`, 'success')
      }
    },
    [actualizarEstadoDenuncia, showToast],
  )

  const handleAsignar = useCallback(
    async (id, cuadrillaId) => {
      const resultado = await asignarDenuncia(id, cuadrillaId)
      if (resultado) {
        showToast(`Denuncia asignada a cuadrilla ${cuadrillaId}`, 'success')
      }
    },
    [asignarDenuncia, showToast],
  )

  const handleExportar = useCallback(async () => {
    const resultado = await exportarReporte({})
    if (resultado) {
      showToast('Reporte exportado exitosamente', 'success')
    }
  }, [exportarReporte, showToast])

  const handleAgregarComentario = useCallback(
    async (id, texto) => {
      const resultado = await agregarComentario(id, texto)
      if (resultado) {
        showToast('Comentario agregado exitosamente', 'success')
      }
    },
    [agregarComentario, showToast],
  )

  const handleResolver = useCallback(
    async (id, datosResolucion) => {
      const resultado = await resolverDenuncia(id, datosResolucion)
      if (resultado) {
        showToast('La denuncia ha sido marcada como resuelta', 'success')
      }
    },
    [resolverDenuncia, showToast],
  )

  const handleExportarIndividual = useCallback(
    (denuncia) => {
      exportarDenunciaIndividual(denuncia)
      showToast(`Denuncia ${denuncia.id} exportada`, 'success')
    },
    [exportarDenunciaIndividual, showToast],
  )

  if (error) {
    return (
      <CContainer fluid className="py-5">
        <CAlert color="danger" className="text-center">
          <h4>Error al cargar datos</h4>
          <p>{error.message}</p>
          <CButton color="danger" onClick={refreshData}>
            <CIcon icon={cilSync} className="me-2" />
            Reintentar
          </CButton>
        </CAlert>
      </CContainer>
    )
  }

  return (
    <CContainer fluid className="animate-fade-eco px-3 px-md-4 py-4">
      {/* Header Premium */}
      <div className="premium-panel mb-4 px-4 py-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-eco-soft rounded-circle text-eco">
              <CIcon icon={cilWarning} size="xl" />
            </div>
            <div>
              <h2 className="mb-1 fw-bold text-dark">Gestión de Denuncias</h2>
              <small className="text-muted d-block">Panel administrativo ECOGEST-MINEC</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <CButton
              color="secondary"
              variant="outline"
              className="fw-semibold px-3"
              onClick={refreshData}
              disabled={loading}
            >
              <CIcon icon={cilSync} className={loading ? 'spin me-2' : 'me-2'} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </CButton>
            <CButton color="outline-eco" className="fw-semibold px-3" onClick={handleExportar}>
              <CIcon icon={cilArrowBottom} className="me-2" />
              Exportar
            </CButton>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <CTabs activeKey={activeTab} onActiveKeyChange={(key) => setActiveTab(key)}>
        <CNav variant="tabs" className="border-0 mb-3 nav-pills">
          <CNavItem>
            <CNavLink
              className="fw-semibold text-montserrat"
              onClick={() => setActiveTab('gestion')}
              active={activeTab === 'gestion'}
            >
              <CIcon icon={cilList} className="me-2" />
              Gestión
              <CBadge color="warning" className="badge-eco ms-2">
                {estadisticas.pendientes || 0}
              </CBadge>
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              className="fw-semibold text-montserrat"
              onClick={() => setActiveTab('mapa')}
              active={activeTab === 'mapa'}
            >
              <CIcon icon={cilMap} className="me-2" />
              Mapa
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              className="fw-semibold text-montserrat"
              onClick={() => setActiveTab('estadisticas')}
              active={activeTab === 'estadisticas'}
            >
              <CIcon icon={cilChart} className="me-2" />
              Estadísticas
              <CBadge color="primary" className="badge-eco ms-2">
                {estadisticas.total || 0}
              </CBadge>
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible={activeTab === 'gestion'}>
            <GestionUnificada
              denuncias={denuncias}
              estadisticas={estadisticas}
              cuadrillas={cuadrillas}
              loading={loading}
              onSelectDenuncia={handleSelectDenuncia}
              onEstadoChange={handleEstadoChange}
              onAsignar={handleAsignar}
            />
          </CTabPane>

          <CTabPane visible={activeTab === 'mapa'}>
            {/* Lazy mount: solo se monta cuando el tab fue visitado por primera vez.
                Esto evita que Leaflet inicialice el mapa dentro de un div con display:none
                (CoreUI oculta los CTabPane inactivos), lo que causaba que el mapa
                calculara height=0 y los tiles quedaran rotos/invisibles. */}
            {mapaVisitado && (
              <MapaCalor denuncias={denuncias} onSelectDenuncia={handleSelectDenuncia} filtros={{}} />
            )}
          </CTabPane>

          <CTabPane visible={activeTab === 'estadisticas'}>
            <DashboardEstadisticas estadisticas={estadisticas} denuncias={denuncias} filtros={{}} />
          </CTabPane>
        </CTabContent>
      </CTabs>

      <DetallesGestionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        denuncia={denunciaSeleccionada}
        onEstadoChange={handleEstadoChange}
        onAsignar={handleAsignar}
        onAgregarComentario={handleAgregarComentario}
        onResolver={handleResolver}
        onExportarIndividual={handleExportarIndividual}
        denuncias={denuncias}
        cuadrillasDisponibles={obtenerCuadrillasDisponibles()}
        obtenerCuadrillaOptima={obtenerCuadrillaOptima}
      />
    </CContainer>
  )
}

export default GestionDenuncias
