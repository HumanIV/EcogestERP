import React, { useState, useEffect } from 'react'
import { CContainer } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople } from '@coreui/icons'
import empleadoService from './Empleados/services/empleadoService'
import { solicitudService } from './Solicitudes/services/solicitudService'
import { cuadrillaService } from '../GestionAdministrativa/cuadrillas/services/cuadrillaService'
import PanelStats from './PanelRRHH/components/PanelStats'
import PanelChart from './PanelRRHH/components/PanelChart'
import PanelProcesos from './PanelRRHH/components/PanelProcesos'
import RrhhPageHeader from './_shared/RrhhPageHeader'

const PanelRRHH = () => {
  const [stats, setStats] = useState({})
  const [chartData, setChartData] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const empRes = await empleadoService.obtenerTodos()
      const solRes = await solicitudService.obtenerSolicitudes()
      const cuadRes = await cuadrillaService.obtenerCuadrillas()

      const empleadosData = empRes.success ? empRes.data : []
      const solicitudesData = solRes.success ? solRes.data : []
      const cuadrillasData = cuadRes.success ? cuadRes.data : []

      setEmpleados(empleadosData)
      setSolicitudes(solicitudesData)

      const ahora = new Date()
      const mesActual = ahora.getMonth()
      const anioActual = ahora.getFullYear()

      const activos = empleadosData.filter((e) => e.estado === 'Activo').length
      const pendientes = solicitudesData.filter((s) => s.estado === 'Pendiente').length
      const cuadrillasActivas = cuadrillasData.filter(
        (c) => c.estado === 'activa' || c.estado === 'Activa',
      ).length
      const solicitudesMes = solicitudesData.filter((s) => {
        const f = new Date(s.fechaSolicitud || s.fecha)
        return f.getMonth() === mesActual && f.getFullYear() === anioActual
      }).length

      setStats({
        empleadosActivos: activos,
        permisosPendientes: pendientes,
        cuadrillasActivas,
        solicitudesMes,
      })

      const meses = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ]
      const contratacionesPorMes = new Array(12).fill(0)
      const permisosPorMes = new Array(12).fill(0)

      empleadosData.forEach((e) => {
        if (e.fechaIngreso) {
          const f = new Date(e.fechaIngreso)
          if (f.getFullYear() === anioActual) contratacionesPorMes[f.getMonth()]++
        }
      })

      solicitudesData.forEach((s) => {
        const f = new Date(s.fechaSolicitud || s.fecha)
        if (f.getFullYear() === anioActual) permisosPorMes[f.getMonth()]++
      })

      const inicio = Math.max(0, mesActual - 4)
      setChartData({
        labels: meses.slice(inicio, mesActual + 1),
        datasets: [
          {
            label: 'Contrataciones',
            borderColor: 'var(--eco-600)',
            backgroundColor: 'rgba(67, 160, 71, 0.2)',
            data: contratacionesPorMes.slice(inicio, mesActual + 1),
            fill: true,
            tension: 0.4,
            borderWidth: 3,
          },
          {
            label: 'Solicitudes',
            borderColor: 'var(--accent-600)',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            data: permisosPorMes.slice(inicio, mesActual + 1),
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      })
    } catch (e) {
      console.error('Error loading PanelRRHH data:', e)
    }
    setLoading(false)
  }

  return (
    <CContainer fluid className="px-0 px-md-4 fade-in">
      <RrhhPageHeader
        icon={cilPeople}
        title="Panel de Recursos Humanos"
        subtitle="Gestión integral del talento humano"
        badge={stats.empleadosActivos}
      />

      <PanelStats stats={stats} />
      <PanelChart chartData={chartData} loading={loading} onRefresh={loadData} />
      <PanelProcesos solicitudes={solicitudes} empleados={empleados} />
    </CContainer>
  )
}

export default PanelRRHH
