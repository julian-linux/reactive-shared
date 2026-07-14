import React, { useMemo } from 'react'
import type { ComponentType } from 'react'

import { Routes, Route, Outlet } from 'react-router-dom'

export interface BuildEntityPageProps {
  routes: Array<{
    index?: boolean
    path?: string
    Component: ComponentType,
    roles?: string[]
  }>
  rol?: string
}

const BuildEntityPageComponent: React.FC<BuildEntityPageProps> = ({ routes, rol }) => {
  const renderRoutes = useMemo(() => {
    const filteredRoutes: React.ReactElement[] = []

    routes.forEach(({ Component, roles = [], path }) => {
      if (roles.length && rol && !roles.includes(rol)) return
      filteredRoutes.push(<Route key={path} path={path} element={<Component />} />)
    })

    return filteredRoutes
  }, [routes, rol])

  return (
    <>
      <Routes>
        {renderRoutes}
      </Routes>
      <Outlet />
    </>
  )
}

export const BuildEntityPage = React.memo(BuildEntityPageComponent)
