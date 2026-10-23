import React, { useMemo } from 'react'

import { Routes, Route } from 'react-router-dom'

import { NotFound } from '../components/notFound'
import { getLocalStorageValue } from '../utils'

const logged = Boolean(getLocalStorageValue('token'))

export interface RouteProp {
  path: string
  Element: any
  roles?: string[]
  disabled?: boolean | ((status: any)=> boolean)
}

interface SharedRoutesProps {
  routes: RouteProp[]
  mainAppHook: any
  UserEntity: any
}

const SharedRoutes: React.FC<SharedRoutesProps> = ({ routes, mainAppHook, UserEntity }) => {
  const { status } = mainAppHook()

  const renderRoutes = useMemo(() => {
    if (!logged) return []

    const filteredRoutes: React.ReactElement[] = []

    routes.forEach(({ Element, roles = [], path, disabled }) => {
      if (roles.length && status?.rol && !roles.includes(status.rol)) return
      if (disabled === true) return
      if (typeof disabled === 'function' && disabled(status)) return
      filteredRoutes.push(<Route key={path} path={path} element={<Element />} />)
    })

    return filteredRoutes
  }, [routes, status])

  return (
    <Routes>
      {renderRoutes}
      <Route key='user/*' path='/user/*' element={<UserEntity />} />
      <Route key='not_found' path='*' element={<NotFound />} />
    </Routes>
  )
}

export default React.memo(SharedRoutes)
