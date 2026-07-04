import React from 'react'
import PropTypes from 'prop-types'
import {
  CBadge,
  CNavGroup,
  CNavGroupItems,
  CNavItem,
  CNavTitle,
  CSidebarNav,
} from '@coreui/react'
import { NavLink } from 'react-router-dom'
import CIcon from '@coreui/icons-react'

export const AppSidebarNav = ({ items }) => {
  // Función auxiliar para renderizar el contenido del enlace
  const renderLinkContent = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon && (
          React.cloneElement(icon, {
            className: 'nav-icon',
            style: {
              color: 'inherit',
              transition: 'color 0.25s ease',
              marginRight: indent ? '0.5rem' : '0.75rem',
              fontSize: indent ? '0.75rem' : '0.875rem',
              minWidth: '18px',
              textAlign: 'center'
            }
          })
        )}
        <span 
          style={{ 
            fontWeight: 'var(--fw-medium)',
            transition: 'all 0.2s ease',
            flexGrow: 1,
            fontSize: indent ? '0.75rem' : '0.8rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {name}
        </span>
        {badge && (
          <CBadge 
            color={badge.color} 
            style={{
              fontSize: '0.55rem',
              padding: '0.1rem 0.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--eco-50)',
              color: 'var(--eco-800)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              fontFamily: 'var(--font-primary)',
              fontWeight: 'var(--fw-medium)',
              marginLeft: '0.5rem'
            }}
          >
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  // Renderizar elementos individuales (items sin hijos)
  const renderNavItem = (item, index, indent = false) => {
    const { name, icon, badge, to, ...rest } = item
    
    return (
      <CNavItem
        key={index}
        {...rest}
        style={{
          margin: indent ? '0.1rem 0.25rem' : '0.15rem 0.5rem',
        }}
      >
        <NavLink
          to={to}
          className={({ isActive }) => 
            `nav-link ${indent ? 'nav-item-indent' : ''} ${isActive ? 'active' : ''}`
          }
          style={({ isActive }) => ({
            padding: indent ? '0.35rem 0.5rem' : '0.5rem 0.75rem',
            borderRadius: indent ? 'var(--radius-sm)' : 'var(--radius-md)',
            border: '1px solid transparent',
            transition: 'var(--transition-base)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: isActive ? 'var(--eco-700)' : 'var(--neutral-700)',
            backgroundColor: isActive ? 'rgba(76, 175, 80, 0.08)' : 'transparent',
            borderColor: isActive ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
            fontFamily: 'var(--font-primary)',
            fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)',
            fontSize: indent ? '0.75rem' : '0.8rem',
            cursor: 'pointer',
            width: '100%',
          })}
        >
          {renderLinkContent(name, icon, badge, indent)}
        </NavLink>
      </CNavItem>
    )
  }

  // Renderizar grupos (items con hijos)
  const renderNavGroup = (item, index) => {
    const { name, icon, items: groupItems, ...rest } = item
    
    return (
      <CNavGroup
        key={index}
        toggler={
          <div 
            style={{
              padding: '0.5rem 0.75rem',
              margin: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              transition: 'var(--transition-base)',
              cursor: 'pointer',
              color: 'var(--neutral-700)',
              fontFamily: 'var(--font-primary)',
              fontWeight: 'var(--fw-medium)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {icon && (
              React.cloneElement(icon, {
                className: 'nav-icon',
                style: {
                  color: 'var(--neutral-500)',
                  transition: 'color 0.25s ease',
                  marginRight: '0.75rem',
                  fontSize: '0.875rem',
                  minWidth: '18px',
                  textAlign: 'center'
                }
              })
            )}
            <span 
              style={{ 
                fontWeight: 'var(--fw-medium)',
                transition: 'all 0.2s ease',
                flexGrow: 1,
                fontSize: '0.8rem'
              }}
            >
              {name}
            </span>
            <CIcon 
              icon="cil-chevron-bottom" 
              style={{ 
                fontSize: '0.7rem',
                color: 'var(--neutral-400)',
                transition: 'transform 0.3s ease',
                marginLeft: '0.5rem'
              }}
            />
          </div>
        }
        {...rest}
        style={{
          marginBottom: '0.1rem',
        }}
      >
        {groupItems && (
          <CNavGroupItems 
            style={{
              marginLeft: '1rem',
              borderLeft: '1px solid rgba(76, 175, 80, 0.1)',
              paddingLeft: '0.5rem'
            }}
          >
            {groupItems.map((childItem, idx) =>
              childItem.items ? renderNavGroup(childItem, idx) : renderNavItem(childItem, idx, true)
            )}
          </CNavGroupItems>
        )}
      </CNavGroup>
    )
  }

  return (
    <CSidebarNav 
      style={{
        flex: '1 1 auto',
        padding: '0.5rem 0.25rem 1rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: '100%'
      }}
    >
      {items.map((item, index) => {
        // Títulos
        if (item.component === CNavTitle) {
          return (
            <CNavTitle 
              key={index}
              style={{
                color: 'var(--eco-700)',
                opacity: '0.9',
                fontSize: '0.65rem',
                fontWeight: 'var(--fw-bold)',
                letterSpacing: '0.5px',
                padding: '0.75rem 0.75rem 0.25rem',
                marginTop: index > 0 ? '0.25rem' : '0',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-secondary)',
                borderTop: index > 0 ? '1px solid rgba(76, 175, 80, 0.1)' : 'none'
              }}
            >
              {item.name}
            </CNavTitle>
          )
        }
        
        // Grupos
        if (item.items) {
          return renderNavGroup(item, index)
        }
        
        // Items individuales
        if (item.component === CNavItem) {
          return renderNavItem(item, index, false)
        }
        
        return null
      })}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.array.isRequired,
}