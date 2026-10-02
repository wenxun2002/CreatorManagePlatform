<script setup lang="ts">
/**
 * @deprecated Use ProfileCard three-column layout (CalendarMonthGrid + CalendarDayAgenda).
 * Kept as a thin wrapper for any legacy imports.
 */
import { computed, toRef } from 'vue'
import type { CalendarEvent } from '@/types/dashboard'
import { useCreatorCalendar } from '@/composables/useCreatorCalendar'
import CalendarMonthGrid from './CalendarMonthGrid.vue'
import CalendarDayAgenda from './CalendarDayAgenda.vue'

const props = defineProps<{
  eventsMap: Record<string, CalendarEvent[]>
}>()

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
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <CalendarMonthGrid
      v-bind="gridProps"
      @prev-month="calendar.prevMonth"
      @next-month="calendar.nextMonth"
      @select-day="calendar.selectDay"
    />
    <CalendarDayAgenda v-bind="agendaProps" />
  </div>
</template>
