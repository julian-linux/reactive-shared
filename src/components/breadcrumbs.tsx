import React, { useEffect, useMemo, useRef } from 'react'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'

import { Link as RouterLink, useLocation } from 'react-router-dom'

import { useAppContext } from '../hoc/hooks'
import { Intl } from '../utils'

const breadcrumbSx = {
  mb: 2,
  px: 2,
  py: 1,
  borderRadius: 2,
  '& .MuiBreadcrumbs-ol': {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.5
  },
  '& .MuiBreadcrumbs-separator': {
    mx: 0.25,
    color: 'text.disabled',
    display: 'flex'
  }
}

const linkSx = {
  '&:hover': {
    bgcolor: 'action.hover',
    borderColor: 'primary.main',
    color: 'primary.main',
    transform: 'translateY(-1px)'
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2
  }
}

const itemSx = (isCurrent: boolean, disabledLink: boolean) => ({
  display: 'inline-flex',
  alignItems: 'center',
  px: 1.5,
  py: 0.75,
  borderRadius: 999,
  border: '1px solid',
  borderColor: isCurrent ? 'primary.main' : 'divider',
  bgcolor: isCurrent ? 'primary.main' : disabledLink ? 'action.disabledBackground' : 'background.paper',
  color: isCurrent ? 'primary.contrastText' : disabledLink ? 'text.disabled' : 'text.secondary',
  fontSize: '0.875rem',
  fontWeight: isCurrent ? 600 : 500,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease'
})

const AppBreadcrumbs: React.FC = () => {
  const { pathname } = useLocation()
  const { breadcrumbRoutes, setBreadcrumbRoutes } = useAppContext()
  const previousPathname = useRef(pathname)
  const pathnameChanged = previousPathname.current !== pathname
  const activeBreadcrumbRoutes = pathnameChanged ? undefined : breadcrumbRoutes

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setBreadcrumbRoutes(undefined)
      previousPathname.current = pathname
    }
  }, [pathname, setBreadcrumbRoutes])

  const items = useMemo(() => {
    if (activeBreadcrumbRoutes !== undefined) {
      return activeBreadcrumbRoutes.map(({ path, label, disabledLink = false }, index) => ({
        path,
        label,
        disabledLink,
        isTranslated: true,
        isCurrent: index === activeBreadcrumbRoutes.length - 1
      }))
    }

    const segments = pathname.split('/').filter(Boolean)
    const prefixes = segments.map((_, index) => `/${segments.slice(0, index + 1).join('/')}`)
    const paths = prefixes.length ? ['/', ...prefixes] : ['/']

    return paths.map((path, index) => {
      const segment = path.split('/').filter(Boolean).at(-1)
      const fallbackLabel = segment?.replace(/[-_]/g, ' ').replace(/\b\w/g, character => character.toUpperCase()) ?? 'Home'

      return { path, label: fallbackLabel, isCurrent: index === paths.length - 1, disabledLink: false, isTranslated: false }
    })
  }, [activeBreadcrumbRoutes, pathname])

  return (
    <Breadcrumbs
      aria-label='breadcrumb'
      separator={<ChevronRightIcon fontSize='small' />}
      sx={breadcrumbSx}
    >
      {items.map(({ path, label, isCurrent, disabledLink, isTranslated }) => {
        const langKey = `BREADCRUMS.${label.toUpperCase()}`
        const labelContent = isTranslated
          ? label
          : <Intl langKey={langKey} component='span' sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }} />
        const sx = itemSx(isCurrent, disabledLink)

        return (
          isCurrent || disabledLink
            ? <Box component='span' sx={sx} key={path}>
              {labelContent}
            </Box>
            : <Link
              component={RouterLink}
              underline='none'
              sx={{ ...sx, ...linkSx }}
              to={path}
              key={path}
            >
              {labelContent}
            </Link>
        )
      })}
    </Breadcrumbs>
  )
}

export default React.memo(AppBreadcrumbs)
