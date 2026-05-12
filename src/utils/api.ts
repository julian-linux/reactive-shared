import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import set from 'lodash/set'

import { getLocalStorageValue } from './localStorage'

const token = getLocalStorageValue('token')

export let api: AxiosInstance

export let baseUrl: string

/** Axios configuration for make request to api via `react-query` */
export const initApi = (config: AxiosRequestConfig): void => {
  api = axios.create(config)
  baseUrl = config.baseURL || ''

  api.interceptors.request.use(config => {
    set(config, 'headers.Authorization', `Bearer ${token}`)
    return config
  })

  api.interceptors.response.use(
    ({ data }) => data,
    (error) => {
      if (error.message === 'Network Error' || error?.response?.status === 500) {
        throw new Error('general-error')
      }

      if (error?.response?.status === 401) {
        throw new Error('forbidden')
      }

      if (error?.response?.status === 400) {
        throw new Error(error?.response?.data ? JSON.stringify(error.response.data) : 'bad-request')
        // return error?.response?.data
      }
    }
  )
}
