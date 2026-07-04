export const ESTADOS_EXPEDIENTE = [
  { value: 'Completo', label: 'Completo', color: 'success' },
  { value: 'En revisión', label: 'En revisión', color: 'warning' },
  { value: 'Incompleto', label: 'Incompleto', color: 'danger' },
  { value: 'Pendiente', label: 'Pendiente', color: 'secondary' },
]

export const EXP_ESTADOS = ESTADOS_EXPEDIENTE
export const EXP_ESTADOS_CONFIG = ESTADOS_EXPEDIENTE.reduce((acc, e) => {
  acc[e.value] = e
  return acc
}, {})

export const TIPOS_DOCUMENTO = [
  'Contrato',
  'Cédula',
  'Académico',
  'Médico',
  'Antecedentes',
  'Certificación',
  'Currículum',
  'Educación',
  'Salud',
  'Otro',
]
