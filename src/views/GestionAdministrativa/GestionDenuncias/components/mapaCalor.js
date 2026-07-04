// components/mapaCalor.js - VERSIÓN FINAL CORREGIDA
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardFooter,
  CButton,
  CSpinner,
  CBadge,
  CFormSelect,
  CRow,
  CCol,
  CAlert,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CProgress,
  CTooltip,
  CToast,
  CToaster,
  CToastHeader,
  CToastBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilFilter,
  cilZoomIn,
  cilZoomOut,
  cilLocationPin,
  cilFullscreen,
  cilMap,
  cilWarning,
  cilSearch,
  cilLayers,
  cilInfo,
  cilCircle,
  cilList,
  cilCompass,
  cilZoom,
  cilHandPointDown,
  cilX
} from '@coreui/icons';

// Coordenadas de San Cristóbal, Táchira, Venezuela
const SAN_CRISTOBAL_CENTER = [7.7667, -72.2333];
const ZOOM_INICIAL = 13;
const ZOOM_ESTADO = 9;
const ZOOM_PAIS = 6;

// Configuración de iconos personalizados para Leaflet
const createCustomIcon = (color, size = 24) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.45}px;
        transition: transform 0.2s ease;
      ">
        📍
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    className: 'custom-leaflet-marker'
  });
};

// Marcador especial para San Cristóbal
const createSanCristobalIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #EF4444, #DC2626);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
      ">
        \uD83C\uDFD9\uFE0F
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'san-cristobal-marker'
  });
};

// Prioridad a colores hex (CSS variables no funcionan en Leaflet divIcon)
const PRIORIDAD_COLORES = {
  alta: '#EF4444',
  media: '#F59E0B',
  baja: '#10B981'
};

const MapaCalor = ({ denuncias, onSelectDenuncia, filtros }) => {

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const sanCristobalMarkerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [errorMapa, setErrorMapa] = useState(null);
  const [tipoVisualizacion, setTipoVisualizacion] = useState('marcadores');
  const [estadisticas, setEstadisticas] = useState({
    conCoordenadas: 0,
    porEstado: {},
    porPrioridad: {},
    tachira: 0
  });
  const [zonaFocus, setZonaFocus] = useState('san_cristobal');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(ZOOM_INICIAL);
  const [showControls, setShowControls] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState(null);
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);


  // Mostrar toast
  const showToast = (message, color = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, color }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Configuración inicial de iconos de Leaflet
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  // Calcular estadísticas con foco en Táchira
  useEffect(() => {
    const conCoordenadas = denuncias.filter(d => d.latitud && d.longitud).length;

    const porEstado = {};
    const porPrioridad = {};
    let tachiraCount = 0;

    denuncias.forEach(d => {
      porEstado[d.estado] = (porEstado[d.estado] || 0) + 1;
      porPrioridad[d.prioridad] = (porPrioridad[d.prioridad] || 0) + 1;

      // Contar denuncias en Táchira
      if (d.estadoUbicacion && d.estadoUbicacion.toLowerCase().includes('táchira')) {
        tachiraCount++;
      }
    });

    setEstadisticas({
      conCoordenadas,
      porEstado,
      porPrioridad,
      tachira: tachiraCount
    });
  }, [denuncias]);

  // Manejar selección de denuncia
  const handleSelectDenuncia = useCallback((denuncia) => {
    setSelectedDenuncia(denuncia);
    setShowDenunciaModal(true);
    if (onSelectDenuncia) {
      onSelectDenuncia(denuncia);
    }
  }, [onSelectDenuncia]);

  // Inicializar mapa centrado en San Cristóbal
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map = null;

    const initMap = () => {
      try {
        // Crear instancia del mapa centrada en San Cristóbal
        map = L.map(mapContainerRef.current, {
          center: SAN_CRISTOBAL_CENTER,
          zoom: ZOOM_INICIAL,
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Escuchar cambios en el zoom
        map.on('zoomend', () => {
          setZoomLevel(map.getZoom());
        });

        // Leaflet no emite evento 'load', se remueve

        // Capa base de OpenStreetMap con estilo personalizado
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          minZoom: 6
        }).addTo(map);

        // Capa de marcadores
        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;

        // Agregar marcador especial para San Cristóbal
        sanCristobalMarkerRef.current = L.marker(SAN_CRISTOBAL_CENTER, {
          icon: createSanCristobalIcon(),
          title: 'San Cristóbal - Centro del Mapa',
          riseOnHover: true
        })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 250px; font-family: var(--font-primary);">
              <div style="background: linear-gradient(135deg, var(--danger), #DC2626); padding: 12px; border-radius: 8px 8px 0 0; margin: -12px -12px 12px -12px;">
                <h6 style="color: white; margin: 0; font-weight: 600; text-align: center; font-size: 14px;">🏙️ SAN CRISTÓBAL</h6>
                <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0 0; text-align: center; font-size: 11px;">
                  Estado Táchira, Venezuela
                </p>
              </div>
              <div style="padding: 12px 0">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: var(--neutral-600); font-size: 12px; font-weight: 500;">Altitud:</span>
                  <span style="font-weight: 600; font-size: 12px;">860 msnm</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: var(--neutral-600); font-size: 12px; font-weight: 500;">Población:</span>
                  <span style="font-weight: 600; font-size: 12px;">≈ 400,000 hab.</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                  <span style="color: var(--neutral-600); font-size: 12px; font-weight: 500;">Denuncias en zona:</span>
                  <span style="font-weight: 600; color: var(--danger); font-size: 12px;">${estadisticas.tachira}</span>
                </div>
                <div style="margin-top: 12px; text-align: center;">
                  <a href="https://www.google.com/maps?q=7.7667,-72.2333" target="_blank" rel="noopener noreferrer"
                    style="display: block; background: linear-gradient(135deg, var(--primary), #1D4ED8); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; width: 100%; font-size: 13px; text-decoration: none; text-align: center;">
                    🌐 Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          `);

        mapInstanceRef.current = map;
        setLoading(false);
        showToast('Mapa de T\u00e1chira inicializado', 'success');

        // Forzar recálculo de tamaño tras la inicialización por si el contenedor
        // aún estaba resolviendo sus dimensiones en el primer render
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 100);

        return map;
      } catch (err) {
        console.error('Error inicializando mapa:', err);
        setErrorMapa('No se pudo cargar el mapa. Verifica tu conexión a internet.');
        setLoading(false);
        return null;
      }
    };

    map = initMap();

    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar popup de San Cristóbal cuando cambien estadísticas
  useEffect(() => {
    if (sanCristobalMarkerRef.current) {
      sanCristobalMarkerRef.current.setPopupContent(`
        <div style="min-width: 250px; font-family: sans-serif;">
          <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 12px; border-radius: 8px 8px 0 0; margin: -12px -12px 12px -12px;">
            <h6 style="color: white; margin: 0; font-weight: 600; text-align: center; font-size: 14px;">🏙️ SAN CRISTÓBAL</h6>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0 0; text-align: center; font-size: 11px;">
              Estado Táchira, Venezuela
            </p>
          </div>
          <div style="padding: 12px 0">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666; font-size: 12px; font-weight: 500;">Altitud:</span>
              <span style="font-weight: 600; font-size: 12px;">860 msnm</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666; font-size: 12px; font-weight: 500;">Población:</span>
              <span style="font-weight: 600; font-size: 12px;">≈ 400,000 hab.</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <span style="color: #666; font-size: 12px; font-weight: 500;">Denuncias en zona:</span>
              <span style="font-weight: 600; color: #EF4444; font-size: 12px;">${estadisticas.tachira}</span>
            </div>
          </div>
        </div>
      `);
    }
  }, [estadisticas.tachira]);

  // Actualizar marcadores cuando cambian las denuncias
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const denunciasConCoords = denuncias.filter(d => d.latitud && d.longitud);

    denunciasConCoords.forEach(denuncia => {
      try {
        const lat = parseFloat(denuncia.latitud);
        const lng = parseFloat(denuncia.longitud);

        if (isNaN(lat) || isNaN(lng)) return;

        // Determinar color según prioridad y tamaño según ubicación
        let color, size;
        switch (denuncia.prioridad) {
          case 'alta':
            color = PRIORIDAD_COLORES.alta;
            size = 26;
            break;
          case 'media':
            color = PRIORIDAD_COLORES.media;
            size = 22;
            break;
          case 'baja':
            color = PRIORIDAD_COLORES.baja;
            size = 18;
            break;
          default:
            color = '#3B82F6';
            size = 20;
        }

        // Si está en Táchira, aumentar tamaño
        if (denuncia.estadoUbicacion && denuncia.estadoUbicacion.toLowerCase().includes('táchira')) {
          size += 2;
        }

        const icon = createCustomIcon(color, size);

        const marker = L.marker([lat, lng], {
          icon,
          title: denuncia.titulo,
          riseOnHover: true
        })
          .addTo(markersLayerRef.current)
          .bindPopup(`
            <div style="min-width: 280px; font-family: var(--font-primary);">
              <div style="background: linear-gradient(135deg, var(--primary), var(--eco-700)); padding: 14px; border-radius: 8px 8px 0 0; margin: -14px -14px 14px -14px;">
                <h6 style="color: white; margin: 0; font-weight: 600; font-size: 15px;">${denuncia.titulo}</h6>
              </div>
              <div style="padding: 12px 0">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: var(--neutral-600); font-size: 13px; font-weight: 500;">Tipo:</span>
                  <span style="font-weight: 600; font-size: 13px;">${denuncia.tipo.replace('_', ' ')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: var(--neutral-600); font-size: 13px; font-weight: 500;">Estado:</span>
                  <span style="font-weight: 600; font-size: 13px; color: ${denuncia.estado === 'pendiente' ? 'var(--warning)' : denuncia.estado === 'resuelta' ? 'var(--success)' : 'var(--info)'}">${denuncia.estado}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center;">
                  <span style="color: var(--neutral-600); font-size: 13px; font-weight: 500;">Prioridad:</span>
                  <span style="font-weight: 600; font-size: 13px; color: ${color}">${denuncia.prioridad}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px; align-items: center;">
                  <span style="color: var(--neutral-600); font-size: 13px; font-weight: 500;">Ubicación:</span>
                  <span style="font-weight: 600; font-size: 13px;">${denuncia.municipio}</span>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 10px; flex-direction: column;">
                  <button onclick="window.mapSelectDenuncia('${denuncia.id}')" 
                    style="background: linear-gradient(135deg, var(--primary), var(--eco-700)); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; width: 100%; font-size: 13px;">
                    📋 Ver detalles completos
                  </button>
                  <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener noreferrer"
                    style="display: block; background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; width: 100%; font-size: 13px; text-decoration: none; text-align: center;">
                    🗺️ Abrir en Google Maps
                  </a>
                </div>
              </div>
            </div>
          `);

        // Manejar evento de clic
        marker.on('click', () => {
          handleSelectDenuncia(denuncia);
        });

        // Manejar evento hover
        marker.on('mouseover', () => {
          marker.openPopup();
        });

        marker.on('mouseout', () => {
          marker.closePopup();
        });

      } catch (err) {
        console.error('Error creando marcador:', err);
      }
    });
  }, [denuncias, handleSelectDenuncia]);

  // Manejar cambio de zona de enfoque
  const handleZonaFocusChange = (zona) => {
    setZonaFocus(zona);

    const zonas = {
      san_cristobal: { center: SAN_CRISTOBAL_CENTER, zoom: ZOOM_INICIAL },
      tachira: { center: [7.8, -72.2], zoom: ZOOM_ESTADO },
      occidente: { center: [8.5, -71.5], zoom: ZOOM_ESTADO },
      todo: { center: [10.5, -66.9], zoom: ZOOM_PAIS },
      norte: { center: [11.5, -66.9], zoom: ZOOM_ESTADO },
      sur: { center: [7.5, -65.0], zoom: ZOOM_ESTADO },
      este: { center: [10.0, -63.0], zoom: ZOOM_ESTADO },
      oeste: { center: [10.0, -72.0], zoom: ZOOM_ESTADO }
    };

    if (mapInstanceRef.current && zonas[zona]) {
      const { center, zoom } = zonas[zona];
      mapInstanceRef.current.flyTo(center, zoom, {
        duration: 1.5
      });

      showToast(`Enfocando en ${zona.replace('_', ' ').toUpperCase()}`, 'info');
    }
  };

  // Función para buscar ubicación
  const handleSearch = () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    // Buscar en Táchira por defecto
    if (searchQuery.toLowerCase().includes('táchira') ||
      searchQuery.toLowerCase().includes('tachira') ||
      searchQuery.toLowerCase().includes('san cristobal') ||
      searchQuery.toLowerCase().includes('sancristobal')) {

      handleZonaFocusChange('san_cristobal');
      showToast(`Buscando en San Cristóbal, Táchira: ${searchQuery}`, 'info');
    } else {
      showToast(`Buscando: ${searchQuery} - Enfoque predeterminado: Región de Táchira`, 'info');
      handleZonaFocusChange('tachira');
    }

    setSearchQuery('');
  };

  // Función para enfocar denuncias en Táchira
  const focusTachira = () => {
    const denunciasEnTachira = denuncias.filter(d =>
      d.estadoUbicacion && d.estadoUbicacion.toLowerCase().includes('táchira') &&
      d.latitud && d.longitud
    );

    if (denunciasEnTachira.length > 0) {
      const bounds = L.latLngBounds(
        denunciasEnTachira.map(d => [parseFloat(d.latitud), parseFloat(d.longitud)])
      );
      mapInstanceRef.current.flyToBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        duration: 2
      });
      showToast(`Enfocando en ${denunciasEnTachira.length} denuncias de Táchira`, 'info');
    } else {
      handleZonaFocusChange('tachira');
    }
  };

  // Controles de zoom personalizados
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      showToast(`Zoom aumentado a ${zoomLevel + 1}x`, 'info');
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      showToast(`Zoom reducido a ${zoomLevel - 1}x`, 'info');
    }
  };

  const resetView = () => {
    handleZonaFocusChange('san_cristobal');
  };

  // Vista alternativa en caso de error
  if (errorMapa) {
    return (
      <CCard className="eco-card border-0 shadow-lg overflow-hidden h-100">
        <CCardHeader className="eco-card-header border-bottom">
          <div className="d-flex align-items-center">
            <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
              <CIcon icon={cilWarning} className="text-warning" />
            </div>
            <div>
              <h5 className="fw-bold text-montserrat mb-0">Mapa de Densidad de Denuncias</h5>
              <small className="text-minec-muted">Centrado en San Cristóbal, Estado Táchira</small>
            </div>
          </div>
        </CCardHeader>

        <CCardBody className="p-5 text-center">
          <div className="bg-warning bg-opacity-10 rounded-circle p-4 d-inline-block mb-4">
            <CIcon icon={cilWarning} size="xxl" className="text-warning" />
          </div>
          <h5 className="text-warning fw-bold mb-3">⚠️ Error de conexión</h5>
          <p className="text-minec-muted mb-4">{errorMapa}</p>

          <div className="rounded-3 p-4 eco-surface mx-auto" style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center mb-3">
              <CIcon icon={cilLocationPin} className="me-2 text-danger" />
              <h6 className="fw-bold mb-0">📍 Ubicación principal: San Cristóbal, Táchira</h6>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="rounded-3 p-3 mb-3">
                  <h6 className="fw-bold text-eco">🏙️ Región Táchira</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span>Denuncias en Táchira</span>
                      <CBadge color="primary">{estadisticas.tachira}</CBadge>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span>Coordenadas centrales</span>
                      <CBadge color="secondary">7.7667°, -72.2333°</CBadge>
                    </li>
                    <li className="d-flex justify-content-between py-1">
                      <span>Municipio principal</span>
                      <CBadge color="info">San Cristóbal</CBadge>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="rounded-3 p-3">
                  <h6 className="fw-bold text-eco">📈 Estadísticas Táchira</h6>
                  {Object.entries(estadisticas.porPrioridad).map(([prioridad, count]) => (
                    <div key={prioridad} className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">{prioridad}</small>
                        <small className="fw-medium">{count}</small>
                      </div>
                      <CProgress
                        value={(count / denuncias.length) * 100}
                        color={
                          prioridad === 'alta' ? 'danger' :
                            prioridad === 'media' ? 'warning' : 'success'
                        }
                        className="mb-3"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Denuncias con coordenadas:</span>
                <span className="fw-bold">{estadisticas.conCoordenadas}/{denuncias.length}</span>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <span className="text-muted">Zoom actual:</span>
                <span className="fw-bold">{zoomLevel}x</span>
              </div>
            </div>
          </div>

          <CButton
            color="outline-primary"
            className="btn-minec-outline mt-4 fw-medium"
            onClick={() => window.location.reload()}
          >
            <CIcon icon={cilCompass} className="me-2" />
            Reintentar carga del mapa
          </CButton>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <>
      {/* Toasts para notificaciones */}
      <CToaster position="top-right">
        {toasts.map((toast) => (
          <CToast key={toast.id} autohide={true} delay={4000} className="border-0 shadow-lg">
            <CToastHeader closeButton>
              <div className={`bg-${toast.color} bg-opacity-10 rounded-circle p-1 me-2`}>
                <CIcon icon={cilInfo} className={`text-${toast.color}`} />
              </div>
              <strong className="me-auto">Mapa de Táchira</strong>
            </CToastHeader>
            <CToastBody className="fw-medium">
              {toast.message}
            </CToastBody>
          </CToast>
        ))}
      </CToaster>

      {/* Modal para detalles de denuncia */}
      {selectedDenuncia && (
        <CModal
          visible={showDenunciaModal}
          onClose={() => setShowDenunciaModal(false)}
          size="lg"
          className="modal-minec"
        >
          <CModalHeader className="border-bottom">
            <CModalTitle className="fw-bold text-eco d-flex align-items-center">
              <CIcon icon={cilLocationPin} className="me-2 text-danger" />
              Detalles de Denuncia
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="p-3">
              <div className="mb-4">
                <h5 className="fw-bold mb-3">{selectedDenuncia.titulo}</h5>
                <div className="d-flex gap-3 mb-3">
                  <CBadge color={
                    selectedDenuncia.prioridad === 'alta' ? 'danger' :
                      selectedDenuncia.prioridad === 'media' ? 'warning' : 'success'
                  } className="px-3 py-2">
                    {selectedDenuncia.prioridad.toUpperCase()}
                  </CBadge>
                  <CBadge color={
                    selectedDenuncia.estado === 'pendiente' ? 'warning' :
                      selectedDenuncia.estado === 'resuelta' ? 'success' : 'info'
                  } className="px-3 py-2">
                    {selectedDenuncia.estado.toUpperCase()}
                  </CBadge>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">📍 Ubicación</h6>
                    <div className="fw-medium">
                      {selectedDenuncia.municipio}, {selectedDenuncia.estadoUbicacion}
                    </div>
                    <small className="text-muted">
                      Lat: {selectedDenuncia.latitud}, Lng: {selectedDenuncia.longitud}
                    </small>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-2">📋 Tipo</h6>
                    <div className="fw-medium">{selectedDenuncia.tipo.replace('_', ' ')}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">📅 Fecha</h6>
                    <div className="fw-medium">
                      {selectedDenuncia.fechaCreacion ? new Date(selectedDenuncia.fechaCreacion).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-2">👤 Denunciante</h6>
                    <div className="fw-medium">{selectedDenuncia.denunciante || 'Anónimo'}</div>
                  </div>
                </div>
              </div>

              {selectedDenuncia.descripcion && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">📝 Descripción</h6>
                  <div className="p-3 eco-surface rounded-3">
                    {selectedDenuncia.descripcion}
                  </div>
                </div>
              )}

              <div className="d-flex gap-3 mt-4">
                <CButton
                  color="primary"
                  className="btn-minec flex-grow-1"
                  onClick={() => {
                    window.open(`https://www.google.com/maps?q=${selectedDenuncia.latitud},${selectedDenuncia.longitud}`, '_blank');
                  }}
                >
                  <CIcon icon={cilMap} className="me-2" />
                  Abrir en Google Maps
                </CButton>

                <CButton
                  color="outline-secondary"
                  className="btn-minec-outline"
                  onClick={() => setShowDenunciaModal(false)}
                >
                  Cerrar
                </CButton>
              </div>
            </div>
          </CModalBody>
        </CModal>
      )}

      <CCard className="eco-card border-0 shadow-lg overflow-hidden h-100">
        {/* Header del mapa */}
        <CCardHeader className="eco-card-header border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div className="d-flex align-items-center mb-2 mb-md-0">
              <div className="bg-eco-soft rounded-circle p-2 me-3">
                <CIcon icon={cilMap} className="text-eco" />
              </div>
              <div>
                <h5 className="fw-bold text-montserrat mb-1">
                  Mapa de Denuncias - Región Táchira
                </h5>
                <small className="text-minec-muted d-flex align-items-center">
                  <CIcon icon={cilLocationPin} className="me-1 text-danger" size="sm" />
                  <span>Centrado en San Cristóbal, Estado Táchira, Venezuela</span>
                  <CBadge color="danger" className="ms-2">
                    🏙️ {estadisticas.tachira} denuncias
                  </CBadge>
                </small>
              </div>
            </div>

            <div className="d-flex gap-2 mt-2 mt-md-0">
              <CTooltip content="Enfocar en denuncias de Táchira">
                <CButton
                  color="outline-primary"
                  size="sm"
                  className="btn-minec-outline fw-medium"
                  onClick={focusTachira}
                >
                  <CIcon icon={cilHandPointDown} className="me-1" />
                  Foco Táchira
                </CButton>
              </CTooltip>

              <CTooltip content="Restablecer vista al centro">
                <CButton
                  color="primary"
                  size="sm"
                  className="btn-minec fw-medium"
                  onClick={resetView}
                >
                  <CIcon icon={cilCompass} className="me-1" />
                  Centrar
                </CButton>
              </CTooltip>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="mt-3">
            <CRow className="g-2">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText className="bg-eco-soft border-0">
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Buscar ubicación en Táchira..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-minec border-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <CButton
                    color="primary"
                    className="btn-minec border-0"
                    onClick={handleSearch}
                  >
                    Buscar
                  </CButton>
                </CInputGroup>
              </CCol>

              <CCol md={4}>
                <CFormSelect
                  value={zonaFocus}
                  onChange={(e) => handleZonaFocusChange(e.target.value)}
                  className="input-minec"
                >
                  <option value="san_cristobal">🏙️ San Cristóbal (Foco)</option>
                  <option value="tachira">🗺️ Estado Táchira</option>
                  <option value="occidente">⬅️ Región Occidente</option>
                  <option value="todo">🇻🇪 Todo Venezuela</option>
                  <option value="norte">⬆️ Zona Norte</option>
                  <option value="sur">⬇️ Zona Sur</option>
                  <option value="este">➡️ Zona Este</option>
                  <option value="oeste">⬅️ Zona Oeste</option>
                </CFormSelect>
              </CCol>

              <CCol md={4}>
                <CFormSelect
                  value={tipoVisualizacion}
                  onChange={(e) => setTipoVisualizacion(e.target.value)}
                  className="input-minec"
                >
                  <option value="marcadores">📍 Marcadores Individuales</option>
                  <option value="agrupados" disabled>🗺️ Marcadores Agrupados</option>
                  <option value="coropletas" disabled>🎨 Mapa Coroplético</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </div>
        </CCardHeader>

        {/* Contenedor del mapa */}
        <CCardBody className="p-0 position-relative" style={{ minHeight: '500px' }}>
          <div
            ref={mapContainerRef}
            style={{
              height: '100%',
              width: '100%',
              minHeight: '500px'
            }}
          >
            {loading && (
              <div className="position-absolute top-0 left-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center eco-surface">
                <CSpinner color="primary" className="mb-3" size="lg" />
                <h6 className="fw-bold text-eco mb-2">Cargando mapa de Táchira...</h6>
                <p className="text-minec-muted text-center">
                  Centrando en San Cristóbal<br />
                  <small>Coordenadas: 7.7667°, -72.2333°</small>
                </p>
              </div>
            )}
          </div>

          {/* Controles de zoom personalizados (solo en móvil/tablet) */}
          <div className="d-md-none position-absolute" style={{ bottom: '1rem', right: '1rem', zIndex: 1000 }}>
            <div className="d-flex flex-column gap-2">
              <CButton
                size="sm"
                color="primary"
                onClick={zoomIn}
                className="btn-minec rounded-circle p-2 shadow"
                style={{ width: '40px', height: '40px' }}
              >
                <CIcon icon={cilZoomIn} />
              </CButton>
              <CButton
                size="sm"
                color="secondary"
                onClick={zoomOut}
                className="btn-minec-outline rounded-circle p-2 shadow"
                style={{ width: '40px', height: '40px' }}
              >
                <CIcon icon={cilZoomOut} />
              </CButton>
            </div>
          </div>

          {/* CONTROLES DE LEYENDA Y ESTADÍSTICAS - LADO SUPERIOR IZQUIERDO */}
          {/* Botón circular toggle */}
          <div className="position-absolute" style={{ top: '1rem', left: '1rem', zIndex: 1001 }}>
            <CButton
              size="sm"
              color="primary"
              className="btn-minec shadow-lg d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              onClick={() => setShowControls(!showControls)}
            >
              <CIcon icon={showControls ? cilX : cilList} />
            </CButton>
          </div>

          {/* Panel combinado con animación slide */}
          <div className="position-absolute bg-body" style={{
            top: '1rem',
            left: showControls ? '4rem' : '-320px',
            zIndex: 1000,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid var(--cui-border-color, #e5e7eb)',
            padding: '0.75rem',
            width: '240px',
            transition: 'left 0.35s ease',
            pointerEvents: showControls ? 'auto' : 'none'
          }}>
            {/* Leyenda */}
            <h6 className="fw-bold text-montserrat mb-2 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
              <CIcon icon={cilInfo} className="me-2 text-eco" />
              🗺️ Leyenda
            </h6>
            <div className="small mb-3">
              <div className="d-flex align-items-center mb-1">
                <div className="rounded-circle me-2 flex-shrink-0" style={{ width: '12px', height: '12px', backgroundColor: '#EF4444' }}></div>
                <span className="fw-medium" style={{ fontSize: '0.8rem' }}>Alta Prioridad</span>
                <span className="ms-auto fw-semibold" style={{ fontSize: '0.8rem' }}>({estadisticas.porPrioridad.alta || 0})</span>
              </div>
              <div className="d-flex align-items-center mb-1">
                <div className="rounded-circle me-2 flex-shrink-0" style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B' }}></div>
                <span className="fw-medium" style={{ fontSize: '0.8rem' }}>Media Prioridad</span>
                <span className="ms-auto fw-semibold" style={{ fontSize: '0.8rem' }}>({estadisticas.porPrioridad.media || 0})</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded-circle me-2 flex-shrink-0" style={{ width: '12px', height: '12px', backgroundColor: '#10B981' }}></div>
                <span className="fw-medium" style={{ fontSize: '0.8rem' }}>Baja Prioridad</span>
                <span className="ms-auto fw-semibold" style={{ fontSize: '0.8rem' }}>({estadisticas.porPrioridad.baja || 0})</span>
              </div>
            </div>
            <hr className="my-2" style={{ borderColor: 'var(--cui-border-color, #e5e7eb)' }} />
            {/* Estadísticas */}
            <h6 className="fw-bold text-montserrat mb-2 d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
              📊 Estadísticas
            </h6>
            <div className="row g-1">
              <div className="col-6">
                <div className="bg-body-tertiary text-center p-1 rounded">
                  <div className="fw-bold" style={{ fontSize: '1rem', color: 'var(--cui-primary, #5856d6)' }}>{estadisticas.tachira}</div>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>En Táchira</small>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-body-tertiary text-center p-1 rounded">
                  <div className="fw-bold" style={{ fontSize: '1rem', color: 'var(--cui-info, #39f)' }}>{estadisticas.conCoordenadas}</div>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>Con coord.</small>
                </div>
              </div>
              <div className="col-12 mt-1">
                <div className="bg-body-tertiary text-center p-1 rounded">
                  <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>Zoom: {zoomLevel}x</div>
                </div>
              </div>
            </div>
          </div>
        </CCardBody>

        {/* Pie de página informativo */}
        {denuncias.length > 0 && (
          <CCardFooter className="eco-surface">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="mb-2 mb-md-0">
                <small className="text-minec-muted d-flex align-items-center">
                  <CIcon icon={cilLocationPin} className="me-1 text-eco" />
                  <span>
                    Sistema de Visualización Geográfica ECOGEST-MINEC • Centro: San Cristóbal, Táchira (7.7667°, -72.2333°)
                  </span>
                </small>
              </div>
              <div className="d-flex gap-2">
                <CBadge color="primary" className="px-2 py-1">
                  🏙️ {estadisticas.tachira} en Táchira
                </CBadge>
                <CBadge color="info" className="px-2 py-1">
                  📍 {estadisticas.conCoordenadas} ubicaciones
                </CBadge>
              </div>
            </div>
          </CCardFooter>
        )}
      </CCard>

      {/* Estilos para controles de Leaflet */}
      <style>{`
        .leaflet-container {
          font-family: var(--font-primary, sans-serif) !important;
          border-radius: 0 !important;
          z-index: 1;
        }
        
        .leaflet-control-zoom {
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
          background: white !important;
          z-index: 1000 !important;
        }
        
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #374151 !important;
          border-bottom: 1px solid #e5e7eb !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
          font-size: 16px !important;
          font-weight: 500 !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #f0fdf4 !important;
          color: #15803d !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          background: white !important;
          padding: 0 !important;
          min-width: 280px !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.4 !important;
        }
        
        .leaflet-popup-tip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
        }
        
        .custom-leaflet-marker:hover div {
          transform: scale(1.1);
        }
        
        .san-cristobal-marker:hover div {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
        }
        
        .leaflet-attribution-flag {
          font-size: 9px !important;
        }
        
        [data-coreui-theme="dark"] .leaflet-container {
          background: #1a1a1a;
        }
        
        [data-coreui-theme="dark"] .leaflet-control-zoom {
          background: #1f2937 !important;
          border-color: #374151 !important;
        }
        
        [data-coreui-theme="dark"] .leaflet-control-zoom a {
          background-color: #1f2937 !important;
          color: #d1d5db !important;
          border-bottom-color: #374151 !important;
        }
        
        [data-coreui-theme="dark"] .leaflet-control-zoom a:hover {
          background-color: #14532d !important;
          color: #86efac !important;
        }
        
        [data-coreui-theme="dark"] .leaflet-popup-content-wrapper {
          background-color: #1f2937 !important;
          border-color: rgba(76, 175, 80, 0.3) !important;
          color: #f3f4f6 !important;
        }
        
        [data-coreui-theme="dark"] .leaflet-popup-tip {
          background: #1f2937 !important;
          border-color: rgba(76, 175, 80, 0.3) !important;
        }
        
        [data-coreui-theme="dark"] .leaflet-tile {
          filter: brightness(0.8) invert(0.1) hue-rotate(180deg) saturate(0.3) brightness(0.9) !important;
        }
        
        @media (max-width: 768px) {
          .leaflet-control-zoom {
            display: none;
          }
          
          .leaflet-popup-content-wrapper {
            min-width: 260px !important;
            max-width: 280px !important;
          }
          
          .leaflet-popup-content {
            font-size: 14px !important;
          }
        }
        
        .leaflet-popup-content button,
        .leaflet-popup-content a {
          width: 100% !important;
          min-height: 42px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          text-align: center !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-bottom: 8px !important;
        }
        
        .leaflet-popup-content button:last-child,
        .leaflet-popup-content a:last-child {
          margin-bottom: 0 !important;
        }
      `}</style>
    </>
  );
};

export default MapaCalor;