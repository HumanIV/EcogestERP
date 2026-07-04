// Función para generar ID de denuncia
export const generarIdDenuncia = (count) => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const sequential = (count + 1).toString().padStart(5, '0');
  return `DEN-${year}${month}-${sequential}`;
};

// Formatear fecha
export const formatearFecha = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Calcular estadísticas
export const calcularEstadisticas = (denuncias) => {
  const total = denuncias.length;
  const pendientes = denuncias.filter(d => d.estado === 'pendiente').length;
  const investigando = denuncias.filter(d => d.estado === 'investigando').length;
  const resueltas = denuncias.filter(d => d.estado === 'resuelta').length;
  
  return { total, pendientes, investigando, resueltas };
};

// Filtrar denuncias
export const filtrarDenuncias = (denuncias, filtro) => {
  if (filtro === 'todas' || !filtro) return denuncias;
  return denuncias.filter(d => d.estado === filtro);
};

// Obtener texto del tipo de denuncia
export const getTipoLabel = (tipo) => {
  const tipos = {
    deforestacion: 'Deforestación',
    contaminacion_agua: 'Contaminación Agua',
    contaminacion_aire: 'Contaminación Aire',
    fauna_silvestre: 'Fauna Silvestre',
    flora_protegida: 'Flora Protegida',
    residuos_solidos: 'Residuos Sólidos',
    mineria_ilegal: 'Minería Ilegal',
    urbanismo_irregular: 'Urbanismo Irregular',
    otros: 'Otros'
  };
  return tipos[tipo] || tipo;
};

// Validar formulario
export const validarFormulario = (form) => {
  const errors = {};
  
  if (!form.titulo?.trim()) errors.titulo = 'El título es obligatorio';
  if (!form.tipo) errors.tipo = 'Seleccione el tipo de denuncia';
  if (!form.descripcion?.trim()) errors.descripcion = 'La descripción es obligatoria';
  if (form.descripcion?.length < 50) errors.descripcion = 'Mínimo 50 caracteres';
  if (!form.estadoUbicacion) errors.estadoUbicacion = 'Seleccione el estado';
  if (!form.municipio?.trim()) errors.municipio = 'El municipio es obligatorio';
  if (!form.origen) errors.origen = 'Seleccione el origen';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};