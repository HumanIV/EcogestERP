import { useState, useEffect, useMemo, useCallback } from 'react'
import { proveedoresService } from '../services/proveedoresService'

const useProveedores = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [proveedorEditando, setProveedorEditando] = useState(null)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    categoria: '',
  })

  const [proveedores, setProveedores] = useState([])
  const [formData, setFormData] = useState({
    nombre: '',
    rifPrefix: 'J',
    rifNumber: '',
    contacto: '',
    telPrefix: '0414',
    telNumber: '',
    email: '',
    direccion: '',
    categoria: '',
    estado: 'Activo',
  })

  const cargarProveedores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await proveedoresService.obtenerProveedores()
      if (res.success) {
        setProveedores(res.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarProveedores()
  }, [cargarProveedores])

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((prov) => {
      const matchBusqueda =
        !filtros.busqueda ||
        prov.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        prov.rif?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        (prov.contacto && prov.contacto.toLowerCase().includes(filtros.busqueda.toLowerCase()))

      const matchEstado = !filtros.estado || prov.estado === filtros.estado
      const matchCategoria = !filtros.categoria || prov.categoria === filtros.categoria

      return matchBusqueda && matchEstado && matchCategoria
    })
  }, [proveedores, filtros])

  const estadisticas = useMemo(() => {
    const total = proveedores.length
    const activos = proveedores.filter((p) => p.estado === 'Activo').length
    const inactivos = proveedores.filter((p) => p.estado === 'Inactivo').length
    return { total, activos, inactivos }
  }, [proveedores])

  const abrirModalCrear = useCallback(() => {
    setModalMode('create')
    setProveedorEditando(null)
    setFormData({
      nombre: '',
      rifPrefix: 'J',
      rifNumber: '',
      contacto: '',
      telPrefix: '0414',
      telNumber: '',
      email: '',
      direccion: '',
      categoria: '',
      estado: 'Activo',
    })
    setError(null)
    setShowModal(true)
  }, [])

  const abrirModalEditar = useCallback((prov) => {
    setModalMode('edit')
    setProveedorEditando(prov)
    const rifMatch = prov.rif?.match(/^([JGVEPjgvep])-?(\d+)$/i)
    const telMatch = prov.telefono?.match(/^(\+?58|0)?(412|414|424|416|426|276)-?(\d+)$/)

    setFormData({
      nombre: prov.nombre || '',
      rifPrefix: rifMatch ? rifMatch[1].toUpperCase() : 'J',
      rifNumber: rifMatch ? rifMatch[2] : prov.rif || '',
      contacto: prov.contacto || '',
      telPrefix: telMatch ? `0${telMatch[2]}` : '0414',
      telNumber: telMatch ? telMatch[3] : prov.telefono || '',
      email: prov.email || '',
      direccion: prov.direccion || '',
      categoria: prov.categoria || '',
      estado: prov.estado || 'Activo',
    })
    setError(null)
    setShowModal(true)
  }, [])

  const cerrarModal = useCallback(() => {
    setShowModal(false)
    setProveedorEditando(null)
    setError(null)
  }, [])

  const handleFiltroChange = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: '', estado: '', categoria: '' })
  }, [])

  const handleInputChange = useCallback(
    (campo, valor) => {
      setFormData((prev) => ({ ...prev, [campo]: valor }))
      if (error && error[campo]) {
        setError((prev) => ({ ...prev, [campo]: '' }))
      }
    },
    [error],
  )

  const handleBlur = useCallback(
    (campo) => {
      const valor = formData[campo]
      const nuevoError = {}

      switch (campo) {
        case 'nombre':
          if (!valor?.trim()) nuevoError.nombre = 'El nombre es obligatorio'
          else if (valor.trim().length < 3)
            nuevoError.nombre = 'El nombre debe tener al menos 3 caracteres'
          break
        case 'rifNumber':
          if (!valor?.trim()) nuevoError.rifNumber = 'Requerido'
          else if (!/^\d{5,9}$/.test(valor)) nuevoError.rifNumber = 'Solo de 5 a 9 números'
          else {
            const rifCompleto = `${formData.rifPrefix}-${valor}-0` // basic structure for duplicate check
            const dupe = proveedores.find(
              (p) => p.rif.startsWith(`${formData.rifPrefix}-${valor}`) && p.id !== proveedorEditando?.id,
            )
            if (dupe) nuevoError.rifNumber = 'Ya existe'
          }
          break
        case 'telNumber':
          if (valor && !/^\d{7}$/.test(valor)) nuevoError.telNumber = 'Debe tener 7 números'
          break
        case 'email':
          if (!valor) nuevoError.categoria = 'Seleccione una categoría'
          break
      }

      setError((prev) => ({
        ...prev,
        [campo]: nuevoError[campo] || '',
      }))
    },
    [formData, proveedores, proveedorEditando],
  )

  const validarFormulario = useCallback(() => {
    const nuevosErrores = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.rifNumber.trim()) {
      nuevosErrores.rifNumber = 'El número de RIF es obligatorio'
    } else if (!/^\d{5,9}$/.test(formData.rifNumber)) {
      nuevosErrores.rifNumber = 'Debe contener entre 5 y 9 números'
    } else {
      const dupe = proveedores.find(
        (p) => p.rif.startsWith(`${formData.rifPrefix}-${formData.rifNumber}`) && p.id !== proveedorEditando?.id,
      )
      if (dupe) {
        nuevosErrores.rifNumber = 'Ya existe un proveedor con este RIF'
      }
    }

    if (formData.telNumber && !/^\d{7}$/.test(formData.telNumber)) {
      nuevosErrores.telNumber = 'El número de teléfono debe tener 7 dígitos exactos'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    if (!formData.categoria) {
      nuevosErrores.categoria = 'Seleccione una categoría'
    }

    setError(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [formData, proveedores, proveedorEditando])

  const agregarProveedor = useCallback(async (datos) => {
    setLoading(true)
    const payload = {
      ...datos,
      rif: `${datos.rifPrefix}-${datos.rifNumber}`,
      telefono: datos.telNumber ? `${datos.telPrefix}-${datos.telNumber}` : '',
    }
    const res = await proveedoresService.crearProveedor(payload)
    setLoading(false)
    if (res.success) {
      setProveedores((prev) => [...prev, res.data])
    }
    return res
  }, [])

  const editarProveedor = useCallback(async (id, datos) => {
    setLoading(true)
    const payload = {
      ...datos,
      rif: `${datos.rifPrefix}-${datos.rifNumber}`,
      telefono: datos.telNumber ? `${datos.telPrefix}-${datos.telNumber}` : '',
    }
    const res = await proveedoresService.actualizarProveedor(id, payload)
    setLoading(false)
    if (res.success) {
      setProveedores((prev) => prev.map((p) => (p.id === id ? res.data : p)))
    }
    return res
  }, [])

  const eliminarProveedor = useCallback(async (id) => {
    // 1. Check if provider has associated assets in the backend
    try {
      const { api } = await import('../../../../services/api')
      const activos = await api('/activos')
      const tieneActivos = activos.some(a => String(a.proveedorId) === String(id))
      
      if (tieneActivos) {
        return { 
          success: false, 
          error: 'No se puede eliminar este proveedor porque tiene activos registrados en el Inventario. Por favor reasigne o dé de baja los activos primero.' 
        }
      }
    } catch (e) {
      console.error('Error al verificar activos del proveedor:', e)
    }

    const res = await proveedoresService.eliminarProveedor(id)
    if (res.success) {
      setProveedores((prev) => prev.filter((p) => p.id !== id))
    }
    return res
  }, [])

  const exportarCSV = useCallback(() => {
    const headers = ['Nombre', 'RIF', 'Contacto', 'Teléfono', 'Email', 'Categoría', 'Estado']
    const rows = proveedoresFiltrados.map((p) => [
      p.nombre,
      p.rif,
      p.contacto || '',
      p.telefono || '',
      p.email || '',
      p.categoria || '',
      p.estado,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `proveedores_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [proveedoresFiltrados])

  return {
    loading,
    error,
    showModal,
    modalMode,
    proveedorEditando,
    filtros,
    proveedores: proveedoresFiltrados,
    todosProveedores: proveedores,
    estadisticas,
    formData,
    setFormData,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    handleFiltroChange,
    limpiarFiltros,
    handleInputChange,
    handleBlur,
    validarFormulario,
    agregarProveedor,
    editarProveedor,
    eliminarProveedor,
    exportarCSV,
    refreshData: cargarProveedores,
  }
}

export default useProveedores
