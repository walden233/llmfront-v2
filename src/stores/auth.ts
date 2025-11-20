import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { login as loginApi, register as registerApi, fetchProfile, changePassword } from '@/api/auth'
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  UserRole,
} from '@/types/auth'

interface AuthState {
  token: string
  user: UserProfile | null
  sessionAccessKey: string
  loading: boolean
}

const TOKEN_STORAGE_KEY = 'llm_proxy_token'
const USER_STORAGE_KEY = 'llm_proxy_user'

const readToken = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''
}

const readUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(USER_STORAGE_KEY)
  return value ? (JSON.parse(value) as UserProfile) : null
}

const persistToken = (token: string) => {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

const persistUser = (user: UserProfile | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: readToken(),
    user: readUser(),
    sessionAccessKey: '',
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    role: (state) => state.user?.role,
    username: (state) => state.user?.username ?? '',
  },
  actions: {
    async login(payload: LoginRequest) {
      this.loading = true
      try {
        const response = await loginApi(payload)
        this.token = response.token
        persistToken(this.token)
        await this.fetchProfile()
        ElMessage.success('登录成功')
      } finally {
        this.loading = false
      }
    },
    async register(payload: RegisterRequest) {
      this.loading = true
      try {
        await registerApi(payload)
        ElMessage.success('注册成功，请登录')
      } finally {
        this.loading = false
      }
    },
    async fetchProfile() {
      const profile = await fetchProfile()
      this.user = profile
      persistUser(profile)
      return profile
    },
    async updatePassword(payload: ChangePasswordRequest) {
      await changePassword(payload)
      ElMessage.success('密码修改成功')
    },
    logout() {
      this.token = ''
      this.user = null
      this.sessionAccessKey = ''
      persistToken('')
      persistUser(null)
    },
    setSessionAccessKey(key: string) {
      this.sessionAccessKey = key
    },
    hasRole(roles?: UserRole[] | string[]) {
      if (!roles || roles.length === 0) {
        return true
      }
      const currentRole = this.user?.role
      return currentRole ? roles.includes(currentRole) : false
    },
  },
})
