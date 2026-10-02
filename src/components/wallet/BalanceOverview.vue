<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Banknote, CircleDollarSign, Eye, EyeOff, Lock, TrendingUp } from 'lucide-vue-next'
import type { WalletSummary } from '@/types/wallet'
import { formatCurrency } from '@/utils/format'

defineProps<{
  summary: WalletSummary
}>()

const emit = defineEmits<{
  withdraw: []
}>()

const { t } = useI18n()
const balanceVisible = ref(false)

const MASKED = '$****.**'

function displayAmount(value: number): string {
  return balanceVisible.value ? formatCurrency(value) : MASKED
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-line bg-card shadow-sm"
  >
    <div
      class="relative bg-brand-gradient px-4 py-5 text-white sm:px-8 sm:py-8"
    >
      <div
        class="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div class="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-white/80">
              {{ t('wallet.balance.available') }}
            </p>
            <button
              type="button"
              class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              :aria-label="
                balanceVisible ? t('wallet.balance.hideAmount') : t('wallet.balance.showAmount')
              "
              :aria-pressed="balanceVisible"
              @click="balanceVisible = !balanceVisible"
            >
              <Eye v-if="balanceVisible" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
          <p class="mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl md:text-5xl">
            {{ displayAmount(summary.availableBalance) }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand shadow-md transition-colors hover:bg-white/90"
          @click="emit('withdraw')"
        >
          <Banknote class="h-4 w-4" />
          {{ t('wallet.balance.withdraw') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div class="flex items-start gap-3.5 px-5 py-5 sm:gap-3 sm:px-6 sm:py-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand sm:h-9 sm:w-9 sm:rounded-lg">
          <TrendingUp class="h-5 w-5 sm:h-4 sm:w-4" />
        </div>
        <div class="min-w-0">
          <p class="text-sm text-muted sm:text-xs">{{ t('wallet.balance.estMonthly') }}</p>
          <p class="mt-1 text-xl font-semibold tabular-nums text-ink sm:mt-0.5 sm:text-base">
            {{ displayAmount(summary.estimatedMonthlyRevenue) }}
          </p>
        </div>
      </div>
      <div class="flex items-start gap-3.5 px-5 py-5 sm:gap-3 sm:px-6 sm:py-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 sm:h-9 sm:w-9 sm:rounded-lg">
          <Lock class="h-5 w-5 sm:h-4 sm:w-4" />
        </div>
        <div class="min-w-0">
          <p class="text-sm text-muted sm:text-xs">{{ t('wallet.balance.pending') }}</p>
          <p class="mt-1 text-xl font-semibold tabular-nums text-ink sm:mt-0.5 sm:text-base">
            {{ displayAmount(summary.pendingFunds) }}
          </p>
        </div>
      </div>
      <div class="flex items-start gap-3.5 px-5 py-5 sm:gap-3 sm:px-6 sm:py-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-up/15 text-up sm:h-9 sm:w-9 sm:rounded-lg">
          <CircleDollarSign class="h-5 w-5 sm:h-4 sm:w-4" />
        </div>
        <div class="min-w-0">
          <p class="text-sm text-muted sm:text-xs">{{ t('wallet.balance.lifetime') }}</p>
          <p class="mt-1 text-xl font-semibold tabular-nums text-ink sm:mt-0.5 sm:text-base">
            {{ displayAmount(summary.lifetimeWithdrawn) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
