import React, { useEffect } from 'react'
import { CContainer, CTabContent, CTabPane } from '@coreui/react'
import useInventario from './hooks/useInventario'
import InventarioActivos from './components/InventarioActivos'
import InventarioMovimientos from './components/InventarioMovimientos'
import InventarioReportes from './components/InventarioReportes'
import InventarioFooter from './components/InventarioFooter'
import InventarioTabs from './components/InventarioTabs'
import InventarioDashboard from './components/InventarioDashboard'
import InventarioAlertas from './components/InventarioAlertas'
import useToast from '../../usuarios/_shared/useToast'
import ActivoModal from './components/ActivoModal'
import MovimientoModal from './components/MovimientoModal'
import ActivoDetalleModal from './components/ActivoDetalleModal'

const Inventario = () => {
  const { showToast } = useToast()

  const {
    loading,
    activeTab,
    setActiveTab,
    visibleModal,
    modalType,
    selectedItem,
    filtros,
    activos,
    todosActivos,
    movimientos,
    alertas,
    metricas,
    proveedores,
    cuadrillas,
    handleFiltroChange,
    limpiarFiltros,
    refreshData,
    handleOpenModal,
    handleCloseModal,
    agregarActivo,
    editarActivo,
    eliminarActivo,
    registrarMovimiento,
    generarReporte,
  } = useInventario()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <CContainer fluid className="px-3 px-md-4 py-4 animate-fade-eco">
      <div className="eco-card mb-4 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center">
            <h1 className="h2 fw-bold mb-0 me-3">Sistema de Gestión de Activos</h1>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => handleOpenModal('movimiento')}
            >
              <i className="bi bi-arrow-left-right me-2"></i>
              Mover Activo
            </button>
            <button className="btn btn-success text-white btn-sm" onClick={() => handleOpenModal('activo')}>
              <i className="bi bi-plus-lg me-2"></i>
              Añadir Activo
            </button>
          </div>
        </div>

        <div className="mt-4">
          <InventarioTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <CTabContent className="mt-4">
            <CTabPane visible={activeTab === 'dashboard'}>
              <InventarioDashboard metricas={metricas} activos={todosActivos} movimientos={movimientos} />
            </CTabPane>

            <CTabPane visible={activeTab === 'activos'}>
              <InventarioActivos
                activos={activos}
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                onLimpiarFiltros={limpiarFiltros}
                onAgregar={() => handleOpenModal('activo')}
                onVerDetalle={(activo) => handleOpenModal('detalle', activo)}
                onEditar={(activo) => handleOpenModal('editar', activo)}
                onMovimiento={(activo) => handleOpenModal('movimiento', activo)}
                onEliminar={(activo) => eliminarActivo(activo.id, activo)}
                loading={loading}
                proveedores={proveedores}
              />
            </CTabPane>

            <CTabPane visible={activeTab === 'movimientos'}>
              <InventarioMovimientos
                movimientos={movimientos}
                onNuevoMovimiento={() => handleOpenModal('movimiento')}
                loading={loading}
              />
            </CTabPane>

            <CTabPane visible={activeTab === 'alertas'}>
              <InventarioAlertas
                alertas={alertas}
                onVerActivo={(id) => {
                  const activo = todosActivos.find((a) => a.id === id)
                  if (activo) handleOpenModal('detalle', activo)
                }}
              />
            </CTabPane>


          </CTabContent>
        </div>
      </div>

      {(modalType === 'activo' || modalType === 'editar') && (
        <ActivoModal
          visible={visibleModal}
          onClose={handleCloseModal}
          activos={todosActivos}
          proveedores={proveedores}
          activoAEditar={modalType === 'editar' ? selectedItem : null}
          onSave={async (formData) => {
            if (modalType === 'editar') {
              const success = await editarActivo(selectedItem.id, formData)
              if (success) {
                showToast('Activo actualizado exitosamente', 'success')
              } else {
                showToast('No se pudo actualizar el activo', 'danger')
              }
            } else {
              const success = await agregarActivo(formData)
              if (success) {
                showToast('Activo registrado exitosamente', 'success')
              } else {
                showToast('No se pudo registrar el activo', 'danger')
              }
            }
          }}
        />
      )}

      {modalType === 'movimiento' && (
        <MovimientoModal
          visible={visibleModal}
          onClose={handleCloseModal}
          activos={todosActivos}
          cuadrillas={cuadrillas}
          activoPreSeleccionado={selectedItem}
          onSave={async (movimientosArray) => {
            try {
              const promises = movimientosArray.map((mov) => registrarMovimiento(mov))
              await Promise.all(promises)
              showToast(
                `Solicitud registrada para ${movimientosArray.length} activo(s) y enviada a Bandeja Administrativa para aprobación.`,
                'success',
              )
            } catch (err) {
              showToast('Error al registrar los movimientos', 'danger')
            }
          }}
        />
      )}

      {modalType === 'detalle' && (
        <ActivoDetalleModal
          visible={visibleModal}
          onClose={handleCloseModal}
          selectedItem={selectedItem}
        />
      )}

      <InventarioFooter metricas={metricas} />
    </CContainer>
  )
}

export default Inventario
