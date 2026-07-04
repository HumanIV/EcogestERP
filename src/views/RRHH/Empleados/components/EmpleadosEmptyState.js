import React from 'react'
import RrhhEmptyState from '../../_shared/RrhhEmptyState'

const EmpleadosEmptyState = ({ onClearFilters, onCrear }) => {
  return (
    <RrhhEmptyState
      title="No se encontraron empleados"
      message="Intenta con otros filtros o crea un nuevo empleado"
      actionLabel="Nuevo Empleado"
      onAction={onCrear}
    />
  )
}

export default EmpleadosEmptyState
