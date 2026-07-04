import React from 'react'
import { CAlert, CListGroup, CListGroupItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilCheckCircle, cilFile } from '@coreui/icons'

const StepConfirmacion = ({ estadoWizard }) => {
  const { datosPersonales, datosLaborales, datosDocumentales } = estadoWizard

  return (
    <div className="fade-in">
      <h5 className="mb-4 text-eco">Confirmación de Datos</h5>

      <CAlert color="info" className="mb-4 d-flex align-items-center">
        <CIcon icon={cilWarning} className="me-3" size="xl" />
        <div>
          <strong>¡Atención!</strong> Revise los datos antes de finalizar. Esta acción creará la
          solicitud de contratación y la enviará a Bandeja Administrativa para aprobación.
        </div>
      </CAlert>

      <div className="mb-4">
        <h6 className="fw-bold border-bottom pb-2">Datos Personales</h6>
        <CListGroup flush>
          <CListGroupItem>
            <strong>Primer nombre:</strong> {datosPersonales.nombre || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Segundo nombre:</strong> {datosPersonales.segundoNombre || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Primer apellido:</strong> {datosPersonales.apellidos || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Segundo apellido:</strong> {datosPersonales.segundoApellido || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Cédula:</strong> {datosPersonales.cedula || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Fecha de nacimiento:</strong> {datosPersonales.fechaNacimiento || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Género:</strong> {datosPersonales.genero || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Email:</strong> {datosPersonales.email || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Teléfono:</strong> {datosPersonales.telefono || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Estado:</strong> {datosPersonales.estado || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Municipio:</strong> {datosPersonales.municipio || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Parroquia:</strong> {datosPersonales.parroquia || '—'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Dirección:</strong> {datosPersonales.direccion || '—'}
          </CListGroupItem>
        </CListGroup>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold border-bottom pb-2">Datos Laborales</h6>
        <CListGroup flush>
          <CListGroupItem>
            <strong>Plaza:</strong> {datosLaborales.plazaId || 'No seleccionada'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Tipo de contrato:</strong> {datosLaborales.tipoContrato || 'No seleccionado'}
          </CListGroupItem>
        </CListGroup>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold border-bottom pb-2">Documentación</h6>
        <CListGroup flush>
          <CListGroupItem>
            <strong>Documentos adjuntos:</strong>{' '}
            {datosDocumentales.length > 0 ? `${datosDocumentales.length} archivo(s)` : 'Ninguno'}
          </CListGroupItem>
          {datosDocumentales.map((doc, i) => (
            <CListGroupItem key={i}>
              <CIcon icon={cilFile} className="text-primary me-2" size="sm" />
              {doc.nombreArchivo}
            </CListGroupItem>
          ))}
        </CListGroup>
      </div>
    </div>
  )
}

export default StepConfirmacion
