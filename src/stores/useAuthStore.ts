import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CreatorProfile } from '@/types/dashboard'
import { MOCK_CREATOR_PROFILE } from '@/mock/creator'

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const userProfile = ref<CreatorProfile | null>(null)
  const authLoading = ref(false)

  async function login() {
    authLoading.value = true
    try {
      await wait(500)
      userProfile.value = { ...MOCK_CREATOR_PROFILE }
      isAuthenticated.value = true
    } finally {
      authLoading.value = false
    }
  }

  async function logout() {
    authLoading.value = true
    try {
      await wait(500)
      isAuthenticated.value = false
      userProfile.value = null
    } finally {
      authLoading.value = false
    }
  }

  return {
    isAuthenticated,
    userProfile,
    authLoading,
    login,
    logout,
  }
})
