/* eslint-disable react-hooks/rules-of-hooks */
import {
  QueryClient,
  useMutation,
  useQuery as useReactQuery,
  useQueryClient
} from '@tanstack/react-query'

import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'
import upperFirst from 'lodash/upperFirst'

// Api
import { api } from './api'

import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

// Interfaces
// #region
export interface ParamsProps {
  id?: string
  [key: string]: any
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data: T
  error?: any
}

export type HookResultProps<TError, TData = any> =
  | UseMutationResult<ApiResponse<TData>, TError, ParamsProps | undefined>
  | UseMutationResult<ApiResponse<TData>, TError, ParamsProps>
  | UseQueryResult<ApiResponse<TData>, TError>
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

type UseMutateProps = (id: string | null, options: UseMutateOptionsProps) => any

type UseDeleteProps = (options: UseMutateOptionsProps) => any

type UseSetAdditionalEndpointsProps = (arg: { hooks: HooksProps, additionalEndpoints?: AdditionalEndpointsProps[] }) => void

type UseCreateApiProps = (endpoint: string, additionalEndpoints?: AdditionalEndpointsProps[]) => HooksProps

type UseCustomQueryProps = (name: string, endpoint: string) => (queryParams: { id?: string, params?: ObjectStringProps }, options: ObjectStringProps) => any

type UseCustomMutateProps = (
  endpoint: string,
  type: AdditionalEndpointsProps['type']
) => (id: string | null, options: UseMutateOptionsProps & { params?: ObjectStringProps }, config?: ObjectStringProps) => any

type OnSuccessMutateProps = (client: QueryClient, queries: string[][]) => (data: ApiResponse) => void

const isBlob = (value: unknown): value is Blob => {
  return typeof Blob !== 'undefined' && value instanceof Blob
}

const containsBlob = (value: unknown): boolean => {
  if (isBlob(value)) return true
  if (Array.isArray(value)) return value.some(containsBlob)
  if (value !== null && typeof value === 'object') {
    return Object.values(value).some(containsBlob)
  }
  return false
}

const appendFormDataValue = (formData: FormData, key: string, value: unknown): void => {
  if (value === undefined) return
  if (value === null) {
    formData.append(key, 'null')
    return
  }

  if (isBlob(value)) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    if (value.some(containsBlob)) {
      value.forEach(item => appendFormDataValue(formData, key, item))
    } else {
      formData.append(key, JSON.stringify(value))
    }
    return
  }

  if (typeof value === 'object') {
    if (containsBlob(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        appendFormDataValue(formData, `${key}[${childKey}]`, childValue)
      })
    } else {
      formData.append(key, JSON.stringify(value))
    }
    return
  }

  formData.append(key, String(value))
}

const toMultipartFormData = (params: ParamsProps): FormData => {
  const formData = new FormData()
  Object.entries(params).forEach(([key, value]) => appendFormDataValue(formData, key, value))
  return formData
}

// #endregion

/**
 * Returns a callback that invalidates the supplied React Query cache keys.
 *
 * Call the returned function after a change that makes the cached data stale.
 * React Query can then refetch matching active queries. Each query key is
 * represented as an array, matching the `queryKey` format used by
 * `useQuery`.
 *
 * @param queries Query keys to invalidate, for example `[['users'], ['posts', 'recent']]`.
 * @returns A callback that invalidates all supplied query keys.
 *
 * @example
 * ```tsx
 * const invalidateQueries = useInvalidateQueries([['users']])
 *
 * const handleUserSaved = () => {
 *   invalidateQueries()
 * }
 * ```
 */
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

const onSuccessMutate: OnSuccessMutateProps = (client, queries) => async (data) => {
  if (data.status !== 'success') return
  await Promise.all(queries.map(async (query: string[]) => await client.invalidateQueries({ queryKey: query })))
}

const useCustomQuery: UseCustomQueryProps = (name, endpoint) => (queryParams = {}, options = {}) => {
  const { id = null, params = {} } = queryParams

  if (id !== null && id !== '') {
    if (endpoint.includes('{id}')) {
      const newEndpoint = endpoint.replace('{id}', id)
      return useReactQuery<ApiResponse>({ queryKey: [name, newEndpoint], queryFn: () => api.get(newEndpoint), ...options })
    }

    return useReactQuery<ApiResponse>({ queryKey: [name, endpoint], queryFn: () => api.get(`${endpoint}/${id}`), ...options })
  }

  return useReactQuery<ApiResponse>({ queryKey: [name, endpoint], queryFn: () => api.get(endpoint, { params }), ...options })
}

const useCustomMutation: UseCustomMutateProps = (endpoint, type) => (id: string | null, options = {}) => {
  if (endpoint.includes('{id}') && !id) {
    throw new Error(`Endpoint ${endpoint} requires an id in hook implementation, but id is null`)
  }

  const { refetchQueries = [], onSuccess } = options

  const onSuccessMutation = onSuccessMutate(useQueryClient(), [[endpoint], ...refetchQueries])

  return useMutation<ApiResponse, Error, ParamsProps & { formData?: FormData }>({
    mutationFn: (params: ParamsProps & { formData?: FormData }) => {
      let data: ParamsProps | FormData = params
      let paramsOptions = {}
      if (params?.formData) {
        data = params.formData
        const { formData: _, ...rest } = params
        paramsOptions = rest
      } else if (containsBlob(params)) {
        data = toMultipartFormData(params)
      }

      let requestEndpoint = endpoint
      if (id) {
        requestEndpoint = endpoint.includes('{id}')
          ? endpoint.replace('{id}', id)
          : `${endpoint}/${id}`
      }

      switch (type) {
        case 'POST':
          return api.post(requestEndpoint, data, paramsOptions)
        case 'PUT':
          return api.put(requestEndpoint, data, paramsOptions)
        case 'DELETE':
          return api.delete(requestEndpoint, { ...paramsOptions, data })
        default:
          throw new Error(`Unsupported mutation request type: ${type}`)
      }
    },
    onSuccess: (data) => {
      onSuccessMutation(data)
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
      hooks[`use${upperFirst(name)}`] = useCustomMutation(endpoint, type)
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
    // console.log('useMutate called with id:', id, 'and options:', options) // Debugging line
    const { refetchQueries = [] } = options
    const onSuccess = onSuccessMutate(client, [[endpoint], ...refetchQueries])

    if (id) {
      return useMutation<ApiResponse, Error, ParamsProps>({
        mutationFn: (params: ParamsProps) => api.put(
          `${endpoint}/${id}`,
          containsBlob(params) ? toMultipartFormData(params) : params
        ),
        onSuccess,
        ...options
      })
    }

    return useMutation<ApiResponse, Error, ParamsProps>({
      mutationFn: (params: ParamsProps) => api.post(
        endpoint,
        containsBlob(params) ? toMultipartFormData(params) : params
      ),
      onSuccess,
      ...options
    })
  }

  const useDelete: UseDeleteProps = (options = {}) => {
    const { refetchQueries = [] } = options
    const onSuccess = onSuccessMutate(client, [[endpoint], ...refetchQueries])

    return useMutation<ApiResponse, Error, ParamsProps>({
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
  ): UseQueryResult<ApiResponse<TData>, TError> | (() => void) => {
    if ((idRequired && id === undefined) || (paramsRequired && isEmpty(params))) {
      return () => { }
    }

    if (id !== undefined) {
      return useReactQuery<ApiResponse<TData>, TError>({
        queryKey: [endpoint, id],
        queryFn: () => api.get(`${endpoint}/${id}`, { params }),
        ...options
      })
    }

    return useReactQuery<ApiResponse<TData>, TError>({
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
