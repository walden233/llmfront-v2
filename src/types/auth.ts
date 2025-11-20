export type UserRole = 'ROLE_ROOT_ADMIN' | 'ROLE_MODEL_ADMIN' | 'ROLE_USER'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface AssignRoleRequest {
  userId: number
  role: UserRole
}

export interface LoginResponse {
  token: string
  username: string
  role: UserRole
}

export interface UserProfile {
  id: number
  username: string
  role: UserRole
  email?: string
  balance?: number
  createdAt?: string
}
