import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode, ReactElement } from 'react'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { AppContext, type AppContextProps, type BreadcrumbRoute, type TypeStatus } from './appContextValue'
import { SnackBar } from '../components/snackBar'

import type { TypeSnackBar } from '../components/sharedTypes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60
    }
  }
})

const AppProviderComponent: React.FC<{ children?: ReactNode, debugReactQuery?: boolean }> = ({ children, debugReactQuery = false }): ReactElement => {
  const [status, setStatus] = useState<TypeStatus>()
  const [snackBarMessage, setSnackBarMessage] = useState<TypeSnackBar>()
  const [pageTitle, setPageTitle] = useState('')
  const [breadcrumbRoutes, setBreadcrumbRoutesState] = useState<BreadcrumbRoute[] | undefined>()
  const [isPrinting, setIsPrinting] = useState(false)

  const setBreadcrumbRoutes = useCallback((routes: BreadcrumbRoute[] | undefined): void => {
    setBreadcrumbRoutesState(currentRoutes => {
      if (currentRoutes === routes) return currentRoutes
      if (currentRoutes == null || routes == null || currentRoutes.length !== routes.length) return routes

      const routesMatch = currentRoutes.every((currentRoute, index) => {
        const nextRoute = routes[index]
        if (nextRoute == null) return false

        return currentRoute.path === nextRoute.path &&
          currentRoute.label === nextRoute.label &&
          currentRoute.disabledLink === nextRoute.disabledLink
      })

      return routesMatch ? currentRoutes : routes
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia('print')
    const handleBeforePrint = (): void => setIsPrinting(true)
    const handleAfterPrint = (): void => setIsPrinting(false)
    const handleMediaChange = (event: MediaQueryListEvent): void => setIsPrinting(event.matches)

    setIsPrinting(mediaQuery.matches)
    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  const value = useMemo<AppContextProps>(() => ({
    status,
    setStatus,
    snackBarMessage,
    setSnackBarMessage,
    pageTitle,
    setPageTitle,
    breadcrumbRoutes,
    setBreadcrumbRoutes
  }), [status, snackBarMessage, pageTitle, breadcrumbRoutes, setBreadcrumbRoutes])

  return (
    <AppContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
        <SnackBar snackBarMessage={snackBarMessage} setSnackBarMessage={setSnackBarMessage} />
        {debugReactQuery && !isPrinting && <ReactQueryDevtools />}

      </QueryClientProvider>
    </AppContext.Provider>
  )
}

export const AppProvider = React.memo(AppProviderComponent)
