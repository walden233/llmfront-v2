import axios, { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosResponse, AxiosRequestHeaders } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import type { Result } from '@/types/api'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  config.headers = (config.headers || new AxiosHeaders()) as AxiosRequestHeaders
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  if (authStore.sessionAccessKey && 'X-Use-Access-Key' in config.headers) {
    config.headers[import.meta.env.VITE_ACCESS_KEY_HEADER] = authStore.sessionAccessKey
    delete config.headers['X-Use-Access-Key']
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse<Result<unknown>>) => {
    const payload = response.data
    if (typeof payload?.code === 'number' && payload.code !== 200) {
      if (payload.code === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push({ name: 'Login' })
      }
      ElMessage.error(payload.message || '请求失败')
      return Promise.reject(payload)
    }
    return response
  },
  (error: AxiosError) => {
    const message = error.response?.data && typeof error.response.data === 'object'
      ? (error.response.data as { message?: string }).message
      : error.message
    ElMessage.error(message || '网络异常')
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'Login' })
    }
    return Promise.reject(error)
  },
)

export default http
