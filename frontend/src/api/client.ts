import axios from 'axios'
import { apiBaseUrl } from '../config/runtime'
import {
  getAdminLoginUrl,
  getCurrentAdminRoutePath,
  setAdminReturnPath,
} from '../utils/adminNavigation'
import { clearAdminToken, getAdminToken } from '../utils/auth'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? getAdminToken() : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const url = error.config?.url ?? ''

      if (
        status === 401 &&
        typeof window !== 'undefined' &&
        url.startsWith('/admin') &&
        url !== '/admin/login'
      ) {
        clearAdminToken()
        setAdminReturnPath(getCurrentAdminRoutePath())

        const loginUrl = getAdminLoginUrl()

        if (window.location.href !== loginUrl) {
          window.location.assign(loginUrl)
        }
      }
    }

    return Promise.reject(error)
  },
)
