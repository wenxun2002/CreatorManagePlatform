<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarClock, CircleDollarSign, Download, FileText, X } from 'lucide-vue-next'
import type { Campaign, CampaignStatus } from '@/types/campaign'
import { formatCompactCurrency } from '@/utils/format'

const props = defineProps<{
  open: boolean
  campaign: Campaign | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t, locale } = useI18n()

const statusClass: Record<CampaignStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  in_progress: 'bg-brand-soft text-brand',
  under_review: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  completed: 'bg-up/15 text-up',
}

const primaryActionKey = computed(() => {
  if (!props.campaign) return 'campaigns.drawer.actions.accept'
  switch (props.campaign.status) {
    case 'pending':
      return 'campaigns.drawer.actions.accept'
    case 'in_progress':
      return 'campaigns.drawer.actions.submitDraft'
    case 'under_review':
      return 'campaigns.drawer.actions.viewReview'
    case 'completed':
      return 'campaigns.drawer.actions.viewSummary'
    default:
      return 'campaigns.drawer.actions.accept'
  }
})

function formatDueDate(iso: string): string {
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
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
        @click.self="emit('close')"
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
            <!-- Header -->
            <header class="flex shrink-0 items-start gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-4">
              <img
                :src="campaign.brandLogoUrl"
                :alt="campaign.brandName"
                class="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-line"
              />
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium text-muted">{{ campaign.brandName }}</p>
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
                @click="emit('close')"
              >
                <X class="h-4 w-4" />
              </button>
            </header>

            <!-- Body -->
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
                  {{ t('campaigns.drawer.briefTitle') }}
                </h3>
                <div
                  class="whitespace-pre-line rounded-xl border border-line bg-page p-4 text-sm leading-relaxed text-muted"
                >
                  {{ campaign.brief }}
                </div>
              </section>

              <section>
                <h3 class="mb-2 text-sm font-semibold text-ink">
                  {{ t('campaigns.drawer.attachmentsTitle') }}
                </h3>
                <ul v-if="campaign.attachments.length" class="space-y-2">
                  <li
                    v-for="file in campaign.attachments"
                    :key="file.id"
                    class="flex items-center justify-between gap-3 rounded-xl border border-line bg-page px-3 py-2.5"
                  >
                    <div class="flex min-w-0 items-center gap-2.5">
                      <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"
                      >
                        <FileText class="h-4 w-4" />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-ink">{{ file.name }}</p>
                        <p class="text-xs text-faint">{{ file.sizeLabel }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-brand/30 bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white dark:border-brand/40 dark:hover:bg-brand-hover"
                    >
                      <Download class="h-3.5 w-3.5" />
                      {{ t('campaigns.drawer.download') }}
                    </button>
                  </li>
                </ul>
                <p
                  v-else
                  class="rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-faint"
                >
                  {{ t('campaigns.drawer.noAttachments') }}
                </p>
              </section>
            </div>

            <!-- Footer -->
            <footer
              class="flex shrink-0 gap-3 border-t border-line bg-card px-4 py-3 sm:px-5 sm:py-4"
              style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
            >
              <button
                type="button"
                class="flex-1 rounded-xl border border-line bg-page px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
                @click="emit('close')"
              >
                {{ t('campaigns.drawer.cancel') }}
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                {{ t(primaryActionKey) }}
              </button>
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
