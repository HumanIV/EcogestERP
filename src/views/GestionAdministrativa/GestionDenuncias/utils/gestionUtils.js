// gestion-denuncias/utils/gestionUtils.js
// Función para generar ID de denuncia
export const generarIdDenuncia = (count) => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const sequential = (count + 1).toString().padStart(5, '0');
  return `DEN-${year}${month}-${sequential}`;
};

// Formatear fecha - ¡ESTA ES LA QUE FALTA!
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

// Obtener texto del tipo de denuncia - ¡ESTA ES LA OTRA QUE FALTA!
export const getTipoLabel = (tipo) => {
  const tipos = {
    deforestacion: 'Deforestación',
    contaminacion_agua: 'Contaminación Agua',
    contaminacion_aire: 'Contaminación Aire',
    fauna_silvestre: 'Fauna Silvestre',
    residuos_solidos: 'Residuos Sólidos',
    mineria_ilegal: 'Minería Ilegal',
    urbanismo: 'Urbanismo',
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

// AGREGA ESTAS FUNCIONES ADICIONALES QUE SE USAN EN OTROS ARCHIVOS:

// Función para calcular estadísticas de gestión
export const calcularEstadisticasGestion = (denuncias) => {
  const total = denuncias.length;
  
  const estados = {
    pendiente: denuncias.filter(d => d.estado === 'pendiente').length,
    investigando: denuncias.filter(d => d.estado === 'investigando').length,
    asignada: denuncias.filter(d => d.estado === 'asignada').length,
    en_proceso: denuncias.filter(d => d.estado === 'en_proceso').length,
    resuelta: denuncias.filter(d => d.estado === 'resuelta').length
  };

  const prioridades = {
    alta: denuncias.filter(d => d.prioridad === 'alta').length,
    media: denuncias.filter(d => d.prioridad === 'media').length,
    baja: denuncias.filter(d => d.prioridad === 'baja').length
  };

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const denunciasEsteMes = denuncias.filter(d => 
    new Date(d.fecha) >= inicioMes
  );

  const zonasActivas = Object.entries(
    denuncias.reduce((acc, d) => {
      const zona = `${d.municipio}, ${d.estadoUbicacion}`;
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {})
  )
  .filter(([_, count]) => count >= 3)
  .length;

  const denunciasResueltas = denuncias.filter(d => d.estado === 'resuelta' && d.fechaResolucion);
  const tiempoPromedioResolucion = denunciasResueltas.length > 0
    ? denunciasResueltas.reduce((sum, d) => {
        const inicio = new Date(d.fecha);
        const fin = new Date(d.fechaResolucion);
        return sum + (fin - inicio);
      }, 0) / denunciasResueltas.length / (1000 * 60 * 60 * 24)
    : 0;

  return {
    total,
    ...estados,
    ...prioridades,
    denunciasEsteMes: denunciasEsteMes.length,
    zonasActivas,
    tiempoPromedioResolucion: Math.round(tiempoPromedioResolucion),
    altaPrioridad: prioridades.alta
  };
};

// Filtrar denuncias para gestión
export const filtrarDenunciasGestion = (denuncias, filtros) => {
  let resultado = [...denuncias];

  if (filtros.estado && filtros.estado !== 'todas') {
    resultado = resultado.filter(d => d.estado === filtros.estado);
  }

  if (filtros.tipo && filtros.tipo !== 'todos') {
    resultado = resultado.filter(d => d.tipo === filtros.tipo);
  }

  if (filtros.prioridad && filtros.prioridad !== 'todas') {
    resultado = resultado.filter(d => d.prioridad === filtros.prioridad);
  }

  if (filtros.estadoUbicacion) {
    resultado = resultado.filter(d => 
      d.estadoUbicacion.toLowerCase().includes(filtros.estadoUbicacion.toLowerCase())
    );
  }

  if (filtros.municipio) {
    resultado = resultado.filter(d => 
      d.municipio.toLowerCase().includes(filtros.municipio.toLowerCase())
    );
  }

  if (filtros.fechaDesde) {
    resultado = resultado.filter(d => 
      new Date(d.fecha) >= new Date(filtros.fechaDesde)
    );
  }

  if (filtros.fechaHasta) {
    resultado = resultado.filter(d => 
      new Date(d.fecha) <= new Date(filtros.fechaHasta)
    );
  }

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase();
    resultado = resultado.filter(d => 
      d.titulo.toLowerCase().includes(busqueda) ||
      d.descripcion.toLowerCase().includes(busqueda) ||
      d.id.toLowerCase().includes(busqueda)
    );
  }

  return resultado;
};

// Función para obtener denuncias para cuadrilla
export const obtenerDenunciasParaCuadrilla = (denuncias, cuadrillaId) => {
  return denuncias.filter(d => 
    d.cuadrillaId === cuadrillaId || 
    (d.estado === 'asignada' && !d.cuadrillaId)
  );
};
