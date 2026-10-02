<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { DemographicSlice } from '@/types/dashboard'
import { useTheme } from '@/composables/useTheme'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const props = defineProps<{
  items: DemographicSlice[]
}>()

const { t, locale } = useI18n()
const { isDark } = useTheme()

function readToken(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const option = computed(() => {
  void isDark.value
  void locale.value

  const dark = isDark.value
  const brandFrom = readToken('--brand-gradient-from', dark ? '#3b82f6' : '#2563eb')
  const brandTo = readToken('--brand-gradient-to', dark ? '#38bdf8' : '#0ea5e9')
  const up = readToken('--trend-up', dark ? '#22c55e' : '#16a34a')
  const card = dark ? '#1e293b' : '#ffffff'

  const tooltipBg = dark ? '#1e293b' : '#ffffff'
  const tooltipBorder = dark ? '#334155' : '#e2e8f0'
  const tooltipText = dark ? '#f8fafc' : '#0f172a'
  const labelText = dark ? '#cbd5e1' : '#334155'

  const palette = [brandFrom, brandTo, up, dark ? '#94a3b8' : '#64748b']

  return {
    color: palette,
    tooltip: {
      trigger: 'item' as const,
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
      formatter: '{b}: {c}% ({d}%)',
    },
    legend: {
      orient: 'horizontal' as const,
      bottom: 0,
      textStyle: { color: labelText, fontSize: 11 },
    },
    series: [
      {
        name: t('dashboard.demographics.title'),
        type: 'pie' as const,
        radius: ['40%', '70%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: card,
          borderWidth: 2,
        },
        label: {
          show: true,
          color: labelText,
          formatter: '{d}%',
          fontSize: 11,
        },
        labelLine: {
          length: 10,
          length2: 8,
          lineStyle: { color: labelText },
        },
        data: props.items.map((item) => ({
          name: t(item.labelKey),
          value: item.value,
        })),
      },
    ],
  }
})
</script>

<template>
  <section class="flex h-full flex-col rounded-2xl border border-line bg-card p-5 shadow-sm">
    <h3 class="mb-2 text-sm font-semibold text-ink">
      {{ t('dashboard.demographics.title') }}
    </h3>
    <div class="h-80 w-full flex-1">
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
