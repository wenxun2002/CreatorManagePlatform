<script setup lang="ts">
import type { OverviewStat } from '@/types/dashboard'
import StatCard from './StatCard.vue'

defineProps<{
  stats: OverviewStat[]
}>()
</script>

<template>
  <section class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard v-for="stat in stats" :key="stat.id" :stat="stat" />
  </section>
</template>
