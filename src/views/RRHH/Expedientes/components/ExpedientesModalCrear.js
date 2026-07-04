import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormSelect,
  CFormLabel,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilWarning, cilCheckCircle, cilUser } from '@coreui/icons'
import empleadoService from '../../Empleados/services/empleadoService'

import expedienteService from '../services/expedienteService'

const ExpedientesModalCrear = ({ visible, onClose, onCreate }) => {
  const [empleados, setEmpleados] = useState([])
  const [empleadosSinExpediente, setEmpleadosSinExpediente] = useState([])
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (visible) {
      const cargarEmpleados = async () => {
        const empRes = await empleadoService.obtenerTodos()
        if (empRes.success) {
          setEmpleados(empRes.data)
        }
        setSelectedEmpleadoId('')
        setError('')
      }
      cargarEmpleados()
    }
  }, [visible])

  useEffect(() => {
    if (empleados.length > 0 && visible) {
      const cargarExpedientes = async () => {
        const expRes = await expedienteService.obtenerExpedientes()
        const expedientes = expRes.success ? expRes.data : []
        const idsConExpediente = expedientes.map((e) => e.empleadoId)
        setEmpleadosSinExpediente(empleados.filter((e) => !idsConExpediente.includes(e.id)))
      }
      cargarExpedientes()
    }
  }, [empleados, visible])

  const handleCreate = () => {
    if (!selectedEmpleadoId) {
      setError('Debe seleccionar un empleado')
      return
    }
    onCreate(Number(selectedEmpleadoId))
    setSelectedEmpleadoId('')
    setError('')
  }

  const selectedEmpleado = empleados.find((e) => e.id === Number(selectedEmpleadoId))

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton>
        <CModalTitle className="fw-bold text-eco d-flex align-items-center">
          <CIcon icon={cilPlus} className="me-2" />
          Nuevo Expediente
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="px-4">
        <CAlert color="info" className="py-2 d-flex align-items-center">
          <CIcon icon={cilWarning} className="me-2 flex-shrink-0" />
          <small>
            Seleccione un empleado para crear su expediente. Cada empleado solo puede tener un
            expediente.
          </small>
        </CAlert>

        <CFormLabel className="fw-semibold small">Empleado *</CFormLabel>
        <CFormSelect
          value={selectedEmpleadoId}
          onChange={(e) => {
            setSelectedEmpleadoId(e.target.value)
            setError('')
          }}
          invalid={!!error}
          className="input-minec mb-3"
        >
          <option value="">Seleccionar empleado</option>
          {empleadosSinExpediente.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nombre} — {emp.departamento} — {emp.cargo}
            </option>
          ))}
          {empleadosSinExpediente.length === 0 && empleados.length > 0 && (
            <option disabled>Todos los empleados ya tienen expediente</option>
          )}
        </CFormSelect>
        {error && <small className="text-danger">{error}</small>}

        {selectedEmpleado && (
          <div className="p-3 rounded-3 bg-eco-soft border border-eco mt-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white rounded-circle p-2">
                <CIcon icon={cilUser} className="text-eco" size="lg" />
              </div>
              <div>
                <h6 className="fw-bold text-eco mb-0">{selectedEmpleado.nombre}</h6>
                <small className="text-muted">
                  {selectedEmpleado.cargo} · {selectedEmpleado.departamento}
                </small>
                <div className="mt-1">
                  <CBadge color="success" className="me-1">
                    {selectedEmpleado.email}
                  </CBadge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CModalBody>
      <CModalFooter className="border-top-0 pt-0">
        <CButton color="secondary" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="success" onClick={handleCreate} disabled={!selectedEmpleadoId}>
          <CIcon icon={cilCheckCircle} className="me-1" />
          Crear Expediente
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ExpedientesModalCrear
