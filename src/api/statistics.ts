import { get, post } from './request'
import type {
  ModelStatisticsItem,
  ModelStatisticsQuery,
  UsageLogItem,
  UsageLogQuery,
} from '@/types/statistics'

export const fetchModelStatistics = (payload: ModelStatisticsQuery) =>
  post<ModelStatisticsItem[]>('/statistics/models', payload)

export const fetchUsageLogsByQuery = (payload: UsageLogQuery) =>
  post<UsageLogItem[]>('/statistics/logs/query', payload)

export const fetchMyUsageLogs = () => get<UsageLogItem[]>('/statistics/logs/me')

export const fetchUserLogs = (userId: number) => get<UsageLogItem[]>(`/statistics/logs/user/${userId}`)
