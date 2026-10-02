<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Clapperboard, Radio, Users } from 'lucide-vue-next'
import type { CalendarEvent } from '@/types/dashboard'

defineProps<{
  events: CalendarEvent[]
  selectedDateLabel: string
}>()

const { t } = useI18n()

const typeIconWrap: Record<CalendarEvent['type'], string> = {
  live: 'bg-brand-soft text-brand',
  video: 'bg-up/15 text-up',
  meeting: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
}

const typeIcons = {
  live: Radio,
  video: Clapperboard,
  meeting: Users,
}
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-col pl-4 lg:pl-6">
    <div class="mb-3 shrink-0">
      <p class="text-xs font-medium text-muted">{{ t('dashboard.calendar.agenda') }}</p>
      <p class="text-sm font-semibold text-ink">{{ selectedDateLabel }}</p>
    </div>

    <ul
      v-if="events.length"
      class="agenda-scroll min-h-[220px] flex-1 space-y-2.5 overflow-y-auto pr-1 lg:min-h-[260px]"
    >
      <li
        v-for="event in events"
        :key="event.id"
        class="flex items-start gap-3 rounded-xl border border-line bg-page px-3 py-3"
        :class="event.status === 'past' ? 'opacity-70' : ''"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          :class="typeIconWrap[event.type]"
        >
          <component :is="typeIcons[event.type]" class="h-4 w-4" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-faint">{{ event.time }}</p>
          <p class="mt-0.5 text-sm font-medium leading-snug text-ink">{{ event.title }}</p>
          <p class="mt-1 text-xs text-muted">
            {{ t(`dashboard.calendar.types.${event.type}`) }}
          </p>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="flex min-h-[220px] flex-1 items-center justify-center rounded-xl border border-dashed border-line px-4 text-center text-sm text-faint lg:min-h-[260px]"
    >
      {{ t('dashboard.calendar.empty') }}
    </p>
  </div>
</template>

<style scoped>
.agenda-scroll {
  scrollbar-width: none;
}

.agenda-scroll::-webkit-scrollbar {
  display: none;
}
</style>
