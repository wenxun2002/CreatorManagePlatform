<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CalendarClock,
  CircleDollarSign,
  Download,
  Loader2,
  Paperclip,
  X,
} from 'lucide-vue-next'
import type { Campaign, CampaignStatus } from '@/types/campaign'
import { formatCompactCurrency } from '@/utils/format'
import { useAuthStore } from '@/stores/useAuthStore'
import UploadZone from '@/components/content/UploadZone.vue'

const props = defineProps<{
  open: boolean
  campaign: Campaign | null
  actionLoading?: boolean
}>()

const emit = defineEmits<{
  close: []
  accept: [campaign: Campaign]
  submitDeliverable: [
    payload: { campaign: Campaign; file: File; description: string },
  ]
  approve: [campaign: Campaign]
}>()

const { t, locale } = useI18n()
const auth = useAuthStore()

const submissionFile = ref<File | null>(null)
const submissionDesc = ref('')
const submitError = ref('')

const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm'

const statusClass: Record<CampaignStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  in_progress: 'bg-brand-soft text-brand',
  under_review: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  completed: 'bg-up/15 text-up',
}

const isCreator = computed(() => auth.role === 'creator')
const isManager = computed(() => auth.role === 'manager')

const showSubmitForm = computed(
  () => isCreator.value && props.campaign?.status === 'in_progress',
)

const showAccept = computed(
  () => isCreator.value && props.campaign?.status === 'pending',
)

const showApprove = computed(
  () => isManager.value && props.campaign?.status === 'under_review',
)

const headerAvatar = computed(() => {
  if (!props.campaign) return ''
  if (isManager.value) {
    return props.campaign.creatorAvatarUrl || props.campaign.brandLogoUrl
  }
  return props.campaign.managerAvatarUrl || props.campaign.brandLogoUrl
})

function formatDueDate(iso: string): string {
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))
}

function resetSubmitForm() {
  submissionFile.value = null
  submissionDesc.value = props.campaign?.submissionDesc ?? ''
  submitError.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && !props.actionLoading) {
    emit('close')
  }
}

function onVideoSelect(files: FileList) {
  submissionFile.value = files[0] ?? null
  submitError.value = ''
}

function onSubmitDeliverable() {
  if (!props.campaign) return
  if (!submissionFile.value) {
    submitError.value = t('campaigns.drawer.videoFileRequired')
    return
  }
  const desc = submissionDesc.value.trim()
  if (!desc) {
    submitError.value = t('campaigns.drawer.descRequired')
    return
  }
  submitError.value = ''
  emit('submitDeliverable', {
    campaign: props.campaign,
    file: submissionFile.value,
    description: desc,
  })
}

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) resetSubmitForm()
  },
)

watch(
  () => props.campaign?.id,
  () => {
    if (props.open) resetSubmitForm()
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]"
        aria-hidden="true"
        @click.self="!actionLoading && emit('close')"
      />
    </Transition>
    <Transition name="drawer-panel">
      <aside
        v-if="open && campaign"
        class="fixed z-[51] flex flex-col border-line bg-card shadow-2xl
          inset-x-0 bottom-0 top-auto max-h-[92vh] w-full rounded-t-2xl border-t
          md:inset-y-0 md:right-0 md:left-auto md:top-0 md:max-h-none md:max-w-lg md:rounded-none md:border-l md:border-t-0"
        role="dialog"
        aria-modal="true"
        :aria-label="campaign.title"
      >
        <div class="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line md:hidden" aria-hidden="true" />

        <header class="flex shrink-0 items-start gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-4">
          <img
            :src="headerAvatar"
            :alt="
              isManager
                ? campaign.creatorName || campaign.brandName
                : campaign.managerName || campaign.brandName
            "
            class="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-muted">
              {{
                isManager
                  ? campaign.creatorName || campaign.brandName
                  : campaign.managerName || campaign.brandName
              }}
            </p>
            <h2 class="mt-0.5 text-base font-semibold leading-snug text-ink">
              {{ campaign.title }}
            </h2>
            <span
              class="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              :class="statusClass[campaign.status]"
            >
              {{ t(`campaigns.status.${campaign.status}`) }}
            </span>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-page hover:text-ink"
            :aria-label="t('campaigns.drawer.close')"
            :disabled="actionLoading"
            @click="emit('close')"
          >
            <X class="h-4 w-4" />
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div class="mb-6 flex flex-wrap gap-4 rounded-xl border border-line bg-page p-4 text-sm">
            <div class="flex items-center gap-2 text-ink">
              <CircleDollarSign class="h-4 w-4 text-brand" />
              <span class="font-semibold">{{ formatCompactCurrency(campaign.budget) }}</span>
            </div>
            <div class="flex items-center gap-2 text-muted">
              <CalendarClock class="h-4 w-4 text-faint" />
              <span>{{ formatDueDate(campaign.dueDate) }}</span>
            </div>
          </div>

          <section class="mb-6">
            <h3 class="mb-2 text-sm font-semibold text-ink">
              {{ t('campaigns.drawer.attachmentsTitle') }}
            </h3>
            <ul v-if="campaign.attachments.length" class="space-y-2">
              <li
                v-for="file in campaign.attachments"
                :key="file.path"
              >
                <a
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink transition-colors hover:border-brand hover:bg-brand-soft/40"
                >
                  <Paperclip class="h-4 w-4 shrink-0 text-brand" />
                  <span class="min-w-0 flex-1 truncate">{{ file.name }}</span>
                  <Download class="h-4 w-4 shrink-0 text-muted" />
                </a>
              </li>
            </ul>
            <p v-else class="text-sm text-muted">{{ t('campaigns.drawer.noAttachments') }}</p>
          </section>

          <section v-if="campaign.submissionDesc || campaign.submissionFileUrl" class="mb-6">
            <h3 class="mb-2 text-sm font-semibold text-ink">
              {{ t('campaigns.drawer.deliverable') }}
            </h3>
            <p
              v-if="campaign.submissionDesc"
              class="mb-3 whitespace-pre-line rounded-xl border border-line bg-page p-4 text-sm leading-relaxed text-muted"
            >
              {{ campaign.submissionDesc }}
            </p>
            <a
              v-if="campaign.submissionFileUrl"
              :href="campaign.submissionFileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              <Download class="h-4 w-4 shrink-0" />
              <span class="truncate">
                {{ campaign.submissionOriginalName || t('campaigns.drawer.downloadSubmission') }}
              </span>
            </a>
          </section>

          <section v-if="showSubmitForm" class="space-y-3">
            <h3 class="text-sm font-semibold text-ink">
              {{ t('campaigns.drawer.submitDeliverable') }}
            </h3>
            <div>
              <label class="mb-1.5 block text-xs text-muted">
                {{ t('campaigns.drawer.videoFile') }}
                <span class="text-down">*</span>
              </label>
              <UploadZone
                compact
                :accept="VIDEO_ACCEPT"
                :title="t('campaigns.drawer.videoDropTitle')"
                :hint="t('campaigns.drawer.videoDropHint')"
                :drop-active="t('content.upload.dropActive')"
                :drop-hint="t('content.upload.dropHint')"
                @select="onVideoSelect"
              />
              <p v-if="submissionFile" class="mt-2 truncate text-xs text-muted">
                {{ submissionFile.name }}
              </p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-muted" for="deliverable-desc">
                {{ t('campaigns.drawer.submissionDesc') }}
                <span class="text-down">*</span>
              </label>
              <textarea
                id="deliverable-desc"
                v-model="submissionDesc"
                rows="4"
                class="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                :placeholder="t('campaigns.drawer.submissionDescPlaceholder')"
              />
            </div>
            <p v-if="submitError" class="text-xs text-down">{{ submitError }}</p>
          </section>
        </div>

        <footer
          class="flex shrink-0 flex-col gap-2 border-t border-line bg-card px-4 py-3 sm:px-5 sm:py-4"
          style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
        >
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl border border-line bg-page px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
              :disabled="actionLoading"
              @click="emit('close')"
            >
              {{ t('campaigns.drawer.cancel') }}
            </button>

            <button
              v-if="showAccept"
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
              :disabled="actionLoading"
              @click="emit('accept', campaign)"
            >
              <Loader2 v-if="actionLoading" class="h-4 w-4 animate-spin" />
              {{ t('campaigns.actions.accept') }}
            </button>

            <button
              v-else-if="showSubmitForm"
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
              :disabled="actionLoading"
              @click="onSubmitDeliverable"
            >
              <Loader2 v-if="actionLoading" class="h-4 w-4 animate-spin" />
              {{
                actionLoading
                  ? t('campaigns.drawer.uploading')
                  : t('campaigns.actions.submitDeliverable')
              }}
            </button>

            <button
              v-else-if="showApprove"
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
              :disabled="actionLoading"
              @click="emit('approve', campaign)"
            >
              <Loader2 v-if="actionLoading" class="h-4 w-4 animate-spin" />
              {{ t('campaigns.actions.approve') }}
            </button>
          </div>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .drawer-panel-enter-from,
  .drawer-panel-leave-to {
    transform: translateX(100%);
  }
}
</style>
