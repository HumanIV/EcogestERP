import React, { useMemo } from 'react'
import { CRow, CCol, CFormInput, CFormSelect, CInputGroup, CInputGroupText } from '@coreui/react'
import { VENEZUELA_GEO } from '../../../../../views/usuarios/_shared/venezuelaGeo'

const GENEROS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'No binario', label: 'No binario' },
]

const ESTADOS = Object.keys(VENEZUELA_GEO)

const StepDatosPersonales = ({ data, onChange }) => {
  const municipios = useMemo(() => {
    if (!data.estado) return []
    return VENEZUELA_GEO[data.estado]?.municipios || []
  }, [data.estado])

  const handleChange = (e) => {
    onChange('datosPersonales', e.target.name, e.target.value)
  }

  const handleEstado = (e) => {
    const estado = e.target.value
    onChange('datosPersonales', 'estado', estado)
    onChange('datosPersonales', 'municipio', '')
  }

  const handleMunicipio = (e) => {
    onChange('datosPersonales', 'municipio', e.target.value)
  }

  const handleCedulaTipo = (e) => {
    const parts = (data.cedula || '').includes('-') ? data.cedula.split('-') : ['V', '']
    onChange('datosPersonales', 'cedula', `${e.target.value}-${parts[1]}`)
  }
  const handleCedulaNum = (e) => {
    const parts = (data.cedula || '').includes('-') ? data.cedula.split('-') : ['V', '']
    const num = e.target.value.replace(/\D/g, '')
    onChange('datosPersonales', 'cedula', `${parts[0]}-${num}`)
  }
  const handleTelPrefix = (e) => {
    const parts = (data.telefono || '').includes('-') ? data.telefono.split('-') : ['0412', '']
    onChange('datosPersonales', 'telefono', `${e.target.value}-${parts[1]}`)
  }
  const handleTelNum = (e) => {
    const parts = (data.telefono || '').includes('-') ? data.telefono.split('-') : ['0412', '']
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 7) val = val.substring(0, 7)
    onChange('datosPersonales', 'telefono', `${parts[0]}-${val}`)
  }

  const cedulaParts = (data.cedula || '').includes('-') ? data.cedula.split('-') : ['V', '']
  const telParts = (data.telefono || '').includes('-') ? data.telefono.split('-') : ['0412', '']

  return (
    <div className="fade-in">
      <h5 className="mb-4 text-eco">Datos Personales</h5>
      <CRow className="g-3">
        <CCol md={6}>
          <CFormInput
            type="text"
            name="nombre"
            label="Primer nombre *"
            value={data.nombre || ''}
            onChange={handleChange}
            placeholder="Ej. Juan"
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormInput
            type="text"
            name="segundoNombre"
            label="Segundo nombre *"
            value={data.segundoNombre || ''}
            onChange={handleChange}
            placeholder="Ej. Carlos"
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormInput
            type="text"
            name="apellidos"
            label="Primer apellido *"
            value={data.apellidos || ''}
            onChange={handleChange}
            placeholder="Ej. Pérez"
            required
          />
        </CCol>
        <CCol md={6}>
          <CFormInput
            type="text"
            name="segundoApellido"
            label="Segundo apellido *"
            value={data.segundoApellido || ''}
            onChange={handleChange}
            placeholder="Ej. Rodríguez"
            required
          />
        </CCol>
        <CCol md={4}>
          <label className="form-label">Cédula de Identidad *</label>
          <CInputGroup>
            <CFormSelect
              style={{ maxWidth: '70px' }}
              value={cedulaParts[0]}
              onChange={handleCedulaTipo}
            >
              <option value="V">V</option>
              <option value="E">E</option>
            </CFormSelect>
            <CInputGroupText>-</CInputGroupText>
            <CFormInput
              type="text"
              placeholder="12345678"
              value={cedulaParts[1]}
              onChange={handleCedulaNum}
              maxLength="8"
              required
            />
          </CInputGroup>
        </CCol>
        <CCol md={4}>
          <CFormInput
            type="date"
            name="fechaNacimiento"
            label="Fecha de nacimiento *"
            value={data.fechaNacimiento || ''}
            onChange={handleChange}
            required
          />
        </CCol>
        <CCol md={4}>
          <CFormSelect
            name="genero"
            label="Género *"
            value={data.genero || ''}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar...</option>
            {GENEROS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormInput
            type="email"
            name="email"
            label="Correo Electrónico *"
            value={data.email || ''}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            required
          />
        </CCol>
        <CCol md={6}>
          <label className="form-label">Teléfono *</label>
          <CInputGroup>
            <CFormSelect
              style={{ maxWidth: '90px' }}
              value={telParts[0]}
              onChange={handleTelPrefix}
            >
              <option value="0412">0412</option>
              <option value="0414">0414</option>
              <option value="0424">0424</option>
              <option value="0416">0416</option>
              <option value="0426">0426</option>
              <option value="0212">0212</option>
            </CFormSelect>
            <CInputGroupText>-</CInputGroupText>
            <CFormInput
              type="text"
              placeholder="1234567"
              value={telParts[1]}
              onChange={handleTelNum}
              maxLength="7"
              required
            />
          </CInputGroup>
        </CCol>
        <CCol md={6}>
          <CFormSelect
            name="estado"
            label="Estado *"
            value={data.estado || ''}
            onChange={handleEstado}
            required
          >
            <option value="">Seleccionar estado...</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CFormSelect
            name="municipio"
            label="Municipio *"
            value={data.municipio || ''}
            onChange={handleMunicipio}
            disabled={!data.estado}
            required
          >
            <option value="">
              {!data.estado ? 'Primero seleccione estado' : 'Seleccionar municipio...'}
            </option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={12}>
          <CFormInput
            type="text"
            name="direccion"
            label="Dirección completa *"
            value={data.direccion || ''}
            onChange={handleChange}
            placeholder="Av. Principal, Calle 5, Casa #12"
            maxLength={200}
            required
          />
        </CCol>
      </CRow>
    </div>
  )
}

export default StepDatosPersonales
