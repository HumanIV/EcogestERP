import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CContainer,
  CHeader,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeaderNav,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
  cilAccountLogout,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { useAuth } from '../context/AuthContext'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const { logout } = useAuth()

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('scrolled', document.documentElement.scrollTop > 0)
      }
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // --- DISEÑO HEADER MINIMALISTA SAAS ---
  return (
    <CHeader
      ref={headerRef}
      className="header-minec-floating"
    >
      <div className="d-flex align-items-center w-100">

        <button
          className="mobile-menu-toggle d-lg-none"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </button>

        {/* Dynamic Breadcrumbs as Page Title */}
        <div className="header-breadcrumb">
          <AppBreadcrumb />
        </div>

        {/* Search Bar Removed as per user request */}

        {/* Right Actions */}
        <CHeaderNav className="d-flex align-items-center">

          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle
              caret={false}
              className="theme-toggle-dropdown"
            >
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu className="theme-toggle-menu">
              <CDropdownItem as="button" onClick={() => setColorMode('light')} active={colorMode === 'light'} className="theme-option">
                <CIcon icon={cilSun} className="me-2" /> Claro
              </CDropdownItem>
              <CDropdownItem as="button" onClick={() => setColorMode('dark')} active={colorMode === 'dark'} className="theme-option">
                <CIcon icon={cilMoon} className="me-2" /> Oscuro
              </CDropdownItem>
              <CDropdownItem as="button" onClick={() => setColorMode('auto')} active={colorMode === 'auto'} className="theme-option">
                <CIcon icon={cilContrast} className="me-2" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          <button
            onClick={logout}
            className="theme-toggle-dropdown ms-2 d-flex align-items-center justify-content-center text-danger hover-bg-light rounded-circle border-0 bg-transparent"
            style={{ width: '40px', height: '40px', transition: 'all 0.3s ease' }}
            title="Cerrar Sesión"
          >
            <CIcon icon={cilAccountLogout} size="lg" />
          </button>
        </CHeaderNav>
      </div>
    </CHeader>
  )
}

export default AppHeader