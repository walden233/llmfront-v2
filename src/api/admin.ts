import { get, post, put, del } from './request'
import type { PageResult } from '@/types/api'
import type { Model } from '@/types/model'
import type { Provider, ProviderKey } from '@/types/provider'
import type { User } from '@/types/user'
import type { AssignRoleRequest } from '@/types/auth'
import type { Order } from '@/types/order'

// --- User Management ---
interface ListUsersParams {
  pageNum?: number
  pageSize?: number
  role?: string
  sortBy?: string
  sortOrder?: string
}
export const listUsers = (params: ListUsersParams) => get<PageResult<User>>('/users', { params })

export const assignRole = (payload: AssignRoleRequest) => post<boolean>('/users/assign-role', payload)

// --- Model Management ---

interface ListModelsParams {
  pageNum?: number
  pageSize?: number
  status?: string
  capability?: string
}

export const listModels = (params: ListModelsParams) => get<PageResult<Model>>('/models', { params })

export const createModel = (payload: Partial<Model>) => post<Model>('/models', payload)

export const updateModel = (id: number, payload: Partial<Model>) => put<Model>(`/models/${id}`, payload)

export const deleteModel = (id: number) => del<boolean>(`/models/${id}`)

export const updateModelStatus = (id: number, payload: { status: 0 | 1 }) =>
  post<Model>(`/models/${id}/status`, payload)

// --- Provider Management ---

interface ListProvidersParams {
    pageNum?: number
    pageSize?: number
}

export const listProviders = (params: ListProvidersParams) => get<PageResult<Provider>>('/providers', { params })

export const createProvider = (payload: { name: string, urlBase?: string }) => post<Provider>('/providers', payload)

export const updateProvider = (id: number, payload: { name?: string, urlBase?: string }) => put<Provider>(`/providers/${id}`, payload)

export const deleteProvider = (id: number) => del<boolean>(`/providers/${id}`)

// --- Provider Key Management ---

export const listProviderKeys = (providerId: number) => get<ProviderKey[]>(`/providers/${providerId}/keys`)

export const createProviderKey = (payload: { providerId?: number; providerName?: string; apiKey: string }) =>
  post<ProviderKey>('/providers/keys', payload)

export const updateProviderKeyStatus = (keyId: number, payload: { status: boolean }) =>
  post<ProviderKey>(`/providers/keys/${keyId}/status`, payload)

export const deleteProviderKey = (keyId: number) => del<boolean>(`/providers/keys/${keyId}`)

// --- Order Management (Admin) ---

interface ListOrdersParams {
  pageNum?: number
  pageSize?: number
  status?: string
  userId?: number
}

export const listOrders = (params: ListOrdersParams) => get<PageResult<Order>>('/orders', { params })

