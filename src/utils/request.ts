import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getToken, removeToken } from './auth'
import router from '@/router'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  // 响应拦截器直接返回 res.data，因此下方 API 调用返回的是 T 而非 AxiosResponse<T>
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

/**
 * 请求实例 —— 因响应拦截器解包了 AxiosResponse.data，
 * 需要断言方法签名让泛型 T 直接对应业务数据类型。
 */
const request = http as unknown as {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export default request
