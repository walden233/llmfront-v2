export interface ModelStatisticsQuery {
  modelId?: number
  modelIdentifier?: string
  date?: string
  startDate?: string
  endDate?: string
}

export interface ModelStatisticsItem {
  modelId?: number
  modelIdentifier?: string
  statDate: string
  totalRequests: number
  successCount: number
  failureCount: number
}

export interface UsageLogQuery {
  userId?: number
  accessKeyId?: number
  modelId?: number
  isSuccess?: boolean
  isAsync?: boolean
  startTime?: string
  endTime?: string
  limit?: number
  sortDesc?: boolean
}

export interface UsageLogItem {
  id?: string
  userId?: number
  accessKeyId?: number
  modelId?: number
  modelIdentifier?: string
  promptTokens?: number
  completionTokens?: number
  imageCount?: number
  cost?: number
  isAsync: boolean
  isSuccess: boolean
  createTime: string
}
