<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboard } from '@/composables/useDashboard'
import { useAuthStore } from '@/stores/useAuthStore'
import DashboardToolbar from '@/components/dashboard/DashboardToolbar.vue'
import ProfileCard from '@/components/dashboard/ProfileCard.vue'
import OverviewStats from '@/components/dashboard/OverviewStats.vue'
import AnalyticsChart from '@/components/dashboard/AnalyticsChart.vue'
import AudienceDemographics from '@/components/dashboard/AudienceDemographics.vue'
import ListSection from '@/components/dashboard/ListSection.vue'

const { t } = useI18n()
const auth = useAuthStore()
const { activeTab, dateRange, loading, data, setTab, setDateRange } = useDashboard()

const profile = computed(() => auth.userProfile ?? data.value?.profile ?? null)
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6">
    <DashboardToolbar
      :active-tab="activeTab"
      :date-range="dateRange"
      @update:active-tab="setTab"
      @update:date-range="setDateRange"
    />

    <div
      v-if="loading && !data"
      class="rounded-2xl border border-line bg-card p-10 text-center text-sm text-muted"
    >
      {{ t('common.loading') }}
    </div>

    <template v-else-if="data && profile">
      <div class="flex flex-col gap-6" :class="{ 'opacity-60 transition-opacity': loading }">
        <ProfileCard :profile="profile" :events-map="data.eventsMap" />
        <OverviewStats :stats="data.stats" />

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <AnalyticsChart :chart="data.chart" />
          </div>
          <div class="lg:col-span-1">
            <AudienceDemographics :items="data.demographics" />
          </div>
        </div>

        <ListSection :lists="data.lists" />
      </div>
    </template>
  </div>
</template>
