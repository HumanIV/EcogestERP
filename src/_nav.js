import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilInbox,
  cilDescription,
  cilFire,
  cilPeople,
  cilStorage,
  cilTruck,
  cilBriefcase,
  cilChart,
  cilUser,
  cilListRich,
  cilFolderOpen,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'INICIO',
  },
  {
    component: CNavItem,
    name: 'Inicio',
    to: '/Inicio',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'ADMINISTRACIÓN',
  },
  {
    component: CNavItem,
    name: 'Panel General',
    to: '/AdminPanel',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Usuarios y Accesos',
    to: '/GestionUsuarios',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Bandeja Administrativa',
    to: '/BandejaAdministrativa',
    icon: <CIcon icon={cilInbox} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Gestión de Trámites',
    to: '/gestionTramites',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Gestión de Denuncias',
    to: '/gestionDenuncias',
    icon: <CIcon icon={cilFire} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Equipos de Campo',
    to: '/cuadrillas',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Inventario',
    to: '/Inventario',
    icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Proveedores',
    to: '/Proveedores',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'RECURSOS HUMANOS',
  },
  {
    component: CNavItem,
    name: 'Panel RRHH',
    to: '/PanelRRHH',
    icon: <CIcon icon={cilBriefcase} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Empleados',
    to: '/listEmpleados',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Expedientes',
    to: '/Expedientes',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Solicitudes RRHH',
    to: '/listSolicitudes',
    icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Estructura Orgánica',
    to: '/EstructuraOrg',
    icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
  },

]

export default _nav
