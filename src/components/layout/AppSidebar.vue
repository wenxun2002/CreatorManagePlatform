<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Clapperboard,
  LayoutDashboard,
  Megaphone,
  Wallet,
} from 'lucide-vue-next'
import { navItemsForRole } from '@/constants/nav'
import { useAuthStore } from '@/stores/useAuthStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const iconMap = {
  layout: LayoutDashboard,
  megaphone: Megaphone,
  clapperboard: Clapperboard,
  wallet: Wallet,
}

const activePath = computed(() => route.path)
const navItems = computed(() => navItemsForRole(auth.role))

function go(to: string) {
  void router.push(to)
}
</script>

<template>
  <aside class="hidden h-full w-60 shrink-0 flex-col border-r border-line bg-card md:flex">
    <div class="flex items-center gap-3 px-5 py-5">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
        CP
      </div>
      <div>
        <p class="text-sm font-semibold text-ink">{{ t('brand.name') }}</p>
        <p class="text-xs text-faint">
          {{ auth.role === 'manager' ? t('auth.roles.manager') : t('auth.roles.creator') }}
        </p>
      </div>
    </div>

    <nav class="flex flex-1 flex-col gap-1 px-3 py-2">
      <button
        v-for="item in navItems"
        :key="item.key"
        type="button"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
        :class="
          activePath.startsWith(item.to)
            ? 'bg-brand-soft text-brand font-medium'
            : 'text-muted hover:bg-page hover:text-ink'
        "
        @click="go(item.to)"
      >
        <component :is="iconMap[item.icon]" class="h-4.5 w-4.5" :stroke-width="2" />
        <span>{{ t(item.labelKey) }}</span>
      </button>
    </nav>
  </aside>
</template>
