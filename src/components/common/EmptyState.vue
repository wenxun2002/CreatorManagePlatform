<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import emptyIllustration from '@/assets/empty-illustration.svg'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  },
)

const { t } = useI18n()
</script>

<template>
  <div class="flex h-full min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
    <img :src="emptyIllustration" alt="" class="mb-4 h-28 w-auto text-faint" />
    <p class="text-sm font-medium text-muted">{{ title || t('common.emptyTitle') }}</p>
    <p class="mt-1 max-w-xs text-xs text-faint">
      {{ description || t('common.emptyDescription') }}
    </p>
  </div>
</template>
