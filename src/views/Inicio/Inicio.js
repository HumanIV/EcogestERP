import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CBadge
} from '@coreui/react'
import { useColorModes } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilApps, 
  cilBook, 
  cilLibraryBuilding, 
  cilReportSlash,
  cilSettings,
  cilChart,
  cilPeople,
  cilNotes,
  cilStorage,
  cilChartLine,
  cilBank,
  cilChevronRight,
  cilChevronBottom,
  cilChevronTop,
  cilCalendar as cilCalendarIcon,
  cilFile,
  cilUserPlus,
  cilBriefcase,
  cilCalculator
} from '@coreui/icons'

const Inicio = () => {
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [loadingModule, setLoadingModule] = useState(null)
  const [expandedModule, setExpandedModule] = useState(1) // Expand first one by default

  const handleModuleClick = (moduleId) => {
    setLoadingModule(moduleId)
    setExpandedModule(expandedModule === moduleId ? null : moduleId)
    setTimeout(() => {
      setLoadingModule(null)
    }, 500)
  }

  const isDark = colorMode === 'dark'

  const moduleColors = {
    1: { color: '#43A047', bg: isDark ? 'rgba(67, 160, 71, 0.1)' : 'rgba(67, 160, 71, 0.05)' },
    2: { color: '#059669', bg: isDark ? 'rgba(5, 150, 105, 0.1)' : 'rgba(5, 150, 105, 0.05)' },
    3: { color: '#D97706', bg: isDark ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)' }
  }

  const mainModules = [
    {
      id: 1,
      title: "Gestión Administrativa",
      description: "Administración general del sistema",
      icon: cilLibraryBuilding,
      subModules: [
        { name: "Panel Administrativo", description: "Dashboard y configuración principal", icon: cilSettings, link: "/AdminPanel", badge: "Principal" },
        { name: "Planificación", description: "Planificación estratégica", icon: cilChartLine, link: "/Planificacion", badge: "Estratégico" },
        { name: "Administración Financiera", description: "Gestión de finanzas", icon: cilBank, link: "/AdministracionFinanciera", badge: "Finanzas" },
        { name: "Inventario", description: "Control de activos y existencias", icon: cilStorage, link: "/Inventario", badge: "Activos" },
      ]
    },
    {
      id: 2,
      title: "Recursos Humanos",
      description: "Gestión de personal y nómina",
      icon: cilBook,
      subModules: [
        { name: "Panel RRHH", description: "Dashboard principal de RRHH", icon: cilChart, link: "/PanelRRHH", badge: "Dashboard" },
        { name: "Lista de Empleados", description: "Ver y gestionar empleados", icon: cilPeople, link: "/listEmpleados", badge: "Empleados" },
        { name: "Nuevo Empleado", description: "Registrar nuevo personal", icon: cilUserPlus, link: "/nuevoEmpleado", badge: "Alta" },
        { name: "Expedientes", description: "Gestión de expedientes", icon: cilFile, link: "/Expedientes", badge: "Archivos" },
      ]
    },
    {
      id: 3,
      title: "Reportes",
      description: "Generación de reportes del sistema",
      icon: cilReportSlash,
      subModules: [
        { name: "Reportes Administrativos", description: "Gestión administrativa", icon: cilChartLine, link: "/Reports", badge: "Admin" },
        { name: "Reportes RRHH", description: "Estadísticas de RRHH", icon: cilPeople, link: "/reportesRRHH", badge: "Personal" },
      ]
    }
  ]

  return (
    <CContainer fluid className="px-0">
      <div className="premium-panel mb-5" style={{ padding: '3rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: isDark ? '#FFF' : '#111827', marginBottom: '0.5rem' }}>
              Módulos del Sistema
            </h1>
            <p style={{ fontSize: '1.1rem', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 }}>
              Selecciona un módulo para acceder a sus funcionalidades
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#9CA3AF' : '#6B7280' }}>
              <CIcon icon={cilCalendarIcon} />
              <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column" style={{ gap: '1.5rem' }}>
          {mainModules.map((module) => (
            <div 
              key={module.id} 
              style={{
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                borderRadius: '20px',
                padding: '1.5rem',
                background: expandedModule === module.id 
                  ? (isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB') 
                  : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <div 
                className="d-flex align-items-center justify-content-between" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="d-flex align-items-center">
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: moduleColors[module.id].bg, color: moduleColors[module.id].color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '1rem'
                  }}>
                    <CIcon icon={module.icon} size="xl" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: isDark ? '#FFF' : '#111827' }}>
                      {module.title}
                    </h3>
                    <span style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: '0.875rem' }}>{module.description}</span>
                  </div>
                </div>
                <div>
                  {loadingModule === module.id ? <CSpinner size="sm" /> : <CIcon icon={expandedModule === module.id ? cilChevronTop : cilChevronBottom} size="lg" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />}
                </div>
              </div>

              {expandedModule === module.id && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                  <CRow className="g-4">
                    {module.subModules.map((sub, index) => (
                      <CCol lg={3} md={6} key={index}>
                        <Link to={sub.link} style={{ textDecoration: 'none' }}>
                          <div 
                            style={{
                              background: isDark ? 'rgba(0,0,0,0.2)' : '#FFFFFF',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                              borderRadius: '16px',
                              padding: '1.5rem',
                              height: '100%',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                              e.currentTarget.style.borderColor = moduleColors[module.id].color;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
                              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: moduleColors[module.id].bg, color: moduleColors[module.id].color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <CIcon icon={sub.icon} size="lg" />
                              </div>
                              <span style={{
                                fontSize: '0.7rem', fontWeight: 600, padding: '4px 8px', borderRadius: '6px',
                                background: moduleColors[module.id].bg, color: moduleColors[module.id].color
                              }}>
                                {sub.badge}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#FFF' : '#111827', marginBottom: '0.5rem' }}>{sub.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 }}>{sub.description}</p>
                          </div>
                        </Link>
                      </CCol>
                    ))}
                  </CRow>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CContainer>
  )
}

export default Inicio