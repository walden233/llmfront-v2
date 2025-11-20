import { get, post, del } from './request'
import type { AccessKeyItem, CreateAccessKeyResponse } from '@/types/access-key'

export const listAccessKeys = () => get<AccessKeyItem[]>('/access-keys')

export const createAccessKey = () => post<CreateAccessKeyResponse>('/access-keys')

export const deleteAccessKey = (id: number) => del<boolean>(`/access-keys/${id}`)
