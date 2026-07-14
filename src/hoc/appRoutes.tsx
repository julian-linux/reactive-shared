import React, { Suspense } from 'react'

import Box from '@mui/material/Box'

import { HashRouter as Router } from 'react-router-dom'

import SharedRoutes from './sharedRoutes'
import AppBar from '../components/app-bar'
import { Loading } from '../components/loading'
import { getLocalStorageValue } from '../utils'

import type { RouteProp } from './sharedRoutes'

interface AppRoutesProps {
  logo: any
  UserEntity: any
  MainAppProvider: any
  mainAppHook: any
  routes: RouteProp[]
  /** routes excluded for check if user is logged */
  excluded?: string[]
  rol?: string
}

const logged = Boolean(getLocalStorageValue('token'))

const AppRoutesContainer: React.FC<AppRoutesProps> = ({ logo, MainAppProvider, UserEntity, routes, mainAppHook }) => {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <MainAppProvider>
        {Boolean(logged) && <AppBar mainAppHook={mainAppHook} logo={logo} />}
        <Box sx={{ mt: logged ? 8 : 0 }}>
          <Suspense fallback={<Loading />}>
            <SharedRoutes routes={routes} mainAppHook={mainAppHook} UserEntity={UserEntity} />
          </Suspense>
        </Box>
      </MainAppProvider>
    </Router>
  )
}

export const AppRoutes = React.memo(AppRoutesContainer)
