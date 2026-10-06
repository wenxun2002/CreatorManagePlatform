import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { http, getStoredToken, setStoredToken } from '@/api/http'
import { MOCK_CREATOR_PROFILE } from '@/mock/creator'
import type { AuthUser, LoginPayload, LoginResponse, UserRole } from '@/types/auth'
import type { CreatorProfile } from '@/types/dashboard'

/**
 * Display profile = auth identity (name / id) + durable mock KPIs.
 * Backend AuthUser has no social metrics yet; until it does, merge keeps
 * header / ProfileCard glamorous after a real login.
 */
function mergeCreatorProfile(authUser: AuthUser): CreatorProfile {
  return {
    id: String(authUser.id),
    name: authUser.name,
    avatarUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(authUser.email)}`,
    followers: MOCK_CREATOR_PROFILE.followers,
    following: MOCK_CREATOR_PROFILE.following,
    likes: MOCK_CREATOR_PROFILE.likes,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken())
  const user = ref<AuthUser | null>(null)
  const authLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const role = computed<UserRole | null>(() => user.value?.role ?? null)

  const userProfile = computed<CreatorProfile | null>(() => {
    if (!user.value) return null
    return mergeCreatorProfile(user.value)
  })

  function applySession(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken
    user.value = nextUser
    setStoredToken(nextToken)
  }

  function clearSession() {
    token.value = null
    user.value = null
    setStoredToken(null)
  }

  async function login(payload: LoginPayload) {
    authLoading.value = true
    try {
      const { data } = await http.post<LoginResponse>('/api/login', {
        email: payload.email,
        password: payload.password,
        device_name: payload.device_name ?? 'web',
      })
      applySession(data.token, data.user)
      return data.user
    } finally {
      authLoading.value = false
    }
  }

  async function fetchCurrentUser() {
    const { data } = await http.get<AuthUser>('/api/user')
    user.value = data
    return data
  }

  /** Restore session from localStorage token (call on app boot). */
  async function hydrate() {
    const stored = getStoredToken()
    if (!stored) {
      clearSession()
      return false
    }

    token.value = stored
    authLoading.value = true
    try {
      await fetchCurrentUser()
      return true
    } catch {
      clearSession()
      return false
    } finally {
      authLoading.value = false
    }
  }

  async function logout() {
    authLoading.value = true
    try {
      if (token.value) {
        await http.post('/api/logout').catch(() => undefined)
      }
    } finally {
      clearSession()
      authLoading.value = false
    }
  }

  return {
    token,
    user,
    role,
    isAuthenticated,
    userProfile,
    authLoading,
    login,
    logout,
    hydrate,
    fetchCurrentUser,
    clearSession,
  }
})
