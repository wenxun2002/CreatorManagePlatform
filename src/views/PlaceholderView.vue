<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="mx-auto max-w-3xl rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
    <p class="text-base text-muted">{{ t('common.placeholder') }}</p>
  </div>
</template>
