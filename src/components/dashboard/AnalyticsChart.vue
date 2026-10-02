<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { DualChartData } from '@/types/dashboard'
import { useTheme } from '@/composables/useTheme'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
])

const props = defineProps<{
  chart: DualChartData
}>()

const { t, locale } = useI18n()
const { isDark } = useTheme()

function readToken(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

/** Compact axis labels: 1200000 → 1.2M, 3500 → 3.5K */
function formatAxisValue(value: number, withCurrency = false): string {
  const absolute = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const prefix = withCurrency ? '$' : ''

  if (absolute >= 1_000_000) {
    const n = absolute / 1_000_000
    const text = n >= 10 ? n.toFixed(0) : n.toFixed(1)
    return `${sign}${prefix}${text}M`
  }
  if (absolute >= 1_000) {
    const n = absolute / 1_000
    const text = n >= 10 ? n.toFixed(0) : n.toFixed(1)
    return `${sign}${prefix}${text}K`
  }
  return `${sign}${prefix}${Math.round(absolute)}`
}

const option = computed(() => {
  void isDark.value
  void locale.value

  const dark = isDark.value
  const brandFrom = readToken('--brand-gradient-from', dark ? '#3b82f6' : '#2563eb')
  const brandTo = readToken('--brand-gradient-to', dark ? '#38bdf8' : '#0ea5e9')
  const up = readToken('--trend-up', dark ? '#22c55e' : '#16a34a')

  const tooltipBg = dark ? '#1e293b' : '#ffffff'
  const tooltipBorder = dark ? '#334155' : '#e2e8f0'
  const tooltipText = dark ? '#f8fafc' : '#0f172a'
  const axisText = dark ? '#cbd5e1' : '#334155'
  const splitLine = dark ? '#334155' : '#cbd5e1'
  const axisLine = dark ? '#475569' : '#94a3b8'
  const pointerColor = dark ? '#94a3b8' : '#64748b'

  const leftAxisName = t(props.chart.yAxisName1Key || props.chart.views.nameKey)
  const rightAxisName = t(props.chart.yAxisName2Key || props.chart.revenue.nameKey)
  const primaryName = t(props.chart.views.nameKey)
  const secondaryName = t(props.chart.revenue.nameKey)
  const categories = props.chart.views.points.map((p) => p.date.slice(5))
  const rightIsMoney =
    props.chart.yAxisName2Key?.includes('revenue') ||
    props.chart.yAxisName2Key?.includes('gmv') ||
    props.chart.revenue.nameKey.includes('revenue') ||
    props.chart.revenue.nameKey.includes('gmv')

  const pointCount = categories.length
  // Prefer a zoomed-in recent window (~last 7–10 days); fall back to 50–100%
  const defaultStart =
    pointCount > 10 ? Math.max(0, Math.round(((pointCount - 10) / pointCount) * 100)) : 50

  return {
    color: [brandFrom, up],
    grid: {
      left: '0%',
      right: '3%',
      top: 48,
      bottom: 36,
      containLabel: true,
    },
    legend: {
      data: [primaryName, secondaryName],
      textStyle: { color: axisText },
      top: 0,
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      padding: [10, 12],
      textStyle: {
        color: tooltipText,
        fontSize: 12,
      },
      extraCssText: [
        `color:${tooltipText}`,
        'box-shadow:0 8px 24px rgba(15,23,42,0.12)',
        'border-radius:10px',
      ].join(';'),
      axisPointer: {
        type: 'line' as const,
        snap: true,
        lineStyle: {
          color: pointerColor,
          type: 'dashed' as const,
          width: 1.5,
        },
        label: {
          backgroundColor: dark ? '#334155' : '#64748b',
        },
      },
    },
    dataZoom: [
      {
        type: 'inside' as const,
        xAxisIndex: 0,
        start: defaultStart,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
        preventDefaultMouseMove: true,
      },
      {
        type: 'slider' as const,
        xAxisIndex: 0,
        start: defaultStart,
        end: 100,
        height: 20,
        bottom: 0,
        borderColor: 'transparent',
        backgroundColor: dark ? 'rgba(51,65,85,0.45)' : 'rgba(226,232,240,0.55)',
        fillerColor: dark ? 'rgba(59,130,246,0.28)' : 'rgba(37,99,235,0.22)',
        handleSize: '80%',
        handleStyle: {
          color: brandFrom,
          borderColor: brandFrom,
          shadowBlur: 0,
        },
        moveHandleSize: 0,
        dataBackground: {
          lineStyle: { color: 'transparent', opacity: 0 },
          areaStyle: { color: 'transparent', opacity: 0 },
        },
        selectedDataBackground: {
          lineStyle: { color: brandFrom, width: 1 },
          areaStyle: { color: `${brandFrom}33` },
        },
        textStyle: { color: axisText, fontSize: 10 },
        brushSelect: false,
      },
    ],
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: categories,
      axisLine: { lineStyle: { color: axisLine } },
      axisLabel: {
        color: axisText,
        hideOverlap: true,
      },
      axisTick: { show: false },
      axisPointer: {
        snap: true,
      },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: leftAxisName,
        nameTextStyle: { color: axisText, fontSize: 11 },
        splitLine: { lineStyle: { color: splitLine, type: 'dashed' as const } },
        axisLabel: {
          color: axisText,
          formatter: (value: number) => formatAxisValue(value, false),
        },
      },
      {
        type: 'value' as const,
        name: rightAxisName,
        nameTextStyle: { color: axisText, fontSize: 11 },
        splitLine: { show: false },
        axisLabel: {
          color: axisText,
          formatter: (value: number) => formatAxisValue(value, rightIsMoney),
        },
      },
    ],
    series: [
      {
        name: primaryName,
        type: 'line' as const,
        yAxisIndex: 0,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 10,
        emphasis: {
          focus: 'series' as const,
          scale: true,
        },
        lineStyle: {
          width: 3,
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: brandFrom },
              { offset: 1, color: brandTo },
            ],
          },
        },
        itemStyle: { color: brandFrom },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${brandFrom}40` },
              { offset: 1, color: `${brandTo}05` },
            ],
          },
        },
        data: props.chart.views.points.map((p) => p.value),
      },
      {
        name: secondaryName,
        type: 'line' as const,
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 10,
        emphasis: {
          focus: 'series' as const,
          scale: true,
        },
        lineStyle: {
          width: 3,
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: up },
              { offset: 1, color: '#4ade80' },
            ],
          },
        },
        itemStyle: { color: up },
        data: props.chart.revenue.points.map((p) => p.value),
      },
    ],
  }
})
</script>

<template>
  <section class="rounded-2xl border border-line bg-card p-5 shadow-sm">
    <div class="h-80 w-full">
      <VChart class="chart" :option="option" :autoresize="true" />
    </div>
  </section>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 320px;
}
</style>
