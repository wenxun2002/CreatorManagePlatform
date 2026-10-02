<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-page text-ink">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main
        class="flex-1 overflow-auto overflow-x-hidden bg-page p-3 pb-20 sm:p-4 md:p-6 md:pb-6"
      >
        <RouterView />
      </main>
    </div>
    <AppBottomNav />
  </div>
</template>
