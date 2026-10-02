<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchWalletData } from '@/mock/wallet'
import type { WalletSummary, WalletTransaction } from '@/types/wallet'
import BalanceOverview from '@/components/wallet/BalanceOverview.vue'
import WithdrawModal from '@/components/wallet/WithdrawModal.vue'
import DataTable from '@/components/wallet/DataTable.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { t } = useI18n()

const loading = ref(true)
const withdrawOpen = ref(false)
const summary = ref<WalletSummary>({
  availableBalance: 0,
  estimatedMonthlyRevenue: 0,
  pendingFunds: 0,
  lifetimeWithdrawn: 0,
})
const transactions = ref<WalletTransaction[]>([])

async function load() {
  loading.value = true
  try {
    const data = await fetchWalletData()
    summary.value = data.summary
    transactions.value = data.transactions
  } finally {
    loading.value = false
  }
}

async function refreshAfterWithdraw() {
  const data = await fetchWalletData()
  summary.value = data.summary
  transactions.value = data.transactions
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <div>
      <h2 class="text-base font-semibold text-ink">{{ t('wallet.heading') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('wallet.subtitle') }}</p>
    </div>

    <template v-if="loading">
      <div class="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <div class="bg-brand-soft/50 px-6 py-8 sm:px-8">
          <Skeleton box-class="mb-3 h-4 w-32" />
          <Skeleton box-class="h-12 w-56" />
        </div>
        <div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          <Skeleton v-for="n in 3" :key="n" box-class="h-14 w-full" rounded="xl" />
        </div>
      </div>
      <DataTable :loading="true" :transactions="[]" />
    </template>

    <template v-else>
      <BalanceOverview :summary="summary" @withdraw="withdrawOpen = true" />
      <DataTable :transactions="transactions" />
    </template>

    <WithdrawModal
      :open="withdrawOpen"
      :available-balance="summary.availableBalance"
      @close="withdrawOpen = false"
      @success="refreshAfterWithdraw"
    />
  </div>
</template>
