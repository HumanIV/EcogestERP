export const MOCK_DATA = [
  {
    id: "DEN-2402-00001",
    titulo: "Tala ilegal en la Reserva Forestal El Tamá",
    descripcion: "Se observó tala indiscriminada de árboles nativos en la zona de amortiguamiento de la Reserva Forestal El Tamá. Árboles de cedro y apamate fueron talados sin autorización.",
    tipo: "deforestacion",
    prioridad: "alta",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Reserva Forestal El Tamá, sector La Fría",
    latitud: "7.766712",
    longitud: "-72.233345",
    fecha: "2024-02-15",
    fechaIncidente: "2024-02-14",
    estado: "investigando",
    evidencia: ["foto_tala_1.jpg", "foto_tala_2.jpg", "video_tala.mp4"],
    cuadrillaId: "CUAD-001"
  },
  {
    id: "DEN-2402-00002",
    titulo: "Contaminación del Río Torbes por vertidos industriales",
    descripcion: "Vertido constante de desechos industriales no tratados al Río Torbes desde una empresa procesadora de lácteos. El agua presenta espuma y coloración anormal.",
    tipo: "contaminacion_agua",
    prioridad: "alta",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Río Torbes, sector Las Lomas",
    latitud: "7.801234",
    longitud: "-72.203456",
    fecha: "2024-02-10",
    fechaIncidente: "2024-02-08",
    estado: "pendiente",
    evidencia: ["analisis_agua.pdf", "foto_rio_1.jpg", "foto_rio_2.jpg"]
  },
  {
    id: "DEN-2401-00003",
    titulo: "Acumulación de basura en Quebrada La Ribereña",
    descripcion: "Acumulación masiva de desechos sólidos en la quebrada La Ribereña. La basura está afectando el cauce natural y genera malos olores en la zona residencial.",
    tipo: "residuos_solidos",
    prioridad: "media",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Quebrada La Ribereña, barrio La Concordia",
    latitud: "7.756789",
    longitud: "-72.243456",
    fecha: "2024-01-25",
    fechaIncidente: "2024-01-20",
    estado: "en_proceso",
    evidencia: ["foto_basura_1.jpg", "foto_basura_2.jpg"],
    cuadrillaId: "CUAD-002"
  },
  {
    id: "DEN-2401-00004",
    titulo: "Emisiones contaminantes de ladrilleras artesanales",
    descripcion: "Ladrilleras en el sector El Valle emiten humo constantemente sin filtros, afectando la calidad del aire en San Cristóbal.",
    tipo: "contaminacion_aire",
    prioridad: "media",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Zona industrial El Valle, sector ladrilleras",
    latitud: "7.791234",
    longitud: "-72.253456",
    fecha: "2024-01-18",
    fechaIncidente: "2024-01-15",
    estado: "asignada",
    evidencia: ["foto_humo_1.jpg", "medicion_aire.pdf"]
  },
  {
    id: "DEN-2312-00005",
    titulo: "Caza ilegal de fauna silvestre en Páramo El Zumbador",
    descripcion: "Cazadores furtivos capturando especies protegidas como el oso frontino y el paují copete de piedra en el Páramo El Zumbador.",
    tipo: "fauna_silvestre",
    prioridad: "alta",
    estadoUbicacion: "Táchira",
    municipio: "Andrés Bello",
    ubicacion: "Páramo El Zumbador, límite Táchira-Mérida",
    latitud: "7.701234",
    longitud: "-72.303456",
    fecha: "2023-12-10",
    fechaIncidente: "2023-12-05",
    estado: "resuelta",
    evidencia: ["foto_trampas_1.jpg", "video_caza.mp4"],
    cuadrillaId: "CUAD-001"
  },
  {
    id: "DEN-2311-00006",
    titulo: "Explotación minera no autorizada en Bramón",
    descripcion: "Extracción ilegal de materiales de construcción (arena y grava) en el sector Bramón sin permisos ambientales.",
    tipo: "mineria_ilegal",
    prioridad: "media",
    estadoUbicacion: "Táchira",
    municipio: "Junín",
    ubicacion: "Sector Bramón, cerca del Río Chururú",
    latitud: "7.721234",
    longitud: "-72.183456",
    fecha: "2023-11-20",
    fechaIncidente: "2023-11-15",
    estado: "investigando",
    evidencia: ["foto_mineria_1.jpg", "foto_mineria_2.jpg"]
  },
  {
    id: "DEN-2310-00007",
    titulo: "Urbanización irregular en zona de protección",
    descripcion: "Construcción de viviendas en zona de protección de quebradas, específicamente en el sector La Pedrera sin estudios de impacto ambiental.",
    tipo: "urbanismo",
    prioridad: "alta",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Urbanización La Pedrera, sector noroeste",
    latitud: "7.761234",
    longitud: "-72.223456",
    fecha: "2023-10-05",
    fechaIncidente: "2023-09-30",
    estado: "en_proceso",
    evidencia: ["plano_ubicacion.pdf", "foto_construccion_1.jpg"],
    cuadrillaId: "CUAD-003"
  },
  {
    id: "DEN-2309-00008",
    titulo: "Incendio forestal en La Grita",
    descripcion: "Incendio de grandes proporciones en zona boscosa del municipio La Grita, afectando más de 50 hectáreas de bosque nativo.",
    tipo: "deforestacion",
    prioridad: "alta",
    estadoUbicacion: "Táchira",
    municipio: "La Grita",
    ubicacion: "Cerro El Cobre, municipio La Grita",
    latitud: "8.131234",
    longitud: "-71.983456",
    fecha: "2023-09-15",
    fechaIncidente: "2023-09-10",
    estado: "resuelta",
    evidencia: ["foto_incendio_1.jpg", "reporte_bomberos.pdf"]
  },
  {
    id: "DEN-2308-00009",
    titulo: "Contaminación de quebradas por aguas residuales",
    descripcion: "Vertido directo de aguas residuales domésticas a la Quebrada El Valle sin tratamiento previo.",
    tipo: "contaminacion_agua",
    prioridad: "media",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Quebrada El Valle, sector residencial",
    latitud: "7.771234",
    longitud: "-72.263456",
    fecha: "2023-08-22",
    fechaIncidente: "2023-08-20",
    estado: "resuelta",
    evidencia: ["analisis_agua.pdf", "foto_vertido.jpg"]
  },
  {
    id: "DEN-2307-00010",
    titulo: "Acumulación de neumáticos usados en patio industrial",
    descripcion: "Acumulación masiva de neumáticos usados en patio industrial del sector Peribeca, riesgo de incendio y proliferación de mosquitos.",
    tipo: "residuos_solidos",
    prioridad: "media",
    estadoUbicacion: "Táchira",
    municipio: "Cárdenas",
    ubicacion: "Zona industrial Peribeca, municipio Cárdenas",
    latitud: "7.811234",
    longitud: "-72.153456",
    fecha: "2023-07-30",
    fechaIncidente: "2023-07-25",
    estado: "pendiente",
    evidencia: ["foto_neumaticos_1.jpg", "foto_neumaticos_2.jpg"]
  },
  {
    id: "DEN-2306-00011",
    titulo: "Quemas agrícolas no controladas en Colón",
    descripcion: "Quemas agrícolas para preparación de terrenos se salieron de control, afectando zonas aledañas al Parque Nacional Chorro El Indio.",
    tipo: "contaminacion_aire",
    prioridad: "baja",
    estadoUbicacion: "Táchira",
    municipio: "Colón",
    ubicacion: "Sector Las Mesas, municipio Colón",
    latitud: "8.031234",
    longitud: "-72.253456",
    fecha: "2023-06-12",
    fechaIncidente: "2023-06-10",
    estado: "resuelta",
    evidencia: ["foto_quema_1.jpg"]
  },
  {
    id: "DEN-2305-00012",
    titulo: "Tráfico ilegal de especies de orquídeas nativas",
    descripcion: "Comercio ilegal de orquídeas endémicas del Páramo de El Tamá en mercados locales de San Cristóbal.",
    tipo: "fauna_silvestre",
    prioridad: "media",
    estadoUbicacion: "Táchira",
    municipio: "San Cristóbal",
    ubicacion: "Mercado Principal de San Cristóbal",
    latitud: "7.771234",
    longitud: "-72.213456",
    fecha: "2023-05-08",
    fechaIncidente: "2023-05-05",
    estado: "investigando",
    evidencia: ["foto_orquideas_1.jpg", "lista_especies.pdf"]
  }
];

export const ESTADOS_VENEZUELA = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara',
  'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa',
  'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
];

export const TIPOS_DENUNCIA = [
  { value: 'deforestacion', label: 'Deforestación', color: 'success', icon: '🌳' },
  { value: 'contaminacion_agua', label: 'Contaminación del Agua', color: 'info', icon: '💧' },
  { value: 'contaminacion_aire', label: 'Contaminación del Aire', color: 'warning', icon: '💨' },
  { value: 'fauna_silvestre', label: 'Fauna Silvestre', color: 'danger', icon: '🐾' },
  { value: 'residuos_solidos', label: 'Residuos Sólidos', color: 'secondary', icon: '🗑️' },
  { value: 'mineria_ilegal', label: 'Minería Ilegal', color: 'dark', icon: '⛏️' },
  { value: 'urbanismo', label: 'Urbanismo Irregular', color: 'primary', icon: '🏗️' },
  { value: 'otros', label: 'Otros', color: 'light', icon: '📝' }
];

export const PRIORIDADES = [
  { value: 'baja', label: 'Baja', color: 'success', icon: '🌿' },
  { value: 'media', label: 'Media', color: 'warning', icon: '⚠️' },
  { value: 'alta', label: 'Alta', color: 'danger', icon: '🚨' }
];

export const ESTADOS_DENUNCIA = [
  { value: 'pendiente', label: 'Pendiente', color: 'warning', icon: '⏳' },
  { value: 'investigando', label: 'Investigando', color: 'info', icon: '🔍' },
  { value: 'asignada', label: 'Asignada', color: 'primary', icon: '👤' },
  { value: 'en_proceso', label: 'En Proceso', color: 'dark', icon: '⚙️' },
  { value: 'resuelta', label: 'Resuelta', color: 'success', icon: '✅' },
  { value: 'rechazada', label: 'Rechazada', color: 'danger', icon: '❌' }
];

// Datos adicionales específicos para Táchira
export const MUNICIPIOS_TACHIRA = [
  'San Cristóbal', 'Cárdenas', 'Córdoba', 'Fernández Feo', 'Francisco de Miranda',
  'García de Hevia', 'Guásimos', 'Independencia', 'Jauregui', 'José María Vargas',
  'Junín', 'Libertad', 'Libertador', 'Lobatera', 'Michelena', 'Panamericano',
  'Pedro María Ureña', 'Rafael Urdaneta', 'Samuel Darío Maldonado', 'San Judas Tadeo',
  'Seboruco', 'Simón Rodríguez', 'Sucre', 'Torbes', 'Uribante', 'Andrés Bello'
];

export const LOCALIDADES_SAN_CRISTOBAL = [
  'Centro', 'La Concordia', 'Barrio Obrero', 'La Castra', 'Los Pinos',
  'Barrio Sucre', 'Barrio Nuevo', 'Barrio El Valle', 'Barrio La Florida',
  'Urbanización Las Lomas', 'Urbanización La Ribereña', 'Urbanización La Pedrera',
  'Urbanización Los Teques', 'Urbanización El Mirador', 'Urbanización La Morita'
];

export const CUADRILLAS_TACHIRA = [
  { id: 'CUAD-001', nombre: 'Cuadrilla San Cristóbal Norte', zona: 'Zona Norte de San Cristóbal' },
  { id: 'CUAD-002', nombre: 'Cuadrilla San Cristóbal Sur', zona: 'Zona Sur de San Cristóbal' },
  { id: 'CUAD-003', nombre: 'Cuadrilla Táchira Central', zona: 'Municipios centrales de Táchira' },
  { id: 'CUAD-004', nombre: 'Cuadrilla Fronteriza', zona: 'Zona fronteriza Colombo-Venezolana' },
  { id: 'CUAD-005', nombre: 'Cuadrilla Páramo y Montaña', zona: 'Zonas altas y páramos de Táchira' }
];

// Puntos de referencia importantes en San Cristóbal
export const PUNTOS_REFERENCIA_SAN_CRISTOBAL = [
  { nombre: 'Río Torbes', coordenadas: '7.801234, -72.203456', tipo: 'río' },
  { nombre: 'Reserva Forestal El Tamá', coordenadas: '7.766712, -72.233345', tipo: 'reserva' },
  { nombre: 'Parque Metropolitano', coordenadas: '7.771234, -72.213456', tipo: 'parque' },
  { nombre: 'Quebrada La Ribereña', coordenadas: '7.756789, -72.243456', tipo: 'quebrada' },
  { nombre: 'Zona Industrial El Valle', coordenadas: '7.791234, -72.253456', tipo: 'industrial' },
  { nombre: 'Cerro El Zumbador', coordenadas: '7.701234, -72.303456', tipo: 'cerro' }
];


// Configuración del mapa
export const MAP_CONFIG = {
  CENTRO_VENEZUELA: [8.0000, -66.0000],
  ZOOM_DEFAULT: 6,
  ZOOM_MAX: 19,
  ZOOM_MIN: 5,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors'
};

// Configuración de heatmap
export const HEATMAP_CONFIG = {
  RADIUS: 25,
  BLUR: 15,
  MAX_ZOOM: 17,
  GRADIENT: {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
  }
};

// Umbrales para alertas
export const UMBRALES_ALERTAS = {
  TIEMPO_RESPUESTA_CRITICO: 30, // días
  DENUNCIAS_PENDIENTES_ALTA: 50,
  CRECIMIENTO_MENSUAL_ALTO: 20, // porcentaje
  EFICIENCIA_BAJA: 60 // porcentaje
};











// Configuración de exportación
export const EXPORT_CONFIG = {
  FORMATOS: ['json', 'csv', 'pdf', 'excel'],
  CAMPOS_DEFAULT: [
    'id', 'titulo', 'tipo', 'estado', 'prioridad', 
    'municipio', 'estadoUbicacion', 'fecha', 'fechaResolucion'
  ],
  ENCODING: 'UTF-8'
};













// Rutas de la API (simuladas)
export const API_ROUTES = {
  DENUNCIAS: '/api/denuncias',
  ESTADISTICAS: '/api/estadisticas',
  CUADRILLAS: '/api/cuadrillas',
  REPORTES: '/api/reportes',
  NOTIFICACIONES: '/api/notificaciones'
};