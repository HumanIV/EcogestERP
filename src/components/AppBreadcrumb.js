import React from 'react'
import { useLocation } from 'react-router-dom'

import routes from '../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        })
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  const activeRoute = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Inicio'

  return (
    <h2 style={{
      margin: 0,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 800,
      fontSize: '1.75rem',
      letterSpacing: '-0.5px'
    }}>
      {activeRoute}
    </h2>
  )
}

export default React.memo(AppBreadcrumb)
