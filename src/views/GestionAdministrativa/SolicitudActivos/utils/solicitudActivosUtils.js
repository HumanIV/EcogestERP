export const getBadgeColor = (estado) => {
  switch (estado) {
    case 'Aprobado': return 'success';
    case 'Rechazado': return 'danger';
    case 'Pendiente': return 'warning';
    default: return 'secondary';
  }
};

export const getOrigenColor = (origen) => {
  switch (origen) {
    case 'cuadrilla': return 'info';
    case 'inventario': return 'primary';
    default: return 'secondary';
  }
};

export const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A';
  try {
    const [fecha, hora] = fechaStr.split(' ');
    return { fecha, hora };
  } catch (e) {
    return { fecha: fechaStr, hora: '' };
  }
};
