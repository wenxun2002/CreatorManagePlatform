<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TransactionStatus, TransactionType, WalletTransaction } from '@/types/wallet'
import { formatSignedCurrency } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

defineProps<{
  loading?: boolean
  transactions: WalletTransaction[]
}>()

const { t, locale } = useI18n()

const typeClass: Record<TransactionType, string> = {
  campaign: 'bg-brand-soft text-brand',
  live_gift: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  withdrawal: 'bg-page text-muted ring-1 ring-line',
}

const statusClass: Record<TransactionStatus, string> = {
  success: 'bg-up/15 text-up',
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale.value !== 'zh',
  }).format(new Date(iso))
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
    <header class="border-b border-line px-4 py-4 sm:px-5">
      <h3 class="text-sm font-semibold text-ink">{{ t('wallet.table.title') }}</h3>
      <p class="mt-0.5 text-xs text-muted">{{ t('wallet.table.subtitle') }}</p>
    </header>

    <div v-if="loading">
      <!-- Mobile skeleton -->
      <div class="block divide-y divide-line md:hidden">
        <div v-for="n in 5" :key="`m-${n}`" class="space-y-2 px-4 py-4">
          <div class="flex items-center justify-between gap-3">
            <Skeleton box-class="h-4 w-[55%]" />
            <Skeleton box-class="h-4 w-20" />
          </div>
          <div class="flex items-center justify-between gap-3">
            <Skeleton box-class="h-3.5 w-28" />
            <Skeleton box-class="h-5 w-14" rounded="full" />
          </div>
        </div>
      </div>
      <!-- Desktop skeleton -->
      <div class="hidden divide-y divide-line md:block">
        <div v-for="n in 5" :key="`d-${n}`" class="flex items-center gap-4 px-5 py-4">
          <Skeleton box-class="h-4 w-28" />
          <Skeleton box-class="h-4 flex-1" />
          <Skeleton box-class="h-5 w-16" rounded="full" />
          <Skeleton box-class="h-5 w-16" rounded="full" />
          <Skeleton box-class="h-4 w-20" />
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!transactions.length"
      :title="t('wallet.table.emptyTitle')"
      :description="t('wallet.table.emptyDescription')"
    />

    <template v-else>
      <!-- Mobile card list -->
      <div class="block md:hidden">
        <article
          v-for="(row, index) in transactions"
          :key="row.id"
          class="px-4 py-4"
          :class="index < transactions.length - 1 ? 'border-b border-line' : ''"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="min-w-0 flex-1 truncate font-medium text-ink">
              {{ row.description }}
            </p>
            <p
              class="shrink-0 text-sm font-semibold tabular-nums"
              :class="row.amount >= 0 ? 'text-up' : 'text-down'"
            >
              {{ formatSignedCurrency(row.amount) }}
            </p>
          </div>
          <div class="mt-1.5 flex items-center justify-between gap-3">
            <p class="text-sm text-muted tabular-nums">{{ formatDate(row.date) }}</p>
            <div class="flex shrink-0 items-center gap-1.5">
              <span
                class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                :class="typeClass[row.type]"
              >
                {{ t(`wallet.table.types.${row.type}`) }}
              </span>
              <span
                class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusClass[row.status]"
              >
                {{ t(`wallet.table.status.${row.status}`) }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Desktop table -->
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-line bg-page/80 text-xs font-medium uppercase tracking-wide text-faint">
              <th class="whitespace-nowrap px-5 py-3 font-medium">{{ t('wallet.table.columns.date') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('wallet.table.columns.description') }}</th>
              <th class="whitespace-nowrap px-5 py-3 font-medium">{{ t('wallet.table.columns.type') }}</th>
              <th class="whitespace-nowrap px-5 py-3 font-medium">{{ t('wallet.table.columns.status') }}</th>
              <th class="whitespace-nowrap px-5 py-3 text-right font-medium">{{ t('wallet.table.columns.amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in transactions"
              :key="row.id"
              class="border-b border-line last:border-b-0 transition-colors hover:bg-brand-soft/40 dark:hover:bg-brand-soft/20"
            >
              <td class="whitespace-nowrap px-5 py-3.5 text-muted tabular-nums">
                {{ formatDate(row.date) }}
              </td>
              <td class="max-w-[240px] px-5 py-3.5 font-medium text-ink">
                <span class="line-clamp-1">{{ row.description }}</span>
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  :class="typeClass[row.type]"
                >
                  {{ t(`wallet.table.types.${row.type}`) }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  :class="statusClass[row.status]"
                >
                  {{ t(`wallet.table.status.${row.status}`) }}
                </span>
              </td>
              <td
                class="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums"
                :class="row.amount >= 0 ? 'text-up' : 'text-down'"
              >
                {{ formatSignedCurrency(row.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
