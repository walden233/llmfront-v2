import { get, post } from './request'
import type { PageResult } from '@/types/api'
import type { Order, CreateOrderRequest, CancelOrderRequest } from '@/types/order'

export const listMyOrders = (params: { pageNum?: number, pageSize?: number, status?: string }) =>
  get<PageResult<Order>>('/orders/my', { params })

export const createOrder = (payload: CreateOrderRequest) => post<Order>('/orders', payload)

export const cancelOrder = (payload: CancelOrderRequest) => post<Order>('/orders/cancel', payload)
