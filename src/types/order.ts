export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface Order {
  id: number
  orderNo: string
  userId: number
  amount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  userId: number
  amount: number
}

export interface CancelOrderRequest {
  orderNo: string
}

export interface PayOrderRequest {
  orderNo: string
}
