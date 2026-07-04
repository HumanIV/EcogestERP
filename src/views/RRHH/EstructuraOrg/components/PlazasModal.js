import React, { useState, useEffect, useMemo } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CFormTextarea,
  CFormLabel,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilCheckCircle, cilInfo } from '@coreui/icons'
import {
  DEPARTAMENTOS_OFICIALES,
  CARGOS_POR_DEPTO,
  ESTADOS_PLAZA,
  NIVELES_JERARQUICOS,
  NIVELES_EDUCATIVOS,
  EXPERIENCIA_OPCIONES,
  TIPOS_JORNADA,
  CONFIG_POR_CARGO,
} from '../constants/estructuraConstants'

const PlazasModal = ({ visible, onClose, onSave, editingPlaza, plazas, solicitudesPlaza }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    departamento: '',
    cargo: '',
    nivel: 4,
    estado: 'vacante',
    nivelEducativo: '',
    experienciaMinima: '0',
    tipoJornada: 'completo',
    certificaciones: '',
  })
  const [formError, setFormError] = useState(null)

  const codigoSugerido = useMemo(() => {
    if (editingPlaza || !formData.departamento || !formData.cargo) return ''
    return generarCodigoPlaza(formData.departamento, formData.cargo, plazas, solicitudesPlaza)
  }, [editingPlaza, formData.departamento, formData.cargo, plazas, solicitudesPlaza])

  useEffect(() => {
    if (visible) {
      if (editingPlaza) {
        setFormData({
          ...editingPlaza,
          departamento: editingPlaza.departamentoCodigo || editingPlaza.departamento || '',
        })
      } else {
        setFormData({
          codigo: '',
          departamento: '',
          cargo: '',
          nivel: 4,
          estado: 'vacante',
          nivelEducativo: '',
          experienciaMinima: '0',
          tipoJornada: 'completo',
          certificaciones: '',
        })
      }
      setFormError(null)
    }
  }, [visible, editingPlaza])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'departamento') {
        next.cargo = ''
        next.codigo = ''
        const deptoObj = DEPARTAMENTOS_OFICIALES.find((d) => d.id === value)
        next.nivel = deptoObj ? deptoObj.nivel : 4
      }
      if (name === 'cargo' && !editingPlaza) {
        const depto = prev.departamento
        next.codigo = generarCodigoPlaza(depto, value, plazas, solicitudesPlaza)
        const cfg = CONFIG_POR_CARGO[value]
        if (cfg) {
          next.nivel = cfg.nivel
          next.nivelEducativo = cfg.nivelEducativo
          next.experienciaMinima = cfg.experienciaMinima
          next.tipoJornada = cfg.tipoJornada
        }
      }
      return next
    })
  }

  const handleSave = () => {
    const errores = validarFormulario(formData, editingPlaza)
    if (errores.length > 0) {
      setFormError(errores.join(' '))
      return
    }
    onSave({
      ...formData,
      departamentoCodigo: formData.departamento,
    })
  }

  const cargos = formData.departamento ? CARGOS_POR_DEPTO[formData.departamento] || [] : []

  const nivelLabel = (() => {
    const n = NIVELES_JERARQUICOS.find((x) => x.value === Number(formData.nivel))
    return n ? n.label : formData.nivel
  })()

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal">
      <CModalHeader closeButton className="bg-eco-soft">
        <CModalTitle className="fw-bold text-eco d-flex align-items-center">
          <CIcon icon={editingPlaza ? cilPencil : cilPlus} className="me-2" />
          {editingPlaza ? 'Editar Plaza' : 'Solicitar Nueva Plaza'}
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="px-4 py-4">
        {!editingPlaza && (
          <CAlert color="info" className="d-flex align-items-start py-2 mb-4">
            <CIcon icon={cilInfo} className="me-2 flex-shrink-0 mt-1" />
            <small>
              Complete la información organizacional. El{' '}
              <strong>código de plaza se genera automáticamente</strong> y la solicitud será enviada
              a Bandeja Administrativa para su aprobación.
            </small>
          </CAlert>
        )}

        {formError && (
          <CAlert color="danger" className="mb-4 py-2">
            <small>{formError}</small>
          </CAlert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <CBadge color="eco" className="px-3 py-2 fs-6" style={{ letterSpacing: '0.05em' }}>
              {formData.codigo || '—'}
            </CBadge>
            {codigoSugerido && !editingPlaza && (
              <small className="text-muted">Generado automáticamente</small>
            )}
            {editingPlaza && <small className="text-muted">Código de plaza</small>}
          </div>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">Nivel</small>
            <CBadge color="primary" className="px-2 py-1">
              {nivelLabel}
            </CBadge>
          </div>
        </div>

        <CRow className="g-3">
          <CCol md={6}>
            <div className="mb-3">
              <CFormLabel className="fw-semibold small">
                Departamento <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="input-minec"
              >
                <option value="">Seleccionar departamento...</option>
                {DEPARTAMENTOS_OFICIALES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold small">
                Cargo <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="input-minec"
                disabled={!formData.departamento}
              >
                <option value="">
                  {!formData.departamento
                    ? 'Primero seleccione un departamento'
                    : 'Seleccionar cargo...'}
                </option>
                {cargos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </CFormSelect>
            </div>

            {editingPlaza && (
              <div className="mb-3">
                <CFormLabel className="fw-semibold small">Estado</CFormLabel>
                <CFormSelect
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="input-minec"
                >
                  {ESTADOS_PLAZA.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            )}
          </CCol>

          <CCol md={6}>
            <div className="mb-3">
              <CFormLabel className="fw-semibold small">
                Nivel Educativo <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                name="nivelEducativo"
                value={formData.nivelEducativo}
                onChange={handleChange}
                className="input-minec"
              >
                <option value="">Seleccionar nivel educativo...</option>
                {NIVELES_EDUCATIVOS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold small">
                Experiencia Mínima <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                name="experienciaMinima"
                value={formData.experienciaMinima}
                onChange={handleChange}
                className="input-minec"
              >
                <option value="">Seleccionar experiencia...</option>
                {EXPERIENCIA_OPCIONES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold small">
                Tipo de Jornada <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                name="tipoJornada"
                value={formData.tipoJornada}
                onChange={handleChange}
                className="input-minec"
              >
                <option value="">Seleccionar jornada...</option>
                {TIPOS_JORNADA.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold small">
                Certificaciones / Habilidades{' '}
                <small className="text-muted fw-normal">(opcional)</small>
              </CFormLabel>
              <CFormTextarea
                name="certificaciones"
                value={formData.certificaciones}
                onChange={handleChange}
                rows={2}
                maxLength={200}
                placeholder="Ej: Licencia de conducir, SAP, inglés avanzado..."
                className="input-minec"
              />
              <small
                className={formData.certificaciones.length >= 200 ? 'text-danger' : 'text-muted'}
              >
                {formData.certificaciones.length}/200 caracteres
              </small>
            </div>
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter className="border-top pt-3">
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="success" onClick={handleSave}>
          <CIcon icon={cilCheckCircle} className="me-1" />
          {editingPlaza ? 'Guardar Cambios' : 'Enviar Solicitud de Plaza'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

function generarCodigoPlaza(departamento, cargo, plazas, solicitudesPlaza) {
  const abbr = generarAbreviaturaCargo(cargo)
  if (!abbr) return ''
  const prefix = `${departamento}-${abbr}-`
  const codigosExistentes = [
    ...(plazas || []).map((p) => String(p.codigo || '')),
    ...(solicitudesPlaza || []).map((s) => String(s.codigo || '')),
  ].filter(Boolean)
  const numeros = codigosExistentes
    .filter((codigo) => codigo.startsWith(prefix))
    .map((codigo) => {
      const match = codigo.match(/-(\d+)$/)
      return match ? parseInt(match[1], 10) : null
    })
    .filter((n) => n !== null && !isNaN(n) && n >= 0)
  const siguiente = (numeros.length > 0 ? Math.max(...numeros) : 0) + 1
  return `${prefix}${String(siguiente).padStart(3, '0')}`
}

function generarAbreviaturaCargo(cargo) {
  if (!cargo) return ''
  const palabras = cargo.trim().split(/\s+/)
  if (palabras.length === 1) {
    return palabras[0]
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .substring(0, 4)
  }
  const abbr = palabras
    .map((p) =>
      p
        .replace(/[^a-zA-Z]/g, '')
        .charAt(0)
        .toUpperCase(),
    )
    .filter(Boolean)
    .join('')
    .substring(0, 4)
  return (
    abbr ||
    palabras[0]
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .substring(0, 4)
  )
}

function validarFormulario(formData, editingPlaza) {
  const errores = []
  if (!formData.departamento) errores.push('Seleccione un departamento.')
  if (!formData.cargo) errores.push('Seleccione un cargo válido para el departamento.')
  if (!formData.nivel) errores.push('Seleccione un nivel jerárquico.')
  if (!editingPlaza && !formData.codigo) errores.push('No se pudo generar el código de plaza.')
  if (editingPlaza && !formData.estado) errores.push('Seleccione un estado.')
  if (!formData.nivelEducativo) errores.push('Seleccione el nivel educativo requerido.')
  if (!formData.experienciaMinima) errores.push('Especifique la experiencia mínima requerida.')
  if (!formData.tipoJornada) errores.push('Seleccione el tipo de jornada.')
  if (formData.certificaciones && formData.certificaciones.length > 200)
    errores.push('Certificaciones no debe exceder 200 caracteres.')
  return errores
}

export default PlazasModal
