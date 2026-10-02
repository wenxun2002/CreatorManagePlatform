import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CalendarEvent } from '@/types/dashboard'

export interface CalendarCell {
  date: Date
  iso: string
  day: number
  inCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  hasEvents: boolean
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useCreatorCalendar(eventsMap: () => Record<string, CalendarEvent[]>) {
  const { locale } = useI18n()

  const today = startOfDay(new Date())
  const currentMonth = ref(startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)))
  const selectedDate = ref(startOfDay(new Date()))

  const weekdays = computed(() => {
    const formatter = new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
      weekday: 'narrow',
    })
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 1 + i)
      return formatter.format(d)
    })
  })

  const monthLabel = computed(() =>
    new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
    }).format(currentMonth.value),
  )

  const selectedDateLabel = computed(() =>
    new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    }).format(selectedDate.value),
  )

  const cells = computed<CalendarCell[]>(() => {
    const map = eventsMap()
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7
    const gridStart = new Date(year, month, 1 - startOffset)
    const selectedIso = toIso(selectedDate.value)
    const todayIso = toIso(today)

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + i)
      const iso = toIso(date)
      return {
        date,
        iso,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === month,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
        hasEvents: Boolean(map[iso]?.length),
      }
    })
  })

  const selectedEvents = computed(() => eventsMap()[toIso(selectedDate.value)] ?? [])

  function prevMonth() {
    const d = new Date(currentMonth.value)
    d.setMonth(d.getMonth() - 1)
    currentMonth.value = startOfDay(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  function nextMonth() {
    const d = new Date(currentMonth.value)
    d.setMonth(d.getMonth() + 1)
    currentMonth.value = startOfDay(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  function selectDay(cell: CalendarCell) {
    selectedDate.value = startOfDay(cell.date)
    if (!cell.inCurrentMonth) {
      currentMonth.value = startOfDay(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1))
    }
  }

  return {
    weekdays,
    monthLabel,
    selectedDateLabel,
    cells,
    selectedEvents,
    prevMonth,
    nextMonth,
    selectDay,
  }
}
