import React from 'react'

import type { TypeSnackBar } from '../components/sharedTypes'

export type TypeStatus = any

export interface BreadcrumbRoute {
  path: string
  label: string
  disabledLink?: boolean
}

export interface AppContextProps {
  status: TypeStatus
  setStatus: React.Dispatch<React.SetStateAction<TypeStatus>>
  snackBarMessage: TypeSnackBar
  setSnackBarMessage: (arg: TypeSnackBar) => void
  pageTitle: string
  setPageTitle: React.Dispatch<React.SetStateAction<string>>
  breadcrumbRoutes: BreadcrumbRoute[] | undefined
  setBreadcrumbRoutes: (routes: BreadcrumbRoute[] | undefined) => void
}

export const AppContext = React.createContext<AppContextProps | undefined>(undefined)
