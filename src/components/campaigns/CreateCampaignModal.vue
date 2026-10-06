<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Loader2, Search, X } from 'lucide-vue-next'
import { createCampaign, getCreators } from '@/api/campaigns'
import type { Campaign } from '@/types/campaign'
import UploadZone from '@/components/content/UploadZone.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [campaigns: Campaign[]]
}>()

const { t } = useI18n()

const title = ref('')
const budget = ref('')
const dueDate = ref('')
const creatorQuery = ref('')
const selectedCreatorIds = ref<number[]>([])
const creators = ref<{ id: number; name: string; email: string }[]>([])
const attachmentFiles = ref<File[]>([])
const loadingCreators = ref(false)
const submitting = ref(false)
const error = ref('')

const ATTACH_ACCEPT =
  '.zip,.pdf,.mp4,.jpg,.jpeg,.png,.gif,.webp,application/zip,application/pdf,video/mp4,image/jpeg,image/png,image/gif,image/webp'

const ATTACH_EXT = ['.zip', '.pdf', '.mp4', '.jpg', '.jpeg', '.png', '.gif', '.webp']

const filteredCreators = computed(() => {
  const q = creatorQuery.value.trim().toLowerCase()
  if (!q) return creators.value
  return creators.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
  )
})

const selectedCreators = computed(() =>
  creators.value.filter((c) => selectedCreatorIds.value.includes(c.id)),
)

function creatorAvatar(email: string) {
  return `https://i.pravatar.cc/64?u=${encodeURIComponent(email)}`
}

function resetForm() {
  title.value = ''
  budget.value = ''
  dueDate.value = ''
  creatorQuery.value = ''
  selectedCreatorIds.value = []
  attachmentFiles.value = []
  error.value = ''
}

function toggleCreator(id: number) {
  const set = new Set(selectedCreatorIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedCreatorIds.value = [...set]
}

function removeCreator(id: number) {
  selectedCreatorIds.value = selectedCreatorIds.value.filter((x) => x !== id)
}

function isAllowedFile(file: File) {
  const name = file.name.toLowerCase()
  return ATTACH_EXT.some((ext) => name.endsWith(ext))
}

function addFiles(list: FileList | File[]) {
  const next = [...attachmentFiles.value]
  for (const file of Array.from(list)) {
    if (!isAllowedFile(file)) continue
    if (next.some((f) => f.name === file.name && f.size === file.size)) continue
    next.push(file)
  }
  attachmentFiles.value = next
}

function removeAttachment(index: number) {
  attachmentFiles.value = attachmentFiles.value.filter((_, i) => i !== index)
}

async function loadCreators() {
  loadingCreators.value = true
  try {
    creators.value = await getCreators()
  } catch {
    error.value = t('campaigns.create.loadCreatorsFailed')
  } finally {
    loadingCreators.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) {
      resetForm()
      void loadCreators()
    }
  },
)

async function onSubmit() {
  error.value = ''
  if (
    !title.value.trim() ||
    !budget.value ||
    !dueDate.value ||
    selectedCreatorIds.value.length === 0
  ) {
    error.value = t('campaigns.create.validation')
    return
  }

  submitting.value = true
  try {
    const campaigns = await createCampaign({
      title: title.value.trim(),
      budget: Number(budget.value),
      due_date: dueDate.value,
      creator_ids: selectedCreatorIds.value,
      attachments: attachmentFiles.value,
    })
    emit('created', campaigns)
    emit('close')
  } catch {
    error.value = t('campaigns.create.failed')
  } finally {
    submitting.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && !submitting.value) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm md:items-center md:p-4"
        @click.self="!submitting && emit('close')"
      >
        <div
          class="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-line bg-card shadow-2xl md:rounded-2xl"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line md:hidden" aria-hidden="true" />
          <header class="flex shrink-0 items-center justify-between border-b border-line px-4 py-3 sm:px-5 sm:py-4">
            <h2 class="text-base font-semibold text-ink">{{ t('campaigns.create.title') }}</h2>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink disabled:opacity-40"
              :disabled="submitting"
              @click="emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </header>

          <form
            class="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
            @submit.prevent="onSubmit"
          >
            <div>
              <label class="mb-1.5 block text-xs font-medium text-muted" for="cmp-title">
                {{ t('campaigns.create.fields.title') }}
              </label>
              <input
                id="cmp-title"
                v-model="title"
                type="text"
                required
                class="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted" for="cmp-budget">
                  {{ t('campaigns.create.fields.budget') }}
                </label>
                <input
                  id="cmp-budget"
                  v-model="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted" for="cmp-due">
                  {{ t('campaigns.create.fields.dueDate') }}
                </label>
                <input
                  id="cmp-due"
                  v-model="dueDate"
                  type="date"
                  required
                  class="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium text-muted">
                {{ t('campaigns.create.fields.creators') }}
              </label>

              <div
                v-if="selectedCreators.length"
                class="mb-2 flex flex-wrap gap-2"
              >
                <button
                  v-for="c in selectedCreators"
                  :key="c.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft py-1 pl-1 pr-2 text-xs font-medium text-brand"
                  @click="removeCreator(c.id)"
                >
                  <img
                    :src="creatorAvatar(c.email)"
                    :alt="c.name"
                    class="h-5 w-5 rounded-full object-cover"
                  />
                  {{ c.name }}
                  <X class="h-3 w-3 opacity-70" />
                </button>
              </div>

              <div class="overflow-hidden rounded-xl border border-line bg-page">
                <div class="flex items-center gap-2 border-b border-line px-3 py-2">
                  <Search class="h-4 w-4 shrink-0 text-faint" />
                  <input
                    v-model="creatorQuery"
                    type="search"
                    class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                    :placeholder="t('campaigns.create.fields.creatorSearch')"
                    :disabled="loadingCreators"
                  />
                </div>
                <ul class="max-h-40 overflow-y-auto py-1">
                  <li v-if="loadingCreators" class="px-3 py-3 text-xs text-muted">
                    {{ t('common.loading') }}
                  </li>
                  <li
                    v-else-if="!filteredCreators.length"
                    class="px-3 py-3 text-xs text-muted"
                  >
                    {{ t('campaigns.create.fields.noCreators') }}
                  </li>
                  <li v-for="c in filteredCreators" :key="c.id">
                    <button
                      type="button"
                      class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-brand-soft/50"
                      @click="toggleCreator(c.id)"
                    >
                      <img
                        :src="creatorAvatar(c.email)"
                        :alt="c.name"
                        class="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-line"
                      />
                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-medium text-ink">{{ c.name }}</span>
                        <span class="block truncate text-xs text-muted">{{ c.email }}</span>
                      </span>
                      <span
                        class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                        :class="
                          selectedCreatorIds.includes(c.id)
                            ? 'border-brand bg-brand text-white'
                            : 'border-line bg-card text-transparent'
                        "
                      >
                        <Check class="h-3 w-3" />
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium text-muted">
                {{ t('campaigns.create.fields.attachments') }}
              </label>
              <UploadZone
                compact
                multiple
                :accept="ATTACH_ACCEPT"
                :title="t('campaigns.create.fields.attachmentsHint')"
                :hint="t('campaigns.create.fields.attachmentsTypes')"
                :drop-active="t('content.upload.dropActive')"
                :drop-hint="t('content.upload.dropHint')"
                @select="addFiles"
              />
              <ul v-if="attachmentFiles.length" class="mt-2 space-y-1.5">
                <li
                  v-for="(file, index) in attachmentFiles"
                  :key="`${file.name}-${file.size}`"
                  class="flex items-center justify-between gap-2 rounded-lg border border-line bg-page px-3 py-2 text-xs"
                >
                  <span class="truncate text-ink">{{ file.name }}</span>
                  <button
                    type="button"
                    class="shrink-0 text-muted hover:text-down"
                    @click="removeAttachment(index)"
                  >
                    <X class="h-3.5 w-3.5" />
                  </button>
                </li>
              </ul>
            </div>

            <p v-if="error" class="text-xs text-down">{{ error }}</p>

            <div class="flex gap-3 pt-1">
              <button
                type="button"
                class="flex-1 rounded-xl border border-line bg-page px-4 py-2.5 text-sm font-medium text-muted hover:text-ink"
                :disabled="submitting"
                @click="emit('close')"
              >
                {{ t('campaigns.drawer.cancel') }}
              </button>
              <button
                type="submit"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
                :disabled="submitting || loadingCreators"
              >
                <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
                {{ t('campaigns.create.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
