import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilChart,
  cilShieldAlt,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useColorModes } from '@coreui/react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useAuth } from '../../context/AuthContext'

const AppHeaderDropdown = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [isOpen, setIsOpen] = useState(false)

  const dropdownMenuStyle = {
    background: colorMode === 'dark' ? 'rgba(15, 26, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border:
      colorMode === 'dark'
        ? '1px solid rgba(76, 175, 80, 0.2)'
        : '1px solid rgba(76, 175, 80, 0.1)',
    borderRadius: 'var(--radius-xl)',
    padding: '0.5rem',
    minWidth: '280px',
    boxShadow: 'var(--shadow-xl)',
    marginTop: '0.5rem',
    animation: isOpen ? 'fadeInEco 0.2s ease-out' : 'none',
  }

  const dropdownItemStyle = {
    padding: '0.625rem 1rem',
    borderRadius: 'var(--radius-md)',
    margin: '0.125rem 0',
    transition: 'var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: colorMode === 'dark' ? 'var(--neutral-200)' : 'var(--neutral-700)',
    border: '1px solid transparent',
  }

  const dropdownItemHoverStyle = {
    background: colorMode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
    borderColor: colorMode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)',
  }

  return (
    <CDropdown variant="nav-item" onShow={() => setIsOpen(true)} onHide={() => setIsOpen(false)}>
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0 hover-lift"
        caret={false}
        style={{
          cursor: 'pointer',
          transition: 'var(--transition-base)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <CAvatar
          src={avatar8}
          size="md"
          style={{
            border: colorMode === 'dark' ? '2px solid var(--eco-600)' : '2px solid var(--eco-500)',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-base)',
          }}
        />
      </CDropdownToggle>
      <CDropdownMenu
        className="pt-0 animate-fade-eco"
        placement="bottom-end"
        style={dropdownMenuStyle}
      >
        <CDropdownHeader
          style={{
            background: colorMode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            borderRadius: 'var(--radius-md)',
            color: colorMode === 'dark' ? 'var(--eco-300)' : 'var(--eco-700)',
            fontSize: '0.875rem',
            fontWeight: 'var(--fw-semibold)',
            borderBottom: '1px solid transparent',
          }}
        >
          <div className="d-flex align-items-center">
            <CIcon
              icon={cilUser}
              className="me-2"
              style={{
                color: colorMode === 'dark' ? 'var(--eco-400)' : 'var(--eco-600)',
              }}
            />
            <span>Mi Cuenta</span>
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 'var(--fw-regular)',
              color: colorMode === 'dark' ? 'var(--neutral-400)' : 'var(--neutral-500)',
              marginTop: '0.25rem',
            }}
          >
            {user?.nombre || 'Usuario'}
          </div>
        </CDropdownHeader>

        <CDropdownItem
          onClick={() => navigate('/Perfil')}
          style={{ ...dropdownItemStyle, cursor: 'pointer' }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, dropdownItemHoverStyle)}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <CIcon
            icon={cilUser}
            className="me-2"
            style={{
              color: colorMode === 'dark' ? 'var(--eco-400)' : 'var(--eco-600)',
            }}
          />
          <span>Perfil</span>
        </CDropdownItem>

        <CDropdownDivider
          style={{
            margin: '0.5rem 0',
            borderColor: colorMode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
          }}
        />

        <CDropdownDivider
          style={{
            margin: '0.5rem 0',
            borderColor: colorMode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
          }}
        />

        <CDropdownItem
          onClick={() => {
            logout()
            navigate('/login')
          }}
          style={{
            ...dropdownItemStyle,
            background: colorMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            color: colorMode === 'dark' ? '#FCA5A5' : '#DC2626',
          }}
          onMouseEnter={(e) =>
            Object.assign(e.currentTarget.style, {
              background:
                colorMode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              borderColor:
                colorMode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
            })
          }
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              colorMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <CIcon
            icon={cilLockLocked}
            className="me-2"
            style={{
              color: colorMode === 'dark' ? '#FCA5A5' : '#DC2626',
            }}
          />
          <span>Cerrar Sesión</span>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
