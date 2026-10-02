<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CalendarEvent, CreatorProfile } from '@/types/dashboard'
import { useCreatorCalendar } from '@/composables/useCreatorCalendar'
import CalendarMonthGrid from './CalendarMonthGrid.vue'
import CalendarDayAgenda from './CalendarDayAgenda.vue'

const props = defineProps<{
  profile: CreatorProfile
  eventsMap: Record<string, CalendarEvent[]>
}>()

const { t } = useI18n()

const eventsMapRef = toRef(props, 'eventsMap')
const calendar = useCreatorCalendar(() => eventsMapRef.value)

const gridProps = computed(() => ({
  monthLabel: calendar.monthLabel.value,
  weekdays: calendar.weekdays.value,
  cells: calendar.cells.value,
}))

const agendaProps = computed(() => ({
  events: calendar.selectedEvents.value,
  selectedDateLabel: calendar.selectedDateLabel.value,
}))

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

const metrics = computed(() => [
  { label: t('dashboard.profile.followers'), value: formatCount(props.profile.followers) },
  { label: t('dashboard.profile.following'), value: formatCount(props.profile.following) },
  { label: t('dashboard.profile.likes'), value: formatCount(props.profile.likes) },
])
</script>

<template>
  <section class="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5 lg:p-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-0">
      <!-- Left: profile -->
      <div class="flex flex-col justify-center lg:col-span-3 lg:border-r lg:border-line lg:pr-6">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="relative shrink-0">
            <img
              :src="profile.avatarUrl"
              :alt="profile.name"
              class="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand/30 lg:h-[4.5rem] lg:w-[4.5rem]"
            />
            <span
              class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-up"
            />
          </div>
          <div class="min-w-0">
            <h2 class="truncate text-lg font-semibold text-ink">{{ profile.name }}</h2>
            <div class="mt-3 grid grid-cols-3 gap-3 sm:gap-4">
              <div v-for="metric in metrics" :key="metric.label">
                <p class="text-sm font-semibold text-ink lg:text-base">{{ metric.value }}</p>
                <p class="text-[11px] text-faint">{{ metric.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center: calendar grid -->
      <div class="lg:col-span-5 lg:border-r lg:border-line">
        <CalendarMonthGrid
          v-bind="gridProps"
          @prev-month="calendar.prevMonth"
          @next-month="calendar.nextMonth"
          @select-day="calendar.selectDay"
        />
      </div>

      <!-- Right: agenda -->
      <div class="lg:col-span-4">
        <CalendarDayAgenda v-bind="agendaProps" />
      </div>
    </div>
  </section>
</template>
