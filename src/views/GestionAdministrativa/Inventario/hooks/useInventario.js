import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  CATEGORIAS,
  UBICACIONES,
  DATOS_INICIALES_ACTIVOS,
  DATOS_INICIALES_MOVIMIENTOS,
  DATOS_INICIALES_ALERTAS,
} from '../constants/inventarioConstants'
import inventarioService from '../services/inventarioService'
import { proveedoresService } from '../../Proveedores/services/proveedoresService'
import { cuadrillaService } from '../../cuadrillas/services/cuadrillaService'
import { registrarAccion } from '../../../../services/AuditLogService'
import { integracionService } from '../../../../services/integracionService'

const useInventario = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [visibleModal, setVisibleModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    estado: '',
    ubicacion: '',
  })

  const [activos, setActivos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [alertas, setAlertas] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [cuadrillas, setCuadrillas] = useState([])

  const cargar = async () => {
    try {
      const invRes = await inventarioService.obtenerInventario()
      if (invRes.success) {
        setActivos(invRes.data.activos || [])
        setMovimientos(invRes.data.movimientos || [])
        setAlertas(invRes.data.alertas || [])
      }

      const provRes = await proveedoresService.obtenerProveedores()
      if (provRes.success) {
        setProveedores(provRes.data)
      }

      const cuadRes = await cuadrillaService.obtenerCuadrillas()
      if (cuadRes.success) {
        setCuadrillas(cuadRes.data)
      }
    } catch (err) {
      console.error('Error cargando inventario:', err)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const activosFiltrados = useMemo(() => {
    return activos.filter((activo) => {
      const matchBusqueda =
        !filtros.busqueda ||
        activo.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        activo.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        (activo.alias && activo.alias.toLowerCase().includes(filtros.busqueda.toLowerCase()))

      const matchCategoria = !filtros.categoria || activo.categoria === filtros.categoria
      const matchEstado = !filtros.estado || activo.estado === filtros.estado
      const matchUbicacion = !filtros.ubicacion || activo.ubicacion.includes(filtros.ubicacion)

      return matchBusqueda && matchCategoria && matchEstado && matchUbicacion
    })
  }, [activos, filtros])

  const metricas = useMemo(() => {
    const totalActivos = activos.length
    const valorTotalActivos = activos.reduce((sum, a) => sum + (Number(a.valorActual) || 0), 0)
    const activosEnUso = activos.filter((a) => a.estado === 'En Uso').length
    const activosMantenimiento = activos.filter((a) => a.estado === 'En Mantenimiento').length

    const distribucionCategorias = CATEGORIAS.map((cat) => ({
      ...cat,
      cantidad: activos.filter((a) => a.categoria === cat.nombre).length,
      valor: activos
        .filter((a) => a.categoria === cat.nombre)
        .reduce((sum, a) => sum + (Number(a.valorActual) || 0), 0),
    }))

    const ocupacionTotal =
      UBICACIONES.reduce(
        (sum, u) => (u.ocupacion !== 'N/A' ? sum + parseInt(u.ocupacion) : sum),
        0,
      ) / UBICACIONES.filter((u) => u.ocupacion !== 'N/A').length

    return {
      totalActivos,
      valorTotalActivos,
      activosEnUso,
      activosMantenimiento,
      distribucionCategorias,
      ocupacionTotal,
    }
  }, [activos])

  const handleOpenModal = useCallback((type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setVisibleModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setVisibleModal(false)
    setModalType(null)
    setSelectedItem(null)
  }, [])

  const handleFiltroChange = useCallback((campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: '', categoria: '', estado: '', ubicacion: '' })
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    await cargar()
    setLoading(false)
  }, [])

  const agregarActivo = useCallback(
    async (formData) => {
      setLoading(true)
      const res = await inventarioService.crearActivo(formData)
      if (res.success) {
        await registrarAccion({
          moduloOrigen: 'GestionAdministrativa',
          moduloDestino: 'Inventario',
          entidad: 'Activo',
          entidadId: res.data.id || res.data.codigo,
          accion: 'CREAR',
          detalles: `Alta de nuevo activo: ${formData.nombre}`,
        })
        await refreshData()
        handleCloseModal()
      } else {
        setError(res.error)
      }
      setLoading(false)
      return res.success
    },
    [refreshData, handleCloseModal],
  )

  const editarActivo = useCallback(
    async (id, formData) => {
      setLoading(true)
      const res = await inventarioService.actualizarActivo(id, formData)
      if (res.success) {
        await registrarAccion({
          moduloOrigen: 'GestionAdministrativa',
          moduloDestino: 'Inventario',
          entidad: 'Activo',
          entidadId: id,
          accion: 'EDITAR',
          detalles: `Se editaron los datos del activo: ${formData.nombre}`,
        })
        await refreshData()
        handleCloseModal()
      } else {
        setError(res.error)
      }
      setLoading(false)
      return res.success
    },
    [refreshData, handleCloseModal]
  )

  const eliminarActivo = useCallback(
    async (id, activoAnterior) => {
      if (window.confirm('¿Está seguro de que desea eliminar este activo? Esta acción no se puede deshacer.')) {
        setLoading(true)
        const res = await inventarioService.eliminarActivo(id)
        if (res.success) {
          await registrarAccion({
            moduloOrigen: 'GestionAdministrativa',
            moduloDestino: 'Inventario',
            entidad: 'Activo',
            entidadId: id,
            accion: 'ELIMINAR',
            detalles: `Se eliminó el activo: ${activoAnterior.nombre}`,
          })
          await refreshData()
          handleCloseModal()
        } else {
          setError(res.error)
        }
        setLoading(false)
        return res.success
      }
      return false
    },
    [refreshData, handleCloseModal]
  )

  const registrarMovimiento = useCallback(
    async (movimientoData) => {
      setLoading(true)
      
      const activo = activos.find((a) => a.id === parseInt(movimientoData.activoId))
      if (activo) {
        // Enviar TODAS las solicitudes a Bandeja Administrativa
        const resIntegracion = await integracionService.solicitarMovimientoActivo(movimientoData, activo)
        if (resIntegracion.success) {
          // Mostrar mensaje de éxito (Bandeja)
          handleCloseModal()
        } else {
          setError(resIntegracion.error)
        }
      }
      setLoading(false)
    },
    [activos, refreshData, handleCloseModal],
  )

  const generarReporte = useCallback((tipo) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }, [])

  return {
    loading,
    error,
    activeTab,
    setActiveTab,
    visibleModal,
    modalType,
    selectedItem,
    filtros,
    activos: activosFiltrados,
    todosActivos: activos,
    movimientos,
    alertas,
    metricas,
    proveedores,
    cuadrillas,
    handleFiltroChange,
    limpiarFiltros,
    refreshData,
    handleOpenModal,
    handleCloseModal,
    agregarActivo,
    editarActivo,
    eliminarActivo,
    registrarMovimiento,
    generarReporte,
  }
}

export default useInventario
