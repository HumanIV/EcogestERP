import {
  cilLaptop,
  cilStorage
} from '@coreui/icons';

export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'En Uso': return 'success';
    case 'Disponible': return 'info';
    case 'En Mantenimiento': return 'warning';
    case 'Operativo': return 'success';
    case 'Dañado': return 'danger';
    case 'Obsoleto': return 'secondary';
    case 'Baja': return 'dark';
    default: return 'info';
  }
};

export const getCategoriaIcon = (categoria) => {
  switch (categoria) {
    case 'Tecnología': return cilLaptop;
    default: return cilStorage;
  }
};

export const getCategoriaIconComponent = (categoria) => {
  switch (categoria) {
    case 'Tecnología': return cilLaptop;
    case 'Vehículos': return cilLaptop;
    case 'Comunicaciones': return cilStorage;
    case 'Herramientas': return cilStorage;
    case 'Mobiliario': return cilStorage;
    case 'Equipos Especiales': return cilStorage;
    default: return cilStorage;
  }
};

export const getTipoMovimientoColor = (tipo) => {
  switch (tipo) {
    case 'Asignación': return 'success';
    case 'Baja': return 'danger';
    case 'Transferencia': return 'info';
    case 'Mantenimiento': return 'warning';
    case 'Reparación': return 'warning';
    default: return 'secondary';
  }
};

export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calcularPorcentajeUso = (activos) => {
  if (activos.length === 0) return 0;
  const enUso = activos.filter(a => a.estado === 'En Uso').length;
  return (enUso / activos.length) * 100;
};

export const getOcupacionColor = (ocupacion) => {
  if (ocupacion === 'N/A') return 'info';
  const val = parseInt(ocupacion);
  if (val > 80) return 'danger';
  if (val > 60) return 'warning';
  return 'success';
};

export const getPrioridadColor = (prioridad) => {
  switch (prioridad) {
    case 'alta': return 'danger';
    case 'media': return 'warning';
    case 'baja': return 'info';
    default: return 'secondary';
  }
};