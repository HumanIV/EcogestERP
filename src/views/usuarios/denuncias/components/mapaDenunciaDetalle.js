import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CCard, CCardBody, CButton, CSpinner, CAlert } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilLocationPin, 
  cilZoomIn,
  cilZoomOut,
  cilMap
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

const MapaDenunciaDetalle = ({ denuncia }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCoordinates, setHasCoordinates] = useState(false);

  // Coordenadas de San Cristóbal, Táchira por defecto
  const DEFAULT_CENTER = [7.7667, -72.2333];
  const DEFAULT_ZOOM = 13;
  
  // Determinar si la denuncia tiene coordenadas
  const getDenunciaCoordinates = () => {
    if (denuncia?.latitud && denuncia?.longitud) {
      setHasCoordinates(true);
      return [parseFloat(denuncia.latitud), parseFloat(denuncia.longitud)];
    }
    setHasCoordinates(false);
    return null;
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    setIsLoading(true);
    
    const initTimer = setTimeout(() => {
      try {
        fixLeafletIcons();

        const denunciaCoords = getDenunciaCoordinates();
        const centerPosition = denunciaCoords || DEFAULT_CENTER;
        const zoomLevel = denunciaCoords ? 16 : DEFAULT_ZOOM;

        mapRef.current = L.map(mapContainerRef.current, {
          center: centerPosition,
          zoom: zoomLevel,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          dragging: false
        });

        // Capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 8
        }).addTo(mapRef.current);

        // Agregar control de zoom personalizado
        L.control.zoom({
          position: 'topright'
        }).addTo(mapRef.current);

        // Si hay coordenadas específicas, agregar marcador
        if (denunciaCoords) {
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

          const markerColor = tipoColors[denuncia.tipo] || '#4CAF50';

          markerRef.current = L.marker(denunciaCoords, {
            icon: L.divIcon({
              className: 'custom-marker-detail',
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
                  animation: pulse-eco 2s infinite;
                ">
                  📍
                </div>
              `,
              iconSize: [44, 44],
              iconAnchor: [22, 44],
              popupAnchor: [0, -40]
            })
          }).addTo(mapRef.current);
          
          // Popup con información de la denuncia
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
        }

        // Dibujar círculo de área afectada si hay coordenadas
        if (denunciaCoords) {
          L.circle(denunciaCoords, {
            color: 'var(--eco-600)',
            fillColor: 'var(--eco-100)',
            fillOpacity: 0.3,
            radius: 500 // 500 metros
          }).addTo(mapRef.current);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error al inicializar el mapa:', err);
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
  }, [denuncia?.latitud, denuncia?.longitud]);

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
    if (mapRef.current) {
      mapRef.current.scrollWheelZoom.enable();
      mapRef.current.dragging.enable();
    }
  };

  const disableInteraction = () => {
    if (mapRef.current) {
      mapRef.current.scrollWheelZoom.disable();
      mapRef.current.dragging.disable();
    }
  };

  return (
    <div className="mapa-denuncia-detalle">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0 d-flex align-items-center text-montserrat" style={{ fontSize: '0.9rem' }}>
          <CIcon icon={cilMap} className="me-2 text-eco" />
          Ubicación del Incidente
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
      
      <CCard className="eco-card border-0 overflow-hidden" style={{ height: '300px' }}>
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
                <small className="text-minec-muted">Cargando mapa...</small>
              </div>
            )}
          </div>
          
          {/* Overlay informativo */}
          {!isLoading && (
            <div className="position-absolute top-3 start-3">
              {hasCoordinates ? (
                <CAlert color="success" className="border-0 rounded-3 py-1 px-2 d-inline-flex align-items-center bg-eco-soft">
                  <CIcon icon={cilLocationPin} className="me-1" style={{ fontSize: '12px' }} />
                  <small className="fw-semibold">Ubicación específica</small>
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
      
      {!hasCoordinates && !isLoading && (
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
      
      {hasCoordinates && !isLoading && (
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
                // Abrir en Google Maps
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
    </div>
  );
};

// Agregar estilos específicos para el mapa de detalles
const addLeafletDetailStyles = () => {
  if (typeof window === 'undefined') return;
  
  if (document.querySelector('#leaflet-detail-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'leaflet-detail-styles';
  style.textContent = `
    .mapa-denuncia-detalle .leaflet-container {
      width: 100%;
      height: 100%;
      z-index: 1;
      font-family: var(--font-primary);
      border-radius: var(--radius-lg);
    }
    
    .mapa-denuncia-detalle .custom-marker-detail {
      background: none !important;
      border: none !important;
    }
    
    .mapa-denuncia-detalle .leaflet-popup-content-wrapper {
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-lg) !important;
      border: 1px solid rgba(76, 175, 80, 0.2) !important;
      font-family: var(--font-primary) !important;
      background: var(--glass-bg) !important;
      backdrop-filter: blur(var(--glass-blur)) !important;
    }
    
    .mapa-denuncia-detalle .leaflet-popup-content {
      margin: 12px 16px !important;
      line-height: 1.4 !important;
    }
    
    .mapa-denuncia-detalle .leaflet-popup-tip {
      background: var(--glass-bg) !important;
      box-shadow: var(--shadow-md) !important;
    }
    
    .mapa-denuncia-detalle .leaflet-control-zoom {
      border: none !important;
      box-shadow: var(--shadow-md) !important;
      border-radius: var(--radius-lg) !important;
      overflow: hidden;
      margin-top: 10px !important;
      margin-right: 10px !important;
    }
    
    .mapa-denuncia-detalle .leaflet-control-zoom a {
      background-color: white !important;
      color: var(--neutral-700) !important;
      border-bottom: 1px solid var(--neutral-200) !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      transition: var(--transition-fast) !important;
      font-size: 16px !important;
    }
    
    .mapa-denuncia-detalle .leaflet-control-zoom a:hover {
      background-color: var(--eco-50) !important;
      color: var(--eco-700) !important;
    }
    
    .mapa-denuncia-detalle .leaflet-control-zoom a:first-child {
      border-top-left-radius: var(--radius-lg) !important;
      border-top-right-radius: var(--radius-lg) !important;
    }
    
    .mapa-denuncia-detalle .leaflet-control-zoom a:last-child {
      border-bottom-left-radius: var(--radius-lg) !important;
      border-bottom-right-radius: var(--radius-lg) !important;
      border-bottom: none !important;
    }
    
    [data-coreui-theme="dark"] .mapa-denuncia-detalle .leaflet-control-zoom a {
      background-color: var(--neutral-800) !important;
      color: var(--neutral-300) !important;
      border-bottom-color: var(--neutral-700) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-denuncia-detalle .leaflet-control-zoom a:hover {
      background-color: var(--eco-900) !important;
      color: var(--eco-300) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-denuncia-detalle .leaflet-popup-content-wrapper {
      background-color: var(--glass-bg-dark) !important;
      color: var(--neutral-100) !important;
      border-color: rgba(76, 175, 80, 0.3) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-denuncia-detalle .leaflet-popup-tip {
      background: var(--glass-bg-dark) !important;
    }
    
    [data-coreui-theme="dark"] .mapa-denuncia-detalle .leaflet-tile {
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
  `;
  document.head.appendChild(style);
};

if (typeof window !== 'undefined') {
  addLeafletDetailStyles();
}

export default MapaDenunciaDetalle;