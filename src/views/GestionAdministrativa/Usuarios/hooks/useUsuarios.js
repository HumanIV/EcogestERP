import { useState, useCallback, useEffect } from 'react'
import { usuariosService } from '../services/usuariosService'

export const useUsuarios = (filtros = {}) => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await usuariosService.obtenerTodos()
      if (res.success) {
        setUsuarios(res.data)
      } else {
        setError(res.error || 'Error cargando usuarios')
      }
    } catch (err) {
      setError('Error de conexión al cargar usuarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const crearUsuario = useCallback(async (usuarioData) => {
    const res = await usuariosService.crear(usuarioData)
    if (res.success) {
      await cargarUsuarios()
      return { success: true, data: res.data }
    }
    return { success: false, error: res.error }
  }, [cargarUsuarios])

  const actualizarUsuario = useCallback(async (id, datosActualizados) => {
    const res = await usuariosService.actualizar(id, datosActualizados)
    if (res.success) {
      await cargarUsuarios()
      return { success: true, data: res.data }
    }
    return { success: false, error: res.error }
  }, [cargarUsuarios])

  const eliminarUsuario = useCallback(async (id) => {
    const res = await usuariosService.eliminar(id)
    if (res.success) {
      await cargarUsuarios()
      return { success: true }
    }
    return { success: false, error: res.error }
  }, [cargarUsuarios])

  const cambiarEstadoUsuario = useCallback(async (id, activo) => {
    const res = await usuariosService.actualizar(id, { activo })
    if (res.success) {
      await cargarUsuarios()
      return { success: true, data: res.data }
    }
    return { success: false, error: res.error }
  }, [cargarUsuarios])

  const refreshData = useCallback(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtros.tipoUsuario) {
      if (filtros.tipoUsuario === 'erp' && u.rol === 'ciudadano') return false
      if (filtros.tipoUsuario === 'ciudadanos' && u.rol !== 'ciudadano') return false
    }
    if (filtros.rol && filtros.rol !== 'todos' && u.rol !== filtros.rol) return false
    if (filtros.estado && filtros.estado !== 'todos') {
      const isActivo = filtros.estado === 'activos'
      if (u.activo !== isActivo) return false
    }
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase()
      const match = (
        u.nombre?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.cedula?.toLowerCase().includes(q) ||
        u.rol?.toLowerCase().includes(q)
      )
      if (!match) return false
    }
    return true
  })

  return {
    usuarios: usuariosFiltrados,
    todosUsuarios: usuarios,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario,
    refreshData,
  }
}
