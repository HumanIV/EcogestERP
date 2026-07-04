export const CATEGORIAS = [
  { id: 1, nombre: 'Tecnología', icon: 'cilLaptop', color: 'info' },
  { id: 2, nombre: 'Vehículos', icon: 'cilCarAlt', color: 'success' },
  { id: 3, nombre: 'Mobiliario', icon: 'cilLaptop', color: 'warning' },
  { id: 4, nombre: 'Comunicaciones', icon: 'cilLaptop', color: 'primary' },
  { id: 5, nombre: 'Herramientas', icon: 'cilLaptop', color: 'danger' },
  { id: 6, nombre: 'Equipos Especiales', icon: 'cilDevices', color: 'secondary' }
];

export const SUBCATEGORIAS_POR_CATEGORIA = {
  'Tecnología': ['Computadoras', 'Servidores', 'Laptops', 'Impresoras', 'Periféricos', 'Redes', 'Proyectores'],
  'Vehículos': ['Camionetas', 'Autobuses', 'Motos', 'Maquinaria Pesada', 'Sedán'],
  'Mobiliario': ['Escritorios', 'Sillas', 'Archivadores', 'Estantes', 'Mesas', 'Sofás'],
  'Comunicaciones': ['Radios', 'Teléfonos', 'Centrales Telefónicas', 'Routers', 'Switches', 'Antenas'],
  'Herramientas': ['Mantenimiento', 'Jardinería', 'Construcción', 'Electromecánica', 'Medición'],
  'Equipos Especiales': ['Laboratorio', 'Topografía', 'Seguridad Industrial', 'Generadores'],
};


export const ESTADOS_ACTIVO = [
  { value: '', label: 'Todos los estados' },
  { value: 'En Uso', label: 'En Uso' },
  { value: 'Disponible', label: 'Disponible' },
  { value: 'En Mantenimiento', label: 'En Mantenimiento' },
  { value: 'Dañado', label: 'Dañado' },
  { value: 'Baja', label: 'Baja' }
];

export const TIPOS_MOVIMIENTO = [
  { value: 'Asignación', label: 'Asignación' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Reparación', label: 'Reparación' },
  { value: 'Baja', label: 'Baja Técnica' }
];

export const DEPARTAMENTOS = [
  'Dirección General',
  'Tecnología e Informática',
  'Logística y Transporte',
  'Administración y Finanzas',
  'Recursos Humanos',
  'Planificación y Proyectos',
  'Comunicaciones',
  'Almacén Central',
  'Mantenimiento'
];

export const RESPONSABLES = [
  'Lic. María Rodríguez - Director General',
  'Ing. Carlos Pérez - Jefe de TI',
  'TSU. Pedro González - Logística',
  'Lic. Ana Martínez - Administración',
  'TSU. Luis Hernández - Mantenimiento',
  'Dra. Carmen López - Recursos Humanos'
];

export const UBICACIONES = [
  { id: 1, nombre: 'Almacén Central', capacidad: '500 m²', ocupacion: '75%', responsable: 'TSU. Pedro González' },
  { id: 2, nombre: 'Sala de Servidores', capacidad: '80 m²', ocupacion: '90%', responsable: 'Ing. Carlos Pérez' },
  { id: 3, nombre: 'Taller de Mantenimiento', capacidad: '120 m²', ocupacion: '60%', responsable: 'TSU. Luis Hernández' },
  { id: 4, nombre: 'Estacionamiento Principal', capacidad: '30 vehículos', ocupacion: '70%', responsable: 'TSU. Pedro González' },
  { id: 5, nombre: 'Oficina Dirección General', capacidad: 'N/A', ocupacion: 'N/A', responsable: 'Lic. María Rodríguez' }
];

export const DATOS_INICIALES_ACTIVOS = [
  {
    id: 1,
    codigo: 'MINECO-IT-001',
    nombre: 'Servidor Dell PowerEdge R740',
    categoria: 'Tecnología',
    subcategoria: 'Servidores',
    descripcion: 'Servidor empresarial para base de datos',
    ubicacion: 'Sala de Servidores - Piso 3',
    departamento: 'Tecnología e Informática',
    responsable: 'Ing. Carlos Pérez',
    serial: 'DLXPS740-2024-001',
    modelo: 'PowerEdge R740',
    marca: 'Dell',
    estado: 'En Uso',
    fechaAdquisicion: '2024-01-15',
    valorCompra: 12500.00,
    valorActual: 9800.00,
    garantia: '2026-01-15',
    proveedor: 'Tecnología Venezuela C.A.',
    condiciones: 'Funcionamiento óptimo',
    mantenimiento: 'Cada 6 meses'
  },
  {
    id: 2,
    codigo: 'MINECO-VEH-001',
    nombre: 'Camioneta Toyota Hilux 4x4',
    categoria: 'Vehículos',
    subcategoria: 'Camionetas',
    descripcion: 'Vehículo oficial para trabajo de campo',
    ubicacion: 'Estacionamiento Principal',
    departamento: 'Logística y Transporte',
    responsable: 'TSU. Pedro González',
    serial: 'VIN-TOYHILUX2024',
    modelo: 'Hilux 4x4 SR5',
    marca: 'Toyota',
    estado: 'Disponible',
    fechaAdquisicion: '2024-03-10',
    valorCompra: 45000.00,
    valorActual: 42000.00,
    kilometraje: '15,250 km',
    placa: 'ABC-123',
    seguro: 'Seguros Caracas',
    mantenimiento: 'Cada 5,000 km'
  },
  {
    id: 3,
    codigo: 'MINECO-COM-001',
    nombre: 'Computadora de Escritorio HP Elite',
    categoria: 'Tecnología',
    subcategoria: 'Computadoras',
    descripcion: 'Estación de trabajo para gestión administrativa',
    ubicacion: 'Oficina 304 - Dirección General',
    departamento: 'Dirección General',
    responsable: 'Lic. María Rodríguez',
    serial: 'HPELITE-2024-045',
    modelo: 'EliteDesk 800 G6',
    marca: 'HP',
    estado: 'En Uso',
    fechaAdquisicion: '2024-02-20',
    valorCompra: 850.00,
    valorActual: 750.00,
    especificaciones: 'i7, 16GB RAM, 512GB SSD',
    sistemaOperativo: 'Windows 11 Pro',
    mantenimiento: 'Anual'
  },
  {
    id: 4,
    codigo: 'MINECO-MOB-001',
    nombre: 'Conjunto de Oficina Ejecutivo',
    categoria: 'Mobiliario',
    subcategoria: 'Muebles',
    descripcion: 'Conjunto completo para oficina ejecutiva',
    ubicacion: 'Oficina 301 - Dirección',
    departamento: 'Dirección General',
    responsable: 'Lic. María Rodríguez',
    serial: 'MOB-EXEC-2024-01',
    modelo: 'Serie Ejecutiva',
    marca: 'Mobiliario Profesional',
    estado: 'En Uso',
    fechaAdquisicion: '2024-01-05',
    valorCompra: 3200.00,
    valorActual: 3000.00,
    componentes: 'Escritorio, silla ejecutiva, archivador, estantería',
    condiciones: 'Excelente estado'
  },
  {
    id: 5,
    codigo: 'MINECO-COM-002',
    nombre: 'Router Cisco Catalyst 9200',
    categoria: 'Comunicaciones',
    subcategoria: 'Redes',
    descripcion: 'Router empresarial para red interna',
    ubicacion: 'Sala de Comunicaciones',
    departamento: 'Tecnología e Informática',
    responsable: 'Ing. Carlos Pérez',
    serial: 'CISCO-9200-2024',
    modelo: 'Catalyst 9200',
    marca: 'Cisco',
    estado: 'Operativo',
    fechaAdquisicion: '2024-04-15',
    valorCompra: 1800.00,
    valorActual: 1600.00,
    especificaciones: '48 puertos Gigabit',
    mantenimiento: 'Cada 12 meses'
  },
  {
    id: 6,
    codigo: 'MINECO-HER-001',
    nombre: 'Kit de Herramientas Completas',
    categoria: 'Herramientas',
    subcategoria: 'Mantenimiento',
    descripcion: 'Kit completo para mantenimiento general',
    ubicacion: 'Bodega de Mantenimiento',
    departamento: 'Mantenimiento',
    responsable: 'TSU. Luis Hernández',
    serial: 'TOOL-KIT-2024',
    modelo: 'Kit Profesional 256 piezas',
    marca: 'Stanley',
    estado: 'Disponible',
    fechaAdquisicion: '2024-03-25',
    valorCompra: 450.00,
    valorActual: 420.00,
    componentes: 'Herramientas manuales, eléctricas y de medición'
  },
  {
    id: 7,
    codigo: 'MINECO-RAD-001',
    nombre: 'Radio Comunicación Motorola',
    categoria: 'Comunicaciones',
    subcategoria: 'Radios',
    descripcion: 'Equipo de comunicación para trabajo de campo',
    ubicacion: 'Oficina de Logística',
    departamento: 'Logística y Transporte',
    responsable: 'TSU. Pedro González',
    serial: 'MOTOROLA-RAD-001',
    modelo: 'MOTOTRBO SL 3000',
    marca: 'Motorola',
    estado: 'En Uso',
    fechaAdquisicion: '2024-02-10',
    valorCompra: 380.00,
    valorActual: 350.00,
    frecuencia: 'UHF 400-470 MHz',
    mantenimiento: 'Cada 6 meses'
  }
];

export const DATOS_INICIALES_MOVIMIENTOS = [
  {
    id: 1,
    tipo: 'Asignación',
    activo: 'Computadora de Escritorio HP Elite',
    codigoActivo: 'MINECO-COM-001',
    cantidad: 1,
    ubicacionOrigen: 'Almacén Central',
    ubicacionDestino: 'Oficina 304 - Dirección General',
    motivo: 'Asignación a Dirección General',
    usuario: 'Admin Sistema',
    fecha: '2024-02-25 09:30:00',
    referencia: 'ASIG-DIR-001'
  },
  {
    id: 2,
    tipo: 'Mantenimiento',
    activo: 'Servidor Dell PowerEdge R740',
    codigoActivo: 'MINECO-IT-001',
    cantidad: 1,
    ubicacionOrigen: 'Sala de Servidores',
    ubicacionDestino: 'Taller de Mantenimiento',
    motivo: 'Mantenimiento preventivo programado',
    usuario: 'TSU. Luis Hernández',
    fecha: '2024-03-15 14:00:00',
    referencia: 'MANT-IT-001'
  },
  {
    id: 3,
    tipo: 'Transferencia',
    activo: 'Kit de Herramientas Completas',
    codigoActivo: 'MINECO-HER-001',
    cantidad: 1,
    ubicacionOrigen: 'Bodega Principal',
    ubicacionDestino: 'Bodega de Mantenimiento',
    motivo: 'Reubicación por reorganización',
    usuario: 'TSU. Pedro González',
    fecha: '2024-04-01 11:15:00',
    referencia: 'TRF-MANT-001'
  },
  {
    id: 4,
    tipo: 'Baja',
    activo: 'Monitor LCD Samsung 24"',
    codigoActivo: 'MINECO-IT-015',
    cantidad: 1,
    ubicacionOrigen: 'Almacén Central',
    ubicacionDestino: 'Baja Técnica',
    motivo: 'Equipo obsoleto - fuera de servicio',
    usuario: 'Ing. Carlos Pérez',
    fecha: '2024-03-28 10:45:00',
    referencia: 'BAJA-TEC-001'
  }
];

export const DATOS_INICIALES_PROVEEDORES = [
  {
    id: 1,
    nombre: 'Tecnología Venezuela C.A.',
    rif: 'J-30123456-7',
    contacto: 'Ing. Roberto Sánchez',
    telefono: '+58 276-1234567',
    email: 'compras@tecnologiave.com',
    direccion: 'Av. Libertador, San Cristóbal',
    categoria: 'Tecnología',
    estado: 'Activo',
    rating: 4.5
  },
  {
    id: 2,
    nombre: 'Automotriz Los Andes C.A.',
    rif: 'J-30765432-1',
    contacto: 'Sr. José Ramírez',
    telefono: '+58 276-7654321',
    email: 'ventas@automotrizandes.com',
    direccion: 'Zona Industrial Paramillo',
    categoria: 'Vehículos',
    estado: 'Activo',
    rating: 4.3
  },
  {
    id: 3,
    nombre: 'Mobiliario Oficina Plus',
    rif: 'J-30111222-3',
    contacto: 'Lic. Carmen Rojas',
    telefono: '+58 276-2223344',
    email: 'info@mobiliarioplus.com',
    direccion: 'Centro Comercial Sambil',
    categoria: 'Mobiliario',
    estado: 'Activo',
    rating: 4.2
  }
];

export const DATOS_INICIALES_ALERTAS = [
  { id: 1, tipo: 'mantenimiento', activo: 'Servidor Dell PowerEdge', mensaje: 'Mantenimiento preventivo próximo', fecha: '2024-06-15', prioridad: 'alta' },
  { id: 2, tipo: 'garantia', activo: 'Router Cisco Catalyst', mensaje: 'Garantía vence en 30 días', fecha: '2024-05-10', prioridad: 'media' },
  { id: 3, tipo: 'revision', activo: 'Camioneta Toyota Hilux', mensaje: 'Revisión de 20,000 km próxima', fecha: '2024-04-20', prioridad: 'alta' }
];