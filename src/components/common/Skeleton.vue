<script setup lang="ts">
withDefaults(
  defineProps<{
    boxClass?: string
    rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full'
  }>(),
  {
    boxClass: '',
    rounded: 'xl',
  },
)

const roundedMap = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}
</script>

<template>
  <div
    class="animate-pulse bg-line/70 dark:bg-line"
    :class="[roundedMap[rounded], boxClass]"
    aria-hidden="true"
  />
</template>
