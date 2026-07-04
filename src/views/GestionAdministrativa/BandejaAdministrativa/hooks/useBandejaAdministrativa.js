import { useState, useEffect, useCallback } from 'react'
import { tramitesService } from '../../Tramites/services/tramitesService'
import { denunciasService } from '../../GestionDenuncias/services/denunciasService'
import { integracionService } from '../../../../services/integracionService'
import { solicitudActivosService } from '../../SolicitudActivos/services/solicitudActivosService'
import estructuraOrgService from '../../../RRHH/EstructuraOrg/services/estructuraOrgService'

const useBandejaAdministrativa = () => {
  const [tareas, setTareas] = useState([])
  const [bitacoraGlobal, setBitacoraGlobal] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarTareas = useCallback(async () => {
    setLoading(true)
    setError(null)
    const errores = []
    try {
      const tareasAgregadas = []
      const bitacoraAgregada = []

      // 1. Trámites pendientes via tramitesService
      const tramitesResult = await tramitesService.obtenerTramites()
      if (tramitesResult.success && tramitesResult.data) {
        tramitesResult.data.forEach((t) => {
          const tareaObj = {
            id: `TRAMITE-${t.id}`,
            moduloOrigen: 'Tramites',
            tipo: t.tipo === 'PERMISO' ? `Permiso: ${t.subtipo}` : `Licencia: ${t.subtipo}`,
            solicitante: t.solicitante,
            cedulaRif: t.cedulaRif,
            estado: t.estado,
            estadoLabel: getEstadoTramiteLabel(t.estado),
            fecha: t.fechaSolicitud,
            tramiteId: t.id,
            tramiteData: t,
            acciones: getAccionesTramite(t.estado),
          }
          if (['REVISION', 'INSPECCION', 'DOCUMENTO_GENERADO'].includes(t.estado)) {
            tareasAgregadas.push(tareaObj)
          } else {
            bitacoraAgregada.push(tareaObj)
          }
        })
      }

      // 1.5 Denuncias pendientes via denunciasService
      const denunciasResult = await denunciasService.obtenerDenuncias()
      if (denunciasResult.success && denunciasResult.data) {
        denunciasResult.data.forEach((d) => {
          const denunciaObj = {
            id: `DENUNCIA-${d.id}`,
            moduloOrigen: 'Denuncias',
            tipo: `Denuncia: ${d.tipo}`,
            solicitante: d.municipio || 'N/A',
            cedulaRif: d.id,
            estado: d.estado,
            estadoLabel: getEstadoDenunciaLabel(d.estado),
            fecha: d.fecha,
            denunciaId: d.id,
            denunciaData: d,
            acciones: getAccionesDenuncia(d.estado),
          }
          if (['asignada'].includes(d.estado)) {
            tareasAgregadas.push(denunciaObj)
          } else {
            bitacoraAgregada.push(denunciaObj)
          }
        })
      }

      // 2. Solicitudes de activos pendientes via solicitudActivosService
      const solActivosRes = await solicitudActivosService.obtenerSolicitudes()
      if (solActivosRes.success) {
        solActivosRes.data.forEach((s) => {
          const solObj = {
            id: `SOL-${s.id}`,
            moduloOrigen: 'SolicitudActivos',
            tipo: `Solicitud de Activo: ${s.activoNombre}`,
            solicitante: s.cuadrillaNombre || s.cuadrillaId || 'Sin cuadrilla',
            cedulaRif: s.activoCodigo || 'N/A',
            estado: s.estado,
            estadoLabel: s.estado,
            fecha: s.fechaSolicitud,
            solicitudId: s.id,
            solicitudData: s,
            acciones: ['aprobar', 'rechazar', 'ver'],
          }
          if (s.estado === 'Pendiente') {
            tareasAgregadas.push(solObj)
          } else {
            bitacoraAgregada.push(solObj)
          }
        })
      }

      // 3. Solicitudes RRHH via integracionService
      if (typeof integracionService.obtenerTodasLasSolicitudesRRHH === 'function') {
        try {
          const rrhhResult = await integracionService.obtenerTodasLasSolicitudesRRHH()
          if (rrhhResult.success && rrhhResult.data) {
            rrhhResult.data.forEach((s) => {
              const rrhhObj = {
                id: `RRHH-${s.id}`,
                moduloOrigen: 'RRHH',
                tipo: `Solicitud RRHH: ${s.tipo}`,
                solicitante: s.empleado || 'Empleado',
                cedulaRif: s.departamento || 'N/A',
                estado: s.estado,
                estadoLabel: s.estado,
                fecha: s.fecha,
                solicitudRRHHId: s.id,
                solicitudRRHHData: s,
                acciones: ['aprobar_rrhh', 'rechazar_rrhh', 'revision_rrhh', 'ver'],
              }
              if (s.estado === 'Pendiente' || s.estado === 'En revisión') {
                tareasAgregadas.push(rrhhObj)
              } else {
                bitacoraAgregada.push(rrhhObj)
              }
            })
          } else if (!rrhhResult.success) {
            errores.push('Solicitudes RRHH: ' + (rrhhResult.error || 'Error desconocido'))
          }
        } catch (e) {
          errores.push('Solicitudes RRHH: ' + (e.message || 'Error de red'))
        }
      }

      // 4. Solicitudes de plaza via estructuraOrgService
      try {
        const plazasResult = await estructuraOrgService.obtenerSolicitudesPlaza() // Fetch ALL
        if (plazasResult.success && plazasResult.data) {
          plazasResult.data.forEach((s) => {
            const plazaObj = {
              id: `PLZASOL-${s.id}`,
              moduloOrigen: 'EstructuraOrg',
              tipo: `Solicitud de Plaza: ${s.cargo}`,
              solicitante: s.departamento || 'Estructura Org',
              cedulaRif: s.codigo || 'N/A',
              estado: s.estado,
              estadoLabel: s.estado,
              fecha: s.fechaSolicitud,
              solicitudPlazaId: s.id,
              solicitudPlazaData: s,
              acciones: ['aprobar_plaza', 'rechazar_plaza', 'ver_plaza'],
            }
            if (s.estado === 'Pendiente') {
              tareasAgregadas.push(plazaObj)
            } else {
              bitacoraAgregada.push(plazaObj)
            }
          })
        } else if (!plazasResult.success) {
          errores.push('Estructura Org: ' + (plazasResult.error || 'Error desconocido'))
        }
      } catch (e) {
        errores.push('Estructura Org: ' + (e.message || 'Error de red'))
      }

      tareasAgregadas.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
      bitacoraAgregada.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))

      setTareas(tareasAgregadas)
      setBitacoraGlobal(bitacoraAgregada)
      if (errores.length > 0) {
        setError(errores)
        console.warn('[Bandeja] Errores al cargar módulos:', errores)
      }
    } catch (err) {
      console.error('Error cargando bandeja:', err)
      setError([err.message || 'Error desconocido al cargar la bandeja'])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarTareas()
  }, [cargarTareas])

  const refreshBandeja = useCallback(() => {
    cargarTareas()
  }, [cargarTareas])

  const getTareasPendientes = useCallback(() => {
    return tareas.length
  }, [tareas])

  return {
    tareas,
    bitacoraGlobal,
    loading,
    error,
    refreshBandeja,
    getTareasPendientes,
  }
}

function getEstadoTramiteLabel(estado) {
  const labels = {
    REVISION: 'En Revisión',
    INSPECCION: 'En Inspección',
    DOCUMENTO_GENERADO: 'Doc. Generado',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
  }
  return labels[estado] || estado
}

function getAccionesTramite(estado) {
  switch (estado) {
    case 'REVISION':
      return ['asignar_inspector', 'ver']
    case 'INSPECCION':
      return ['generar_pdf', 'ver']
    case 'DOCUMENTO_GENERADO':
      return ['registrar_firma', 'ver']
    default:
      return ['ver']
  }
}

function getEstadoDenunciaLabel(estado) {
  const labels = {
    pendiente: 'Pendiente',
    investigando: 'Investigando',
    asignada: 'Asignada',
    en_proceso: 'En Proceso',
    resuelta: 'Resuelta',
  }
  return labels[estado] || estado
}

function getAccionesDenuncia(estado) {
  switch (estado) {
    case 'asignada':
      return ['aprobar_denuncia', 'rechazar_denuncia', 'ver']
    default:
      return ['ver']
  }
}

export default useBandejaAdministrativa
