<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isAxiosError } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import { useTheme } from '@/composables/useTheme'
import { defaultHomeForRole } from '@/constants/nav'
import { Moon, Sun } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const email = ref('creator@example.com')
const password = ref('password')
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    const user = await auth.login({
      email: email.value.trim(),
      password: password.value,
      device_name: 'web',
    })
    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : defaultHomeForRole(user.role)
    await router.replace(redirect)
  } catch (err) {
    if (isAxiosError(err)) {
      const message = err.response?.data?.message
      const emailError = err.response?.data?.errors?.email?.[0]
      error.value = emailError || message || t('auth.loginFailed')
      return
    }
    error.value = t('auth.loginFailed')
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-page px-4 text-ink">
    <div class="absolute right-4 top-4">
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-card text-muted transition-colors hover:text-ink"
        :title="isDark ? t('header.themeLight') : t('header.themeDark')"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>
    </div>

    <section class="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-sm">
      <div class="mb-8 flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white"
        >
          CP
        </div>
        <div>
          <h1 class="text-lg font-semibold text-ink">{{ t('brand.name') }}</h1>
          <p class="text-xs text-faint">{{ t('auth.subtitle') }}</p>
        </div>
      </div>

      <p class="mb-6 text-sm text-muted">{{ t('auth.demoHint') }}</p>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-muted" for="login-email">
            {{ t('auth.email') }}
          </label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="username"
            required
            class="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-muted" for="login-password">
            {{ t('auth.password') }}
          </label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <p v-if="error" class="text-sm text-down">{{ error }}</p>

        <button
          type="submit"
          class="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
          :disabled="auth.authLoading"
        >
          {{ auth.authLoading ? t('auth.loggingIn') : t('auth.login') }}
        </button>
      </form>
    </section>
  </div>
</template>
