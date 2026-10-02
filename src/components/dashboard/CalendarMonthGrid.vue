<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { CalendarCell } from '@/composables/useCreatorCalendar'

defineProps<{
  monthLabel: string
  weekdays: string[]
  cells: CalendarCell[]
}>()

const emit = defineEmits<{
  prevMonth: []
  nextMonth: []
  selectDay: [cell: CalendarCell]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex min-w-0 flex-col px-4 lg:px-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-medium text-muted">{{ t('dashboard.calendar.title') }}</p>
        <p class="text-base font-semibold text-ink">{{ monthLabel }}</p>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-page text-muted transition-colors hover:bg-card hover:text-ink"
          :aria-label="t('dashboard.calendar.prevMonth')"
          @click="emit('prevMonth')"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-page text-muted transition-colors hover:bg-card hover:text-ink"
          :aria-label="t('dashboard.calendar.nextMonth')"
          @click="emit('nextMonth')"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="mb-2 grid grid-cols-7 gap-1.5">
      <span
        v-for="(label, index) in weekdays"
        :key="`${label}-${index}`"
        class="flex h-7 items-center justify-center text-xs font-medium text-faint"
      >
        {{ label }}
      </span>
    </div>

    <div class="grid grid-cols-7 gap-1.5">
      <button
        v-for="cell in cells"
        :key="cell.iso"
        type="button"
        class="relative flex h-10 flex-col items-center justify-center rounded-xl text-sm transition-colors sm:h-11"
        :class="[
          cell.isSelected
            ? 'bg-brand text-white shadow-sm'
            : cell.isToday
              ? 'border-2 border-brand text-brand'
              : cell.inCurrentMonth
                ? 'text-ink hover:bg-page'
                : 'text-faint hover:bg-page/80',
        ]"
        @click="emit('selectDay', cell)"
      >
        <span class="font-medium leading-none">{{ cell.day }}</span>
        <span
          v-if="cell.hasEvents"
          class="mt-1 h-1.5 w-1.5 rounded-full"
          :class="cell.isSelected ? 'bg-white' : 'bg-brand'"
        />
      </button>
    </div>
  </div>
</template>
