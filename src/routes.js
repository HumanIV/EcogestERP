import React from 'react'

// Páginas de autenticación
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))

// Inicio
const Inicio = React.lazy(() => import('./views/Inicio/Inicio'))

// Gestión Administrativa
const AdminPanel = React.lazy(() => import('./views/GestionAdministrativa/AdminPanel'))
const UsuariosList = React.lazy(() => import('./views/GestionAdministrativa/Usuarios/UsuariosList'))
const Inventario = React.lazy(() => import('./views/GestionAdministrativa/Inventario/Inventario'))
const Proveedores = React.lazy(
  () => import('./views/GestionAdministrativa/Proveedores/Proveedores'),
)
const BandejaAdministrativa = React.lazy(
  () => import('./views/GestionAdministrativa/BandejaAdministrativa/BandejaAdministrativa'),
)
const gestionTramites = React.lazy(
  () => import('./views/GestionAdministrativa/Tramites/gestionTramites'),
)
const gestionDenuncias = React.lazy(
  () => import('./views/GestionAdministrativa/GestionDenuncias/gestionDenuncias'),
)
const cuadrillas = React.lazy(() => import('./views/GestionAdministrativa/cuadrillas/cuadrillas'))

// RRHH - Panel
const PanelRRHH = React.lazy(() => import('./views/RRHH/PanelRRHH'))

// RRHH - Empleados
const listEmpleados = React.lazy(() => import('./views/RRHH/Empleados/listEmpleados'))
const nuevoEmpleado = React.lazy(() => import('./views/RRHH/Empleados/nuevoEmpleado'))
const perfilEmpleado = React.lazy(() => import('./views/RRHH/Empleados/perfilEmpleado'))

// RRHH - Expedientes
const listExpedientes = React.lazy(() => import('./views/RRHH/Expedientes/listExpedientes'))

// RRHH - Solicitudes
const listSolicitudes = React.lazy(() => import('./views/RRHH/Solicitudes/listSolicitudes'))

// RRHH - Estructura Organizativa
const EstructuraOrg = React.lazy(() => import('./views/RRHH/EstructuraOrg/EstructuraOrg'))

// Usuarios - Portal Ciudadano
const MisTramites = React.lazy(() => import('./views/usuarios/MisTramites/index'))
const MisDenuncias = React.lazy(() => import('./views/usuarios/MisDenuncias/index'))
const Perfil = React.lazy(() => import('./views/usuarios/perfilUsers/perfilUsers'))

const routes = [
  // Página principal
  { path: '/', exact: true, name: 'Home' },

  // Autenticación
  { path: '/login', name: 'Login', element: Login },
  { path: '/register', name: 'Register', element: Register },

  // Inicio
  { path: '/Inicio', name: 'Inicio', element: Inicio },

  // Mi Cuenta
  { path: '/Perfil', name: 'Perfil', element: Perfil },

  // Gestión Administrativa
  { path: '/AdminPanel', name: 'Gestión Administrativa', element: AdminPanel },
  { path: '/GestionUsuarios', name: 'Usuarios y Accesos', element: UsuariosList },
  { path: '/BandejaAdministrativa', name: 'Bandeja', element: BandejaAdministrativa },
  { path: '/gestionTramites', name: 'Gestión de Trámites', element: gestionTramites },
  { path: '/gestionDenuncias', name: 'Gestión de Denuncias', element: gestionDenuncias },
  { path: '/cuadrillas', name: 'Equipos de Campo', element: cuadrillas },
  { path: '/Inventario', name: 'Inventario', element: Inventario },
  { path: '/Proveedores', name: 'Proveedores', element: Proveedores },

  // RRHH - Panel
  { path: '/PanelRRHH', name: 'Panel RRHH', element: PanelRRHH },

  // RRHH - Empleados
  { path: '/listEmpleados', name: 'Empleados', element: listEmpleados },
  { path: '/nuevoEmpleado', name: 'Nuevo Empleado', element: nuevoEmpleado },
  { path: '/perfilEmpleado/:id', name: 'Perfil Empleado', element: perfilEmpleado },

  // RRHH - Expedientes
  { path: '/Expedientes', name: 'Expedientes', element: listExpedientes },

  // RRHH - Solicitudes
  { path: '/listSolicitudes', name: 'Solicitudes RRHH', element: listSolicitudes },

  // RRHH - Estructura Organizativa
  { path: '/EstructuraOrg', name: 'Estructura Organizativa', element: EstructuraOrg },

  // Portal Ciudadano (accesibles pero no en nav)
  { path: '/mis-tramites', name: 'Mis Trámites', element: MisTramites },
  { path: '/mis-denuncias', name: 'Mis Denuncias', element: MisDenuncias },
]

export default routes
