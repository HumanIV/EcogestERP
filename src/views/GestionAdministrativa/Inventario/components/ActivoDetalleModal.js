import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo } from '@coreui/icons'
import { getEstadoColor } from '../utils/inventarioUtils'

const ActivoDetalleModal = ({
  visible,
  onClose,
  selectedItem
}) => {
  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilInfo} className="me-2" />
          Detalle del Activo
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {selectedItem && (
          <div>
            <CRow className="mb-4">
              <CCol md={8}>
                <h5 className="fw-bold">{selectedItem.nombre}</h5>
                <p className="text-muted">{selectedItem.descripcion}</p>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color={getEstadoColor(selectedItem.estado)} className="px-3 py-2">
                  {selectedItem.estado}
                </CBadge>
              </CCol>
            </CRow>
            <CRow className="g-3">
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Codigo</small>
                  <div className="fw-bold">{selectedItem.codigo}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Categoria</small>
                  <div className="fw-bold">{selectedItem.categoria}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted">Ubicacion</small>
                  <div className="fw-bold">{selectedItem.ubicacion}</div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 text-center">
                  <small className="text-muted">Valor Compra</small>
                  <div className="fw-bold h5 mb-0">
                    ${selectedItem.valorCompra?.toLocaleString()}
                  </div>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="border rounded p-3 text-center">
                  <small className="text-muted">Valor Actual</small>
                  <div className="fw-bold h5 mb-0 text-success">
                    ${selectedItem.valorActual?.toLocaleString()}
                  </div>
                </div>
              </CCol>
            </CRow>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ActivoDetalleModal
