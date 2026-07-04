import { useState, useEffect, useCallback, useRef } from 'react'
import { denunciasService } from '../services/denunciasService'
import { cuadrillaService } from '../../cuadrillas/services/cuadrillaService'

const useGestionDenuncias = (filtros = {}) => {
  const [denuncias, setDenuncias] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [cuadrillas, setCuadrillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const cargarDenuncias = useCallback(async () => {
    if (!mountedRef.current) return

    setLoading(true)

    try {
      const denunciasResp = await denunciasService.obtenerDenuncias(filtros)
      const cuadrillasResp = await cuadrillaService.obtenerCuadrillas()

      if (!denunciasResp.success) {
        if (mountedRef.current) {
          setError(new Error(denunciasResp.error || 'Error al cargar las denuncias'))
        }
        return
      }

      const todasDenuncias = denunciasResp.data
      const cuadrillasActivas = cuadrillasResp.success
        ? cuadrillasResp.data.filter((c) => c.estado === 'activa')
        : []

      const stats = {
        total: todasDenuncias.length,
        pendientes: todasDenuncias.filter((d) => d.estado === 'pendiente').length,
        investigando: todasDenuncias.filter((d) => d.estado === 'investigando').length,
        asignada: todasDenuncias.filter((d) => d.estado === 'asignada').length,
        en_proceso: todasDenuncias.filter((d) => d.estado === 'en_proceso').length,
        resuelta: todasDenuncias.filter((d) => d.estado === 'resuelta').length,
        zonasActivas: new Set(todasDenuncias.map((d) => d.municipio)).size,
        altaPrioridad: todasDenuncias.filter((d) => d.prioridad === 'alta').length,
        mediaPrioridad: todasDenuncias.filter((d) => d.prioridad === 'media').length,
        bajaPrioridad: todasDenuncias.filter((d) => d.prioridad === 'baja').length,
      }

      if (mountedRef.current) {
        setDenuncias(todasDenuncias)
        setEstadisticas(stats)
        setCuadrillas(cuadrillasActivas)
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error cargando datos:', err)
        setError(new Error('Error al cargar los datos'))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [JSON.stringify(filtros)])

  const _recalcularEstadisticas = useCallback((currentDenuncias) => {
    const stats = {
      total: currentDenuncias.length,
      pendientes: currentDenuncias.filter((d) => d.estado === 'pendiente').length,
      investigando: currentDenuncias.filter((d) => d.estado === 'investigando').length,
      asignada: currentDenuncias.filter((d) => d.estado === 'asignada').length,
      en_proceso: currentDenuncias.filter((d) => d.estado === 'en_proceso').length,
      resuelta: currentDenuncias.filter((d) => d.estado === 'resuelta').length,
      zonasActivas: new Set(currentDenuncias.map((d) => d.municipio)).size,
      altaPrioridad: currentDenuncias.filter((d) => d.prioridad === 'alta').length,
      mediaPrioridad: currentDenuncias.filter((d) => d.prioridad === 'media').length,
      bajaPrioridad: currentDenuncias.filter((d) => d.prioridad === 'baja').length,
    }
    setEstadisticas(stats)
  }, [])

  const actualizarEstadoDenuncia = useCallback(
    async (id, nuevoEstado, detalle = '') => {
      try {
        if (nuevoEstado === 'eliminada') {
          setDenuncias((prev) => prev.filter((d) => d.id !== id))
          setTimeout(() => {
            setDenuncias((current) => {
              _recalcularEstadisticas(current)
              return current
            })
          }, 0)
        } else {
          const resultado = await denunciasService.actualizarEstado(id, nuevoEstado, detalle)
          if (resultado.success) {
            setDenuncias((prev) =>
              prev.map((d) => (d.id === id ? resultado.data : d)),
            )
            setTimeout(() => {
              setDenuncias((current) => {
                _recalcularEstadisticas(current)
                return current
              })
            }, 0)
          }
        }
        return true
      } catch (err) {
        console.error('Error actualizando estado:', err)
        return false
      }
    },
    [_recalcularEstadisticas],
  )

  const asignarDenuncia = useCallback(
    async (id, cuadrillaId, datosAdicionales = {}) => {
      try {
        const resultado = await denunciasService.asignarDenuncia(id, cuadrillaId, datosAdicionales)
        if (resultado.success) {
          setDenuncias((prev) =>
            prev.map((d) => (d.id === id ? resultado.data : d)),
          )
          setTimeout(() => {
            setDenuncias((current) => {
              _recalcularEstadisticas(current)
              return current
            })
          }, 0)
        }
        return resultado.success
      } catch (err) {
        console.error('Error asignando denuncia:', err)
        return false
      }
    },
    [_recalcularEstadisticas],
  )

  const asignarAutomaticamente = useCallback(
    async (denunciaId) => {
      try {
        const denuncia = denuncias.find((d) => d.id === denunciaId)
        if (!denuncia) {
          return { success: false, message: 'Denuncia no encontrada' }
        }

        const cuadrillasDisponibles = cuadrillas.filter(
          (c) => c.estado === 'activa' && c.disponible === true,
        )

        if (cuadrillasDisponibles.length === 0) {
          return { success: false, message: 'No hay cuadrillas disponibles' }
        }

        const cuadrillasConCarga = cuadrillasDisponibles.map((cuadrilla) => {
          const denunciasAsignadas = denuncias.filter(
            (d) => d.cuadrillaId === cuadrilla.id && d.estado !== 'resuelta',
          ).length

          return {
            ...cuadrilla,
            cargaActual: denunciasAsignadas,
            porcentajeCarga: (denunciasAsignadas / cuadrilla.capacidad) * 100,
          }
        })

        let mejorCuadrilla = null
        let mejorPuntaje = -1
        let razon = ''

        cuadrillasConCarga.forEach((cuadrilla) => {
          let puntaje = 0
          let razones = []

          if (
            cuadrilla.especialidad.includes(denuncia.tipo) ||
            cuadrilla.especialidad.includes('todos')
          ) {
            puntaje += 50
            razones.push('especialidad')
          }

          const estadoDenuncia = denuncia.estadoUbicacion?.toLowerCase() || ''
          const zonaCuadrilla = cuadrilla.zona?.toLowerCase() || ''

          if (estadoDenuncia.includes(zonaCuadrilla) || zonaCuadrilla.includes(estadoDenuncia)) {
            puntaje += 30
            razones.push('cercanía')
          }

          const cargaPorcentaje = cuadrilla.porcentajeCarga
          const puntajeCarga = Math.max(0, 20 - cargaPorcentaje / 5)
          puntaje += puntajeCarga
          if (puntajeCarga > 0) razones.push('baja carga')

          if (puntaje > mejorPuntaje) {
            mejorPuntaje = puntaje
            mejorCuadrilla = cuadrilla
            razon = razones.join(', ')
          }
        })

        if (mejorCuadrilla) {
          const resultado = await asignarDenuncia(denunciaId, mejorCuadrilla.id, {
            asignacionAutomatica: true,
            razonAsignacion: razon,
          })

          if (resultado) {
            return {
              success: true,
              cuadrilla: mejorCuadrilla,
              message: `Denuncia asignada automáticamente a: ${mejorCuadrilla.nombre}`,
              razon: razon,
            }
          }
        }

        return { success: false, message: 'No se pudo asignar la denuncia' }
      } catch (err) {
        console.error('Error en asignación automática:', err)
        return { success: false, message: 'Error en asignación automática' }
      }
    },
    [denuncias, cuadrillas, asignarDenuncia],
  )

  const obtenerEstadisticasCuadrillas = useCallback(() => {
    const cuadrillasStats = {}

    denuncias.forEach((denuncia) => {
      if (denuncia.cuadrillaId) {
        if (!cuadrillasStats[denuncia.cuadrillaId]) {
          cuadrillasStats[denuncia.cuadrillaId] = {
            total: 0,
            pendientes: 0,
            enProceso: 0,
            resueltas: 0,
          }
        }

        cuadrillasStats[denuncia.cuadrillaId].total++

        switch (denuncia.estado) {
          case 'pendiente':
          case 'asignada':
            cuadrillasStats[denuncia.cuadrillaId].pendientes++
            break
          case 'investigando':
          case 'en_proceso':
            cuadrillasStats[denuncia.cuadrillaId].enProceso++
            break
          case 'resuelta':
            cuadrillasStats[denuncia.cuadrillaId].resueltas++
            break
        }
      }
    })

    const estadisticasCompletas = cuadrillas.map((cuadrilla) => {
      const stats = cuadrillasStats[cuadrilla.id] || {
        total: 0,
        pendientes: 0,
        enProceso: 0,
        resueltas: 0,
      }

      return {
        ...cuadrilla,
        estadisticas: stats,
        eficiencia: stats.total > 0 ? Math.round((stats.resueltas / stats.total) * 100) : 0,
        cargaPorcentaje: (stats.total / cuadrilla.capacidad) * 100,
      }
    })

    return estadisticasCompletas
  }, [denuncias, cuadrillas])

  const obtenerCuadrillasDisponibles = useCallback(() => {
    return cuadrillas
      .filter((c) => c.estado === 'activa' && c.disponible === true)
      .map((cuadrilla) => {
        const denunciasAsignadas = denuncias.filter(
          (d) => d.cuadrillaId === cuadrilla.id && d.estado !== 'resuelta',
        ).length

        return {
          ...cuadrilla,
          cargaActual: denunciasAsignadas,
          porcentajeCarga: (denunciasAsignadas / cuadrilla.capacidad) * 100,
          disponibilidad: Math.max(0, cuadrilla.capacidad - denunciasAsignadas),
        }
      })
      .sort((a, b) => a.porcentajeCarga - b.porcentajeCarga)
  }, [cuadrillas, denuncias])

  const obtenerCuadrillaOptima = useCallback(
    (denuncia) => {
      const cuadrillasDisponibles = obtenerCuadrillasDisponibles()

      if (cuadrillasDisponibles.length === 0) {
        return null
      }

      let mejorCuadrilla = null
      let mejorPuntaje = -1

      cuadrillasDisponibles.forEach((cuadrilla) => {
        let puntaje = 0
        let razon = ''

        if (
          cuadrilla.especialidad.includes(denuncia.tipo) ||
          cuadrilla.especialidad.includes('todos')
        ) {
          puntaje += 50
          razon += 'Especializada en este tipo de denuncia. '
        }

        const estadoDenuncia = denuncia.estadoUbicacion?.toLowerCase() || ''
        const zonaCuadrilla = cuadrilla.zona?.toLowerCase() || ''

        if (estadoDenuncia.includes(zonaCuadrilla) || zonaCuadrilla.includes(estadoDenuncia)) {
          puntaje += 30
          razon += 'Ubicada en la misma zona. '
        }

        const cargaPorcentaje = cuadrilla.porcentajeCarga
        const puntajeCarga = Math.max(0, 20 - cargaPorcentaje / 5)
        puntaje += puntajeCarga
        if (puntajeCarga > 0) razon += 'Baja carga de trabajo. '

        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje
          mejorCuadrilla = {
            ...cuadrilla,
            puntaje: puntaje,
            razon: razon.trim(),
          }
        }
      })

      return mejorCuadrilla
    },
    [obtenerCuadrillasDisponibles],
  )

  const reasignarDenuncias = useCallback(
    async (cuadrillaOrigenId, cuadrillaDestinoId) => {
      try {
        const denunciasAReasignar = denuncias.filter(
          (d) => d.cuadrillaId === cuadrillaOrigenId && d.estado !== 'resuelta',
        )

        if (denunciasAReasignar.length === 0) {
          return { success: false, message: 'No hay denuncias para reasignar' }
        }

        const cuadrillaDestino = cuadrillas.find((c) => c.id === cuadrillaDestinoId)
        if (!cuadrillaDestino) {
          return { success: false, message: 'Cuadrilla destino no encontrada' }
        }

        const denunciasActualesDestino = denuncias.filter(
          (d) => d.cuadrillaId === cuadrillaDestinoId && d.estado !== 'resuelta',
        ).length

        if (denunciasActualesDestino + denunciasAReasignar.length > cuadrillaDestino.capacidad) {
          return {
            success: false,
            message: `La cuadrilla destino no tiene capacidad suficiente. 
            Capacidad: ${cuadrillaDestino.capacidad}, 
            Actual: ${denunciasActualesDestino}, 
            Nuevas: ${denunciasAReasignar.length}`,
          }
        }

        const resultados = []
        for (const denuncia of denunciasAReasignar) {
          const resultado = await asignarDenuncia(denuncia.id, cuadrillaDestinoId, {
            reasignada: true,
            cuadrillaAnterior: cuadrillaOrigenId,
            fechaReasignacion: new Date().toISOString(),
          })

          resultados.push({
            id: denuncia.id,
            success: resultado,
          })
        }

        const exitosas = resultados.filter((r) => r.success).length

        return {
          success: exitosas > 0,
          total: denunciasAReasignar.length,
          exitosas: exitosas,
          message: `${exitosas}/${denunciasAReasignar.length} denuncias reasignadas exitosamente`,
        }
      } catch (err) {
        console.error('Error reasignando denuncias:', err)
        return { success: false, message: 'Error reasignando denuncias' }
      }
    },
    [denuncias, cuadrillas, asignarDenuncia],
  )

  const exportarReporte = useCallback(
    async (filtrosExport) => {
      try {
        const estadisticasCuadrillas = obtenerEstadisticasCuadrillas()

        const reporte = {
          metadata: {
            titulo: 'Reporte de Denuncias Ambientales',
            fechaGeneracion: new Date().toISOString(),
            filtrosAplicados: filtrosExport,
            totalRegistros: denuncias.length,
            totalCuadrillas: cuadrillas.length,
          },
          datos: denuncias,
          estadisticas: estadisticas,
          cuadrillas: estadisticasCuadrillas,
          resumen: {
            total: denuncias.length,
            resueltas: estadisticas.resuelta || 0,
            pendientes: estadisticas.pendientes || 0,
            cuadrillasActivas: cuadrillas.filter((c) => c.estado === 'activa').length,
          },
        }

        const dataStr = JSON.stringify(reporte, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute(
          'download',
          `reporte-denuncias-${new Date().toISOString().split('T')[0]}.json`,
        )
        linkElement.click()

        return true
      } catch (err) {
        console.error('Error exportando reporte:', err)
        return false
      }
    },
    [denuncias, estadisticas, cuadrillas, obtenerEstadisticasCuadrillas],
  )

  const actualizarCuadrilla = useCallback((cuadrillaActualizada) => {
    setCuadrillas((prev) =>
      prev.map((c) => (c.id === cuadrillaActualizada.id ? cuadrillaActualizada : c)),
    )
  }, [])

  const agregarCuadrilla = useCallback((nuevaCuadrilla) => {
    setCuadrillas((prev) => [...prev, nuevaCuadrilla])
  }, [])

  const eliminarCuadrilla = useCallback(
    (cuadrillaId) => {
      const tieneDenuncias = denuncias.some(
        (d) => d.cuadrillaId === cuadrillaId && d.estado !== 'resuelta',
      )

      if (tieneDenuncias) {
        return {
          success: false,
          message: 'La cuadrilla tiene denuncias asignadas pendientes',
        }
      }

      setCuadrillas((prev) => prev.filter((c) => c.id !== cuadrillaId))
      return { success: true, message: 'Cuadrilla eliminada exitosamente' }
    },
    [denuncias],
  )

  const agregarComentario = useCallback(async (id, texto, autor = 'Operador') => {
    try {
      const resultado = await denunciasService.agregarComentario(id, texto, autor)
      if (resultado.success) {
        setDenuncias((prev) =>
          prev.map((d) => (d.id === id ? resultado.data : d)),
        )
      }
      return resultado.success
    } catch (err) {
      console.error('Error agregando comentario:', err)
      return false
    }
  }, [])

  const resolverDenuncia = useCallback(
    async (id, datosResolucion) => {
      try {
        const resultado = await denunciasService.actualizarEstado(id, 'resuelta', '', datosResolucion)
        if (resultado.success) {
          setDenuncias((prev) =>
            prev.map((d) => (d.id === id ? resultado.data : d)),
          )
          setTimeout(() => {
            setDenuncias((current) => {
              _recalcularEstadisticas(current)
              return current
            })
          }, 0)
        }
        return resultado.success
      } catch (err) {
        console.error('Error resolviendo denuncia:', err)
        return false
      }
    },
    [_recalcularEstadisticas],
  )

  const exportarDenunciaIndividual = useCallback((denuncia) => {
    if (!denuncia) return
    const data = {
      id: denuncia.id,
      titulo: denuncia.titulo,
      tipo: denuncia.tipo,
      estado: denuncia.estado,
      prioridad: denuncia.prioridad,
      ubicacion: `${denuncia.ubicacion}, ${denuncia.municipio}, ${denuncia.estadoUbicacion}`,
      fecha: denuncia.fecha,
      descripcion: denuncia.descripcion,
      historial: denuncia.historial || [],
      comentarios: denuncia.comentarios || [],
      resolucion: denuncia.resolucion || null,
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `denuncia-${denuncia.id}.json`)
    linkElement.click()
  }, [])

  useEffect(() => {
    cargarDenuncias()
  }, [cargarDenuncias])

  return {
    denuncias,
    estadisticas,
    cuadrillas,
    loading,
    error,
    actualizarEstadoDenuncia,
    asignarDenuncia,
    asignarAutomaticamente,
    exportarReporte,
    refreshData: cargarDenuncias,
    agregarComentario,
    resolverDenuncia,
    exportarDenunciaIndividual,
    obtenerEstadisticasCuadrillas,
    obtenerCuadrillasDisponibles,
    obtenerCuadrillaOptima,
    reasignarDenuncias,
    actualizarCuadrilla,
    agregarCuadrilla,
    eliminarCuadrilla,
    getKPIs: () => ({
      totalDenuncias: estadisticas.total || 0,
      denunciasPendientes: estadisticas.pendientes || 0,
      denunciasResueltas: estadisticas.resuelta || 0,
      cuadrillasActivas: cuadrillas.filter((c) => c.estado === 'activa').length,
      cuadrillasDisponibles: obtenerCuadrillasDisponibles().length,
    }),
    getAlertas: () => {
      const alertas = []

      const denunciasSinAsignar = denuncias.filter(
        (d) => d.estado === 'pendiente' && !d.cuadrillaId,
      ).length

      if (denunciasSinAsignar > 5) {
        alertas.push({
          tipo: 'warning',
          titulo: 'Denuncias sin asignar',
          mensaje: `Hay ${denunciasSinAsignar} denuncias pendientes sin asignar a cuadrillas`,
          prioridad: 'media',
        })
      }

      const cuadrillasSobrecargadas = obtenerCuadrillasDisponibles().filter(
        (c) => c.porcentajeCarga > 100,
      )

      if (cuadrillasSobrecargadas.length > 0) {
        cuadrillasSobrecargadas.forEach((c) => {
          alertas.push({
            tipo: 'danger',
            titulo: 'Cuadrilla sobrecargada',
            mensaje: `${c.nombre} está al ${c.porcentajeCarga.toFixed(0)}% de su capacidad`,
            prioridad: 'alta',
          })
        })
      }

      return alertas
    },
  }
}

export default useGestionDenuncias
