import { onMounted, ref, watch } from 'vue'
import { fetchDashboardData } from '@/mock/dashboard'
import type { DashboardData, DashboardTab, DateRange } from '@/types/dashboard'

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function defaultRange(): DateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 13)
  return {
    start: toIsoDate(start),
    end: toIsoDate(end),
  }
}

export function useDashboard() {
  const activeTab = ref<DashboardTab>('short_video')
  const dateRange = ref<DateRange>(defaultRange())
  const loading = ref(false)
  const data = ref<DashboardData | null>(null)

  async function load() {
    loading.value = true
    try {
      data.value = await fetchDashboardData(activeTab.value, dateRange.value)
    } finally {
      loading.value = false
    }
  }

  function setTab(tab: DashboardTab) {
    activeTab.value = tab
  }

  function setDateRange(range: DateRange) {
    dateRange.value = range
  }

  watch([activeTab, dateRange], () => {
    void load()
  })

  onMounted(() => {
    void load()
  })

  return {
    activeTab,
    dateRange,
    loading,
    data,
    setTab,
    setDateRange,
    reload: load,
  }
}
