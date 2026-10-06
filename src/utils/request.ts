import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'cp_access_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 8000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Let the runtime attach multipart boundary (do not keep application/json).
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }

  return config
})

let handlingUnauthorized = false

request.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const isLoginRequest = url.includes('/api/login')

    if (status === 401 && !isLoginRequest && !handlingUnauthorized) {
      handlingUnauthorized = true
      setStoredToken(null)

      try {
        const { useAuthStore } = await import('@/stores/useAuthStore')
        useAuthStore().clearSession()
      } catch {
        // store may be unavailable during early boot
      }

      try {
        const { default: router } = await import('@/router')
        if (router.currentRoute.value.name !== 'login') {
          await router.replace({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath },
          })
        }
      } catch {
        window.location.assign('/login')
      }

      handlingUnauthorized = false
    }

    return Promise.reject(error)
  },
)

/** @deprecated Prefer importing `request` from `@/utils/request` */
export const http = request
