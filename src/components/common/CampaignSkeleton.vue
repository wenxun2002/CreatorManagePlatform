<script setup lang="ts">
import Skeleton from './Skeleton.vue'
</script>

<template>
  <article class="rounded-2xl border border-line bg-card p-5 shadow-sm">
    <div class="flex items-start gap-3">
      <Skeleton box-class="h-12 w-12 shrink-0" rounded="xl" />
      <div class="min-w-0 flex-1 space-y-2">
        <Skeleton box-class="h-3 w-24" />
        <Skeleton box-class="h-4 w-[80%]" />
      </div>
      <Skeleton box-class="h-6 w-20 shrink-0" rounded="full" />
    </div>

    <div class="mt-5 space-y-2">
      <Skeleton box-class="h-3 w-full" />
      <Skeleton box-class="h-3 w-[85%]" />
    </div>

    <div class="mt-5 flex items-center justify-between border-t border-line pt-4">
      <Skeleton box-class="h-4 w-24" />
      <Skeleton box-class="h-4 w-28" />
    </div>
  </article>
</template>
