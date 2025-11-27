import { get, post } from './request'
import type {
  AssignRoleRequest,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
} from '@/types/auth'

export const login = (payload: LoginRequest) => post<LoginResponse>('/auth/login', payload)

export const register = (payload: RegisterRequest) => post<string>('/auth/register', payload)

export const fetchProfile = () => get<UserProfile>('/auth/me')

export const changePassword = (payload: ChangePasswordRequest) => post<boolean>('/auth/change-password', payload)

export const assignRole = (payload: AssignRoleRequest) => post<boolean>('/users/assign-role', payload)
