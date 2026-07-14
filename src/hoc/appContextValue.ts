import React from 'react'

import type { TypeSnackBar } from '../components/sharedTypes'

export type TypeStatus = any

export interface AppContextProps {
  status: TypeStatus
  setStatus: React.Dispatch<React.SetStateAction<TypeStatus>>
  snackBarMessage: TypeSnackBar
  setSnackBarMessage: (arg: TypeSnackBar) => void
  pageTitle: string
  setPageTitle: React.Dispatch<React.SetStateAction<string>>
}

export const AppContext = React.createContext<AppContextProps | undefined>(undefined)
