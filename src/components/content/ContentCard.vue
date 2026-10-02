<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Play } from 'lucide-vue-next'
import type { ContentItem } from '@/types/content'

const props = defineProps<{
  item: ContentItem
}>()

const { t, locale } = useI18n()

const durationLabel = computed(() => {
  const total = Math.max(0, Math.floor(props.item.durationSec))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const dateLabel = computed(() => {
  const loc = locale.value === 'zh' ? 'zh-CN' : 'en-US'
  const value = new Date(props.item.date)

  if (props.item.status === 'scheduled') {
    const formatted = new Intl.DateTimeFormat(loc, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale.value !== 'zh',
    }).format(value)
    return t('content.card.scheduledFor', { date: formatted })
  }

  const formatted = new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(value)

  if (props.item.status === 'draft') {
    return t('content.card.editedOn', { date: formatted })
  }
  return t('content.card.publishedOn', { date: formatted })
})
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-lg hover:shadow-brand/15 dark:hover:shadow-brand/25"
  >
    <div class="relative aspect-video overflow-hidden bg-page">
      <img
        :src="item.coverUrl"
        :alt="item.title"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-200 group-hover:bg-ink/35 group-hover:opacity-100"
      >
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/40"
        >
          <Play class="ml-0.5 h-5 w-5 fill-current" />
        </span>
      </div>
      <span
        class="absolute bottom-2 right-2 rounded-md bg-ink/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm"
      >
        {{ durationLabel }}
      </span>
    </div>
    <div class="p-3 sm:p-3.5">
      <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-ink">
        {{ item.title }}
      </h3>
      <p class="mt-1.5 text-xs text-muted">{{ dateLabel }}</p>
    </div>
  </article>
</template>
