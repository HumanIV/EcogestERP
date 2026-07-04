import React from 'react'
import { CRow, CCol, CFormSelect, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilWarning } from '@coreui/icons'
import { DEPARTAMENTOS_OFICIALES } from '../../../EstructuraOrg/constants/estructuraConstants'

const StepLaboral = ({ data, onChange, plazasVacantes }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange('datosLaborales', name, value)

    // Si cambia el nivel jerárquico, resetear el cargo
    if (name === 'nivelJerarquico') {
      onChange('datosLaborales', 'cargo', '')
    }
  }

  // Diccionario de cargos por nivel jerárquico
  const opcionesCargo = {
    Obrero: ['Personal de Mantenimiento', 'Chofer', 'Obrero General'],
    Técnico: ['Inspector Ambiental', 'Asistente Administrativo', 'Técnico de Campo'],
    Profesional: ['Especialista I', 'Especialista II', 'Analista de Proyectos'],
  }

  return (
    <div className="fade-in">
      <h5 className="mb-3 text-eco">Información Organizacional</h5>

      <CAlert color="info" className="d-flex align-items-center py-2 mb-4">
        <CIcon icon={cilInfo} className="me-2 flex-shrink-0" size="lg" />
        <small>
          <strong>Política de Contratación:</strong> Los cargos directivos y de coordinación
          (Directores, Jefes de Departamento) son de libre nombramiento y remoción o por ascenso. No
          pueden ser creados desde la contratación base.
        </small>
      </CAlert>

      <CRow className="g-3">
        <CCol md={6}>
          <CFormSelect
            name="departamento"
            label="Departamento / Dirección"
            value={data.departamento}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un departamento...</option>
            {DEPARTAMENTOS_OFICIALES.map((d) => (
              <option key={d.id} value={d.nombre}>
                {d.nombre}
              </option>
            ))}
          </CFormSelect>
        </CCol>

        <CCol md={6}>
          <CFormSelect
            name="nivelJerarquico"
            label="Nivel Jerárquico"
            value={data.nivelJerarquico}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione el nivel...</option>
            <option value="Obrero">Obrero / Apoyo</option>
            <option value="Técnico">Técnico / Administrativo</option>
            <option value="Profesional">Profesional / Especialista</option>
          </CFormSelect>
        </CCol>

        <CCol md={6}>
          <CFormSelect
            name="cargo"
            label="Cargo Nominal"
            value={data.cargo}
            onChange={handleChange}
            disabled={!data.nivelJerarquico}
            required
          >
            <option value="">
              {!data.nivelJerarquico
                ? 'Primero seleccione un nivel jerárquico'
                : 'Seleccione el cargo...'}
            </option>
            {data.nivelJerarquico &&
              opcionesCargo[data.nivelJerarquico]?.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
          </CFormSelect>
        </CCol>

        <CCol md={6}>
          <CFormSelect
            name="tipoContrato"
            label="Tipo de Contrato"
            value={data.tipoContrato}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione el tipo...</option>
            <option value="Fijo">Personal Fijo</option>
            <option value="Contratado">Contratado</option>
            <option value="Suplente">Suplente temporal</option>
          </CFormSelect>
        </CCol>

        <CCol md={12}>
          {plazasVacantes.length === 0 ? (
            <CAlert color="warning" className="py-2 mb-0">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" size="lg" />
              <small>
                No hay plazas vacantes disponibles. No se puede continuar con la contratación hasta
                que se apruebe una plaza en <strong>Estructura Organizativa</strong>.
              </small>
            </CAlert>
          ) : (
            <CFormSelect
              name="plazaId"
              label="Asignar Plaza *"
              value={data.plazaId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una plaza vacante...</option>
              {plazasVacantes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} — {p.cargo} ({p.departamento})
                </option>
              ))}
            </CFormSelect>
          )}
        </CCol>
      </CRow>
    </div>
  )
}

export default StepLaboral
