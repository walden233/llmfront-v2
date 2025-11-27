import { get } from './request'
import type { PageResult } from '@/types/api'
import type { Model } from '@/types/model'

interface ListModelsParams {
  pageNum?: number
  pageSize?: number
  status?: string
  capability?: string
  sortBy?: 'priority' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export const listModels = (params: ListModelsParams) => get<PageResult<Model>>('/models', { params })
