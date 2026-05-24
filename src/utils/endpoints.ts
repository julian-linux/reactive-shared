/* eslint-disable react-hooks/rules-of-hooks,@typescript-eslint/no-empty-function */
import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery as useReactQuery,
  useQueryClient,
  // UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'

import upperFirst from 'lodash/upperFirst'
import isEmpty from 'lodash/isEmpty'
import capitalize from 'lodash/capitalize'

import { AxiosResponse } from 'axios'

// Api
import { api } from './api'

// Interfaces
// #region
export interface ParamsProps {
  id?: string
  [key: string]: any
}

export type HookResultProps<TError, TData = any> =
  | UseMutationResult<AxiosResponse<TData>, TError, ParamsProps | undefined>
  | UseMutationResult<AxiosResponse<TData>, TError, ParamsProps>
  | UseQueryResult<AxiosResponse<TData>, TError>
  | (() => void)

interface ObjectStringProps {
  [key: string]: any
}

export interface HooksProps {
  [key: `use${string}`]: any // Keep this flexible for dynamic properties
}

export interface AdditionalEndpointsProps {
  name: string
  endpoint: string
  type: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

interface UseMutateOptionsProps {
  refetchQueries?: string[][]
  onSuccess?: () => void
}

interface QueryParamsProps {
  id?: string
  params?: HooksProps
}

interface QueryOptionsProps {
  idRequired?: boolean
  paramsRequired?: boolean
  [key: string]: any
}

type UseQueryProps = (queryParams: QueryParamsProps, options: QueryOptionsProps) => any

type UseMutateProps = (id: string | null, options: UseMutateOptionsProps) => any

type UseDeleteProps = (options: UseMutateOptionsProps) => any

type UseSetAdditionalEndpointsProps = (arg: { hooks: HooksProps, additionalEndpoints?: AdditionalEndpointsProps[] }) => void

type UseCreateApiProps = (endpoint: string, additionalEndpoints?: AdditionalEndpointsProps[]) => HooksProps

type UseCustomQueryProps = (name: string, endpoint: string) => (queryParams: { id?: string, params?: ObjectStringProps }, options: ObjectStringProps) => any

type UseCustomMutateProps = (endpoint: string) => (id: string | null, options: UseMutateOptionsProps & { params?: ObjectStringProps }, config?: ObjectStringProps) => any

type OnSuccessMutateProps = (client: QueryClient, queries: string[][]) => (args: { status: string }) => void
// #endregion

export const useInvalidateQueries = (queries: string[][]) => {
  const client = useQueryClient()

  const invalidate = () => {
    try {
      queries.forEach(query => {
        client.invalidateQueries({ queryKey: query })
      })
    } catch (error) {
      console.error('Error invalidating queries:', error)

    }
  }

  return invalidate
}

const onSuccessMutate: OnSuccessMutateProps = (client, queries) => async ({ status }) => {
  if (status !== 'success') return
  await Promise.all(queries.map(async (query: string[]) => await client.invalidateQueries({ queryKey: query })))
}

const useCustomQuery: UseCustomQueryProps = (name, endpoint) => (queryParams = {}, options = {}) => {
  const { id = null, params = {} } = queryParams

  if (id !== null && id !== '') {
    if (endpoint.includes('{id}')) {
      const newEndpoint = endpoint.replace('{id}', id)
      return useReactQuery({ queryKey: [name, newEndpoint], queryFn: () => api.get(newEndpoint), ...options })
    }

    return useReactQuery({ queryKey: [name, endpoint], queryFn: () => api.get(`${endpoint}/${id}`), ...options })
  }

  return useReactQuery({ queryKey: [name, endpoint], queryFn: () => api.get(endpoint, { params }), ...options })
}

const useCustomMutation: UseCustomMutateProps = (endpoint) => (id: string | null, options = {}, config = {}) => {
  if (endpoint.includes('{id}') && !id) {
    throw new Error(`Endpoint ${endpoint} requires an id in hook implementation, but id is null`)
  }

  const { refetchQueries = [], onSuccess, params = {} } = options

  const onSuccessMutation = onSuccessMutate(useQueryClient(), [[endpoint], ...refetchQueries])


  return useMutation({
    mutationFn: (formData) => {
      let data = formData
      let paramsOptions = {}
      if (formData.formData) {
        data = formData.formData
        delete formData.formData
        paramsOptions = formData
      }

      if (id) {
        if (endpoint.includes('{id}')) {
          const newEndpoint = endpoint.replace('{id}', id)
          return api.put(newEndpoint, data, paramsOptions)
        }

        return api.put(`${endpoint}/${id}`, data, paramsOptions)
      }
      return api.post(endpoint, data, paramsOptions)
    },
    onSuccess: () => {
      onSuccessMutation({ status: 'success' })
      if (onSuccess) {
        onSuccess()
      }
    },
    ...options
  })
}

/* If `additionalEndpoints` comes, must be an array of {name, endpoint, type} and will be added as ´use${upperFirst(name)}´ hook */
const useSetAdditionalEndpoints: UseSetAdditionalEndpointsProps = ({ hooks, additionalEndpoints = [] }) => {
  additionalEndpoints.forEach(({ name, endpoint, type }) => {
    if (type === 'GET') {
      hooks[`use${upperFirst(name)}`] = useCustomQuery(name, endpoint)
    } else {
      hooks[`use${upperFirst(name)}`] = useCustomMutation(endpoint)
    }
  })
}

/**
 * every entity must have `config/context` file with the following basic code
 * ````
 * ...
 * import React, {ReactElement, ReactNode, useContext} from 'react'
 * const api = useCreateApi('sauce')
 * const SauceAppContext = React.createContext<HooksProps | undefined>(undefined)
 * const SauceAppProviderComponent: React.FC<{ children?: ReactNode }> = ({children}): ReactElement => {
 *   return (
 *     <SauceAppContext.Provider value={api}>
 *       {children}
 *     </SauceAppContext.Provider>
 *   )
 * }
 *
 * export const useSauceAppContext = (): HooksProps => {
 * const context = useContext(SauceAppContext)
 *
 * if (context === undefined) {
 *     throw new Error("AppContext must be within AppProvider -- in Sauce")
 * }
 *
 *  return context
 * }
 *
 *  export const SauceAppProvider = React.memo(SauceAppProviderComponent)
 * ````
 * if `additionalEndpoints` comes, must be an array of {name, endpoint, type} and will be added as ´use${upperFirst(name)}´ hook
 *
 * @param {string} endpoint - endpoint url
 * @param {AdditionalEndpointsProps[] | undefined} additionalEndpoints - set of additional endpoints
 * @returns react-query hooks for insert in entity context
 */
export const useCreateApi: UseCreateApiProps = (endpoint: string, additionalEndpoints: AdditionalEndpointsProps[] | undefined) => {
  if (api === undefined) {
    throw new Error('No Api configured')
  }

  const client = useQueryClient()

  const entity = capitalize(endpoint)

  const useMutate: UseMutateProps = (id = null, options = {}) => {
    const { refetchQueries = [] } = options
    const onSuccess = onSuccessMutate(client, [[endpoint], ...refetchQueries])

    if (id) {
      return useMutation({
        mutationFn: (params: ParamsProps) => api.put(`${endpoint}/${id}`, params),
        onSuccess,
        ...options
      })
    }

    return useMutation({
      mutationFn: (params: ParamsProps) => api.post(endpoint, params),
      onSuccess,
      ...options
    })
  }

  const useDelete: UseDeleteProps = (options = {}) => {
    const { refetchQueries = [] } = options
    const onSuccess = onSuccessMutate(client, [endpoint, ...refetchQueries])

    return useMutation({
      mutationFn: ({ id, ...params }: ParamsProps) => {
        return api.delete(`${endpoint}/${id ?? ''}`, params)
      },
      onSuccess,
      ...options
    })
  }

  /**
   * @typedef {Object} params - options needed for make requests params are exclusive, id or params. If need to search by id too, insert id on params
   * @param {string | number | undefined} id - id of record
   * @param {ParamsProps} params - params for search
   * @param {boolean} idRequired - if the request needs id as mandatory
   * @param {boolean} paramsRequired - if the request needs id as mandatory
   * @param {*} options :options of react-query useQuery
   * @returns
   */
  const useQuery = <TData = any, TError = any>(
    { id = undefined, params = {} } = {},
    { idRequired = false, paramsRequired = false, ...options } = {}
  ): UseQueryResult<AxiosResponse<TData>, TError> | (() => void) => {
    if ((idRequired && id === undefined) || (paramsRequired && isEmpty(params))) {
      return () => { }
    }

    if (id !== undefined) {
      return useReactQuery<AxiosResponse<TData>, TError>({
        queryKey: [endpoint, id],
        queryFn: () => api.get(`${endpoint}/${id}`, { params }),
        ...options
      })
    }

    return useReactQuery<AxiosResponse<TData>, TError>({
      queryKey: [endpoint, params],
      queryFn: () => api.get(endpoint, { params }),
      ...options
    })
  }

  const hooks = {
    [`use${entity}Delete`]: useDelete,
    [`use${entity}Mutate`]: useMutate,
    [`use${entity}Query`]: useQuery
  }

  if (additionalEndpoints != null) {
    useSetAdditionalEndpoints({ hooks, additionalEndpoints })
  }

  return hooks
}

/** Create request hooks only with additionalEndpoints configuration */
export const createCustomApi = (additionalEndpoints: AdditionalEndpointsProps[]): HooksProps => {
  if (api === undefined) {
    throw new Error('No Api configured')
  }

  const hooks = {}

  useSetAdditionalEndpoints({ hooks, additionalEndpoints })

  return hooks
}
