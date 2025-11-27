import type { UserRole } from './auth'

export interface User {
  id: number
  username: string
  email?: string
  role: UserRole
  balance: number
  createdAt: string
}
