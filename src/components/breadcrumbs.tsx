import React, { useMemo } from 'react'

import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'

import { Link as RouterLink, useLocation } from 'react-router-dom'

import { useAppContext } from '../hoc/hooks'
import { Intl } from '../utils'

const AppBreadcrumbs: React.FC = () => {
  const { pathname } = useLocation()
  const { breadcrumbRoutes } = useAppContext()

  const items = useMemo(() => {
    if (breadcrumbRoutes !== undefined) {
      return breadcrumbRoutes.map(({ path, label, disabledLink = false }, index) => ({
        path,
        label,
        disabledLink,
        isCurrent: index === breadcrumbRoutes.length - 1
      }))
    }

    const segments = pathname.split('/').filter(Boolean)
    const prefixes = segments.map((_, index) => `/${segments.slice(0, index + 1).join('/')}`)
    const paths = prefixes.length ? ['/', ...prefixes] : ['/']

    return paths.map((path, index) => {
      const segment = path.split('/').filter(Boolean).at(-1)
      const fallbackLabel = segment?.replace(/[-_]/g, ' ').replace(/\b\w/g, character => character.toUpperCase()) ?? 'Home'

      return { path, label: fallbackLabel, isCurrent: index === paths.length - 1, disabledLink: false }
    })
  }, [breadcrumbRoutes, pathname])

  return (
    <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
      {items.map(({ path, label, isCurrent, disabledLink }) => {
        const langKey = `BREADCRUMS.${label.toUpperCase()}`

        return (
          isCurrent || disabledLink
            ? <Intl langKey={langKey} color={isCurrent ? 'text.primary' : 'text.disabled'} component='span' key={path} />
            : <Link component={RouterLink} color='inherit' to={path} key={path}><Intl langKey={langKey} /></Link>
        )
      })}
    </Breadcrumbs>
  )
}

export default React.memo(AppBreadcrumbs)
