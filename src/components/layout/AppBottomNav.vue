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
import { APP_NAV_ITEMS } from '@/constants/nav'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const iconMap = {
  layout: LayoutDashboard,
  megaphone: Megaphone,
  clapperboard: Clapperboard,
  wallet: Wallet,
}

const activePath = computed(() => route.path)

function go(to: string) {
  void router.push(to)
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur-md md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    aria-label="Primary"
  >
    <div class="grid h-16 grid-cols-4">
      <button
        v-for="item in APP_NAV_ITEMS"
        :key="item.key"
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors"
        :class="
          activePath.startsWith(item.to)
            ? 'text-brand'
            : 'text-faint hover:text-muted'
        "
        @click="go(item.to)"
      >
        <component
          :is="iconMap[item.icon]"
          class="h-5 w-5"
          :stroke-width="activePath.startsWith(item.to) ? 2.25 : 1.75"
        />
        <span class="truncate px-1">{{ t(item.labelKey) }}</span>
      </button>
    </div>
  </nav>
</template>
