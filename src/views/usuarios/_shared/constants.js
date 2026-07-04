/**
 * ECOGEST — Shared Constants
 * ===========================
 * Constants shared across multiple usuario modules.
 * Module-specific constants stay in their own constants/ folder.
 */

// ── ESTADOS DE VENEZUELA ─────────────────────────────────────────────────────
export const ESTADOS_VENEZUELA = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
];

// ── FILE UPLOAD DEFAULTS ─────────────────────────────────────────────────────
export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10 MB
  maxCount: 5,
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
  ],
  allowedTypesExtended: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  acceptString: 'image/*,.pdf,video/mp4',
  acceptStringExtended: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
};

// ── FORM FIELD LIMITS ────────────────────────────────────────────────────────
export const FIELD_LIMITS = {
  title: { min: 5, max: 255 },
  description: { min: 30, max: 2000 },
  process: { min: 50, max: 2000 },
  address: { min: 5, max: 500 },
  name: { min: 2, max: 255 },
  input: { min: 0, max: 255 },
};
