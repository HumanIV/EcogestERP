/**
 * estructuraConstants.js
 *
 * Define la estructura organizativa del ministerio:
 * - Departamentos oficiales
 * - Cargos por departamento
 * - Plazas presupuestadas (con estado: vacante/ocupada)
 */

export const DEPARTAMENTOS_OFICIALES = [
  { id: 'DIR', nombre: 'Dirección General', nivel: 1 },
  { id: 'GA', nombre: 'Gestión Administrativa', nivel: 1 },
  { id: 'RRHH', nombre: 'Recursos Humanos', nivel: 2 },
  { id: 'ADMIN', nombre: 'Administración y Finanzas', nivel: 2 },
  { id: 'OPER', nombre: 'Operaciones de Campo', nivel: 2 },
  { id: 'AMB', nombre: 'Gestión Ambiental', nivel: 2 },
  { id: 'FISC', nombre: 'Fiscalización y Control', nivel: 2 },
]

export const LEGACY_DEPTO_MAP = {
  GAmb: 'AMB',
  Insp: 'FISC',
  Op: 'OPER',
}

export function resolverDepto(codigo) {
  if (!codigo) return { nombre: 'Sin departamento', nivel: null }
  const directo = DEPARTAMENTOS_OFICIALES.find((d) => d.id === codigo)
  if (directo) return directo
  const legacy = LEGACY_DEPTO_MAP[codigo]
  if (legacy) {
    const mapeado = DEPARTAMENTOS_OFICIALES.find((d) => d.id === legacy)
    if (mapeado) return mapeado
  }
  return { nombre: codigo, nivel: null }
}

export const CARGOS_POR_DEPTO = {
  DIR: ['Director General', 'Subdirector', 'Asesor de Dirección'],
  GA: [
    'Director de Gestión Administrativa',
    'Coordinador Administrativo',
    'Analista de Trámites',
    'Asistente Administrativo',
  ],
  RRHH: [
    'Coordinador de RRHH',
    'Analista de Nómina',
    'Analista de Reclutamiento',
    'Asistente de RRHH',
    'Especialista en Capacitación',
  ],
  ADMIN: [
    'Administrador General',
    'Analista Financiero',
    'Contador',
    'Asistente de Dirección',
    'Recepcionista',
    'Archivista',
  ],
  OPER: [
    'Supervisor de Operaciones',
    'Supervisor de Campo',
    'Obrero Especializado',
    'Obrero',
    'Inspector',
  ],
  AMB: ['Gerente Ambiental', 'Analista Ambiental', 'Asesor'],
  FISC: ['Inspector Jefe', 'Inspector de Control', 'Fiscal de Campo'],
}

export const CONFIG_POR_CARGO = {
  'Director General': {
    nivel: 1,
    nivelEducativo: 'maestria',
    experienciaMinima: '10',
    tipoJornada: 'completo',
  },
  Subdirector: {
    nivel: 1,
    nivelEducativo: 'postgrado',
    experienciaMinima: '5',
    tipoJornada: 'completo',
  },
  'Asesor de Dirección': {
    nivel: 1,
    nivelEducativo: 'universitario',
    experienciaMinima: '5',
    tipoJornada: 'completo',
  },
  'Director de Gestión Administrativa': {
    nivel: 1,
    nivelEducativo: 'maestria',
    experienciaMinima: '10',
    tipoJornada: 'completo',
  },
  'Coordinador Administrativo': {
    nivel: 2,
    nivelEducativo: 'universitario',
    experienciaMinima: '5',
    tipoJornada: 'completo',
  },
  'Coordinador de RRHH': {
    nivel: 2,
    nivelEducativo: 'universitario',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  'Administrador General': {
    nivel: 2,
    nivelEducativo: 'universitario',
    experienciaMinima: '5',
    tipoJornada: 'completo',
  },
  'Gerente Ambiental': {
    nivel: 2,
    nivelEducativo: 'postgrado',
    experienciaMinima: '5',
    tipoJornada: 'completo',
  },
  'Supervisor de Operaciones': {
    nivel: 3,
    nivelEducativo: 'tecnico',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  'Supervisor de Campo': {
    nivel: 3,
    nivelEducativo: 'tecnico',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  'Inspector Jefe': {
    nivel: 3,
    nivelEducativo: 'tecnico',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  'Analista de Trámites': {
    nivel: 4,
    nivelEducativo: 'universitario',
    experienciaMinima: '2',
    tipoJornada: 'completo',
  },
  'Analista de Nómina': {
    nivel: 4,
    nivelEducativo: 'tecnico',
    experienciaMinima: '1',
    tipoJornada: 'completo',
  },
  'Analista de Reclutamiento': {
    nivel: 4,
    nivelEducativo: 'tecnico',
    experienciaMinima: '1',
    tipoJornada: 'completo',
  },
  'Analista Financiero': {
    nivel: 4,
    nivelEducativo: 'universitario',
    experienciaMinima: '2',
    tipoJornada: 'completo',
  },
  'Analista Ambiental': {
    nivel: 4,
    nivelEducativo: 'universitario',
    experienciaMinima: '2',
    tipoJornada: 'completo',
  },
  'Especialista en Capacitación': {
    nivel: 4,
    nivelEducativo: 'universitario',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  Contador: {
    nivel: 4,
    nivelEducativo: 'universitario',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  'Inspector de Control': {
    nivel: 4,
    nivelEducativo: 'tecnico',
    experienciaMinima: '2',
    tipoJornada: 'completo',
  },
  'Fiscal de Campo': {
    nivel: 4,
    nivelEducativo: 'tecnico',
    experienciaMinima: '2',
    tipoJornada: 'completo',
  },
  Asesor: {
    nivel: 4,
    nivelEducativo: 'universitario',
    experienciaMinima: '3',
    tipoJornada: 'completo',
  },
  'Asistente de RRHH': {
    nivel: 5,
    nivelEducativo: 'tecnico',
    experienciaMinima: '0',
    tipoJornada: 'completo',
  },
  'Asistente de Dirección': {
    nivel: 5,
    nivelEducativo: 'tecnico',
    experienciaMinima: '1',
    tipoJornada: 'completo',
  },
  Recepcionista: {
    nivel: 5,
    nivelEducativo: 'bachiller',
    experienciaMinima: '0',
    tipoJornada: 'completo',
  },
  Archivista: {
    nivel: 5,
    nivelEducativo: 'bachiller',
    experienciaMinima: '0',
    tipoJornada: 'completo',
  },
  'Asistente Administrativo': {
    nivel: 5,
    nivelEducativo: 'tecnico',
    experienciaMinima: '1',
    tipoJornada: 'completo',
  },
  Obrero: { nivel: 6, nivelEducativo: 'basico', experienciaMinima: '0', tipoJornada: 'completo' },
  'Obrero Especializado': {
    nivel: 6,
    nivelEducativo: 'basico',
    experienciaMinima: '1',
    tipoJornada: 'completo',
  },
  Inspector: {
    nivel: 6,
    nivelEducativo: 'basico',
    experienciaMinima: '1',
    tipoJornada: 'completo',
  },
}

export const ESTADOS_PLAZA = [
  { value: 'vacante', label: 'Vacante', color: 'success' },
  { value: 'ocupada', label: 'Ocupada', color: 'primary' },
  { value: 'suspendida', label: 'Suspendida', color: 'warning' },
  { value: 'eliminada', label: 'Eliminada', color: 'danger' },
]

export const NIVELES_JERARQUICOS = [
  { value: 1, label: 'Dirección' },
  { value: 2, label: 'Coordinación' },
  { value: 3, label: 'Supervisión' },
  { value: 4, label: 'Analista' },
  { value: 5, label: 'Asistente' },
  { value: 6, label: 'Operativo' },
]

export const NIVELES_EDUCATIVOS = [
  { value: 'basico', label: 'Básico' },
  { value: 'bachiller', label: 'Bachiller' },
  { value: 'tecnico', label: 'Técnico Superior' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'postgrado', label: 'Postgrado' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' },
]

export const EXPERIENCIA_OPCIONES = [
  { value: '0', label: 'Sin experiencia' },
  { value: '1', label: '1 año' },
  { value: '2', label: '2 años' },
  { value: '3', label: '3 años' },
  { value: '5', label: '5 años' },
  { value: '10', label: '10+ años' },
]

export const TIPOS_JORNADA = [
  { value: 'completo', label: 'Tiempo Completo' },
  { value: 'medio', label: 'Medio Tiempo' },
  { value: 'proyecto', label: 'Por Proyecto' },
  { value: 'temporal', label: 'Temporal' },
]

export const FORM_INICIAL_PLAZA = {
  codigo: '',
  departamento: '',
  cargo: '',
  nivel: 4,
  estado: 'vacante',
  nivelEducativo: '',
  experienciaMinima: '0',
  tipoJornada: 'completo',
  certificaciones: '',
}
