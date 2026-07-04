export const CATEGORIAS_PROVEEDOR = [
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Vehículos', label: 'Vehículos' },
  { value: 'Mobiliario', label: 'Mobiliario' },
  { value: 'Comunicaciones', label: 'Comunicaciones' },
  { value: 'Herramientas', label: 'Herramientas' },
  { value: 'Equipos Especiales', label: 'Equipos Especiales' },
  { value: 'Suministros', label: 'Suministros' },
  { value: 'Servicios', label: 'Servicios' }
];

export const ESTADOS_PROVEEDOR = [
  { value: 'Activo', label: 'Activo', color: 'success' },
  { value: 'Inactivo', label: 'Inactivo', color: 'secondary' },
  { value: 'Suspendido', label: 'Suspendido', color: 'warning' }
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
  },
  {
    id: 4,
    nombre: 'Comercializadora Electrónica',
    rif: 'J-30666777-8',
    contacto: 'Ing. Carlos Mendoza',
    telefono: '+58 274-4445566',
    email: 'ventas@electronica.com.ve',
    direccion: 'Calle 5ta, Maracaibo',
    categoria: 'Tecnología',
    estado: 'Inactivo',
    rating: 3.8
  }
];