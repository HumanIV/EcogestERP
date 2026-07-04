import { useState, useEffect, useMemo } from 'react'
import empleadoService from '../../../RRHH/Empleados/services/empleadoService'

const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)

  const cargarEmpleados = async () => {
    try {
      const res = await empleadoService.obtenerActivos()
      if (res.success) {
        setEmpleados(res.data)
      } else {
        setEmpleados([])
      }
    } catch (e) {
      console.error('Error cargando empleados:', e)
      setEmpleados([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEmpleados()
  }, [])

  const getEmpleadosActivos = () => empleados

  const getEmpleadoById = (id) => empleados.find((e) => e.id === id || e.id === parseInt(id))

  const getEmpleadosByNombre = (nombre) =>
    empleados.filter((e) => e.nombre?.toLowerCase().includes(nombre.toLowerCase()))

  const getSupervisores = useMemo(() => {
    const cargosSupervisor = [
      'supervisor', 'jefe de cuadrilla', 'jefe', 'coordinador',
      'encargado', 'lider', 'supervisor de campo', 'coordinador de grupo',
    ]
    return empleados.filter((e) => {
      const cargo = (e.cargo || '').toLowerCase()
      return cargosSupervisor.some((c) => cargo.includes(c))
    })
  }, [empleados])

  const getObreros = useMemo(() => {
    const cargosObrero = [
      'obrero', 'operario', 'tecnico', 'técnico', 'auxiliar',
      'operador', 'trabajador', 'empleado', 'asistente de campo',
    ]
    return empleados.filter((e) => {
      const cargo = (e.cargo || '').toLowerCase()
      return cargosObrero.some((c) => cargo.includes(c))
    })
  }, [empleados])

  const getAllEmpleadosPorCargo = useMemo(() => ({
    supervisores: getSupervisores,
    obreros: getObreros,
    otros: empleados.filter((e) => {
      const isSupervisor = getSupervisores.some((s) => s.id === e.id)
      const isObrero = getObreros.some((o) => o.id === e.id)
      return !isSupervisor && !isObrero
    }),
  }), [empleados, getSupervisores, getObreros])

  return {
    empleados,
    loading,
    cargarEmpleados,
    getEmpleadosActivos,
    getEmpleadoById,
    getEmpleadosByNombre,
    getSupervisores,
    getObreros,
    getAllEmpleadosPorCargo,
  }
}

export default useEmpleados
