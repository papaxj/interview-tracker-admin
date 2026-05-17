import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getToken, removeToken } from './auth'
import router from '@/router'

interface RequestInstance {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const data = err.response?.data as { message?: string } | undefined
    const message = data?.message || err.message || '请求失败'

    if (err.response?.status === 401) {
      removeToken()
      router.push('/login')
    }

    return Promise.reject(new Error(message))
  },
)

const request = instance as unknown as RequestInstance

export default request
