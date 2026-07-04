/**
 * ECOGEST — Shared Validation Utilities
 * ======================================
 * Centralized, reusable validation functions for all form modules.
 * All modules (denuncias, permisos, licencias, perfilUsers) import from here.
 *
 * Rules:
 * - Pure functions only (no React imports)
 * - Return { isValid, error } for single-field validators
 * - Return { isValid, errors } for multi-field validators
 */

// ── SANITIZATION ─────────────────────────────────────────────────────────────

/**
 * Sanitize text input: trim + remove dangerous characters.
 * Prevents basic XSS / injection without breaking normal Spanish text.
 */
export const sanitizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')      // strip js protocol
    .replace(/on\w+\s*=/gi, '')        // strip event handlers
    .replace(/[<>]/g, '');             // strip remaining angle brackets
};

// ── TEXT VALIDATORS ──────────────────────────────────────────────────────────

/**
 * Validate a text field (input / textarea).
 * @param {string} value - raw value
 * @param {object} opts - { required, minLen, maxLen, label, blockRepeated, blockUppercase }
 */
export const validateText = (value, opts = {}) => {
  const {
    required = true,
    minLen = 0,
    maxLen = 255,
    label = 'Este campo',
    blockRepeated = true,
    blockUppercase = true
  } = opts;

  const cleaned = sanitizeText(value);

  if (required && !cleaned) {
    return { isValid: false, error: `${label} es obligatorio` };
  }
  if (!required && !cleaned) {
    return { isValid: true, error: null, sanitized: '' };
  }
  if (cleaned.length < minLen) {
    return { isValid: false, error: `${label} debe tener al menos ${minLen} caracteres` };
  }
  if (cleaned.length > maxLen) {
    return { isValid: false, error: `${label} no puede exceder ${maxLen} caracteres` };
  }

  // Prevent simple repetition (e.g. "aaaaa", "test test test")
  if (blockRepeated) {
    if (/^(.+?)\1{4,}$/.test(cleaned)) {
      return { isValid: false, error: `${label} no parece tener contenido válido` };
    }
  }

  // Prevent all uppercase
  if (blockUppercase) {
    if (cleaned === cleaned.toUpperCase() && cleaned.match(/[A-Z]/)) {
      return { isValid: false, error: `${label} no debe estar escrito solo en mayúsculas` };
    }
  }

  return { isValid: true, error: null, sanitized: cleaned };
};


// ── SELECT VALIDATORS ────────────────────────────────────────────────────────

/**
 * Validate a select field against a whitelist of allowed values.
 * @param {string} value
 * @param {string[]} allowedValues - array of valid option values
 * @param {string} label
 */
export const validateSelect = (value, allowedValues, label = 'Este campo') => {
  if (!value || value === '') {
    return { isValid: false, error: `Selecciona ${label}` };
  }
  if (allowedValues && !allowedValues.includes(value)) {
    return { isValid: false, error: `Valor inválido para ${label}` };
  }
  return { isValid: true, error: null };
};

// ── EMAIL VALIDATOR ──────────────────────────────────────────────────────────

export const validateEmail = (value, required = true) => {
  const cleaned = sanitizeText(value);
  if (required && !cleaned) {
    return { isValid: false, error: 'El correo electrónico es obligatorio' };
  }
  if (!required && !cleaned) {
    return { isValid: true, error: null };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return { isValid: false, error: 'Ingresa un correo electrónico válido' };
  }
  if (cleaned.length > 255) {
    return { isValid: false, error: 'El correo no puede exceder 255 caracteres' };
  }
  return { isValid: true, error: null, sanitized: cleaned };
};

// ── PHONE VALIDATOR ──────────────────────────────────────────────────────────

export const validatePhone = (value, required = true) => {
  const cleaned = sanitizeText(value);
  if (required && !cleaned) {
    return { isValid: false, error: 'El teléfono es obligatorio' };
  }
  if (!required && !cleaned) {
    return { isValid: true, error: null };
  }
  // Accept Venezuelan phone formats: 0412-555-1234, 04121234567, +58-412-1234567
  const phoneRegex = /^(\+?58[-\s]?)?0?4(12|14|16|24|26)[-\s]?\d{3}[-\s]?\d{4}$/;
  if (!phoneRegex.test(cleaned.replace(/\s/g, ''))) {
    return { isValid: false, error: 'Formato de teléfono inválido (ej: 0412-555-1234)' };
  }
  return { isValid: true, error: null, sanitized: cleaned };
};

// ── DATE VALIDATOR ───────────────────────────────────────────────────────────

/**
 * Validate a date value.
 * @param {string} value - ISO date string
 * @param {object} opts - { required, allowFuture, label, maxPastDays }
 */
export const validateDate = (value, opts = {}) => {
  const { required = false, allowFuture = true, label = 'La fecha', maxPastDays = null } = opts;

  if (required && !value) {
    return { isValid: false, error: `${label} es obligatoria` };
  }
  if (!required && !value) {
    return { isValid: true, error: null };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${label} tiene un formato inválido` };
  }
  
  const now = new Date();
  
  if (!allowFuture && date > now) {
    return { isValid: false, error: `${label} no puede ser futura` };
  }

  if (maxPastDays !== null) {
    const pastLimit = new Date();
    pastLimit.setDate(pastLimit.getDate() - maxPastDays);
    if (date < pastLimit) {
      return { isValid: false, error: `${label} no puede ser mayor a ${maxPastDays} días en el pasado` };
    }
  }

  return { isValid: true, error: null };
};

// ── COORDINATE VALIDATORS ────────────────────────────────────────────────────

export const validateCoordinates = (lat, lng, required = false) => {
  const errors = {};

  if (required && (!lat && lat !== 0)) {
    errors.latitud = 'La latitud es obligatoria';
  }
  if (required && (!lng && lng !== 0)) {
    errors.longitud = 'La longitud es obligatoria';
  }

  if (lat || lat === 0) {
    const latNum = Number(lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      errors.latitud = 'Latitud inválida (debe estar entre -90 y 90)';
    }
  }

  if (lng || lng === 0) {
    const lngNum = Number(lng);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      errors.longitud = 'Longitud inválida (debe estar entre -180 y 180)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate coordinates are within Venezuela's geographic bounds.
 * Venezuela approximate bounds: lat 0.5-12.5, lng -73.5 to -59.5
 */
export const validateVenezuelaCoordinates = (lat, lng, required = false) => {
  const baseValidation = validateCoordinates(lat, lng, required);
  if (!baseValidation.isValid) return baseValidation;

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const errors = {};

  if (latNum < 0.5 || latNum > 12.5) {
    errors.latitud = 'La latitud debe estar dentro de Venezuela (0.5 a 12.5)';
  }

  if (lngNum < -73.5 || lngNum > -59.5) {
    errors.longitud = 'La longitud debe estar dentro de Venezuela (-73.5 a -59.5)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ── FILE VALIDATORS ──────────────────────────────────────────────────────────

/**
 * Default allowed MIME types across ECOGEST.
 */
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_COUNT = 5;

/**
 * Validate a set of files for upload.
 * @param {File[]} files - new files being added
 * @param {File[]} existingFiles - already selected files
 * @param {object} opts - { allowedTypes, maxSize, maxCount }
 */
export const validateFiles = (files, existingFiles = [], opts = {}) => {
  const {
    allowedTypes = ALLOWED_FILE_TYPES,
    maxSize = MAX_FILE_SIZE,
    maxCount = MAX_FILE_COUNT,
  } = opts;

  const errors = [];
  const validFiles = [];
  const existingNames = new Set(existingFiles.map(f => f.name));
  const totalCount = existingFiles.length;

  for (const file of files) {
    // Duplicate check
    if (existingNames.has(file.name)) {
      errors.push(`"${file.name}" ya fue seleccionado`);
      continue;
    }

    // Type check
    if (!allowedTypes.includes(file.type)) {
      errors.push(`"${file.name}": tipo de archivo no permitido`);
      continue;
    }

    // Size check
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      errors.push(`"${file.name}" excede ${maxMB}MB`);
      continue;
    }

    // Count check
    if (totalCount + validFiles.length >= maxCount) {
      errors.push(`Máximo ${maxCount} archivos permitidos`);
      break;
    }

    validFiles.push(file);
    existingNames.add(file.name);
  }

  return {
    isValid: errors.length === 0,
    validFiles,
    errors,
    errorMessage: errors.length > 0
      ? errors.join('. ')
      : null,
  };
};

// ── RIF VALIDATOR ────────────────────────────────────────────────────────────

/**
 * Validate Venezuelan RIF format.
 * Accepts formats like: J-12345678-9, J123456789, G-20123456-8
 */
export const validateRIF = (value, required = true) => {
  const cleaned = sanitizeText(value);
  if (required && !cleaned) {
    return { isValid: false, error: 'El RIF es obligatorio' };
  }
  if (!required && !cleaned) {
    return { isValid: true, error: null };
  }

  const normalizedRIF = cleaned.replace(/[-\s]/g, '').toUpperCase();
  const rifRegex = /^[JGVEP]\d{9}$/;

  if (!rifRegex.test(normalizedRIF)) {
    return { isValid: false, error: 'RIF inválido (ej: J-12345678-9)' };
  }

  return { isValid: true, error: null, sanitized: cleaned };
};

// ── PASSWORD VALIDATOR ───────────────────────────────────────────────────────

export const validatePassword = (password, confirmPassword) => {
  const errors = {};

  if (!password) {
    errors.nueva = 'La nueva contraseña es obligatoria';
  } else if (password.length < 8) {
    errors.nueva = 'Mínimo 8 caracteres';
  } else if (!/[A-Z]/.test(password)) {
    errors.nueva = 'Debe incluir al menos una letra mayúscula';
  } else if (!/[0-9]/.test(password)) {
    errors.nueva = 'Debe incluir al menos un número';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmar = 'Las contraseñas no coinciden';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ── CHECKBOX VALIDATOR ───────────────────────────────────────────────────────

export const validateCheckbox = (value, label = 'Este campo') => {
  if (!value) {
    return { isValid: false, error: `Debes aceptar ${label}` };
  }
  return { isValid: true, error: null };
};
