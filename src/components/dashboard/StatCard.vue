<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronDown,
  Clock,
  DollarSign,
  Eye,
  Gift,
  Heart,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { OverviewStat } from '@/types/dashboard'
import { useTheme } from '@/composables/useTheme'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const props = defineProps<{
  stat: OverviewStat
}>()

const { t, locale } = useI18n()
const { isDark } = useTheme()
const isExpanded = ref(false)
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

const iconMap = {
  eye: Eye,
  heart: Heart,
  dollar: DollarSign,
  cart: ShoppingCart,
  users: Users,
  clock: Clock,
  gift: Gift,
}

const isUp = computed(() => props.stat.trendPercent >= 0)

const hasHistory = computed(
  () => Array.isArray(props.stat.trendHistory) && props.stat.trendHistory.length > 0,
)

function readToken(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function formatAxisDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'numeric',
    day: 'numeric',
  }).format(d)
}

function formatTooltipDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(d)
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function formatValue(stat: OverviewStat): string {
  if (stat.format === 'duration') {
    return formatDuration(stat.value)
  }

  if (stat.format === 'currency') {
    const digits = Number.isInteger(stat.value) ? 0 : 1
    return `${stat.prefix ?? ''}${stat.value.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`
  }

  const absolute = Math.abs(stat.value)
  if (absolute >= 1_000_000) return `${(stat.value / 1_000_000).toFixed(2)}M`
  if (absolute >= 1_000) return `${(stat.value / 1_000).toFixed(1)}K`
  return `${stat.prefix ?? ''}${stat.value.toLocaleString()}`
}

function formatTooltipValue(value: number): string {
  if (props.stat.format === 'duration') return formatDuration(value)
  if (props.stat.format === 'currency') {
    return `${props.stat.prefix ?? '$'}${value.toLocaleString()}`
  }
  return value.toLocaleString()
}

const sparkOption = computed(() => {
  void isDark.value
  void locale.value
  const dark = isDark.value
  const trendColor =
    props.stat.trendPercent > 0
      ? readToken('--trend-up', '#10b981')
      : readToken('--trend-down', '#ef4444')
  const history = props.stat.trendHistory ?? []
  const categories = history.map((p) => formatAxisDate(p.date))
  const values = history.map((p) => p.value)
  const axisText = dark ? '#94a3b8' : '#64748b'

  function withAlpha(hex: string, alpha: number): string {
    const raw = hex.replace('#', '')
    if (raw.length !== 6) {
      return props.stat.trendPercent > 0
        ? `rgba(16, 185, 129, ${alpha})`
        : `rgba(239, 68, 68, ${alpha})`
    }
    const r = Number.parseInt(raw.slice(0, 2), 16)
    const g = Number.parseInt(raw.slice(2, 4), 16)
    const b = Number.parseInt(raw.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return {
    animationDuration: 400,
    grid: { top: 8, bottom: 4, left: 4, right: 4, containLabel: true },
    tooltip: {
      trigger: 'axis' as const,
      confine: true,
      backgroundColor: dark ? '#1e293b' : '#ffffff',
      borderColor: dark ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: dark ? '#f8fafc' : '#0f172a', fontSize: 11 },
      axisPointer: {
        type: 'line' as const,
        snap: true,
        lineStyle: { color: dark ? '#94a3b8' : '#64748b', type: 'dashed' as const, width: 1 },
      },
      formatter: (params: unknown) => {
        const list = Array.isArray(params) ? params : [params]
        const first = list[0] as { dataIndex?: number; value?: number } | undefined
        if (!first) return ''
        const point = history[first.dataIndex ?? 0]
        const dateLabel = point ? formatTooltipDate(point.date) : ''
        return `${dateLabel}<br/>${formatTooltipValue(Number(first.value ?? 0))}`
      },
    },
    xAxis: {
      type: 'category' as const,
      show: true,
      data: categories,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: axisText,
        fontSize: 10,
        interval: 0,
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value' as const,
      show: false,
      scale: true,
    },
    series: [
      {
        type: 'line' as const,
        data: values,
        smooth: 0.35,
        symbol: 'circle',
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { width: 2.5, color: trendColor },
        itemStyle: { color: trendColor },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(trendColor, 0.3) },
              { offset: 1, color: withAlpha(trendColor, 0) },
            ],
          },
        },
      },
    ],
  }
})

function toggleExpand() {
  if (!hasHistory.value) return
  isExpanded.value = !isExpanded.value
}

watch(isExpanded, async (open) => {
  if (!open) return
  await nextTick()
  // Force resize after expand animation starts so sparkline fills width
  window.setTimeout(() => {
    chartRef.value?.resize?.()
  }, 50)
  window.setTimeout(() => {
    chartRef.value?.resize?.()
  }, 320)
})
</script>

<template>
  <article
    class="w-full self-start rounded-2xl border border-line bg-card p-3.5 shadow-sm transition-all duration-300 sm:p-5"
    :class="
      hasHistory
        ? 'cursor-pointer hover:border-brand hover:shadow-md'
        : ''
    "
    :aria-expanded="hasHistory ? isExpanded : undefined"
    @click="toggleExpand"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-sm text-muted">{{ t(stat.labelKey) }}</p>
        <p class="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {{ formatValue(stat) }}
          <span v-if="stat.unit" class="text-sm font-medium text-muted">{{ stat.unit }}</span>
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <component :is="iconMap[stat.icon]" class="h-5 w-5" />
        </div>
        <ChevronDown
          v-if="hasHistory"
          class="h-4 w-4 text-faint transition-transform duration-300"
          :class="isExpanded ? 'rotate-180 text-brand' : ''"
        />
      </div>
    </div>

    <div class="mt-4 flex items-center gap-1.5 text-sm">
      <component
        :is="isUp ? TrendingUp : TrendingDown"
        class="h-4 w-4"
        :class="isUp ? 'text-up' : 'text-down'"
      />
      <span class="font-medium text-brand">
        {{ isUp ? '+' : '' }}{{ stat.trendPercent.toFixed(1) }}%
      </span>
      <span class="text-faint">{{ t(stat.trendLabelKey) }}</span>
    </div>

    <div
      class="grid transition-[grid-template-rows] duration-300 ease-out"
      :style="{ gridTemplateRows: isExpanded && hasHistory ? '1fr' : '0fr' }"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          class="pt-3"
          @click.stop
        >
          <div class="h-32 w-full">
            <VChart
              v-if="hasHistory && isExpanded"
              ref="chartRef"
              class="h-full w-full"
              :option="sparkOption"
              :autoresize="true"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
