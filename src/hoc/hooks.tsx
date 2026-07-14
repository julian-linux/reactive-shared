import { useContext } from 'react'

import { AppContext, type AppContextProps } from './appContextValue'

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('AppContext must be within AppProvider')
  }

  return context
}
