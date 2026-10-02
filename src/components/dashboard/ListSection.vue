<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { DashboardListColumn } from '@/types/dashboard'
import EmptyState from '@/components/common/EmptyState.vue'

defineProps<{
  lists: DashboardListColumn[]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <article
      v-for="column in lists"
      :key="column.id"
      class="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5"
    >
      <h3 class="mb-4 text-sm font-semibold text-ink">{{ t(column.titleKey) }}</h3>

      <EmptyState v-if="column.items.length === 0" />

      <ul v-else class="space-y-3">
        <li
          v-for="item in column.items"
          :key="item.id"
          class="flex gap-3 rounded-xl border border-line bg-page p-2.5"
        >
          <img
            v-if="item.coverUrl"
            :src="item.coverUrl"
            :alt="item.title"
            class="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-14 sm:w-20"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-ink">{{ item.title }}</p>
            <p v-if="item.subtitle" class="mt-0.5 text-xs text-faint">{{ item.subtitle }}</p>
            <p v-if="item.metricValue" class="mt-1 text-xs text-brand">
              <span v-if="item.metricLabelKey">{{ t(item.metricLabelKey) }} · </span>
              {{ item.metricValue }}
            </p>
          </div>
        </li>
      </ul>
    </article>
  </section>
</template>
