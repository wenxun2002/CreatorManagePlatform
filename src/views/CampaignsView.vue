<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarClock, CircleDollarSign } from 'lucide-vue-next'
import { fetchCampaigns } from '@/mock/campaigns'
import type { Campaign, CampaignFilter, CampaignStatus } from '@/types/campaign'
import { formatCompactCurrency } from '@/utils/format'
import CampaignSkeleton from '@/components/common/CampaignSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CampaignDrawer from '@/components/campaigns/CampaignDrawer.vue'

const { t, locale } = useI18n()

const loading = ref(true)
const campaigns = ref<Campaign[]>([])
const activeFilter = ref<CampaignFilter>('all')
const drawerOpen = ref(false)
const selectedCampaign = ref<Campaign | null>(null)

const filters: { key: CampaignFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'campaigns.filters.all' },
  { key: 'pending', labelKey: 'campaigns.filters.pending' },
  { key: 'in_progress', labelKey: 'campaigns.filters.inProgress' },
  { key: 'under_review', labelKey: 'campaigns.filters.underReview' },
  { key: 'completed', labelKey: 'campaigns.filters.completed' },
]

const filteredCampaigns = computed(() => {
  if (activeFilter.value === 'all') return campaigns.value
  return campaigns.value.filter((item) => item.status === activeFilter.value)
})

const statusClass: Record<CampaignStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  in_progress: 'bg-brand-soft text-brand',
  under_review: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  completed: 'bg-up/15 text-up',
}

function formatDueDate(iso: string): string {
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

function openDrawer(campaign: Campaign) {
  selectedCampaign.value = campaign
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

async function load() {
  loading.value = true
  try {
    campaigns.value = await fetchCampaigns()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-base font-semibold text-ink">{{ t('campaigns.heading') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('campaigns.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
        <button
          v-for="filter in filters"
          :key="filter.key"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm"
          :class="
            activeFilter === filter.key
              ? 'bg-brand-soft text-brand shadow-sm'
              : 'text-muted hover:text-ink'
          "
          @click="activeFilter = filter.key"
        >
          {{ t(filter.labelKey) }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <CampaignSkeleton v-for="n in 4" :key="n" />
    </div>

    <div
      v-else-if="filteredCampaigns.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <button
        v-for="campaign in filteredCampaigns"
        :key="campaign.id"
        type="button"
        class="rounded-2xl border border-line bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft/60 hover:shadow-lg hover:shadow-brand/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-5 dark:hover:bg-brand-soft/40 dark:hover:shadow-brand/25"
        @click="openDrawer(campaign)"
      >
        <div class="flex items-start gap-3">
          <img
            :src="campaign.brandLogoUrl"
            :alt="campaign.brandName"
            class="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-line"
          />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-muted">{{ campaign.brandName }}</p>
            <h3 class="mt-1 line-clamp-2 text-sm font-semibold text-ink">
              {{ campaign.title }}
            </h3>
          </div>
          <span
            class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium"
            :class="statusClass[campaign.status]"
          >
            {{ t(`campaigns.status.${campaign.status}`) }}
          </span>
        </div>

        <div class="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
          <div class="flex items-center gap-1.5 text-ink">
            <CircleDollarSign class="h-4 w-4 text-brand" />
            <span class="font-semibold">{{ formatCompactCurrency(campaign.budget) }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-muted">
            <CalendarClock class="h-4 w-4 text-faint" />
            <span>{{ formatDueDate(campaign.dueDate) }}</span>
          </div>
        </div>
      </button>
    </div>

    <div v-else class="rounded-2xl border border-line bg-card">
      <EmptyState
        :title="t('campaigns.emptyTitle')"
        :description="t('campaigns.emptyDescription')"
      />
    </div>

    <CampaignDrawer
      :open="drawerOpen"
      :campaign="selectedCampaign"
      @close="closeDrawer"
    />
  </div>
</template>
