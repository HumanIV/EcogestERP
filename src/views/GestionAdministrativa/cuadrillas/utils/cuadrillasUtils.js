import { ESTADOS_CUADRILLA, MODULOS_ORIGEN } from '../constants/cuadrillasConstants';

export const getEstadoColor = (estado) => {
  const found = ESTADOS_CUADRILLA.find(e => e.value === estado);
  return found ? found.color : 'secondary';
};

export const getEstadoLabel = (estado) => {
  const found = ESTADOS_CUADRILLA.find(e => e.value === estado);
  return found ? found.label : estado;
};

export const getModuloOrigenInfo = (moduloOrigen) => {
  return MODULOS_ORIGEN[moduloOrigen] || { label: moduloOrigen, color: 'secondary', icon: 'cilInfo' };
};

export const calcularPorcentajeCarga = (cuadrilla) => {
  if (!cuadrilla.capacidad || cuadrilla.capacidad === 0) return 0;
  const tareasActuales = cuadrilla.tareasActuales?.length || 0;
  return Math.min(Math.round((tareasActuales / cuadrilla.capacidad) * 100), 100);
};

export const getCargaColor = (porcentaje) => {
  if (porcentaje >= 90) return 'danger';
  if (porcentaje >= 60) return 'warning';
  return 'success';
};

export const formatResponsables = (responsables) => {
  if (!responsables) return '';
  if (Array.isArray(responsables)) return responsables.join(', ');
  return responsables;
};

export const parseResponsables = (responsablesStr) => {
  if (!responsablesStr) return [];
  if (Array.isArray(responsablesStr)) return responsablesStr;
  return responsablesStr.split(',').map(s => s.trim()).filter(Boolean);
};

export const exportarCuadrillasCSV = (cuadrillas) => {
  const headers = ['ID', 'Nombre', 'Zona', 'Responsables', 'Capacidad', 'Estado', 'Especialidades', 'Teléfono'];
  const rows = cuadrillas.map(c => [
    c.id,
    c.nombre,
    c.zona,
    formatResponsables(c.responsables),
    c.capacidad,
    c.estado,
    Array.isArray(c.especialidad) ? c.especialidad.join(', ') : c.especialidad,
    c.telefono || '',
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `cuadrillas_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
