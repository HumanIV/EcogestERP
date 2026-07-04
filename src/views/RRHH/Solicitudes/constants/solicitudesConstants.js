export const TIPOS_SOLICITUD = [
  'Vacaciones',
  'Permiso Personal',
  'Permiso Especial',
  'Constancia de Trabajo',
  'Reposo Médico',
  'Licencia por Estudio',
  'Solicitud de Contratación',
  'Adelanto de Nómina',
  'Licencia por Maternidad / Paternidad',
  'Cambio de Horario / Turno',
  'Baja / Renuncia',
]

export const ESTADOS_SOLICITUD = [
  { value: 'Pendiente', label: 'Pendiente', color: 'warning' },
  { value: 'En revisión', label: 'En revisión', color: 'info' },
  { value: 'Aprobada', label: 'Aprobada', color: 'success' },
  { value: 'Rechazada', label: 'Rechazada', color: 'danger' },
]

export const PRIORIDADES_SOLICITUD = [
  { value: 'Baja', label: 'Baja', color: 'secondary' },
  { value: 'Media', label: 'Media', color: 'info' },
  { value: 'Alta', label: 'Alta', color: 'warning' },
  { value: 'Urgente', label: 'Urgente', color: 'danger' },
]

export const FORM_INICIAL_SOLICITUD = {
  tipo: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  empleadoNombre: '',
  usuario: '',
  estado: 'Pendiente',
  fechaRespuesta: '',
  comentarios: '',
  prioridad: 'Media',
  motivo: '',
  detalles: '',
  documentos: [],
  departamento: '',
  diasSolicitados: 0,
  fechaInicio: '',
  fechaFin: '',
}
