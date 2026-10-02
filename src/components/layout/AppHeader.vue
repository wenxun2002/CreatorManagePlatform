<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Bell, ChevronDown, Moon, Sun } from 'lucide-vue-next'
import { setLocale, type AppLocale } from '@/locales'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/useAuthStore'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const title = computed(() => {
  const key = route.meta.titleKey
  return typeof key === 'string' ? t(key) : ''
})

const displayName = computed(() => auth.userProfile?.name?.split(' ')[0] ?? 'Creator')
const avatarUrl = computed(
  () => auth.userProfile?.avatarUrl ?? 'https://i.pravatar.cc/64?u=nova-chen',
)

function switchLocale(lang: AppLocale) {
  setLocale(lang)
}

async function handleLogout() {
  menuOpen.value = false
  await auth.logout()
  await router.replace({ name: 'login' })
}

function onDocClick(event: MouseEvent) {
  if (!menuRef.value?.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header class="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-card px-3 sm:h-16 md:px-6">
    <h1 class="min-w-0 truncate text-base font-semibold text-ink sm:text-lg">{{ title }}</h1>

    <div class="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
      <div class="flex items-center rounded-xl border border-line bg-page p-0.5">
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors sm:px-2.5 sm:text-xs"
          :class="locale === 'zh' ? 'bg-card text-brand shadow-sm' : 'text-muted hover:text-ink'"
          @click="switchLocale('zh')"
        >
          中文
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors sm:px-2.5 sm:text-xs"
          :class="locale === 'en' ? 'bg-card text-brand shadow-sm' : 'text-muted hover:text-ink'"
          @click="switchLocale('en')"
        >
          EN
        </button>
      </div>

      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-page hover:text-ink"
        :title="isDark ? t('header.themeLight') : t('header.themeDark')"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>

      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-page hover:text-ink"
        :title="t('header.notifications')"
      >
        <Bell class="h-4 w-4" />
      </button>

      <div ref="menuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-line px-2 py-1.5 transition-colors hover:bg-page"
          @click="menuOpen = !menuOpen"
        >
          <img
            :src="avatarUrl"
            alt=""
            class="h-7 w-7 rounded-full object-cover"
          />
          <span class="hidden text-sm text-ink md:inline">{{ displayName }}</span>
          <ChevronDown class="h-3.5 w-3.5 text-faint" />
        </button>

        <div
          v-if="menuOpen"
          class="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-card p-1 shadow-lg"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-page"
          >
            {{ t('header.profile') }}
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-page"
            :disabled="auth.authLoading"
            @click="handleLogout"
          >
            {{ t('header.logout') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
