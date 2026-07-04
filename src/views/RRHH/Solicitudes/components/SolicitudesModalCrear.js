import React, { useState, useEffect, useRef } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CFormTextarea,
  CAlert,
  CSpinner,
  CAvatar,
  CFormSwitch,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilWarning, cilSearch, cilUser, cilCheckCircle, cilInfo, cilPaperclip } from '@coreui/icons'
import empleadoService from '../../Empleados/services/empleadoService'
import { TIPOS_SOLICITUD } from '../constants/solicitudesConstants'

const SolicitudesModalCrear = ({ visible, onClose, onSubmit }) => {
  const [empleados, setEmpleados] = useState([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [form, setForm] = useState({
    tipo: '',
    empleadoNombre: '',
    descripcion: '', // Asunto corto (Auto-generado)
    fechaInicio: '',
    fechaFin: '',
    diasSolicitados: 0,
    motivo: '', // Justificación detallada
    
    // Constancia
    dirigidoA: '',
    proposito: '',
    mostrarSueldo: false,
    
    // Permisos
    motivoPermiso: '',
    franjaAusencia: 'Jornada Completa',
    archivoSoporteName: '',
    archivoSoporteBase64: '',

    // Adelanto de Nómina
    montoAdelanto: '',
  })
  const [errors, setErrors] = useState({})
  
  // Autocomplete State
  const [searchEmp, setSearchEmp] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const todayStr = new Date().toISOString().split('T')[0]
  
  const getMinDatePermiso = () => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return d.toISOString().split('T')[0]
  }

  const getMinFechaFinVacaciones = () => {
    if (!form.fechaInicio) return todayStr
    const d = new Date(form.fechaInicio)
    d.setDate(d.getDate() + 1) // +1 día
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (visible) {
      const cargarEmpleados = async () => {
        setLoadingEmpleados(true)
        try {
          const res = await empleadoService.obtenerTodos()
          if (res.success) setEmpleados(res.data)
        } catch (err) {
          console.error('Error cargando empleados:', err)
          setEmpleados([])
        }
        setLoadingEmpleados(false)
      }
      cargarEmpleados()
      setForm({
        tipo: '',
        empleadoNombre: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        diasSolicitados: 0,
        motivo: '',
        dirigidoA: '',
        proposito: '',
        mostrarSueldo: false,
        motivoPermiso: '',
        franjaAusencia: 'Jornada Completa',
        archivoSoporteName: '',
        archivoSoporteBase64: '',
        montoAdelanto: '',
      })
      setSearchEmp('')
      setErrors({})
    }
  }, [visible])

  // Auto-generar Asunto (Descripción)
  useEffect(() => {
    let newDesc = ''
    if (form.tipo === 'Constancia de Trabajo') {
      newDesc = 'Solicitud de Constancia de Trabajo'
    } else if (form.tipo === 'Vacaciones') {
      newDesc = 'Solicitud de Vacaciones'
    } else if (form.tipo.includes('Permiso') || form.tipo === 'Reposo Médico') {
      newDesc = form.motivoPermiso ? `Permiso por ${form.motivoPermiso}` : 'Solicitud de Permiso'
    } else if (form.tipo) {
      newDesc = `Solicitud: ${form.tipo}`
    }
    setForm(prev => ({ ...prev, descripcion: newDesc }))
  }, [form.tipo, form.motivoPermiso])

  // Calcular Días Vacaciones / Fechas genéricas
  useEffect(() => {
    if (form.fechaInicio && form.fechaFin && (form.tipo === 'Vacaciones' || form.tipo.includes('Licencia'))) {
      const start = new Date(form.fechaInicio)
      const end = new Date(form.fechaFin)
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      setForm((prev) => ({ ...prev, diasSolicitados: diff > 0 ? diff : 0 }))
    } else if (form.tipo !== 'Vacaciones' && !form.tipo.includes('Licencia')) {
      setForm((prev) => ({ ...prev, diasSolicitados: 0 }))
    }
  }, [form.fechaInicio, form.fechaFin, form.tipo])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field, value) => {
    let finalValue = value

    // Reglas Constancia de Trabajo
    if (field === 'dirigidoA') {
      finalValue = value.replace(/[^a-zA-Z0-9\s.,ñÑáéíóúÁÉÍÓÚ]/g, '')
      if (finalValue.length > 60) return
    }
    if (field === 'proposito' && value.length > 80) return
    
    // Reglas Justificación (150 chars max)
    if (field === 'motivo' && form.tipo !== 'Vacaciones' && value.length > 150) {
      return // Bloquea teclado
    }

    // Reglas numéricas
    if (field === 'montoAdelanto') {
      finalValue = value.replace(/[^0-9.]/g, '') // Solo números y punto
    }

    setForm((prev) => ({ ...prev, [field]: finalValue }))
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev }
        delete n[field]
        return n
      })
    }
  }

  const handleSelectEmpleado = (emp) => {
    handleChange('empleadoNombre', emp.nombre)
    setSearchEmp(`${emp.nombre} ${emp.apellidos || ''}`)
    setShowDropdown(false)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({...prev, archivoSoporte: 'El archivo excede los 2MB permitidos'}))
      e.target.value = ''
      return
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({...prev, archivoSoporte: 'Formato no válido. Use PDF, PNG o JPG'}))
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev, 
        archivoSoporteName: file.name,
        archivoSoporteBase64: reader.result
      }))
      setErrors(prev => { const n = {...prev}; delete n.archivoSoporte; return n })
    }
    reader.readAsDataURL(file)
  }

  const isConstancia = form.tipo === 'Constancia de Trabajo'
  const isVacaciones = form.tipo === 'Vacaciones'
  const isPermiso = form.tipo.includes('Permiso') || form.tipo === 'Reposo Médico'
  const isAdelanto = form.tipo === 'Adelanto de Nómina'
  const isLicenciaOrTurno = form.tipo.includes('Licencia') || form.tipo.includes('Cambio de Horario') || form.tipo.includes('Baja')

  const handleSubmit = () => {
    const newErrors = {}
    if (!form.tipo) newErrors.tipo = 'Seleccione un tipo'
    if (!form.empleadoNombre) newErrors.empleadoNombre = 'Seleccione un empleado de la lista'

    if (isConstancia) {
      if (!form.dirigidoA?.trim()) newErrors.dirigidoA = 'Indique a quién va dirigida'
    } else if (isVacaciones) {
      if (!form.fechaInicio) newErrors.fechaInicio = 'Fecha inicio requerida'
      if (!form.fechaFin) newErrors.fechaFin = 'Fecha fin requerida'
      
      if (form.fechaInicio && form.fechaFin && new Date(form.fechaFin) <= new Date(form.fechaInicio))
        newErrors.fechaFin = 'Debe ser estrictamente posterior a la fecha inicio'

      if (form.diasSolicitados < 1) newErrors.fechaFin = 'Debe solicitar al menos 1 día'
      if (form.diasSolicitados > 30) newErrors.fechaFin = 'Máximo 30 días para vacaciones'
      if (!form.motivo?.trim()) newErrors.motivo = 'Indique el período vacacional (ej. 2025-2026)'
    } else if (isPermiso) {
      if (!form.motivoPermiso) newErrors.motivoPermiso = 'Seleccione el motivo del permiso'
      if (!form.fechaInicio) newErrors.fechaInicio = 'Fecha requerida'
      if (!form.franjaAusencia) newErrors.franjaAusencia = 'Franja requerida'
      if (!form.motivo?.trim()) newErrors.motivo = 'La justificación es obligatoria'

      if (form.motivoPermiso === 'Salud' && !form.archivoSoporteBase64) {
        newErrors.archivoSoporte = 'El justificativo médico es obligatorio'
      }
    } else if (isAdelanto) {
      if (!form.montoAdelanto) newErrors.montoAdelanto = 'Indique el monto'
      if (!form.motivo?.trim()) newErrors.motivo = 'La justificación es obligatoria'
    } else if (isLicenciaOrTurno) {
      if (!form.fechaInicio) newErrors.fechaInicio = 'Fecha inicio requerida'
      if (!form.motivo?.trim()) newErrors.motivo = 'La justificación es obligatoria'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      const emp = empleados.find((e) => e.nombre === form.empleadoNombre)
      
      let detallesObj = {}
      if (isConstancia) {
        detallesObj = { dirigidoA: form.dirigidoA, proposito: form.proposito, mostrarSueldo: form.mostrarSueldo }
      } else if (isVacaciones) {
        detallesObj = { fechaInicio: form.fechaInicio, fechaFin: form.fechaFin, diasTotales: form.diasSolicitados }
      } else if (isPermiso) {
        detallesObj = { 
          fechaPermiso: form.fechaInicio, 
          franjaAusencia: form.franjaAusencia,
          motivoEspecifico: form.motivoPermiso,
          archivoSoporte: form.archivoSoporteBase64
        }
      } else if (isAdelanto) {
        detallesObj = { monto: parseFloat(form.montoAdelanto) }
      } else if (isLicenciaOrTurno) {
        detallesObj = { fechaInicio: form.fechaInicio, fechaFin: form.fechaFin }
      }

      onSubmit({
        ...form,
        empleadoId: emp?.id || null,
        departamento: emp?.departamento || '',
        detalles: JSON.stringify(detallesObj),
      })
    }
  }

  const filteredEmpleados = empleados
    .filter(e => e.estado === 'Activo')
    .filter(e => 
      (e.nombre + ' ' + (e.apellidos || '')).toLowerCase().includes(searchEmp.toLowerCase()) ||
      e.departamento?.toLowerCase().includes(searchEmp.toLowerCase())
    )

  const isSelected = (emp) => form.empleadoNombre === emp.nombre

  return (
    <CModal visible={visible} onClose={onClose} size="lg" className="eco-modal" backdrop="static">
      <CModalHeader closeButton className="eco-card-header border-bottom-0 pb-0">
        <CModalTitle className="fw-bold text-eco d-flex align-items-center h4">
          Nueva Solicitud de Personal
        </CModalTitle>
      </CModalHeader>
      <CModalBody className="px-4 pt-4 pb-4">
        
        {/* Sección Empleado */}
        <div className="mb-4">
          <h6 className="fw-bold text-muted mb-3 d-flex align-items-center">
            <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{width: '24px', height: '24px', fontSize: '0.8rem'}}>1</span>
            Datos del Solicitante
          </h6>
          <CRow>
            <CCol md={12}>
              <div ref={dropdownRef} className="position-relative">
                <CFormLabel className="fw-semibold small">Buscar Empleado *</CFormLabel>
                <div className="position-relative">
                  <CIcon icon={cilSearch} className="position-absolute text-muted" style={{ top: '10px', left: '12px' }} />
                  <CFormInput
                    placeholder="Escriba un nombre, apellido o departamento..."
                    value={searchEmp}
                    onChange={(e) => {
                      setSearchEmp(e.target.value)
                      setShowDropdown(true)
                      if(form.empleadoNombre) handleChange('empleadoNombre', '')
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="input-minec ps-5"
                    invalid={!!errors.empleadoNombre}
                  />
                  {loadingEmpleados && <CSpinner size="sm" color="success" className="position-absolute" style={{ top: '10px', right: '12px' }} />}
                </div>
                {errors.empleadoNombre && (
                  <small className="text-danger mt-1 d-block">{errors.empleadoNombre}</small>
                )}

                {showDropdown && (
                  <div 
                    className="position-absolute w-100 bg-white border rounded shadow-lg mt-1" 
                    style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}
                  >
                    {filteredEmpleados.length > 0 ? (
                      filteredEmpleados.map(emp => (
                        <div 
                          key={emp.id} 
                          className={`d-flex justify-content-between align-items-center p-2 border-bottom hover-lift ${isSelected(emp) ? 'bg-light' : ''}`}
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                          onClick={() => handleSelectEmpleado(emp)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected(emp) ? '#f8f9fa' : 'white'}
                        >
                          <div className="d-flex align-items-center">
                            <CAvatar color="primary" textColor="white" size="md" className="me-3">
                              {emp.nombre?.charAt(0) || <CIcon icon={cilUser} />}
                            </CAvatar>
                            <div>
                              <div className="fw-semibold text-eco">{emp.nombre} {emp.apellidos}</div>
                              <div className="small text-muted">{emp.departamento || 'Sin departamento'}</div>
                            </div>
                          </div>
                          {isSelected(emp) && <CIcon icon={cilCheckCircle} className="text-success" size="lg" />}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted small">No se encontraron empleados que coincidan con la búsqueda.</div>
                    )}
                  </div>
                )}
              </div>
            </CCol>
          </CRow>
        </div>

        <hr className="my-4 text-muted opacity-25" />

        {/* Sección Detalles */}
        <div>
          <h6 className="fw-bold text-muted mb-3 d-flex align-items-center">
            <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{width: '24px', height: '24px', fontSize: '0.8rem'}}>2</span>
            Detalles de la Solicitud
          </h6>
          <CRow className="g-3">
            <CCol md={12}>
              <CFormLabel className="fw-semibold small">Tipo de Solicitud *</CFormLabel>
              <CFormSelect
                value={form.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                invalid={!!errors.tipo}
                className="input-minec"
              >
                <option value="">Seleccionar tipo de trámite...</option>
                {TIPOS_SOLICITUD.filter((t) => t !== 'Solicitud de Contratación').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
              {errors.tipo && <small className="text-danger">{errors.tipo}</small>}
            </CCol>

            {/* Asunto Generado (Solo lectura) - Se muestra siempre y cuando haya tipo elegido */}
            {form.tipo && (
              <CCol md={12}>
                <CFormLabel className="fw-semibold small text-muted">Asunto del Trámite</CFormLabel>
                <CFormInput
                  value={form.descripcion}
                  readOnly
                  className="input-minec bg-light text-muted"
                  title="Este campo se genera automáticamente"
                />
              </CCol>
            )}

            {/* --- BLOQUE CONSTANCIA DE TRABAJO --- */}
            {isConstancia && (
              <>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold small">Dirigido a * (Máx 60)</CFormLabel>
                  <CFormInput
                    value={form.dirigidoA}
                    onChange={(e) => handleChange('dirigidoA', e.target.value)}
                    invalid={!!errors.dirigidoA}
                    className="input-minec"
                    placeholder="Ej. A quien pueda interesar"
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {errors.dirigidoA ? <small className="text-danger">{errors.dirigidoA}</small> : <span/>}
                    <small className="text-muted" style={{fontSize: '0.7rem'}}>{form.dirigidoA.length}/60</small>
                  </div>
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold small">Propósito (Opcional - Máx 80)</CFormLabel>
                  <CFormInput
                    value={form.proposito}
                    onChange={(e) => handleChange('proposito', e.target.value)}
                    invalid={!!errors.proposito}
                    className="input-minec"
                    placeholder="Ej. Apertura de cuenta bancaria"
                  />
                  <div className="d-flex justify-content-end mt-1">
                    <small className="text-muted" style={{fontSize: '0.7rem'}}>{form.proposito.length}/80</small>
                  </div>
                </CCol>
                <CCol md={12}>
                  <CFormSwitch 
                    label="Mostrar Sueldo en la Constancia" 
                    id="mostrarSueldoSwitch" 
                    checked={form.mostrarSueldo}
                    onChange={(e) => handleChange('mostrarSueldo', e.target.checked)}
                  />
                </CCol>
              </>
            )}

            {/* --- BLOQUE VACACIONES E INCAPACIDADES LARGAS --- */}
            {(isVacaciones || isLicenciaOrTurno) && (
              <>
                <CCol md={4}>
                  <CFormLabel className="fw-semibold small">Fecha Inicio *</CFormLabel>
                  <CFormInput
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    invalid={!!errors.fechaInicio}
                    className="input-minec"
                    min={isVacaciones ? todayStr : undefined} // Estricto para vacaciones
                  />
                  {errors.fechaInicio && <small className="text-danger">{errors.fechaInicio}</small>}
                </CCol>
                
                {form.tipo !== 'Baja / Renuncia' && (
                  <CCol md={4}>
                    <CFormLabel className="fw-semibold small">Fecha Fin {isVacaciones && '*'}</CFormLabel>
                    <CFormInput
                      type="date"
                      value={form.fechaFin}
                      onChange={(e) => handleChange('fechaFin', e.target.value)}
                      invalid={!!errors.fechaFin}
                      className="input-minec"
                      min={isVacaciones ? getMinFechaFinVacaciones() : form.fechaInicio}
                    />
                    {errors.fechaFin && <small className="text-danger">{errors.fechaFin}</small>}
                  </CCol>
                )}
                
                {form.fechaFin && (
                  <CCol md={4}>
                    <CFormLabel className="fw-semibold small">Días Totales</CFormLabel>
                    <CFormInput
                      type="number"
                      value={form.diasSolicitados}
                      readOnly
                      className="input-minec bg-light text-center fw-bold"
                    />
                  </CCol>
                )}

                <CCol md={12}>
                  <CFormLabel className="fw-semibold small">Justificación / Detalles *</CFormLabel>
                  <CFormTextarea
                    value={form.motivo}
                    onChange={(e) => handleChange('motivo', e.target.value)}
                    invalid={!!errors.motivo}
                    className="input-minec"
                    rows={2}
                    placeholder={isVacaciones ? "Indique el período vacacional (Ej. 2025-2026)..." : "Detalles de la solicitud..."}
                  />
                  {errors.motivo && <small className="text-danger">{errors.motivo}</small>}
                </CCol>
              </>
            )}

            {/* --- BLOQUE PERMISOS (Ausencias de 1 día) --- */}
            {isPermiso && (
              <>
                <CCol md={4}>
                  <CFormLabel className="fw-semibold small">Motivo del Permiso *</CFormLabel>
                  <CFormSelect
                    value={form.motivoPermiso}
                    onChange={(e) => handleChange('motivoPermiso', e.target.value)}
                    invalid={!!errors.motivoPermiso}
                    className="input-minec"
                  >
                    <option value="">Seleccionar motivo</option>
                    <option value="Salud">Salud (Requiere Soporte)</option>
                    <option value="Trámite Personal">Trámite Personal</option>
                    <option value="Luto">Luto</option>
                    <option value="Otro">Otro</option>
                  </CFormSelect>
                  {errors.motivoPermiso && <small className="text-danger">{errors.motivoPermiso}</small>}
                </CCol>

                <CCol md={4}>
                  <CFormLabel className="fw-semibold small">Fecha del Permiso *</CFormLabel>
                  <CFormInput
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => handleChange('fechaInicio', e.target.value)}
                    invalid={!!errors.fechaInicio}
                    className="input-minec"
                    min={getMinDatePermiso()} // Permite hasta 2 días atrás
                  />
                  {errors.fechaInicio && <small className="text-danger">{errors.fechaInicio}</small>}
                </CCol>

                <CCol md={4}>
                  <CFormLabel className="fw-semibold small">Franja de Ausencia *</CFormLabel>
                  <CFormSelect
                    value={form.franjaAusencia}
                    onChange={(e) => handleChange('franjaAusencia', e.target.value)}
                    invalid={!!errors.franjaAusencia}
                    className="input-minec"
                  >
                    <option value="Jornada Completa">Jornada Completa</option>
                    <option value="Media Jornada - Mañana">Media Jornada - Mañana</option>
                    <option value="Media Jornada - Tarde">Media Jornada - Tarde</option>
                    <option value="Llegada Tardía">Llegada Tardía</option>
                    <option value="Salida Temprana">Salida Temprana</option>
                  </CFormSelect>
                  {errors.franjaAusencia && <small className="text-danger">{errors.franjaAusencia}</small>}
                </CCol>

                {form.motivoPermiso === 'Salud' && (
                  <CCol md={12}>
                    <CFormLabel className="fw-semibold small d-flex align-items-center">
                      <CIcon icon={cilPaperclip} className="me-1" />
                      Documento Adjunto (Justificativo Médico) *
                    </CFormLabel>
                    <CFormInput
                      type="file"
                      accept=".pdf, .png, .jpg, .jpeg"
                      onChange={handleFileUpload}
                      invalid={!!errors.archivoSoporte}
                      className="input-minec"
                    />
                    {errors.archivoSoporte ? (
                      <small className="text-danger">{errors.archivoSoporte}</small>
                    ) : (
                      <small className="text-muted d-block mt-1">Máximo 2MB. Formatos: PDF, PNG, JPG.</small>
                    )}
                  </CCol>
                )}

                <CCol md={12}>
                  <CFormLabel className="fw-semibold small">Justificación Detallada *</CFormLabel>
                  <CFormTextarea
                    value={form.motivo}
                    onChange={(e) => handleChange('motivo', e.target.value)}
                    invalid={!!errors.motivo}
                    className="input-minec"
                    rows={3}
                    placeholder="Agregue la justificación de la ausencia..."
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {errors.motivo ? <small className="text-danger">{errors.motivo}</small> : <span/>}
                    <small className={form.motivo.length === 150 ? 'text-danger fw-bold' : 'text-muted'} style={{fontSize: '0.7rem'}}>
                      {form.motivo.length}/150
                    </small>
                  </div>
                </CCol>
              </>
            )}

            {/* --- BLOQUE ADELANTOS --- */}
            {isAdelanto && (
              <>
                <CCol md={6}>
                  <CFormLabel className="fw-semibold small">Monto Solicitado *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>$</CInputGroupText>
                    <CFormInput
                      value={form.montoAdelanto}
                      onChange={(e) => handleChange('montoAdelanto', e.target.value)}
                      invalid={!!errors.montoAdelanto}
                      className="input-minec"
                      placeholder="0.00"
                    />
                  </CInputGroup>
                  {errors.montoAdelanto && <small className="text-danger">{errors.montoAdelanto}</small>}
                </CCol>

                <CCol md={12}>
                  <CFormLabel className="fw-semibold small">Motivo del Adelanto *</CFormLabel>
                  <CFormTextarea
                    value={form.motivo}
                    onChange={(e) => handleChange('motivo', e.target.value)}
                    invalid={!!errors.motivo}
                    className="input-minec"
                    rows={2}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {errors.motivo ? <small className="text-danger">{errors.motivo}</small> : <span/>}
                    <small className={form.motivo.length === 150 ? 'text-danger fw-bold' : 'text-muted'} style={{fontSize: '0.7rem'}}>
                      {form.motivo.length}/150
                    </small>
                  </div>
                </CCol>
              </>
            )}

          </CRow>
        </div>

      </CModalBody>
      <CModalFooter className="border-top-0 pt-0 pb-4 px-4 d-flex justify-content-between bg-light rounded-bottom">
        <small className="text-muted d-flex align-items-center">
          <CIcon icon={cilInfo} className="me-1 text-primary" />
          Se enviará a Bandeja Administrativa
        </small>
        <div>
          <CButton color="secondary" variant="ghost" onClick={onClose} className="me-2">
            Cancelar
          </CButton>
          <CButton color="success" onClick={handleSubmit} className="px-4 shadow-sm text-white">
            <CIcon icon={cilPlus} className="me-2" /> Enviar Solicitud
          </CButton>
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default SolicitudesModalCrear
