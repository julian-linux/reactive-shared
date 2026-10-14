import React, { Suspense, useMemo } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

import { Routes, Route, Outlet } from 'react-router-dom'

import { Loading } from '../components/loading'

type RouteComponent = ComponentType | LazyExoticComponent<ComponentType>

export interface BuildEntityPageProps {
  routes: Array<{
    index?: boolean
    path?: string
    Component: RouteComponent,
    roles?: string[]
  }>
  rol?: string
}

const BuildEntityPageComponent: React.FC<BuildEntityPageProps> = ({ routes, rol }) => {
  const renderRoutes = useMemo(() => {
    const filteredRoutes: React.ReactElement[] = []

    routes.forEach(({ Component, roles = [], path }) => {
      if (roles.length && rol && !roles.includes(rol)) return

      const LazyComponent = React.isValidElement(Component)
        ? Component
        : 'then' in Component
          ? Component
          : React.lazy(async () => ({ default: Component }))

      filteredRoutes.push(
        <Route
          key={path}
          path={path}
          element={<LazyComponent />}
        />
      )
    })

    return filteredRoutes
  }, [routes, rol])

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          {renderRoutes}
        </Routes>
      </Suspense>
      <Outlet />
    </>
  )
}

export const BuildEntityPage = React.memo(BuildEntityPageComponent)
