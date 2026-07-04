import { useState, useEffect, useCallback } from 'react';
import { denunciasService } from '../services/denunciasService';
import { 
  generarMapaCalor, 
  obtenerZonasCalientes, 
  obtenerCentroMapa, 
  calcularZoomOptimo,
  obtenerEstadisticasGeograficas 
} from '../utils/mapaUtils';

const useMapaCalor = (filtros = {}) => {
  const [denuncias, setDenuncias] = useState([]);
  const [datosCalor, setDatosCalor] = useState([]);
  const [zonasCalientes, setZonasCalientes] = useState([]);
  const [centroMapa, setCentroMapa] = useState([8.0000, -66.0000]);
  const [zoomOptimo, setZoomOptimo] = useState(6);
  const [estadisticasGeograficas, setEstadisticasGeograficas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoVisualizacion, setTipoVisualizacion] = useState('calor'); // 'calor' o 'marcadores'

  const cargarDatosMapa = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener denuncias con filtros
      const respuesta = await denunciasService.obtenerDenuncias(filtros);
      
      if (!respuesta.success) {
        throw new Error(respuesta.error);
      }
      
      const denunciasFiltradas = respuesta.data;
      setDenuncias(denunciasFiltradas);
      
      // Calcular datos para el mapa
      if (tipoVisualizacion === 'calor') {
        const datos = generarMapaCalor(denunciasFiltradas);
        setDatosCalor(datos);
      }
      
      const zonas = obtenerZonasCalientes(denunciasFiltradas);
      const centro = obtenerCentroMapa(denunciasFiltradas);
      const zoom = calcularZoomOptimo(denunciasFiltradas);
      const statsGeo = obtenerEstadisticasGeograficas(denunciasFiltradas);
      
      setZonasCalientes(zonas);
      setCentroMapa(centro);
      setZoomOptimo(zoom);
      setEstadisticasGeograficas(statsGeo);
      
    } catch (err) {
      setError(err.message || 'Error cargando datos del mapa');
      console.error('Error en useMapaCalor:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filtros), tipoVisualizacion]);

  // Cambiar tipo de visualización
  const cambiarVisualizacion = useCallback((nuevoTipo) => {
    setTipoVisualizacion(nuevoTipo);
  }, []);

  // Filtrar denuncias por zona
  const filtrarPorZona = useCallback((zonaId) => {
    const zona = zonasCalientes.find(z => z.id === zonaId);
    if (!zona) return denuncias;
    
    return denuncias.filter(d => 
      zona.denuncias.some(zd => zd.id === d.id)
    );
  }, [denuncias, zonasCalientes]);

  // Obtener denuncias por tipo en una zona específica
  const getDenunciasPorTipoEnZona = useCallback((zonaId, tipo) => {
    const zona = zonasCalientes.find(z => z.id === zonaId);
    if (!zona) return [];
    
    return zona.denuncias.filter(d => d.tipo === tipo);
  }, [zonasCalientes]);

  // Generar reporte geográfico
  const generarReporteGeografico = useCallback(async () => {
    try {
      const reporte = {
        metadata: {
          titulo: 'Reporte Geográfico de Denuncias',
          fechaGeneracion: new Date().toISOString(),
          filtrosAplicados: filtros,
          tipoVisualizacion,
          totalDenuncias: denuncias.length
        },
        centroMapa,
        zoomOptimo,
        zonasCalientes,
        estadisticasGeograficas,
        distribucionPorEstado: estadisticasGeograficas.topEstados,
        distribucionPorMunicipio: estadisticasGeograficas.topMunicipios,
        recomendaciones: generarRecomendacionesGeograficas(zonasCalientes)
      };
      
      // Crear archivo para descargar
      const dataStr = JSON.stringify(reporte, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `reporte-geografico-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (err) {
      console.error('Error generando reporte geográfico:', err);
      return false;
    }
  }, [denuncias, centroMapa, zoomOptimo, zonasCalientes, estadisticasGeograficas, filtros, tipoVisualizacion]);

  // Función para generar recomendaciones basadas en zonas calientes
  const generarRecomendacionesGeograficas = useCallback((zonas) => {
    const recomendaciones = [];
    
    if (zonas.length === 0) {
      return ['No se detectaron zonas críticas.'];
    }
    
    // Zona con más denuncias
    const zonaMasCritica = zonas[0];
    if (zonaMasCritica.cantidad > 10) {
      recomendaciones.push(
        `Reforzar presencia en ${zonaMasCritica.municipio}, ${zonaMasCritica.estado} (${zonaMasCritica.cantidad} denuncias)`
      );
    }
    
    // Tipos de denuncia predominantes
    const tiposPorZona = zonas.reduce((acc, zona) => {
      zona.denuncias.forEach(d => {
        if (!acc[d.tipo]) {
          acc[d.tipo] = 0;
        }
        acc[d.tipo]++;
      });
      return acc;
    }, {});
    
    const tipoMasComun = Object.entries(tiposPorZona).sort((a, b) => b[1] - a[1])[0];
    if (tipoMasComun) {
      recomendaciones.push(
        `Enfocar recursos en denuncias de tipo: ${tipoMasComun[0]} (${tipoMasComun[1]} casos)`
      );
    }
    
    // Zonas con denuncias antiguas no resueltas
    const zonasConDenunciasAntiguas = zonas.filter(zona => {
      const denunciasAntiguas = zona.denuncias.filter(d => {
        const fecha = new Date(d.fecha);
        const ahora = new Date();
        const dias = (ahora - fecha) / (1000 * 60 * 60 * 24);
        return dias > 60 && d.estado !== 'resuelta';
      });
      return denunciasAntiguas.length > 0;
    });
    
    if (zonasConDenunciasAntiguas.length > 0) {
      recomendaciones.push(
        `Revisar ${zonasConDenunciasAntiguas.length} zonas con denuncias antiguas no resueltas`
      );
    }
    
    return recomendaciones.length > 0 
      ? recomendaciones 
      : ['Distribución geográfica equilibrada. Mantener monitoreo regular.'];
  }, []);

  useEffect(() => {
    cargarDatosMapa();
  }, [cargarDatosMapa]);

  return {
    // Datos del mapa
    denuncias,
    datosCalor,
    zonasCalientes,
    centroMapa,
    zoomOptimo,
    estadisticasGeograficas,
    
    // Configuración
    tipoVisualizacion,
    
    // Estado
    loading,
    error,
    
    // Acciones
    cambiarVisualizacion,
    filtrarPorZona,
    getDenunciasPorTipoEnZona,
    generarReporteGeografico,
    recargar: cargarDatosMapa,
    
    // Métodos de conveniencia
    getZonaMasCaliente: () => zonasCalientes[0] || null,
    getTotalZonasActivas: () => zonasCalientes.length,
    getDenunciasConCoordenadas: () => denuncias.filter(d => d.latitud && d.longitud),
    
    // Configuración para Leaflet
    getMapConfig: () => ({
      center: centroMapa,
      zoom: zoomOptimo,
      maxZoom: 19,
      minZoom: 5
    }),
    
    // Configuración para heatmap
    getHeatmapConfig: () => ({
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    })
  };
};

export default useMapaCalor;