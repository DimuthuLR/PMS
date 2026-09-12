import axios from 'axios'
import { snakeToCamel, camelToSnake, deepConvertKeys } from '../utils/caseConverter'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ---- Request interceptor ----
api.interceptors.request.use(
  (config) => {
    // 1. Attach JWT token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 2. Convert camelCase body → snake_case for Flask
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = deepConvertKeys(config.data, camelToSnake)
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ---- Response interceptor ----
api.interceptors.response.use(
  (response) => {
    // Convert snake_case response → camelCase for Vue
    if (response.data && typeof response.data === 'object') {
      response.data = deepConvertKeys(response.data, snakeToCamel)
    }
    return response
  },
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
