import type { AxiosRequestConfig } from 'axios'
import http from './http'
import type { Result } from '@/types/api'

const request = async <T>(config: AxiosRequestConfig) => {
  const response = await http.request<Result<T>>(config)
  return response.data.data
}

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>({ ...(config || {}), method: 'GET', url })

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...(config || {}), method: 'POST', url, data })

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>({ ...(config || {}), method: 'DELETE', url })

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  request<T>({ ...(config || {}), method: 'PUT', url, data })
