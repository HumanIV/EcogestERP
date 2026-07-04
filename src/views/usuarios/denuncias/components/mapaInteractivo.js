import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CCard, CCardBody, CAlert, CButton, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilLocationPin, 
  cilMap, 
  cilWarning, 
  cilSearch,
  cilZoomIn,
  cilZoomOut
} from '@coreui/icons';

// Solución para los iconos de Leaflet
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
};

const MapaInteractivo = forwardRef(({ onLocationSelect, onAddressFound, initialPosition, readOnly = false, denuncia = null }, ref) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCoordinates, setHasCoordinates] = useState(false);

  // Coordenadas de San Cristóbal, Táchira, Venezuela
  const DEFAULT_CENTER = [7.7667, -72.2333];
  const DEFAULT_ZOOM = 13;

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await response.json();
      if (data && data.display_name) {
        const address = data.address || {};
        const road = address.road || address.pedestrian || '';
        const suburb = address.suburb || address.neighbourhood || address.village || '';
        const city = address.city || address.town || address.municipality || '';
        const parts = [road, suburb, city].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : data.display_name;
      }
    } catch {
      // Silently fail, coords still valid
    }
    return null;
  }, []);

  // Determinar si es modo visualización de denuncia
  const isDenunciaView = denuncia !== null;

  // Colores por tipo de denuncia
  const getTipoColor = (tipo) => {
    const tipoColors = {
      deforestacion: '#10B981',
      contaminacion_agua: '#3B82F6',
      contaminacion_aire: '#F59E0B',
      fauna_silvestre: '#EF4444',
      residuos_solidos: '#6B7280',
      mineria_ilegal: '#1F2937',
      urbanismo: '#8B5CF6',
      otros: '#059669'
    };
    return tipoColors[tipo] || '#4CAF50';
  };

  const getInitialPosition = () => {
    if (denuncia?.latitud && denuncia?.longitud) {
      setHasCoordinates(true);
      return [parseFloat(denuncia.latitud), parseFloat(denuncia.longitud)];
    }
    if (initialPosition && Array.isArray(initialPosition) && initialPosition.length === 2) {
      setHasCoordinates(true);
      return initialPosition;
    }
    setHasCoordinates(false);
    return DEFAULT_CENTER;
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    setIsLoading(true);
    
    const initTimer = setTimeout(() => {
      try {
        fixLeafletIcons();

        const centerPosition = getInitialPosition();
        const zoomLevel = hasCoordinates ? 16 : DEFAULT_ZOOM;

        const mapOptions = {
          center: centerPosition,
          zoom: zoomLevel,
          zoomControl: false,
          attributionControl: false
        };

        // Si es modo visualización, deshabilitar interacción
        if (isDenunciaView) {
          mapOptions.scrollWheelZoom = false;
          mapOptions.dragging = false;
        }

        mapRef.current = L.map(mapContainerRef.current, mapOptions);

        // Capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 8
        }).addTo(mapRef.current);

        // Agregar control de zoom
        L.control.zoom({
          position: 'topright'
        }).addTo(mapRef.current);

        // Evento de click solo si NO es modo lectura
        if (!isDenunciaView && !readOnly) {
          mapRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Eliminar marcador anterior si existe
            if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
            }
            
            // Crear nuevo marcador
            markerRef.current = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'custom-marker',
                html: `
                  <div style="
                    background: var(--eco-600);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 22px;
                    box-shadow: var(--shadow-lg);
                    border: 3px solid white;
                    cursor: pointer;
                  ">
                    📍
                  </div>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 44],
                popupAnchor: [0, -40]
              }),
              draggable: true
            }).addTo(mapRef.current);
            
            // Mostrar popup
            markerRef.current.bindPopup(`
              <div style="text-align: center; min-width: 200px; font-family: var(--font-primary);">
                <div style="font-weight: var(--fw-bold); margin-bottom: 8px; color: var(--eco-700);">
                  📍 Ubicación seleccionada
                </div>
                <div style="font-size: 12px; color: var(--neutral-600);">
                  Latitud: ${lat.toFixed(6)}<br>
                  Longitud: ${lng.toFixed(6)}
                </div>
              </div>
            `).openPopup();
            
            // Notificar al componente padre
            if (onLocationSelect) {
              onLocationSelect({ lat, lng });
            }

            // Geocodificación inversa para obtener dirección
            if (onAddressFound) {
              reverseGeocode(lat, lng).then(address => {
                if (address) onAddressFound(address);
              });
            }
          });
        }

        // Agregar marcador si hay posición inicial o denuncia
        if (hasCoordinates) {
          const markerColor = denuncia ? getTipoColor(denuncia.tipo) : '#4CAF50';
          
          markerRef.current = L.marker(centerPosition, {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `
                <div style="
                  background: ${markerColor};
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 22px;
                  box-shadow: var(--shadow-lg);
                  border: 3px solid white;
                  cursor: pointer;
                  ${isDenunciaView ? 'animation: pulse-eco 2s infinite;' : ''}
                ">
                  📍
                </div>
              `,
              iconSize: [44, 44],
              iconAnchor: [22, 44]
            })
          }).addTo(mapRef.current);
          
          if (denuncia) {
            // Popup para denuncia
            markerRef.current.bindPopup(`
              <div style="text-align: center; min-width: 220px; font-family: var(--font-primary);">
                <div style="font-weight: var(--fw-bold); margin-bottom: 8px; color: var(--eco-700);">
                  📍 ${denuncia.titulo}
                </div>
                <div style="font-size: 11px; color: var(--neutral-600); margin-bottom: 4px;">
                  <strong>Tipo:</strong> ${denuncia.tipo?.replace('_', ' ').toUpperCase()}
                </div>
                <div style="font-size: 11px; color: var(--neutral-600); margin-bottom: 4px;">
                  <strong>Municipio:</strong> ${denuncia.municipio}
                </div>
                <div style="font-size: 11px; color: var(--neutral-600);">
                  <strong>Coordenadas:</strong><br>
                  Lat: ${parseFloat(denuncia.latitud).toFixed(6)}<br>
                  Lng: ${parseFloat(denuncia.longitud).toFixed(6)}
                </div>
              </div>
            `).openPopup();

            // Dibujar círculo de área afectada
            L.circle(centerPosition, {
              color: markerColor,
              fillColor: markerColor,
              fillOpacity: 0.1,
              radius: 500 // 500 metros
            }).addTo(mapRef.current);
          } else {
            // Popup para ubicación inicial
            markerRef.current.bindPopup(`
              <div style="text-align: center; min-width: 200px;">
                <div style="font-weight: var(--fw-bold); color: var(--success);">
                  📍 Ubicación inicial
                </div>
              </div>
            `).openPopup();
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error al inicializar el mapa:', err);
        setError('No se pudo cargar el mapa. Verifica tu conexión a internet.');
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty array to only run on mount/unmount

  // ── Expose flyTo so the parent form can navigate the map ──
  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom = 10) => {
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
      }
    },
    setMarker: (lat, lng) => {
      if (!mapRef.current) return;
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      markerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: var(--eco-600); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; box-shadow: var(--shadow-lg); border: 3px solid white;">📍</div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 44],
          popupAnchor: [0, -40]
        }),
        draggable: true
      }).addTo(mapRef.current);
      markerRef.current.bindPopup(`<div style="text-align:center;min-width:200px;font-family:var(--font-primary);"><div style="font-weight:var(--fw-bold);margin-bottom:8px;color:var(--eco-700);">📍 Ubicación seleccionada</div><div style="font-size:12px;color:var(--neutral-600);">Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</div></div>`).openPopup();
      if (onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
      if (onAddressFound) {
        reverseGeocode(lat, lng).then(address => {
          if (address) onAddressFound(address);
        });
      }
    }
  }), [onLocationSelect]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada');
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapRef.current) {
          // Centrar mapa en ubicación actual
          mapRef.current.setView([lat, lng], 16);
          
          // Actualizar marcador
          if (markerRef.current) {
            mapRef.current.removeLayer(markerRef.current);
          }
          
          markerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `
                <div style="
                  background: var(--cui-primary);
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 22px;
                  box-shadow: var(--shadow-lg);
                  border: 3px solid white;
                ">
                  📍
                </div>
              `,
              iconSize: [44, 44],
              iconAnchor: [22, 44]
            }),
            draggable: true
          }).addTo(mapRef.current);
          
          // Notificar al componente padre
          if (onLocationSelect) {
            onLocationSelect({ lat, lng });
          }

          // Geocodificación inversa
          if (onAddressFound) {
            reverseGeocode(lat, lng).then(address => {
              if (address) onAddressFound(address);
            });
          }
          
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        setError(`Error obteniendo ubicación: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const enableInteraction = () => {
    if (mapRef.current && isDenunciaView) {
      mapRef.current.scrollWheelZoom.enable();
      mapRef.current.dragging.enable();
    }
  };

  const disableInteraction = () => {
    if (mapRef.current && isDenunciaView) {
      mapRef.current.scrollWheelZoom.disable();
      mapRef.current.dragging.disable();
    }
  };

  return (
    <div className={`mapa-interactivo ${isDenunciaView ? 'mapa-denuncia' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 d-flex align-items-center text-montserrat">
          <CIcon icon={cilMap} className="me-2 text-eco" />
          {isDenunciaView ? 'Ubicación del Incidente' : 'Mapa Interactivo - San Cristóbal, Táchira'}
        </h6>
        
        <div className="d-flex gap-1">
          <CButton 
            size="sm" 
            color="outline-secondary"
            onClick={zoomOut}
            disabled={isLoading}
            title="Alejar"
            className="btn-icon-minec p-1"
            style={{ width: '32px', height: '32px' }}
          >
            <CIcon icon={cilZoomOut} />
          </CButton>
          <CButton 
            size="sm" 
            color="outline-secondary"
            onClick={zoomIn}
            disabled={isLoading}
            title="Acercar"
            className="btn-icon-minec p-1"
            style={{ width: '32px', height: '32px' }}
          >
            <CIcon icon={cilZoomIn} />
          </CButton>
        </div>
      </div>
      
      <CCard className={`eco-card ${isDenunciaView ? 'border-0' : ''} overflow-hidden`} style={{ height: isDenunciaView ? '300px' : '400px' }}>
        <CCardBody className="p-0 position-relative">
          <div 
            ref={mapContainerRef}
            className="w-100 h-100"
            onMouseEnter={enableInteraction}
            onMouseLeave={disableInteraction}
            style={{ 
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}
          >
            {isLoading && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center eco-surface">
                <CSpinner color="primary" className="mb-2" style={{ color: 'var(--eco-600)' }} />
                <small className="text-minec-muted">
                  {isDenunciaView ? 'Cargando mapa...' : 'Cargando mapa de Táchira...'}
                </small>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center eco-surface p-3">
                <CIcon icon={cilWarning} size="xl" className="text-danger mb-3" />
                <p className="text-danger text-center mb-3">{error}</p>
                <CButton 
                  color="primary" 
                  onClick={() => window.location.reload()}
                  className="mt-2 btn-minec"
                >
                  Reintentar
                </CButton>
              </div>
            )}
          </div>
          
          {/* Overlay informativo */}
          {!isLoading && !error && (
            <div className="position-absolute top-3 start-3">
              {hasCoordinates ? (
                <CAlert color="success" className="border-0 rounded-3 py-1 px-2 d-inline-flex align-items-center bg-eco-soft">
                  <CIcon icon={cilLocationPin} className="me-1" style={{ fontSize: '12px' }} />
                  <small className="fw-semibold">
                    {isDenunciaView ? 'Ubicación específica' : 'Ubicación seleccionada'}
                  </small>
                </CAlert>
              ) : (
                <CAlert color="info" className="border-0 rounded-3 py-1 px-2 d-inline-flex align-items-center bg-eco-soft">
                  <CIcon icon={cilMap} className="me-1" style={{ fontSize: '12px' }} />
                  <small className="fw-semibold">Ubicación general</small>
                </CAlert>
              )}
            </div>
          )}
        </CCardBody>
      </CCard>
      
      {/* Controles adicionales solo para modo interactivo */}
      {!isDenunciaView && !readOnly && (
        <>
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <CButton 
              color="outline-primary" 
              onClick={handleGeolocation}
              disabled={isLoading}
              size="sm"
              className="btn-minec-outline"
            >
              <CIcon icon={cilLocationPin} className="me-2" />
              Usar mi ubicación
            </CButton>
            
            <div className="text-minec-muted small">
              <CIcon icon={cilSearch} className="me-1" />
              Haz click en el mapa para marcar ubicación
            </div>
          </div>
          
          <CAlert color="info" className="mt-3 border-0 rounded-3 small bg-eco-soft">
            <div className="d-flex align-items-start">
              <CIcon icon={cilWarning} className="me-2 mt-1" />
              <div>
                <strong>Ubicación:</strong> San Cristóbal, Estado Táchira, Venezuela
                <div className="mt-1">
                  <span className="badge bg-eco-soft text-eco me-2 fw-medium">Lat: 7.7667°</span>
                  <span className="badge bg-eco-soft text-eco fw-medium">Lng: -72.2333°</span>
                </div>
              </div>
            </div>
          </CAlert>
        </>
      )}
      
      {/* Información de coordenadas para modo denuncia */}
      {isDenunciaView && hasCoordinates && !isLoading && (
        <div className="mt-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-minec-muted d-block fw-light">Coordenadas GPS</small>
              <div className="d-flex align-items-center gap-3">
                <div>
                  <small className="text-minec-muted d-block fw-light" style={{ fontSize: '10px' }}>Latitud</small>
                  <span className="fw-semibold fw-data text-inter small">{parseFloat(denuncia.latitud).toFixed(6)}</span>
                </div>
                <div>
                  <small className="text-minec-muted d-block fw-light" style={{ fontSize: '10px' }}>Longitud</small>
                  <span className="fw-semibold fw-data text-inter small">{parseFloat(denuncia.longitud).toFixed(6)}</span>
                </div>
              </div>
            </div>
            <CButton 
              size="sm" 
              color="outline-primary"
              className="btn-minec-outline rounded-pill px-3"
              onClick={() => {
                const url = `https://www.google.com/maps?q=${denuncia.latitud},${denuncia.longitud}`;
                window.open(url, '_blank');
              }}
            >
              <CIcon icon={cilLocationPin} className="me-1" />
              Ver en Maps
            </CButton>
          </div>
        </div>
      )}
      
      {isDenunciaView && !hasCoordinates && !isLoading && (
        <CAlert color="info" className="mt-2 border-0 rounded-3 small bg-eco-soft">
          <div className="d-flex align-items-start">
            <CIcon icon={cilMap} className="me-2 mt-1" />
            <div>
              <small className="fw-semibold">Ubicación aproximada</small>
              <p className="mb-0 text-minec-muted small">
                Esta denuncia no tiene coordenadas específicas. Mostrando ubicación general de {denuncia?.municipio || 'la región'}.
              </p>
            </div>
          </div>
        </CAlert>
      )}
    </div>
  );
});

// Agregar estilos CSS necesarios
const addLeafletStyles = () => {
  if (typeof window === 'undefined') return;
  
  if (document.querySelector('#leaflet-styles-minec')) return;
  
  const style = document.createElement('style');
  style.id = 'leaflet-styles-minec';
  style.textContent = `
    .mapa-interactivo .leaflet-container {
      width: 100%;
      height: 100%;
      z-index: 1;
      font-family: var(--font-primary);
      border-radius: var(--radius-lg);
    }
    
    .mapa-interactivo .custom-marker {
      background: none !important;
      border: none !important;
    }
    
    .mapa-interactivo .leaflet-popup-content-wrapper {
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-lg) !important;
      border: 1px solid rgba(76, 175, 80, 0.2) !important;
      font-family: var(--font-primary) !important;
      background: var(--glass-bg) !important;
      backdrop-filter: blur(var(--glass-blur)) !important;
    }
    
    .mapa-interactivo .leaflet-popup-content {
      margin: 12px 16px !important;
      line-height: 1.4 !important;
    }
    
    .mapa-interactivo .leaflet-popup-tip {
      background: var(--glass-bg) !important;
      box-shadow: var(--shadow-md) !important;
    }
    
    .mapa-interactivo .leaflet-control-zoom {
      border: none !important;
      box-shadow: var(--shadow-md) !important;
      border-radius: var(--radius-lg) !important;
      overflow: hidden;
      margin-top: 10px !important;
      margin-right: 10px !important;
    }
    
    .mapa-interactivo .leaflet-control-zoom a {
      background-color: white !important;
      color: var(--neutral-700) !important;
      border-bottom: 1px solid var(--neutral-200) !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      transition: var(--transition-fast) !important;
      font-size: 16px !important;
    }
    
    .mapa-interactivo .leaflet-control-zoom a:hover {
      background-color: var(--eco-50) !important;
      color: var(--eco-700) !important;
    }
    
    .mapa-interactivo .leaflet-control-zoom a:first-child {
      border-top-left-radius: var(--radius-lg) !important;
      border-top-right-radius: var(--radius-lg) !important;
    }
    
    .mapa-interactivo .leaflet-control-zoom a:last-child {
      border-bottom-left-radius: var(--radius-lg) !important;
      border-bottom-right-radius: var(--radius-lg) !important;
      border-bottom: none !important;
    }
    
    [data-coreui-theme="dark"] .mapa-interactivo .leaflet-control-zoom a {
      background-color: var(--neutral-800) !important;
      color: var(--neutral-300) !important;
      border-bottom-color: var(--neutral-700) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-interactivo .leaflet-control-zoom a:hover {
      background-color: var(--eco-900) !important;
      color: var(--eco-300) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-interactivo .leaflet-popup-content-wrapper {
      background-color: var(--glass-bg-dark) !important;
      color: var(--neutral-100) !important;
      border-color: rgba(76, 175, 80, 0.3) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-interactivo .leaflet-popup-tip {
      background: var(--glass-bg-dark) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-interactivo .leaflet-tile {
      filter: brightness(0.8) invert(0.1) !important;
    }
    
    /* Animación de pulso para el marcador */
    @keyframes pulse-eco {
      0%, 100% {
        transform: scale(1);
        box-shadow: var(--shadow-lg);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
      }
    }
    
    .mapa-denuncia .leaflet-container {
      cursor: default !important;
    }
  `;
  document.head.appendChild(style);
};

// Ejecutar la función para agregar estilos
if (typeof window !== 'undefined') {
  addLeafletStyles();
}

export default MapaInteractivo;