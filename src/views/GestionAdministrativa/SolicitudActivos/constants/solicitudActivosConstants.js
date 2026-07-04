export const ESTADOS_SOLICITUD = [
  { value: 'Pendiente', label: 'Pendiente', color: 'warning' },
  { value: 'Aprobado', label: 'Aprobado', color: 'success' },
  { value: 'Rechazado', label: 'Rechazado', color: 'danger' }
];

export const TIPOS_ACTIVOS_SOLICITUD = [
  { value: 'Herramientas', label: 'Herramientas' },
  { value: 'Equipos', label: 'Equipos' },
  { value: 'Vehiculos', label: 'Vehículos' },
  { value: 'Suministros', label: 'Suministros' },
  { value: 'Materiales', label: 'Materiales' }
];

export const DATOS_INICIALES_SOLICITUDES = [
  {
    id: 1,
    cuadrillaId: 'Cuadrilla A',
    cuadrillaNombre: 'Cuadrilla A - Zona Norte',
    activoId: 1,
    activoNombre: 'Taladro Industrial',
    activoCodigo: 'MINECO-HER-001',
    cantidad: 2,
    estado: 'Pendiente',
    origen: 'cuadrilla',
    origenDetalle: 'Solicitado por Cuadrilla A',
    fechaSolicitud: '2026-05-09 08:30:00',
    fechaAprobacion: null,
    aprobadoPor: null,
    observaciones: 'Necesario para reparación en zona norte - Denuncia #245'
  },
  {
    id: 2,
    cuadrillaId: 'Cuadrilla B',
    cuadrillaNombre: 'Cuadrilla B - Zona Sur',
    activoId: 6,
    activoNombre: 'Kit de Herramientas Completas',
    activoCodigo: 'MINECO-HER-001',
    cantidad: 1,
    estado: 'Aprobado',
    origen: 'inventario',
    origenDetalle: 'Movimiento MINECO-HER-001 - Asignacion',
    fechaSolicitud: '2026-05-08 10:15:00',
    fechaAprobacion: '2026-05-08 14:30:00',
    aprobadoPor: 'Secretaria Admin',
    observaciones: 'Mantenimiento preventivo zona sur'
  }
];