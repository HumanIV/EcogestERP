import React, { useState, useMemo, useEffect } from 'react'
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
  CInputGroup,
  CInputGroupText,
  CAlert,
  CFormSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilWarning, cilInfo, cilLoopCircular } from '@coreui/icons'
import { CATEGORIAS, UBICACIONES } from '../constants/inventarioConstants'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'
import { api } from '../../../../services/api'

const ActivoModal = ({
  visible,
  onClose,
  activos,
  proveedores,
  onSave,
  activoAEditar = null
}) => {
  const [errores, setErrores] = useState({})
  
  const [formActivo, setFormActivo] = useState(activoAEditar || {
    codigo: '',
    nombre: '',
    categoria: '',
    ubicacion: '',
    modelo: '',
    marca: '',
    estado: 'Disponible',
    fechaRegistro: '',
    valorCompra: '',
    valorActual: '',
    proveedorId: '',
    cantidad: 1,
    tipoActivo: 'unitario',
  })

  const [displayValorCompra, setDisplayValorCompra] = useState(
    activoAEditar?.valorCompra ? Number(activoAEditar.valorCompra).toLocaleString('en-US') : ''
  )
  const [codigoValidando, setCodigoValidando] = useState(false)
  const [codigoDuplicado, setCodigoDuplicado] = useState(false)

  // Validation Debounce for code
  useEffect(() => {
    if (!formActivo.codigo || activoAEditar) return
    
    const timeoutId = setTimeout(async () => {
      setCodigoValidando(true)
      try {
        const res = await api(`/activos?codigo=${formActivo.codigo}`)
        if (res.data && res.data.length > 0) {
          setCodigoDuplicado(true)
        } else {
          setCodigoDuplicado(false)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCodigoValidando(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formActivo.codigo, activoAEditar])

  const handleActivoChange = (campo, valor) => {
    setFormActivo((prev) => {
      const newState = { ...prev, [campo]: valor }

      if (campo === 'categoria') {
        newState.marca = ''
        newState.modelo = ''
      }

      if (campo === 'tipoActivo' && valor === 'unitario') {
        newState.cantidad = 1
      }

      const catText = campo === 'categoria' ? valor : newState.categoria
      const marcaText = campo === 'marca' ? valor : newState.marca
      const modeloText = campo === 'modelo' ? valor : newState.modelo

      const parts = []
      if (catText) parts.push(catText)
      if (marcaText) parts.push(marcaText)
      if (modeloText) parts.push(modeloText)
      
      newState.nombre = parts.join(' ')

      return newState
    })
  }

  const handleValorCompraChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '')
    const parts = rawValue.split('.')
    let cleanValue = parts[0]
    if (parts.length > 1) {
      cleanValue += '.' + parts.slice(1).join('')
    }
    
    if (cleanValue === '') {
      setDisplayValorCompra('')
      handleActivoChange('valorCompra', '')
      handleActivoChange('valorActual', '')
      return
    }

    const numberValue = parseFloat(cleanValue)
    if (!isNaN(numberValue)) {
      setDisplayValorCompra(numberValue.toLocaleString('en-US', { maximumFractionDigits: 2 }))
      handleActivoChange('valorCompra', cleanValue)
      handleActivoChange('valorActual', cleanValue)
    } else {
      setDisplayValorCompra(rawValue)
    }
  }

  const opcionesMarca = useMemo(() => {
    const marcasUnicas = new Set(
      activos.filter((a) => a.marca && a.categoria === formActivo.categoria).map((a) => a.marca),
    )
    return Array.from(marcasUnicas).map((m) => ({ value: m, label: m }))
  }, [activos, formActivo.categoria])

  const opcionesModelo = useMemo(() => {
    const modelosUnicos = new Set(
      activos
        .filter((a) => a.modelo && a.marca === formActivo.marca && a.categoria === formActivo.categoria)
        .map((a) => a.modelo),
    )
    return Array.from(modelosUnicos).map((m) => ({ value: m, label: m }))
  }, [activos, formActivo.marca, formActivo.categoria])

  const opcionesProveedores = useMemo(() => {
    return proveedores
      .filter((p) => p.estado === 'Activo')
      .map((p) => ({ value: p.id, label: `${p.nombre} - ${p.rif}` }))
  }, [proveedores])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones
    const nuevosErrores = {}
    if (!formActivo.nombre?.trim()) nuevosErrores.nombre = 'El nombre del activo es obligatorio'
    if (!formActivo.categoria) nuevosErrores.categoria = 'La categoría es obligatoria'
    if (!formActivo.ubicacion) nuevosErrores.ubicacion = 'La ubicación es obligatoria'
    if (!formActivo.valorCompra) nuevosErrores.valorCompra = 'El valor de compra es obligatorio'
    if (isNaN(Number(formActivo.valorCompra)) || Number(formActivo.valorCompra) <= 0) {
      nuevosErrores.valorCompra = 'El valor de compra debe ser mayor a 0'
    }
    if (codigoDuplicado) {
      nuevosErrores.codigo = 'Este código ya está en uso'
    }
    if (formActivo.tipoActivo === 'contable' && (!formActivo.cantidad || formActivo.cantidad < 1)) {
      nuevosErrores.cantidad = 'La cantidad debe ser mayor a 0'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setErrores({})

    const codigoFinal = formActivo.codigo ||
      `MINECO-${formActivo.categoria?.substring(0, 3).toUpperCase() || 'XXX'}-${String(activos.length + 1).padStart(3, '0')}`

    onSave({ ...formActivo, codigo: codigoFinal })
  }

  return (
    <CModal visible={visible} onClose={onClose} size="xl" className="eco-modal">
      <CModalHeader closeButton className="eco-card-header">
        <CModalTitle className="fw-bold">
          <CIcon icon={cilInfo} className="me-2" />
          {activoAEditar ? 'Editar Activo' : 'Nuevo Activo'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {Object.keys(errores).length > 0 && (
          <CAlert color="danger" className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="flex-shrink-0 me-2" />
            <div>Por favor corrija los errores indicados en el formulario</div>
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit}>
            <div className="border-bottom pb-2 mb-3">
              <h6 className="text-eco mb-1">
                <CIcon icon={cilInfo} className="me-2" />
                IDENTIFICACIÓN DEL ACTIVO
              </h6>
            </div>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Codigo del Activo</CFormLabel>
                <CInputGroup>
                  <CInputGroupText className="bg-eco-soft">
                    {codigoValidando ? <CIcon icon={cilLoopCircular} className="text-primary fa-spin" /> : <CIcon icon={cilInfo} />}
                  </CInputGroupText>
                  <CFormInput
                    value={
                      formActivo.codigo ||
                      (activoAEditar ? '' : `MINECO-${formActivo.categoria?.substring(0, 3).toUpperCase() || 'XXX'}-${String(activos.length + 1).padStart(3, '0')}`)
                    }
                    onChange={(e) => handleActivoChange('codigo', e.target.value)}
                    placeholder="MINECO-IT-001"
                    maxLength={30}
                    invalid={!!errores?.codigo || codigoDuplicado}
                  />
                </CInputGroup>
                {codigoDuplicado ? (
                  <small className="text-danger d-block mt-1">Este código ya existe en el sistema.</small>
                ) : (
                  <small className="text-muted d-block mt-1">Se genera automaticamente si se deja vacio</small>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Nombre Generado (Automático)</CFormLabel>
                <CFormInput
                  value={formActivo.nombre}
                  readOnly
                  className="bg-light text-muted"
                  placeholder="Se generará solo..."
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3 align-items-center">
              <CCol md={4}>
                <div className="p-3 border rounded bg-light">
                  <CFormSwitch
                    label={formActivo.tipoActivo === 'contable' ? "Activo Lote/Contable" : "Activo Único"}
                    checked={formActivo.tipoActivo === 'contable'}
                    onChange={(e) => handleActivoChange('tipoActivo', e.target.checked ? 'contable' : 'unitario')}
                  />
                  <small className="text-muted d-block mt-1">
                    {formActivo.tipoActivo === 'contable' ? 'Permite registrar cantidades múltiples del mismo ítem.' : 'Registra un solo ítem identificable de forma única.'}
                  </small>
                </div>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Cantidad *</CFormLabel>
                <CFormInput
                  type="number"
                  min="1"
                  value={formActivo.cantidad}
                  onChange={(e) => handleActivoChange('cantidad', parseInt(e.target.value) || 1)}
                  disabled={formActivo.tipoActivo !== 'contable'}
                  invalid={!!errores?.cantidad}
                />
                {errores?.cantidad && <small className="text-danger">{errores.cantidad}</small>}
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={4}>
                <CFormLabel>Categoria *</CFormLabel>
                <CFormSelect
                  value={formActivo.categoria}
                  onChange={(e) => handleActivoChange('categoria', e.target.value)}
                  invalid={!!errores?.categoria}
                  required
                >
                  <option value="">Seleccionar</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </CFormSelect>
                {errores?.categoria && <small className="text-danger">{errores.categoria}</small>}
              </CCol>
              <CCol md={4}>
                <CFormLabel>Marca</CFormLabel>
                <CreatableSelect
                  isClearable
                  menuPosition="fixed"
                  placeholder="Seleccionar o crear..."
                  options={opcionesMarca}
                  value={formActivo.marca ? { label: formActivo.marca, value: formActivo.marca } : null}
                  onChange={(newValue) => handleActivoChange('marca', newValue ? newValue.value : '')}
                  formatCreateLabel={(inputValue) => `Crear nueva marca: "${inputValue}"`}
                  isDisabled={!formActivo.categoria}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Modelo</CFormLabel>
                <CreatableSelect
                  isClearable
                  menuPosition="fixed"
                  placeholder="Seleccionar o crear..."
                  options={opcionesModelo}
                  value={formActivo.modelo ? { label: formActivo.modelo, value: formActivo.modelo } : null}
                  onChange={(newValue) => handleActivoChange('modelo', newValue ? newValue.value : '')}
                  formatCreateLabel={(inputValue) => `Crear nuevo modelo: "${inputValue}"`}
                  isDisabled={!formActivo.marca}
                />
              </CCol>
            </CRow>

            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Ubicacion *</CFormLabel>
                <CFormSelect
                  value={formActivo.ubicacion}
                  onChange={(e) => handleActivoChange('ubicacion', e.target.value)}
                  invalid={!!errores?.ubicacion}
                  required
                >
                  <option value="">Seleccionar</option>
                  {UBICACIONES.map((u) => (
                    <option key={u.id} value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </CFormSelect>
                {errores?.ubicacion && <small className="text-danger">{errores.ubicacion}</small>}
              </CCol>
            </CRow>

            <div className="border-bottom pb-2 mb-3 mt-4">
              <h6 className="text-eco mb-1">
                <CIcon icon={cilInfo} className="me-2" />
                VALOR Y PROVEEDOR
              </h6>
            </div>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormLabel>Valor de Compra ($) *</CFormLabel>
                <CInputGroup>
                  <CInputGroupText>$</CInputGroupText>
                  <CFormInput
                    type="text"
                    value={displayValorCompra}
                    onChange={handleValorCompraChange}
                    placeholder="0.00"
                    invalid={!!errores?.valorCompra}
                    required
                  />
                </CInputGroup>
                <small className="text-muted d-block mt-1">
                  Valor Actual = Valor de Compra (sin depreciacion)
                </small>
                {errores?.valorCompra && (
                  <small className="text-danger d-block">{errores.valorCompra}</small>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Proveedor</CFormLabel>
                <Select
                  isClearable
                  menuPosition="fixed"
                  placeholder="Seleccionar proveedor (opcional)"
                  options={opcionesProveedores}
                  value={opcionesProveedores.find(p => String(p.value) === String(formActivo.proveedorId)) || null}
                  onChange={(newValue) => handleActivoChange('proveedorId', newValue ? newValue.value : '')}
                />
              </CCol>
            </CRow>

            <CModalFooter className="mt-4">
              <CButton color="secondary" onClick={onClose}>
                Cancelar
              </CButton>
              <CButton type="submit" color="success" className="fw-bold" disabled={codigoValidando || codigoDuplicado}>
                <CIcon icon={cilCheckCircle} className="me-2" />
                Guardar Activo
              </CButton>
            </CModalFooter>
          </CForm>
      </CModalBody>
    </CModal>
  )
}

export default ActivoModal
