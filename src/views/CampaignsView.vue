<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarClock, CircleDollarSign, Plus } from 'lucide-vue-next'
import {
  getCampaigns,
  updateCampaignStatus,
} from '@/api/campaigns'
import type { Campaign, CampaignFilter, CampaignStatus } from '@/types/campaign'
import { formatCompactCurrency } from '@/utils/format'
import { useAuthStore } from '@/stores/useAuthStore'
import CampaignSkeleton from '@/components/common/CampaignSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CampaignDrawer from '@/components/campaigns/CampaignDrawer.vue'
import CreateCampaignModal from '@/components/campaigns/CreateCampaignModal.vue'

const POLL_MS = 5000

const { t, locale } = useI18n()
const auth = useAuthStore()

const loading = ref(true)
const actionLoading = ref(false)
const loadError = ref('')
const campaigns = ref<Campaign[]>([])
const activeFilter = ref<CampaignFilter>('all')
const drawerOpen = ref(false)
const createOpen = ref(false)
const selectedCampaign = ref<Campaign | null>(null)

let pollTimer: ReturnType<typeof setInterval> | null = null

const isManager = computed(() => auth.role === 'manager')
const isCreator = computed(() => auth.role === 'creator')

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

function replaceCampaign(updated: Campaign) {
  const index = campaigns.value.findIndex((c) => c.id === updated.id)
  if (index >= 0) {
    campaigns.value[index] = updated
  }
  if (selectedCampaign.value?.id === updated.id) {
    selectedCampaign.value = updated
  }
}

function mergeSilentRefresh(next: Campaign[]) {
  campaigns.value = next
  if (selectedCampaign.value) {
    const fresh = next.find((c) => c.id === selectedCampaign.value!.id)
    if (fresh) selectedCampaign.value = fresh
  }
}

async function load(options: { silent?: boolean } = {}) {
  const silent = options.silent === true
  if (!silent) {
    loading.value = true
    loadError.value = ''
  }
  try {
    const data = await getCampaigns()
    if (silent) {
      mergeSilentRefresh(data)
    } else {
      campaigns.value = data
    }
  } catch {
    if (!silent) {
      loadError.value = t('campaigns.loadFailed')
      campaigns.value = []
    }
  } finally {
    if (!silent) loading.value = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(() => {
    if (actionLoading.value || createOpen.value) return
    void load({ silent: true })
  }, POLL_MS)
}

function stopPolling() {
  if (pollTimer != null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function onAccept(campaign: Campaign) {
  actionLoading.value = true
  try {
    const updated = await updateCampaignStatus(campaign.id, 'in_progress')
    replaceCampaign(updated)
    closeDrawer()
  } finally {
    actionLoading.value = false
  }
}

async function onSubmitDeliverable(payload: {
  campaign: Campaign
  file: File
  description: string
}) {
  actionLoading.value = true
  try {
    const updated = await updateCampaignStatus(payload.campaign.id, 'under_review', {
      submission_file: payload.file,
      submission_desc: payload.description,
    })
    replaceCampaign(updated)
    closeDrawer()
  } finally {
    actionLoading.value = false
  }
}

async function onApprove(campaign: Campaign) {
  actionLoading.value = true
  try {
    const updated = await updateCampaignStatus(campaign.id, 'completed')
    replaceCampaign(updated)
    closeDrawer()
  } finally {
    actionLoading.value = false
  }
}

async function onApproveFromCard(campaign: Campaign, event: Event) {
  event.stopPropagation()
  await onApprove(campaign)
}

async function onAcceptFromCard(campaign: Campaign, event: Event) {
  event.stopPropagation()
  await onAccept(campaign)
}

function onCreated(created: Campaign[]) {
  campaigns.value = [...created, ...campaigns.value]
}

onMounted(() => {
  void load().then(() => startPolling())
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-base font-semibold text-ink">{{ t('campaigns.heading') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('campaigns.subtitle') }}</p>
      </div>

      <div class="flex flex-col items-stretch gap-3 sm:items-end">
        <button
          v-if="isManager"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          @click="createOpen = true"
        >
          <Plus class="h-4 w-4" />
          {{ t('campaigns.create.button') }}
        </button>

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
    </div>

    <p v-if="loadError" class="text-sm text-down">{{ loadError }}</p>

    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <CampaignSkeleton v-for="n in 4" :key="n" />
    </div>

    <div
      v-else-if="filteredCampaigns.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="campaign in filteredCampaigns"
        :key="campaign.id"
        class="rounded-2xl border border-line bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft/60 hover:shadow-lg hover:shadow-brand/15 sm:p-5 dark:hover:bg-brand-soft/40 dark:hover:shadow-brand/25"
      >
        <button
          type="button"
          class="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          @click="openDrawer(campaign)"
        >
          <div class="flex items-start gap-3">
            <img
              :src="
                isManager
                  ? campaign.creatorAvatarUrl || campaign.brandLogoUrl
                  : campaign.managerAvatarUrl || campaign.brandLogoUrl
              "
              :alt="isManager ? campaign.creatorName || campaign.brandName : campaign.managerName || campaign.brandName"
              class="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-muted">
                <template v-if="isManager">
                  {{ t('campaigns.assignedTo') }}
                  <span class="text-ink">{{ campaign.creatorName || '—' }}</span>
                </template>
                <template v-else>
                  {{ campaign.managerName || campaign.brandName }}
                </template>
              </p>
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

        <div
          v-if="
            (isCreator && campaign.status === 'pending') ||
            (isManager && campaign.status === 'under_review')
          "
          class="mt-3 flex gap-2"
        >
          <button
            v-if="isCreator && campaign.status === 'pending'"
            type="button"
            class="flex-1 rounded-xl bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            :disabled="actionLoading"
            @click="onAcceptFromCard(campaign, $event)"
          >
            {{ t('campaigns.actions.accept') }}
          </button>
          <button
            v-if="isManager && campaign.status === 'under_review'"
            type="button"
            class="flex-1 rounded-xl bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            :disabled="actionLoading"
            @click="onApproveFromCard(campaign, $event)"
          >
            {{ t('campaigns.actions.approve') }}
          </button>
        </div>
      </article>
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
      :action-loading="actionLoading"
      @close="closeDrawer"
      @accept="onAccept"
      @submit-deliverable="onSubmitDeliverable"
      @approve="onApprove"
    />

    <CreateCampaignModal
      :open="createOpen"
      @close="createOpen = false"
      @created="onCreated"
    />
  </div>
</template>
