/**
 * ENTITY: normal name. ie: user
 * ENTITY_P: users
 * ENTITY_C: User
 * ENTITY_CP: Users
 * ENTITY_U: USER
 */


const CONFIG_USE_CONTEXT = `
import { createContext, useContext } from 'react'

import type { HooksProps } from 'reactive-shared'

export const {ENTITY_C}AppContext = React.createContext<HooksProps | undefined>(undefined)

export default (): HooksProps => {
  const context = useContext({ENTITY_C}AppContext)

  if (context === undefined) {
    throw new Error('AppContext must be within AppProvider -- in {ENTITY_C}')
  }

  return context
}
`

const CONFIG_CONTEXT = `
import React from 'react'
import type { ReactElement, ReactNode } from 'react'

import { useCreateApi } from 'reactive-shared'

import { {ENTITY_C}AppContext } from './useContext'

const {ENTITY_C}AppProviderComponent: React.FC<{ children?: ReactNode }> = ({ children }): ReactElement => {
  const api = useCreateApi('{ENTITY_P}')

  return (
    <{ENTITY_C}AppContext.Provider value={api}>
      {children}
    </{ENTITY_C}AppContext.Provider>
  )
}

export const {ENTITY_C}AppProvider = React.memo({ENTITY_C}AppProviderComponent)
`

const CONFIG_TYPES = `
export interface {ENTITY_C}Props {
  id?: string
  name?: string
}
`

const PAGES_INDEX = `
// Libraries
import React from 'react'

// Pages
import {ENTITY_C}ListPage from 'entities/{ENTITY}/pages/list'
import {ENTITY_C}AddPage from 'entities/{ENTITY}/pages/add'

// HoC
import { BuildEntityPage } from 'reactive-shared'

// Context
import { {ENTITY_C}AppProvider } from 'entities/{ENTITY}/config/context'

const configRoutes = [
  {
    path: '/',
    Component: {ENTITY_C}ListPage
  },
  {
    path: 'add',
    Component: {ENTITY_C}AddPage
  },
  {
    path: 'add/:id',
    Component: {ENTITY_C}AddPage
  }
]

const {ENTITY_C}Home: React.FC = () => {
  return (
    <{ENTITY_C}AppProvider>
      <BuildEntityPage routes={configRoutes} />
    </{ENTITY_C}AppProvider>
  )
}

export default React.memo({ENTITY_C}Home)
`

const PAGES_ADD_INDEX = `
// Libraries
import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'

// Shared
import {
  BuildPageForm,
  AfterMutateActionProps,
  ActionsProps
} from 'reactive-shared'

// Context
import  use{ENTITY_C}AppContext from 'entities/{ENTITY}/config/useContext'

// Config
import buildFormProps from './buildFormProps'

const {ENTITY_C}PageAdd: React.FC = () => {
  const navigate = useNavigate()
  const { use{ENTITY_CP}Mutate, use{ENTITY_CP}Query } = use{ENTITY_C}AppContext()

  const afterMutate = useCallback<AfterMutateActionProps>((_, postData, error) => {
    if (!error && postData) {
      navigate('/{ENTITY}')
    }
  }, [navigate])

  const actions = useMemo<ActionsProps>((): any => ({
    useQuery: use{ENTITY_CP}Query,
    useMutate: use{ENTITY_CP}Mutate,
    afterMutate
  }), [use{ENTITY_CP}Query, use{ENTITY_CP}Mutate, afterMutate])

  return (
    <BuildPageForm
      entity='{ENTITY_U}'
      buildFormProps={cloneDeep(buildFormProps)}
      actions={actions}
    />
  )
}

export default React.memo({ENTITY_C}PageAdd)
`

const PAGES_ADD_BUILDFORMPROPS = `
import * as yup from 'yup'
import keyBy from 'lodash/keyBy'

// Shared
import { InputProps, BuildFormProps } from 'reactive-shared'

const fieldsConfig: InputProps[] = [
  {
    name: 'name',
    type: 'text',
    label: '{ENTITY_U}.LABEL.NAME',
    yupValidation: yup.string().required()
  }
]

const buildFormProps: BuildFormProps = {
  inputsFormConfig: keyBy(fieldsConfig, 'name')
}

export default buildFormProps
`

const PAGES_LIST_INDEX = `
import React, { useMemo } from 'react'

// Icons
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

// Shared
import { BuildPageList, Intl, DialogOptionsProps, useAppContext, onlyText } from 'reactive-shared'

// Context
import use{ENTITY_C}AppContext from 'entities/{ENTITY}/config/useContext'

// {ENTITY_C}Item
import {ENTITY_C}Item from 'entities/{ENTITY}/pages/list/item'

const {ENTITY_C}PageList: React.FC = () => {
  const { setSnackBarMessage } = useAppContext()
  const { use{ENTITY_CP}Query, use{ENTITY_CP}Delete } = use{ENTITY_C}AppContext()

  const { mutate } = use{ENTITY_CP}Delete()

  const dialogOptions: DialogOptionsProps = useMemo(() => {
    return {
      edit: {
        icon: <EditIcon />,
        text: <Intl langKey='{ENTITY_U}.EDIT.TITLE' />,
        to: '/{ENTITY}/add'
      },
      delete: {
        icon: <DeleteIcon color='secondary' />,
        text: <Intl
          color='secondary'
          langKey='{ENTITY_U}.DELETE.TITLE'
              />,
        onConfirm: async ({ id }) => {
          await mutate({ id })
          setSnackBarMessage(onlyText('{ENTITY_U}.DELETE.SUCCESS'))
        }
      }
    }
  }, [mutate, setSnackBarMessage])

  return (
    <BuildPageList
      useQuery={use{ENTITY_CP}Query}
      addRoute='/{ENTITY}/add'
      pageTitle='{ENTITY_U}.LIST.TITLE'
      dialogOptions={dialogOptions}
      ItemComponent={{ENTITY_C}Item}
    />
  )
}

export default React.memo({ENTITY_C}PageList)
`

const PAGES_LIST_ITEM = `
// Libraries
import React from 'react'

// Material Components
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'

// Shared
import { ItemName } from 'reactive-shared'

// Interfaces
import { {ENTITY_C}Props } from 'entities/{ENTITY}/config/types'

interface {ENTITY_C}ItemProps {
  item: {ENTITY_C}Props
  onSelect: any
}

const {ENTITY_C}Item: React.FC<{ENTITY_C}ItemProps> = ({ item, onSelect }) => {
  return (
    <ListItemButton onClick={onSelect(item)} divider>
      <ListItemAvatar>
        <ItemName name={item.name!} />
      </ListItemAvatar>
      <ListItemText primary={item.name} />
    </ListItemButton>
  )
}

export default React.memo({ENTITY_C}Item)
`

module.exports = {
  CONFIG_USE_CONTEXT,
  CONFIG_CONTEXT,
  CONFIG_TYPES,
  PAGES_INDEX,
  PAGES_ADD_INDEX,
  PAGES_ADD_BUILDFORMPROPS,
  PAGES_LIST_INDEX,
  PAGES_LIST_ITEM
}
