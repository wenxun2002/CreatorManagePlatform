<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { DashboardTab, DateRange } from '@/types/dashboard'

defineProps<{
  activeTab: DashboardTab
  dateRange: DateRange
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: DashboardTab]
  'update:dateRange': [range: DateRange]
}>()

const { t } = useI18n()

const tabs: { key: DashboardTab; labelKey: string }[] = [
  { key: 'short_video', labelKey: 'dashboard.tabs.shortVideo' },
  { key: 'live', labelKey: 'dashboard.tabs.live' },
]
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between">
    <div class="flex w-full rounded-xl bg-page p-1 md:w-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex-none md:px-4"
        :class="
          activeTab === tab.key
            ? 'bg-card text-brand shadow-sm'
            : 'text-muted hover:text-ink'
        "
        @click="emit('update:activeTab', tab.key)"
      >
        {{ t(tab.labelKey) }}
      </button>
    </div>

    <!-- TODO: re-enable date range picker when VueDatePicker version is settled -->
  </div>
</template>
