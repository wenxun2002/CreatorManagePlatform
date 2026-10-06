<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchContentItems } from '@/mock/content'
import type { ContentItem, ContentStatus } from '@/types/content'
import UploadZone from '@/components/content/UploadZone.vue'
import ContentCard from '@/components/content/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { t } = useI18n()

const loading = ref(true)
const items = ref<ContentItem[]>([])
const activeTab = ref<ContentStatus>('published')

const tabs: { key: ContentStatus; labelKey: string }[] = [
  { key: 'published', labelKey: 'content.tabs.published' },
  { key: 'draft', labelKey: 'content.tabs.drafts' },
  { key: 'scheduled', labelKey: 'content.tabs.scheduled' },
]

const filteredItems = computed(() =>
  items.value.filter((item) => item.status === activeTab.value),
)

function onUploadSelect(_files: FileList) {
  // Demo upload — wire to real API later
}

async function load() {
  loading.value = true
  try {
    items.value = await fetchContentItems()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <div>
      <h2 class="text-base font-semibold text-ink">{{ t('content.heading') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('content.subtitle') }}</p>
    </div>

    <UploadZone
      :title="t('content.upload.title')"
      :hint="t('content.upload.hint')"
      :drop-active="t('content.upload.dropActive')"
      :drop-hint="t('content.upload.dropHint')"
      @select="onUploadSelect"
    />

    <div class="flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1 self-start">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm"
        :class="
          activeTab === tab.key
            ? 'bg-brand-soft text-brand shadow-sm'
            : 'text-muted hover:text-ink'
        "
        @click="activeTab = tab.key"
      >
        {{ t(tab.labelKey) }}
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="n in 8"
        :key="n"
        class="overflow-hidden rounded-2xl border border-line bg-card"
      >
        <Skeleton box-class="aspect-video w-full !rounded-none" />
        <div class="space-y-2 p-3 sm:p-3.5">
          <Skeleton box-class="h-4 w-[80%]" />
          <Skeleton box-class="h-3 w-1/2" />
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredItems.length"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
    >
      <ContentCard v-for="item in filteredItems" :key="item.id" :item="item" />
    </div>

    <div v-else class="rounded-2xl border border-line bg-card">
      <EmptyState
        :title="t('content.emptyTitle')"
        :description="t('content.emptyDescription')"
      />
    </div>
  </div>
</template>
