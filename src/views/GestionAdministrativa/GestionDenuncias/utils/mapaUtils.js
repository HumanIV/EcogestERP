import L from 'leaflet';
import 'leaflet.heat';

// Función para generar datos de calor para el mapa
export const generarMapaCalor = (denuncias) => {
  // Filtrar denuncias con coordenadas válidas
  const denunciasConCoordenadas = denuncias.filter(d => 
    d.latitud && d.longitud && 
    !isNaN(parseFloat(d.latitud)) && 
    !isNaN(parseFloat(d.longitud))
  );

  // Convertir a formato de calor de Leaflet
  const datosCalor = denunciasConCoordenadas.map(d => [
    parseFloat(d.latitud),
    parseFloat(d.longitud),
    0.5 // Intensidad base
  ]);

  // Aumentar intensidad según prioridad
  return datosCalor.map(punto => {
    const denuncia = denunciasConCoordenadas.find(d => 
      parseFloat(d.latitud) === punto[0] && 
      parseFloat(d.longitud) === punto[1]
    );
    
    if (denuncia) {
      switch(denuncia.prioridad) {
        case 'alta': return [punto[0], punto[1], 1.0];
        case 'media': return [punto[0], punto[1], 0.7];
        case 'baja': return [punto[0], punto[1], 0.4];
        default: return [punto[0], punto[1], 0.5];
      }
    }
    return punto;
  });
};

// Función para obtener zonas calientes (clusters)
export const obtenerZonasCalientes = (denuncias, radioKm = 10) => {
  const zonas = [];
  
  denuncias.forEach(denuncia => {
    if (!denuncia.latitud || !denuncia.longitud) return;
    
    const lat = parseFloat(denuncia.latitud);
    const lng = parseFloat(denuncia.longitud);
    
    // Buscar si ya existe una zona cercana
    let zonaExistente = zonas.find(zona => {
      const distancia = calcularDistancia(
        lat, lng, 
        zona.centro.lat, zona.centro.lng
      );
      return distancia <= radioKm;
    });
    
    if (zonaExistente) {
      // Agregar a zona existente
      zonaExistente.denuncias.push(denuncia);
      zonaExistente.cantidad++;
      
      // Recalcular centro (promedio)
      const totalLat = zonaExistente.denuncias.reduce((sum, d) => sum + parseFloat(d.latitud), 0);
      const totalLng = zonaExistente.denuncias.reduce((sum, d) => sum + parseFloat(d.longitud), 0);
      zonaExistente.centro = {
        lat: totalLat / zonaExistente.cantidad,
        lng: totalLng / zonaExistente.cantidad
      };
    } else {
      // Crear nueva zona
      zonas.push({
        id: `zona-${zonas.length + 1}`,
        centro: { lat, lng },
        denuncias: [denuncia],
        cantidad: 1,
        municipio: denuncia.municipio,
        estado: denuncia.estadoUbicacion
      });
    }
  });
  
  // Ordenar por cantidad de denuncias
  return zonas
    .sort((a, b) => b.cantidad - a.cantidad)
    .map(zona => ({
      ...zona,
      zona: `${zona.municipio}, ${zona.estado}`,
      radio: Math.max(5, Math.min(20, zona.cantidad * 2)) // Radio basado en cantidad
    }));
};

// Calcular distancia entre dos puntos en km (fórmula de Haversine)
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Función para obtener el centro óptimo del mapa
export const obtenerCentroMapa = (denuncias) => {
  const denunciasConCoordenadas = denuncias.filter(d => d.latitud && d.longitud);
  
  if (denunciasConCoordenadas.length === 0) {
    return [8.0000, -66.0000]; // Centro de Venezuela
  }
  
  // Calcular promedio de coordenadas
  const totalLat = denunciasConCoordenadas.reduce((sum, d) => sum + parseFloat(d.latitud), 0);
  const totalLng = denunciasConCoordenadas.reduce((sum, d) => sum + parseFloat(d.longitud), 0);
  
  return [
    totalLat / denunciasConCoordenadas.length,
    totalLng / denunciasConCoordenadas.length
  ];
};

// Función para calcular el zoom óptimo
export const calcularZoomOptimo = (denuncias) => {
  if (denuncias.length === 0) return 6; // Zoom por defecto para Venezuela
  
  const denunciasConCoordenadas = denuncias.filter(d => d.latitud && d.longitud);
  
  if (denunciasConCoordenadas.length === 1) return 12;
  if (denunciasConCoordenadas.length <= 5) return 10;
  if (denunciasConCoordenadas.length <= 20) return 8;
  return 6;
};

// Función para generar marcadores personalizados
export const generarMarcadoresPersonalizados = (denuncias) => {
  return denuncias.map(denuncia => {
    if (!denuncia.latitud || !denuncia.longitud) return null;
    
    const icono = L.divIcon({
      className: 'custom-marker',
      html: generarHtmlMarker(denuncia),
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    
    return {
      position: [parseFloat(denuncia.latitud), parseFloat(denuncia.longitud)],
      icon: icono,
      denuncia: denuncia
    };
  }).filter(Boolean);
};

const generarHtmlMarker = (denuncia) => {
  const colorMap = {
    pendiente: 'warning',
    investigando: 'info',
    asignada: 'primary',
    en_proceso: 'primary',
    resuelta: 'success'
  };

  const iconMap = {
    alta: '🔥',
    media: '⚠️',
    baja: '🌿'
  };

  const color = colorMap[denuncia.estado] || 'secondary';
  const icono = iconMap[denuncia.prioridad] || '📍';

  return `
    <div style="
      background: var(--cui-${color});
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
      cursor: pointer;
    ">
      ${icono}
    </div>
  `;
};

// Función para generar capa de calor por tipo de denuncia
export const generarCalorPorTipo = (denuncias, tipo) => {
  const denunciasFiltradas = denuncias.filter(d => 
    d.tipo === tipo && 
    d.latitud && 
    d.longitud
  );

  return denunciasFiltradas.map(d => [
    parseFloat(d.latitud),
    parseFloat(d.longitud),
    0.7 // Intensidad para este tipo
  ]);
};

// Función para obtener estadísticas geográficas
export const obtenerEstadisticasGeograficas = (denuncias) => {
  const porEstado = denuncias.reduce((acc, d) => {
    const estado = d.estadoUbicacion || 'Desconocido';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const porMunicipio = denuncias.reduce((acc, d) => {
    const municipio = d.municipio || 'Desconocido';
    acc[municipio] = (acc[municipio] || 0) + 1;
    return acc;
  }, {});

  // Top 5 estados con más denuncias
  const topEstados = Object.entries(porEstado)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([estado, cantidad]) => ({ estado, cantidad }));

  // Top 5 municipios con más denuncias
  const topMunicipios = Object.entries(porMunicipio)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([municipio, cantidad]) => ({ municipio, cantidad }));

  return {
    total: denuncias.length,
    porEstado,
    porMunicipio,
    topEstados,
    topMunicipios,
    zonasActivas: Object.keys(porMunicipio).length
  };
};