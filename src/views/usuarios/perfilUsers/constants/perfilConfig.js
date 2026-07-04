/**
 * ECOGEST — PerfilUsers Constants
 * ================================
 * Mock data and configuration for the user profile module.
 */

// ── MOCK USER DATA (replace with real API call) ──────────────────────────────
export const MOCK_USUARIO = {
  id: 1,
  nombre: 'Carlos',
  apellidos: 'Méndez López',
  cedula: '12345678',
  email: 'carlos@example.com',
  telefono: '0412-5555555',
  foto: 'https://i.pravatar.cc/150?img=1',
  direccion: 'Calle 1, Ciudad',
  fechaNacimiento: '1990-05-15',
};

// ── PROFILE FORM FIELDS CONFIG ───────────────────────────────────────────────
export const PROFILE_FIELDS = [
  { name: 'nombre', label: 'Nombre', md: 6 },
  { name: 'apellidos', label: 'Apellidos', md: 6 },
  { name: 'cedula', label: 'Cédula', md: 6 },
  { name: 'telefono', label: 'Teléfono', md: 6 },
  { name: 'email', label: 'Email', md: 6, type: 'email' },
  { name: 'fechaNacimiento', label: 'Fecha de Nacimiento', md: 6, type: 'date' },
  { name: 'direccion', label: 'Dirección', md: 12 },
];

// ── PASSWORD FORM FIELDS CONFIG ──────────────────────────────────────────────
export const PASSWORD_FIELDS = [
  { name: 'actual', label: 'Contraseña Actual', placeholder: 'Ingrese su contraseña actual' },
  { name: 'nueva', label: 'Nueva Contraseña', placeholder: 'Mínimo 8 caracteres, 1 mayúscula, 1 número' },
  { name: 'confirmar', label: 'Confirmar Contraseña', placeholder: 'Repita la nueva contraseña' },
];
