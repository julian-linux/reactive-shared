import React, { Suspense, type ReactElement } from 'react'

import Box from '@mui/material/Box'

import { HashRouter as Router } from 'react-router-dom'

import SharedRoutes from './sharedRoutes'
import AppBar from '../components/app-bar'
import AppBreadcrumbs from '../components/breadcrumbs'
import { Loading } from '../components/loading'
import { getLocalStorageValue } from '../utils'

import type { RouteProp } from './sharedRoutes'

interface AppRoutesProps {
  logo: any
  MainAppProvider: any
  UserEntity: any
  routes: RouteProp[]
  mainAppHook: any
  customMenuItemComponent: ReactElement | undefined
}

const logged = Boolean(getLocalStorageValue('token'))

const AppRoutesContainer: React.FC<AppRoutesProps> = ({ logo, MainAppProvider, UserEntity, routes, mainAppHook, customMenuItemComponent }) => {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <MainAppProvider>
        {Boolean(logged) && <AppBar mainAppHook={mainAppHook} logo={logo} customItem={customMenuItemComponent} />}
        <Box sx={{ mt: logged ? 7 : 0 }}>
          {Boolean(logged) && <AppBreadcrumbs />}
          <Suspense fallback={<Loading />}>
            <SharedRoutes routes={routes} mainAppHook={mainAppHook} UserEntity={UserEntity} />
          </Suspense>
        </Box>
      </MainAppProvider>
    </Router>
  )
}

export const AppRoutes = React.memo(AppRoutesContainer)
