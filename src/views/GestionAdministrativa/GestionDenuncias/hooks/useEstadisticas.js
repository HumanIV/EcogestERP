import { useState, useEffect, useCallback } from 'react';
import { denunciasService } from '../services/denunciasService';
import { analizarTendenciasTemporales, analizarPorTipo, analizarTiemposRespuesta, generarDatosGraficos } from '../utils/analiticasUtils';

const useEstadisticas = (filtros = {}) => {
  const [estadisticas, setEstadisticas] = useState({});
  const [tendencias, setTendencias] = useState({});
  const [analisisTipos, setAnalisisTipos] = useState({});
  const [tiemposRespuesta, setTiemposRespuesta] = useState({});
  const [datosGraficos, setDatosGraficos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener denuncias con filtros
      const respuesta = await denunciasService.obtenerDenuncias(filtros);
      
      if (!respuesta.success) {
        throw new Error(respuesta.error);
      }
      
      const denuncias = respuesta.data;
      
      // Calcular diferentes tipos de análisis
      const stats = await denunciasService.obtenerEstadisticas(filtros);
      const tendenciasTemp = analizarTendenciasTemporales(denuncias);
      const analisisTipo = analizarPorTipo(denuncias);
      const tiempos = analizarTiemposRespuesta(denuncias);
      const graficos = generarDatosGraficos(denuncias);
      
      setEstadisticas(stats.data);
      setTendencias(tendenciasTemp);
      setAnalisisTipos(analisisTipo);
      setTiemposRespuesta(tiempos);
      setDatosGraficos(graficos);
      
    } catch (err) {
      setError(err.message || 'Error cargando estadísticas');
      console.error('Error en useEstadisticas:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filtros)]);

  // Función para actualizar estadísticas específicas
  const actualizarEstadisticas = useCallback(async (nuevosDatos) => {
    try {
      // Aquí podrías implementar actualizaciones específicas
      // Por ahora, simplemente recargamos todo
      await cargarEstadisticas();
      return true;
    } catch (err) {
      console.error('Error actualizando estadísticas:', err);
      return false;
    }
  }, [cargarEstadisticas]);

  // Función para exportar estadísticas
  const exportarEstadisticas = useCallback(async () => {
    try {
      const reporte = {
        metadata: {
          titulo: 'Reporte Estadístico de Denuncias',
          fechaGeneracion: new Date().toISOString(),
          filtrosAplicados: filtros
        },
        estadisticas,
        tendencias,
        analisisTipos,
        tiemposRespuesta,
        datosGraficos
      };
      
      // Crear archivo JSON para descargar
      const dataStr = JSON.stringify(reporte, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `estadisticas-denuncias-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (err) {
      console.error('Error exportando estadísticas:', err);
      return false;
    }
  }, [estadisticas, tendencias, analisisTipos, tiemposRespuesta, datosGraficos, filtros]);

  useEffect(() => {
    cargarEstadisticas();
    
    // Opcional: actualizar cada 5 minutos
    const intervalo = setInterval(() => {
      cargarEstadisticas();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalo);
  }, [cargarEstadisticas]);

  return {
    // Datos
    estadisticas,
    tendencias,
    analisisTipos,
    tiemposRespuesta,
    datosGraficos,
    
    // Estado
    loading,
    error,
    
    // Acciones
    actualizarEstadisticas,
    exportarEstadisticas,
    recargar: cargarEstadisticas,
    
    // Métodos de conveniencia
    getKPIs: () => ({
      totalDenuncias: estadisticas.total || 0,
      denunciasPendientes: estadisticas.pendiente || 0,
      denunciasResueltas: estadisticas.resuelta || 0,
      eficiencia: tiemposRespuesta.eficiencia || 0,
      crecimiento: tendencias.crecimientoPromedio || 0
    }),
    
    getAlertas: () => {
      const alertas = [];
      
      // Alertas basadas en umbrales
      if (estadisticas.pendiente > 50) {
        alertas.push({
          tipo: 'advertencia',
          mensaje: `Hay ${estadisticas.pendiente} denuncias pendientes`,
          prioridad: 'alta'
        });
      }
      
      if (tiemposRespuesta.promedio > 30) {
        alertas.push({
          tipo: 'critica',
          mensaje: `Tiempo promedio de respuesta: ${tiemposRespuesta.promedio} días`,
          prioridad: 'alta'
        });
      }
      
      if (tendencias.crecimientoPromedio > 20) {
        alertas.push({
          tipo: 'informacion',
          mensaje: `Crecimiento mensual del ${tendencias.crecimientoPromedio?.toFixed(1)}%`,
          prioridad: 'media'
        });
      }
      
      return alertas;
    }
  };
};

export default useEstadisticas;