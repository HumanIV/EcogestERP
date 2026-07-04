export const DEPARTAMENTOS = [
  'Dirección General',
  'Gestión Administrativa',
  'Gestión Ambiental',
  'Fiscalización y Control',
  'Recursos Humanos',
  'Administración y Finanzas',
  'Operaciones de Campo',
]

export const CARGOS = [
  'Auxiliar',
  'Analista',
  'Supervisor',
  'Coordinador',
  'Gerente',
  'Director',
  'Especialista',
  'Consultor',
]

export const TIPOS_CONTRATO = [
  'Indefinido',
  'Contrato Fijo',
  'Temporal',
  'Prácticas Profesionales',
  'Contrato de Formación',
  'Honorarios',
]

export const ESTADOS_EMPLEADO = [
  { value: 'Activo', color: 'success' },
  { value: 'Vacaciones', color: 'info' },
  { value: 'Reposo médico', color: 'warning' },
  { value: 'Suspendido', color: 'secondary' },
  { value: 'Jubilado', color: 'dark' },
  { value: 'Baja', color: 'danger' },
]

export const GENEROS = ['Masculino', 'Femenino', 'No binario']

export const FORM_INICIAL_EMPLEADO = {
  nombre: '',
  apellidos: '',
  cedula: '',
  fechaNacimiento: '',
  genero: '',
  email: '',
  telefono: '',
  direccion: '',
  departamento: '',
  cargo: '',
  tipoContrato: '',
  fechaIngreso: new Date().toISOString().split('T')[0],
  estado: 'Activo',
  supervisor: '',
  foto: '',
  ubicacion: '',
  edad: '',
  skills: [],
  rendimiento: 0,
  ultimaEvaluacion: '',
  contratacion: '',
  habilidades: [],
  documentos: [],
  cuadrillaId: null,
  cuadrillaId: null,
}
