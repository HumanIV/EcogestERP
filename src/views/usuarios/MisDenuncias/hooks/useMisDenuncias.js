import { useState, useEffect, useCallback } from 'react'
import { denunciasService } from '../../../GestionAdministrativa/GestionDenuncias/services/denunciasService'

const SOLICITANTE_ID = 'CIUDADANO-001'

const useMisDenuncias = () => {
  const [denuncias, setDenuncias] = useState([])
  const [filteredDenuncias, setFilteredDenuncias] = useState([])
  const [stats, setStats] = useState({ total: 0, pendientes: 0, investigando: 0, resueltas: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todas')

  const calcularStats = (lista) => ({
    total: lista.length,
    pendientes: lista.filter((d) => d.estado === 'pendiente').length,
    investigando: lista.filter((d) => d.estado === 'investigando' || d.estado === 'asignada').length,
    resueltas: lista.filter((d) => d.estado === 'resuelta' || d.estado === 'en_proceso').length,
  })

  const cargarDenuncias = useCallback(async () => {
    setLoading(true)
    try {
      const result = await denunciasService.obtenerDenuncias()
      if (result.success) {
        const mias = result.data.filter((d) => d.solicitanteId === SOLICITANTE_ID || !d.solicitanteId)
        const filtradas = filter === 'todas' ? mias : mias.filter((d) => d.estado === filter)
        setDenuncias(mias)
        setFilteredDenuncias(filtradas)
        setStats(calcularStats(mias))
      }
    } catch (err) {
      console.error('Error cargando denuncias:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { cargarDenuncias() }, [cargarDenuncias])

  const agregarDenuncia = useCallback(async (nuevaDenuncia) => {
    const result = await denunciasService.crearDenuncia({
      ...nuevaDenuncia,
      solicitanteId: SOLICITANTE_ID,
      estado: 'pendiente',
      fecha: new Date().toISOString().split('T')[0],
    })
    if (result.success) {
      await cargarDenuncias()
      return { id: result.data.id, denuncia: result.data }
    }
    return null
  }, [cargarDenuncias])

  const eliminarDenuncia = useCallback(async (id) => {
    try {
      const result = await denunciasService.eliminarDenuncia(id)
      if (result.success) {
        await cargarDenuncias()
      }
    } catch (err) {
      console.error('Error eliminando denuncia:', err)
      throw err
    }
  }, [cargarDenuncias])

  return {
    denuncias,
    filteredDenuncias,
    stats,
    loading,
    filter,
    setFilter,
    agregarDenuncia,
    eliminarDenuncia,
    recargar: cargarDenuncias,
  }
}

export default useMisDenuncias
