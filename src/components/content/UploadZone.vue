<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CloudUpload } from 'lucide-vue-next'

const emit = defineEmits<{
  select: [files: FileList]
}>()

const { t } = useI18n()
const inputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
/** Nested dragenter/leave counter — avoids flicker when crossing child nodes */
let dragDepth = 0

function openPicker() {
  inputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    emit('select', input.files)
    input.value = ''
  }
}

function resetDrag() {
  dragDepth = 0
  dragging.value = false
}

function onDrop(event: DragEvent) {
  resetDrag()
  const files = event.dataTransfer?.files
  if (files?.length) emit('select', files)
}

function onDragEnter(event: DragEvent) {
  event.preventDefault()
  dragDepth += 1
  dragging.value = true
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  dragging.value = true
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) dragging.value = false
}
</script>

<template>
  <button
    type="button"
    class="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-6 sm:py-12"
    :class="
      dragging
        ? 'scale-[1.01] border-solid border-brand bg-brand-soft shadow-lg shadow-brand/25 ring-4 ring-brand/30 dark:bg-brand/25 dark:ring-brand/40'
        : 'border-line bg-card hover:border-brand hover:bg-brand-soft/50 dark:hover:bg-brand-soft/30'
    "
    @click="openPicker"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div
      v-if="dragging"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--brand-primary)_0%,transparent_70%)] opacity-15 dark:opacity-25"
      aria-hidden="true"
    />
    <div
      class="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200"
      :class="
        dragging
          ? 'scale-110 bg-brand text-white shadow-md shadow-brand/40'
          : 'bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white'
      "
    >
      <CloudUpload class="h-7 w-7" :class="dragging ? 'animate-bounce' : ''" />
    </div>
    <p
      class="relative text-sm font-semibold transition-colors"
      :class="dragging ? 'text-brand' : 'text-ink'"
    >
      {{ dragging ? t('content.upload.dropActive') : t('content.upload.title') }}
    </p>
    <p
      class="relative mt-1.5 text-xs transition-colors"
      :class="dragging ? 'font-medium text-brand' : 'text-muted'"
    >
      {{ dragging ? t('content.upload.dropHint') : t('content.upload.hint') }}
    </p>
    <input
      ref="inputRef"
      type="file"
      accept="video/mp4,video/webm,.mp4,.webm"
      class="hidden"
      @change="onFileChange"
    />
  </button>
</template>
