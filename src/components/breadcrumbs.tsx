import React, { useMemo } from 'react'

import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'

import type { RouteProp } from '../hoc/sharedRoutes'

interface AppBreadcrumbsProps {
  routes: RouteProp[]
}

const AppBreadcrumbs: React.FC<AppBreadcrumbsProps> = ({ routes }) => {
  const { pathname } = useLocation()

  const items = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const prefixes = segments.map((_, index) => `/${segments.slice(0, index + 1).join('/')}`)
    const paths = prefixes.length ? ['/', ...prefixes] : ['/']

    return paths.map((path, index) => {
      const route = routes.find(({ path: routePath }) => (
        routePath !== '*' && matchPath({ path: routePath.startsWith('/') ? routePath : `/${routePath}`, end: true }, path) != null
      ))
      const segment = path.split('/').filter(Boolean).at(-1)
      const fallbackLabel = segment?.replace(/[-_]/g, ' ').replace(/\b\w/g, character => character.toUpperCase()) ?? 'Home'
      const label = route?.breadcrumb ?? fallbackLabel

      return { path, label, isCurrent: index === paths.length - 1 }
    })
  }, [pathname, routes])

  return (
    <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
      {items.map(({ path, label, isCurrent }) => (
        isCurrent
          ? <Typography color='text.primary' key={path}>{label}</Typography>
          : <Link component={RouterLink} color='inherit' to={path} key={path}>{label}</Link>
      ))}
    </Breadcrumbs>
  )
}

export default React.memo(AppBreadcrumbs)
