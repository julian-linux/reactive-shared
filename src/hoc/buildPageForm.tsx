import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import { useParams } from 'react-router-dom'

import each from 'lodash/each'
import isEmpty from 'lodash/isEmpty'

import { useAppContext } from './hooks'
import { CreateForm } from '../components/form'
import { Loading } from '../components/loading'
import { onlyText } from '../utils/intlHelpers'

import type { BuildFormProps, InputsFormConfigProps } from '../components/form'
import type { HookResultProps } from '../utils/endpoints'
import type {
  UseMutateFunction,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

interface AnyParams { [key: string]: any }
export type UseMutateActionProps = (id: number | string, useMutateOptions: UseMutationOptions) => HookResultProps<any, any>
export type BeforeMutateActionProps = (formData: { [key: string]: any }, mutate: UseMutateFunction<unknown, unknown, unknown>) => void
export type UseQueryActionProps = (params: { id: number | string, params: AnyParams | undefined }, options: UseQueryOptions & { idRequired: boolean }) => UseQueryResult
export type AfterMutateActionProps = (id: number | string | null, mutateData: any, error: any) => void
export type AfterQueryActionProps = (formData: AnyParams, data: AnyParams) => void

export interface ActionsProps {
  /**
   * Hook for get all the form data before send request
   *
   * @param {BuildFormProps} formData - Data build by form inputs
   * @param {(formData:{[key]: any})=>void} mutate - function for make request
   */
  beforeMutate?: BeforeMutateActionProps
  useMutate: UseMutateActionProps
  useMutateOptions?: any
  afterMutate: AfterMutateActionProps
  useQuery?: UseQueryActionProps
  useQueryParams?: AnyParams
  useQueryOptions?: UseQueryOptions
  afterQuery?: AfterQueryActionProps
}

export interface BuildPageFormProps {
  entity?: string
  pageTitle?: string
  buildFormProps: BuildFormProps
  actions: ActionsProps
  removeIdFromForm?: boolean
  onBackAction?: () => void
  fixedActionsBottom?: boolean
}
// #endregion

const BuildPageFormContainer: React.FC<BuildPageFormProps> = ({
  entity,
  pageTitle = '',
  removeIdFromForm = false,
  onBackAction,
  fixedActionsBottom = false,
  buildFormProps: {
    defaultSuccessMessage = true,
    noBackButton = false,
    disabled = false,
    confirmButtonLangkey,
    inputsFormConfig,
    formBoxProps = {}
  },
  actions: {
    beforeMutate,
    useMutate,
    useMutateOptions = {},
    afterMutate,
    useQuery = () => ({}),
    useQueryParams,
    useQueryOptions = {},
    afterQuery
  }
}) => {
  const { setPageTitle, setSnackBarMessage } = useAppContext()
  let { id = '' } = useParams()
  id = id || useQueryParams?.id || ''

  const [newId] = useState(removeIdFromForm ? '' : id)

  const afterQueryCalled = useRef(false)
  const dataSet = useRef(false)

  const { mutate, isSuccess, error, isPending: adding, data: mutateData }: any = useMutate(newId, useMutateOptions)

  const options = useMemo(() => {
    return {
      enabled: Boolean(id),
      idRequired: true,
      ...useQueryOptions
    } as UseQueryOptions & { idRequired: boolean }
  }, [id, useQueryOptions])

  const { isLoading = false, data: queryData = {} }: any = useQuery({ id, params: useQueryParams }, options)

  const handleSubmit = useCallback((formData: { [k: string]: any }) => {
    if (beforeMutate != null) {
      beforeMutate(formData, mutate)
    } else {
      mutate(formData)
    }
  }, [beforeMutate, mutate])

  const errors = useMemo(() => {
    if (error) {
      const errors = JSON.parse(error?.message || '{}')
      return errors?.errors || {}
    }

    return {}
  }, [error])

  /** set data for form */
  const formData = useMemo<InputsFormConfigProps>(() => {
    const { data = {} } = queryData

    if (!id || isEmpty(data)) return inputsFormConfig

    if (!dataSet.current) {
      dataSet.current = true
      each(inputsFormConfig, fieldProps => {
        if (data[fieldProps.name] !== undefined) {
          fieldProps.value = data[fieldProps.name]
          fieldProps.disabled = false
        }
      })
    }

    if (afterQuery != null && !afterQueryCalled.current) {
      afterQueryCalled.current = true
      afterQuery(inputsFormConfig, data)
    }

    return inputsFormConfig
  }, [queryData, inputsFormConfig, afterQuery, id])

  const confirmButtonText = useMemo(() => {
    if (confirmButtonLangkey !== undefined) return confirmButtonLangkey
    if (newId !== '') return 'GENERAL.EDIT'
    return 'GENERAL.ADD'
  }, [confirmButtonLangkey, newId])

  /** set title */
  useEffect(() => {
    if (pageTitle !== '') {
      setPageTitle(onlyText(pageTitle))
    } else if (entity !== undefined) {
      const title = `${entity.toLocaleUpperCase()}.${newId !== '' ? 'EDIT' : 'ADD'}.TITLE`
      setPageTitle(onlyText(title))
    }
  }, [id, newId, setPageTitle, entity, pageTitle])

  /** when a mutation is made */
  useEffect(() => {
    if (isSuccess === true && mutateData?.status === 'success') {
      if (defaultSuccessMessage) {
        setSnackBarMessage(onlyText('GENERAL.ADD_SUCCESS'))
      }

      if (error !== null && mutateData?.data !== undefined) {
        throw new Error('something is wrong with response format')
      }

      afterMutate(id, mutateData?.data, error)
    }

    if (error instanceof Error) {
      setSnackBarMessage({ message: onlyText('GENERAL.ERROR'), severity: 'error' })
    }
  },
    [isSuccess, error, mutateData, id, afterMutate, setSnackBarMessage, defaultSuccessMessage]
  )

  if (options.enabled && (isLoading === true || isEmpty(queryData))) {
    return <Loading backdrop />
  }

  return (
    <Paper>
      <Box sx={{ mt: 2, p: 2 }}>
        <CreateForm
          loading={adding}
          disabled={disabled}
          noBackButton={noBackButton}
          {...(onBackAction && { onBackAction })}
          confirmButtonLangkey={confirmButtonText}
          inputsFormConfig={formData}
          responseErrors={errors}
          onSubmit={handleSubmit}
          formBoxProps={formBoxProps}
          fixedActionsBottom={fixedActionsBottom}
        />
      </Box>
    </Paper>
  )
}

export const BuildPageForm = React.memo(BuildPageFormContainer)
