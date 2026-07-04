import React, { useState, useEffect, useMemo } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CAlert,
  CBadge,
  CCard,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilWarning, cilInfo } from '@coreui/icons'
import { getEstadoColor } from '../utils/inventarioUtils'
import { UBICACIONES } from '../constants/inventarioConstants'
import Select from 'react-select'

const MovimientoModal = ({
  visible,
  onClose,
  activos,
  cuadrillas,
  activoPreSeleccionado,
  onSave
}) => {
  const [errores, setErrores] = useState({})
  const [activosElegidos, setActivosElegidos] = useState([])
  
  const [formMovimiento, setFormMovimiento] = useState({
    tipo: 'Asignacion',
    activosIds: [],
    cantidad: 1,
    ubicacionOrigen: '',
    ubicacionDestino: '',
    motivo: '',
    referencia: '',
    cuadrillaId: '',
    cuadrillaNombre: '',
  })

  useEffect(() => {
    if (visible && activoPreSeleccionado) {
      setFormMovimiento((prev) => ({
        ...prev,
        activosIds: [activoPreSeleccionado.id],
      }))
    }
  }, [visible, activoPreSeleccionado])

  useEffect(() => {
    if (formMovimiento.activosIds.length > 0) {
      const selected = activos.filter((a) => formMovimiento.activosIds.includes(a.id))
      setActivosElegidos(selected)
      if (selected.length > 0) {
        // If all selected have the same origin, show it. Otherwise show 'Múltiples orígenes'
        const origins = new Set(selected.map(a => a.ubicacion))
        const originString = origins.size === 1 ? selected[0].ubicacion : 'Múltiples orígenes'
        
        setFormMovimiento((prev) => ({
          ...prev,
          ubicacionOrigen: originString,
        }))
      }
    } else {
      setActivosElegidos([])
      setFormMovimiento((prev) => ({
        ...prev,
        ubicacionOrigen: '',
      }))
    }
  }, [formMovimiento.activosIds, activos])

  const validarMovimiento = () => {
    const nuevosErrores = {}

    if (!formMovimiento.tipo) nuevosErrores.tipo = 'Seleccione el tipo de movimiento'
    if (!formMovimiento.activosIds || formMovimiento.activosIds.length === 0) nuevosErrores.activosIds = 'Debe seleccionar al menos un activo'
    
    if (formMovimiento.ubicacionDestino === 'Cuadrilla Asignada' && !formMovimiento.cuadrillaId) {
      nuevosErrores.cuadrillaId = 'Seleccione una cuadrilla'
    }

    if (
      formMovimiento.ubicacionOrigen &&
      formMovimiento.ubicacionDestino &&
      formMovimiento.ubicacionOrigen === formMovimiento.ubicacionDestino &&
      formMovimiento.tipo === 'Transferencia'
    ) {
      nuevosErrores.ubicacionDestino = 'En transferencia, origen y destino no pueden ser iguales'
    }

    if (!formMovimiento.ubicacionDestino?.trim()) {
      nuevosErrores.ubicacionDestino = 'La ubicación de destino es obligatoria'
    }

    if (!formMovimiento.motivo?.trim()) {
      nuevosErrores.motivo = 'El motivo del movimiento es obligatorio'
    } else if (formMovimiento.motivo.length > 100) {
      nuevosErrores.motivo = 'El motivo no puede exceder 100 caracteres'
    } else if (formMovimiento.motivo.length < 10) {
      nuevosErrores.motivo = 'El motivo debe tener al menos 10 caracteres'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmitMovimiento = (e) => {
    e.preventDefault()
    if (validarMovimiento()) {
      const referenciaBase = `MOV-${Date.now().toString(36).toUpperCase()}-${formMovimiento.tipo.substring(0, 3).toUpperCase()}`
      
      const movimientosArray = activosElegidos.map((activo, index) => {
        return {
          ...formMovimiento,
          activoId: activo.id,
          activoNombre: activo.nombre,
          codigoActivo: activo.codigo,
          referencia: `${referenciaBase}-${index + 1}`,
          usuario: 'Administrador',
          fecha: new Date().toISOString(),
          // Always default quantity to 1 unless it's a single accounting asset selected
          cantidad: (activosElegidos.length === 1 && activo.tipoActivo === 'contable') ? formMovimiento.cantidad : 1
        }
      })
      
      onSave(movimientosArray)
      setErrores({})
    }
  }

  const getReferenciaPreview = () => {
    if (formMovimiento.tipo) {
      return `MOV-XXXX-${formMovimiento.tipo.substring(0, 3).toUpperCase()}`
    }
    return 'MOV-XXXX-XXX'
  }

  const opcionesActivos = useMemo(() => {
    return activos.map((act) => ({
      value: act.id,
      label: `${act.codigo} - ${act.nombre} (${act.estado})`,
      estado: act.estado
    }))
  }, [activos])

  const showContableQuantity = activosElegidos.length === 1 && activosElegidos[0].tipoActivo === 'contable'

  return (
    <CModal visible={visible} onClose={onClose} size="xl" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilInfo} className="me-2" />
          Registro de Movimiento
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {Object.keys(errores).length > 0 && (
          <CAlert color="danger" className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="flex-shrink-0 me-2" />
            <div>Por favor corrija los errores indicados en el formulario</div>
          </CAlert>
        )}

        <CForm onSubmit={handleSubmitMovimiento}>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel>Tipo de Movimiento *</CFormLabel>
                <CFormSelect
                  value={formMovimiento.tipo}
                  onChange={(e) => {
                    const newTipo = e.target.value
                    let newDestino = formMovimiento.ubicacionDestino
                    if (newTipo === 'Baja') {
                      newDestino = 'Almacen de Desincorporados'
                    } else if (newTipo === 'Asignacion' && newDestino !== 'Cuadrilla Asignada' && !UBICACIONES.some(u => u.nombre === newDestino)) {
                      newDestino = ''
                    } else if (newTipo === 'Transferencia' && !UBICACIONES.some(u => u.nombre === newDestino)) {
                      newDestino = ''
                    } else if ((newTipo === 'Mantenimiento' || newTipo === 'Reparacion') && newDestino !== 'Mantenimiento Externo' && newDestino !== 'Taller Interno') {
                      newDestino = ''
                    }

                    setFormMovimiento({ ...formMovimiento, tipo: newTipo, ubicacionDestino: newDestino })
                    if (errores.tipo) setErrores((prev) => ({ ...prev, tipo: '' }))
                  }}
                  invalid={!!errores.tipo}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Asignacion">Asignacion</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Reparacion">Reparacion</option>
                  <option value="Baja">Baja Tecnica</option>
                </CFormSelect>
                {errores.tipo && <small className="text-danger">{errores.tipo}</small>}
                <small className="text-muted d-block mt-1">
                  Seleccione el tipo segun naturaleza del movimiento
                </small>
              </CCol>

              <CCol md={6}>
                <CFormLabel>Activos a Mover (Múltiple) *</CFormLabel>
                <Select
                  isMulti
                  menuPosition="fixed"
                  placeholder="Buscar activo por código o nombre..."
                  options={opcionesActivos}
                  value={opcionesActivos.filter(opt => formMovimiento.activosIds.includes(opt.value))}
                  onChange={(selected) => {
                    setFormMovimiento({ ...formMovimiento, activosIds: selected ? selected.map(s => s.value) : [] })
                    if (errores.activosIds) setErrores((prev) => ({ ...prev, activosIds: '' }))
                  }}
                  isOptionDisabled={(option) => option.estado === 'Dañado' || option.estado === 'En Mantenimiento' || option.estado === 'Baja'}
                />
                {errores.activosIds && <small className="text-danger">{errores.activosIds}</small>}
              </CCol>
            </CRow>

            {activosElegidos.length === 1 ? (
              <CCard className="eco-surface border mt-3 mb-3">
                <CCardBody className="py-2 px-3">
                  <CRow className="align-items-center">
                    <CCol md={3}>
                      <small className="text-muted">Codigo</small>
                      <div className="fw-bold">{activosElegidos[0].codigo}</div>
                    </CCol>
                    <CCol md={3}>
                      <small className="text-muted">Nombre</small>
                      <div className="fw-bold">{activosElegidos[0].nombre}</div>
                    </CCol>
                    <CCol md={2}>
                      <small className="text-muted">Categoria</small>
                      <div>{activosElegidos[0].categoria}</div>
                    </CCol>
                    <CCol md={2}>
                      <small className="text-muted">Estado Actual</small>
                      <div>
                        <CBadge color={getEstadoColor(activosElegidos[0].estado)}>
                          {activosElegidos[0].estado}
                        </CBadge>
                      </div>
                    </CCol>
                    <CCol md={2}>
                      <small className="text-muted">Tipo</small>
                      <div>
                        <CBadge
                          color={activosElegidos[0].tipoActivo === 'unitario' ? 'info' : 'warning'}
                        >
                          {activosElegidos[0].tipoActivo === 'unitario' ? 'Unitario' : 'Contable'}
                        </CBadge>
                      </div>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            ) : activosElegidos.length > 1 ? (
              <CAlert color="info" className="mt-3 mb-3 p-2">
                <CIcon icon={cilInfo} className="me-2" />
                Se han seleccionado <strong>{activosElegidos.length}</strong> activos para mover en lote.
              </CAlert>
            ) : null}

            <CRow className="g-3 mt-2">
              <CCol md={6}>
                <CFormLabel>Ubicacion de Origen</CFormLabel>
                <CInputGroup>
                  <CInputGroupText className="bg-eco-soft">
                    <CIcon icon={cilInfo} />
                  </CInputGroupText>
                  <CFormInput
                    value={formMovimiento.ubicacionOrigen || 'Sin ubicacion'}
                    disabled
                    className="bg-white"
                  />
                </CInputGroup>
                <small className="text-muted d-block mt-1">
                  Se captura automaticamente de la ubicacion actual de los activos
                </small>
              </CCol>

              <CCol md={6}>
                <CFormLabel>Ubicacion de Destino {formMovimiento.tipo !== 'Baja' ? '*' : ''}</CFormLabel>
                <CFormSelect
                  value={formMovimiento.ubicacionDestino}
                  onChange={(e) => {
                    setFormMovimiento({ ...formMovimiento, ubicacionDestino: e.target.value })
                    if (errores.ubicacionDestino)
                      setErrores((prev) => ({ ...prev, ubicacionDestino: '' }))
                  }}
                  invalid={!!errores.ubicacionDestino}
                  disabled={formMovimiento.tipo === 'Baja' || !formMovimiento.tipo}
                >
                  <option value="">
                    {!formMovimiento.tipo ? 'Primero seleccione tipo' : 'Seleccionar nueva ubicacion'}
                  </option>
                  {formMovimiento.tipo === 'Transferencia' &&
                    UBICACIONES.map((u) => (
                      <option key={u.id} value={u.nombre}>
                        {u.nombre}
                      </option>
                    ))}
                  {formMovimiento.tipo === 'Asignacion' && (
                    <>
                      <option value="Cuadrilla Asignada">Cuadrilla Asignada</option>
                      {UBICACIONES.map((u) => (
                        <option key={u.id} value={u.nombre}>
                          {u.nombre}
                        </option>
                      ))}
                    </>
                  )}
                  {(formMovimiento.tipo === 'Mantenimiento' || formMovimiento.tipo === 'Reparacion') && (
                    <>
                      <option value="Mantenimiento Externo">Mantenimiento Externo</option>
                      <option value="Taller Interno">Taller Interno</option>
                    </>
                  )}
                  {formMovimiento.tipo === 'Baja' && (
                    <option value="Almacen de Desincorporados">Almacen de Desincorporados</option>
                  )}
                </CFormSelect>
                {errores.ubicacionDestino && (
                  <small className="text-danger">{errores.ubicacionDestino}</small>
                )}
              </CCol>
            </CRow>

            {formMovimiento.ubicacionDestino === 'Cuadrilla Asignada' && (
              <CRow className="g-3 mt-2">
                <CCol md={12}>
                  <CFormLabel>Asignar a Cuadrilla *</CFormLabel>
                  <CFormSelect
                    value={formMovimiento.cuadrillaId || ''}
                    onChange={(e) =>
                      setFormMovimiento({
                        ...formMovimiento,
                        cuadrillaId: e.target.value,
                        cuadrillaNombre: e.target.options[e.target.selectedIndex].text,
                      })
                    }
                  >
                    <option value="">Seleccionar cuadrilla</option>
                    {cuadrillas?.map((c) => (
                      <option key={c.id || c.nombre} value={c.id || c.nombre}>
                        {c.nombre} {c.zona ? `- ${c.zona}` : ''}
                      </option>
                    ))}
                    {!cuadrillas?.length && (
                      <>
                        <option value="Cuadrilla A">Cuadrilla A - Zona Norte</option>
                        <option value="Cuadrilla B">Cuadrilla B - Zona Sur</option>
                        <option value="Cuadrilla C">Cuadrilla C - Centro</option>
                      </>
                    )}
                  </CFormSelect>
                </CCol>
              </CRow>
            )}

            <CRow className="g-3 mt-2">
              {showContableQuantity ? (
                <CCol md={6}>
                  <CFormLabel>Cantidad de Unidades *</CFormLabel>
                  <CFormInput
                    type="number"
                    min="1"
                    value={formMovimiento.cantidad || 1}
                    onChange={(e) =>
                      setFormMovimiento({
                        ...formMovimiento,
                        cantidad: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <small className="text-muted d-block mt-1">
                    Activo contable: puede mover cantidad parcial
                  </small>
                </CCol>
              ) : (
                <CCol md={6}>
                  <CFormLabel>Cantidad de Unidades</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText className="bg-eco-soft">
                      <CIcon icon={cilInfo} />
                    </CInputGroupText>
                    <CFormInput value={activosElegidos.length > 1 ? "1 (por activo)" : "1"} disabled className="bg-white" />
                  </CInputGroup>
                  <small className="text-muted d-block mt-1">
                    {activosElegidos.length > 1 ? "Lote: cada activo seleccionado se mueve como unidad" : "Activo unitario: siempre se mueve como 1 unidad"}
                  </small>
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel>Numero de Referencia</CFormLabel>
                <CInputGroup>
                  <CInputGroupText className="bg-eco-soft">
                    <CIcon icon={cilInfo} />
                  </CInputGroupText>
                  <CFormInput value={getReferenciaPreview()} disabled className="bg-white" />
                </CInputGroup>
                <small className="text-muted d-block mt-1">
                  Se generara automaticamente al guardar (una referencia única por activo)
                </small>
              </CCol>
            </CRow>

            <CRow className="g-3 mt-2">
              <CCol md={12}>
                <CFormLabel>Motivo / Justificacion del Movimiento *</CFormLabel>
                <CFormTextarea
                  rows={3}
                  maxLength={100}
                  value={formMovimiento.motivo}
                  onChange={(e) => {
                    setFormMovimiento({ ...formMovimiento, motivo: e.target.value })
                    if (errores.motivo) setErrores((prev) => ({ ...prev, motivo: '' }))
                  }}
                  placeholder="Describa el motivo y justificacion del movimiento. Minimo 10, maximo 100 caracteres."
                  invalid={!!errores.motivo}
                />
                {errores.motivo ? (
                  <small className="text-danger">{errores.motivo}</small>
                ) : (
                  <small className="text-muted d-block">
                    {formMovimiento.motivo?.length || 0}/100 caracteres (minimo 10)
                  </small>
                )}
              </CCol>
            </CRow>

            <CRow className="g-3 mt-3">
              <CCol md={12}>
                <div className="border rounded p-3 eco-surface">
                  <small className="text-muted fw-bold d-block mb-2">
                    INFORMACION DEL REGISTRO
                  </small>
                  <CRow>
                    <CCol md={4}>
                      <small className="text-muted">Fecha y Hora</small>
                      <div>{new Date().toLocaleString('es-VE')}</div>
                    </CCol>
                    <CCol md={4}>
                      <small className="text-muted">Usuario Responsable</small>
                      <div>Administrador</div>
                    </CCol>
                    <CCol md={4}>
                      <small className="text-muted">Estado</small>
                      <CBadge color="success" className="px-2">
                        Pendiente de Confirmar
                      </CBadge>
                    </CCol>
                  </CRow>
                </div>
              </CCol>
            </CRow>

            <CModalFooter className="mt-4">
              <CButton color="secondary" onClick={onClose}>
                Cancelar
              </CButton>
              <CButton type="submit" color="primary" className="fw-bold" disabled={activosElegidos.length === 0}>
                <CIcon icon={cilCheckCircle} className="me-2" />
                Registrar Movimiento{activosElegidos.length > 1 ? 's en Lote' : ''}
              </CButton>
            </CModalFooter>
          </CForm>
      </CModalBody>
    </CModal>
  )
}

export default MovimientoModal
