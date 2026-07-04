// Utilidades para análisis y estadísticas avanzadas

// Análisis temporal de denuncias
export const analizarTendenciasTemporales = (denuncias) => {
  // Agrupar por mes
  const porMes = denuncias.reduce((acc, d) => {
    const fecha = new Date(d.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[mes]) {
      acc[mes] = {
        total: 0,
        porTipo: {},
        porPrioridad: { alta: 0, media: 0, baja: 0 },
        porEstado: { pendiente: 0, investigando: 0, asignada: 0, en_proceso: 0, resuelta: 0 }
      };
    }
    
    acc[mes].total++;
    acc[mes].porTipo[d.tipo] = (acc[mes].porTipo[d.tipo] || 0) + 1;
    acc[mes].porPrioridad[d.prioridad] = (acc[mes].porPrioridad[d.prioridad] || 0) + 1;
    acc[mes].porEstado[d.estado] = (acc[mes].porEstado[d.estado] || 0) + 1;
    
    return acc;
  }, {});

  // Convertir a array y ordenar por fecha
  const tendencias = Object.entries(porMes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, datos]) => ({
      mes,
      ...datos
    }));

  // Calcular crecimiento mensual
  const crecimiento = tendencias.slice(-12).map((mes, index, array) => {
    if (index === 0) return { ...mes, crecimiento: 0 };
    
    const mesAnterior = array[index - 1];
    const crecimiento = ((mes.total - mesAnterior.total) / mesAnterior.total) * 100;
    
    return {
      ...mes,
      crecimiento: Math.round(crecimiento * 10) / 10
    };
  });

  return {
    tendencias,
    crecimiento,
    ultimoMes: tendencias[tendencias.length - 1] || null,
    crecimientoPromedio: calcularCrecimientoPromedio(crecimiento)
  };
};

// Análisis por tipo de denuncia
export const analizarPorTipo = (denuncias) => {
  const porTipo = denuncias.reduce((acc, d) => {
    acc[d.tipo] = (acc[d.tipo] || 0) + 1;
    return acc;
  }, {});

  const total = denuncias.length;
  
  const analisis = Object.entries(porTipo).map(([tipo, cantidad]) => ({
    tipo,
    cantidad,
    porcentaje: (cantidad / total) * 100,
    tendencia: calcularTendenciaPorTipo(denuncias, tipo)
  })).sort((a, b) => b.cantidad - a.cantidad);

  return {
    totalTipos: Object.keys(porTipo).length,
    distribucion: analisis,
    tipoMasComun: analisis[0],
    tipoMenosComun: analisis[analisis.length - 1]
  };
};

// Análisis de tiempos de respuesta
export const analizarTiemposRespuesta = (denuncias) => {
  const denunciasResueltas = denuncias.filter(d => 
    d.estado === 'resuelta' && 
    d.fecha && 
    d.fechaResolucion
  );

  if (denunciasResueltas.length === 0) {
    return {
      promedio: 0,
      mediana: 0,
      minimo: 0,
      maximo: 0,
      eficiencia: 0
    };
  }

  const tiempos = denunciasResueltas.map(d => {
    const inicio = new Date(d.fecha);
    const fin = new Date(d.fechaResolucion);
    return (fin - inicio) / (1000 * 60 * 60 * 24); // Convertir a días
  });

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  const mediana = calcularMediana(tiempos);
  const minimo = Math.min(...tiempos);
  const maximo = Math.max(...tiempos);

  // Calcular eficiencia (0-100%, menor tiempo = mayor eficiencia)
  const eficiencia = Math.max(0, 100 - (promedio * 2));

  return {
    promedio: Math.round(promedio),
    mediana: Math.round(mediana),
    minimo: Math.round(minimo),
    maximo: Math.round(maximo),
    eficiencia: Math.round(eficiencia),
    totalAnalizadas: denunciasResueltas.length
  };
};

// Análisis de eficiencia por cuadrilla
export const analizarEficienciaCuadrillas = (denuncias) => {
  const denunciasAsignadas = denuncias.filter(d => 
    d.cuadrillaId && 
    d.estado === 'resuelta' &&
    d.fechaAsignacion &&
    d.fechaResolucion
  );

  const porCuadrilla = denunciasAsignadas.reduce((acc, d) => {
    if (!acc[d.cuadrillaId]) {
      acc[d.cuadrillaId] = {
        total: 0,
        tiempos: [],
        denuncias: []
      };
    }
    
    const tiempo = (new Date(d.fechaResolucion) - new Date(d.fechaAsignacion)) / (1000 * 60 * 60 * 24);
    
    acc[d.cuadrillaId].total++;
    acc[d.cuadrillaId].tiempos.push(tiempo);
    acc[d.cuadrillaId].denuncias.push(d);
    
    return acc;
  }, {});

  const analisis = Object.entries(porCuadrilla).map(([cuadrillaId, datos]) => {
    const promedio = datos.tiempos.reduce((a, b) => a + b, 0) / datos.tiempos.length;
    const eficiencia = Math.max(0, 100 - (promedio * 3));
    
    return {
      cuadrillaId,
      totalDenuncias: datos.total,
      tiempoPromedio: Math.round(promedio),
      eficiencia: Math.round(eficiencia),
      denuncias: datos.denuncias
    };
  }).sort((a, b) => b.eficiencia - a.eficiencia);

  return {
    totalCuadrillas: analisis.length,
    cuadrillas: analisis,
    cuadrillaMasEficiente: analisis[0],
    cuadrillaMenosEficiente: analisis[analisis.length - 1],
    eficienciaGeneral: analisis.reduce((sum, c) => sum + c.eficiencia, 0) / analisis.length
  };
};

// Predicción de tendencias futuras
export const predecirTendencias = (denuncias, meses = 3) => {
  const tendencias = analizarTendenciasTemporales(denuncias);
  
  if (tendencias.tendencias.length < 3) {
    return {
      prediccion: 'Datos insuficientes para predicción',
      confianza: 0
    };
  }

  const ultimosMeses = tendencias.tendencias.slice(-6);
  const crecimientoPromedio = tendencias.crecimientoPromedio;
  const ultimoTotal = ultimosMeses[ultimosMeses.length - 1].total;

  const predicciones = [];
  for (let i = 1; i <= meses; i++) {
    const crecimientoEsperado = crecimientoPromedio * i;
    const prediccion = Math.round(ultimoTotal * (1 + crecimientoEsperado / 100));
    
    predicciones.push({
      mes: `M+${i}`,
      prediccion,
      crecimientoEsperado: Math.round(crecimientoEsperado)
    });
  }

  return {
    predicciones,
    confianza: calcularConfianzaPrediccion(tendencias.tendencias),
    recomendaciones: generarRecomendaciones(predicciones)
  };
};

// Funciones auxiliares
const calcularCrecimientoPromedio = (crecimiento) => {
  if (crecimiento.length < 2) return 0;
  
  const crecimientosValidos = crecimiento
    .slice(1) // Excluir el primer mes (crecimiento 0)
    .map(c => c.crecimiento)
    .filter(c => !isNaN(c) && isFinite(c));
  
  if (crecimientosValidos.length === 0) return 0;
  
  return crecimientosValidos.reduce((a, b) => a + b, 0) / crecimientosValidos.length;
};

const calcularTendenciaPorTipo = (denuncias, tipo) => {
  // Agrupar por mes y tipo
  const porMes = denuncias.reduce((acc, d) => {
    if (d.tipo !== tipo) return acc;
    
    const fecha = new Date(d.fecha);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  const meses = Object.keys(porMes).sort();
  if (meses.length < 2) return 'estable';

  const valores = meses.map(mes => porMes[mes]);
  const ultimo = valores[valores.length - 1];
  const penultimo = valores[valores.length - 2];
  const cambio = ((ultimo - penultimo) / penultimo) * 100;

  if (cambio > 20) return 'ascendente';
  if (cambio < -20) return 'descendente';
  return 'estable';
};

const calcularMediana = (numeros) => {
  const sorted = [...numeros].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

const calcularConfianzaPrediccion = (tendencias) => {
  if (tendencias.length < 6) return 50;
  
  // Calcular variabilidad de los datos
  const valores = tendencias.map(t => t.total);
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
  const desviacion = Math.sqrt(varianza);
  const coeficienteVariacion = (desviacion / promedio) * 100;
  
  // Menor variación = mayor confianza
  const confianza = Math.max(50, 100 - coeficienteVariacion);
  return Math.round(confianza);
};

const generarRecomendaciones = (predicciones) => {
  const crecimientoFinal = predicciones[predicciones.length - 1].crecimientoEsperado;
  
  if (crecimientoFinal > 20) {
    return [
      'Aumentar personal de revisión',
      'Implementar campañas preventivas',
      'Reforzar cuadrillas en zonas críticas'
    ];
  } else if (crecimientoFinal > 10) {
    return [
      'Mantener personal actual',
      'Monitorear zonas de crecimiento',
      'Optimizar procesos de atención'
    ];
  } else if (crecimientoFinal < -10) {
    return [
      'Evaluar eficiencia de campañas',
      'Reasignar recursos a otras áreas',
      'Analizar causas de disminución'
    ];
  }
  
  return [
    'Mantener estrategias actuales',
    'Continuar monitoreo regular',
    'Mejorar procesos existentes'
  ];
};

// Exportar datos para gráficos
export const generarDatosGraficos = (denuncias) => {
  const tendencias = analizarTendenciasTemporales(denuncias);
  const porTipo = analizarPorTipo(denuncias);
  const tiempos = analizarTiemposRespuesta(denuncias);

  return {
    lineChart: {
      labels: tendencias.tendencias.slice(-12).map(t => t.mes),
      datasets: [
        {
          label: 'Denuncias por mes',
          data: tendencias.tendencias.slice(-12).map(t => t.total),
          borderColor: '#1a5c36',
          backgroundColor: 'rgba(26, 92, 54, 0.1)',
          tension: 0.4
        }
      ]
    },
    barChart: {
      labels: porTipo.distribucion.slice(0, 5).map(d => d.tipo),
      datasets: [
        {
          label: 'Denuncias por tipo',
          data: porTipo.distribucion.slice(0, 5).map(d => d.cantidad),
          backgroundColor: [
            '#1a5c36',
            '#28a745',
            '#20c997',
            '#17a2b8',
            '#6c757d'
          ]
        }
      ]
    },
    pieChart: {
      labels: ['Pendientes', 'Investigando', 'Asignadas', 'En Proceso', 'Resueltas'],
      datasets: [
        {
          data: [
            denuncias.filter(d => d.estado === 'pendiente').length,
            denuncias.filter(d => d.estado === 'investigando').length,
            denuncias.filter(d => d.estado === 'asignada').length,
            denuncias.filter(d => d.estado === 'en_proceso').length,
            denuncias.filter(d => d.estado === 'resuelta').length
          ],
          backgroundColor: [
            '#ffc107',
            '#17a2b8',
            '#007bff',
            '#6610f2',
            '#28a745'
          ]
        }
      ]
    }
  };
};