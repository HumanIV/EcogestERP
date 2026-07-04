import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import CIcon from '@coreui/icons-react'
import { cilArrowCircleLeft, cilArrowCircleRight } from '@coreui/icons'
import LOGO from '../assets/images/WhatsApp Image 2026-02-10 at 1.09.23 PM.jpeg'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const theme = useSelector((state) => state.theme)
  
  const [isHovered, setIsHovered] = useState(false)
  
  const isExpanded = !unfoldable || isHovered
  
  const handleToggle = () => {
    dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })
  }

  return (
    <>
      {sidebarShow && (
        <div 
          className="ecogest-sidebar-backdrop d-lg-none"
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      )}
      
      <aside 
        className={`ecogest-floating-sidebar ${theme === 'dark' ? 'dark-mode' : ''} ${sidebarShow ? 'show' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-brand-container">
          <a href="#/" className="brand-link">
            <div className={`brand-logo ${!isExpanded ? 'small' : 'large'}`}>
              <img src={LOGO} alt="ECOGEST" />
            </div>
            <div className={`brand-text ${!isExpanded ? 'hidden' : ''}`} title={!isExpanded ? 'ECOGEST - Ministerio MINEC' : ''}>
              <h4>ECOGEST</h4>
              <span>Ministerio MINEC</span>
            </div>
          </a>
        </div>

        <div className="sidebar-nav-scroll">
          <AppSidebarNav items={navigation} />
        </div>

        <div className={`sidebar-footer-container ${!isExpanded ? 'centered' : ''}`}>
          <div className={`footer-info ${!isExpanded ? 'hidden' : ''}`}>
            <span className="version">v1.0.0</span>
            <span className="subtitle">SaaS Premium</span>
          </div>
          <button className="collapse-trigger" onClick={handleToggle}>
            <CIcon icon={unfoldable ? cilArrowCircleRight : cilArrowCircleLeft} size="lg" />
          </button>
        </div>
      </aside>
    </>
  )
}

export default React.memo(AppSidebar)