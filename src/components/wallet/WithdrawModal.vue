<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircle2, Loader2, X } from 'lucide-vue-next'
import type { WithdrawMethod } from '@/types/wallet'
import { formatCurrency } from '@/utils/format'
import { submitWithdrawal } from '@/mock/wallet'

const props = defineProps<{
  open: boolean
  availableBalance: number
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const { t } = useI18n()

type Phase = 'form' | 'loading' | 'success'

const phase = ref<Phase>('form')
const amountInput = ref('')
const method = ref<WithdrawMethod>('bank')
const errorKey = ref('')

const amount = computed(() => {
  const parsed = Number.parseFloat(amountInput.value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : NaN
})

const methods: { key: WithdrawMethod; labelKey: string }[] = [
  { key: 'bank', labelKey: 'wallet.withdraw.methods.bank' },
  { key: 'paypal', labelKey: 'wallet.withdraw.methods.paypal' },
]

function resetForm() {
  phase.value = 'form'
  amountInput.value = ''
  method.value = 'bank'
  errorKey.value = ''
}

function validate(): boolean {
  if (!Number.isFinite(amount.value) || amount.value <= 0) {
    errorKey.value = 'wallet.withdraw.errors.invalid'
    return false
  }
  if (amount.value > props.availableBalance) {
    errorKey.value = 'wallet.withdraw.errors.exceeds'
    return false
  }
  errorKey.value = ''
  return true
}

async function onConfirm() {
  if (!validate()) return
  phase.value = 'loading'
  try {
    await submitWithdrawal(amount.value, method.value)
    phase.value = 'success'
    emit('success')
    window.setTimeout(() => {
      emit('close')
    }, 1400)
  } catch {
    phase.value = 'form'
    errorKey.value = 'wallet.withdraw.errors.failed'
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && phase.value !== 'loading') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) resetForm()
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
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm md:items-center md:p-4"
        @click.self="phase !== 'loading' && emit('close')"
      >
        <div
          class="withdraw-sheet w-full max-w-md overflow-hidden border border-line bg-card shadow-2xl rounded-t-2xl border-b-0 md:rounded-2xl md:border"
          role="dialog"
          aria-modal="true"
          :aria-label="t('wallet.withdraw.title')"
        >
          <div class="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
          <header class="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5 sm:py-4">
            <h2 class="text-base font-semibold text-ink">{{ t('wallet.withdraw.title') }}</h2>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-ink disabled:opacity-40"
              :disabled="phase === 'loading'"
              :aria-label="t('wallet.withdraw.close')"
              @click="emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </header>

          <div class="px-4 py-4 sm:px-5 sm:py-5">
            <div
              v-if="phase === 'loading'"
              class="flex flex-col items-center justify-center gap-3 py-10"
            >
              <Loader2 class="h-10 w-10 animate-spin text-brand" />
              <p class="text-sm text-muted">{{ t('wallet.withdraw.processing') }}</p>
            </div>

            <div
              v-else-if="phase === 'success'"
              class="flex flex-col items-center justify-center gap-3 py-10"
            >
              <CheckCircle2 class="h-12 w-12 text-up" />
              <p class="text-base font-semibold text-ink">{{ t('wallet.withdraw.success') }}</p>
              <p class="text-xs text-muted">{{ t('wallet.withdraw.successHint') }}</p>
            </div>

            <div v-else class="space-y-5">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-muted" for="withdraw-amount">
                  {{ t('wallet.withdraw.amountLabel') }}
                </label>
                <div
                  class="flex items-center rounded-xl border border-line bg-page focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
                >
                  <span class="pl-3 text-sm font-medium text-muted">$</span>
                  <input
                    id="withdraw-amount"
                    v-model="amountInput"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="0.01"
                    :max="availableBalance"
                    class="w-full bg-transparent px-2 py-2.5 text-sm text-ink outline-none tabular-nums placeholder:text-faint"
                    :placeholder="t('wallet.withdraw.amountPlaceholder')"
                    @input="errorKey = ''"
                  />
                </div>
                <p class="mt-1.5 text-xs text-faint">
                  {{ t('wallet.withdraw.availableHint', { amount: formatCurrency(availableBalance) }) }}
                </p>
                <p v-if="errorKey" class="mt-1.5 text-xs text-down">{{ t(errorKey) }}</p>
              </div>

              <div>
                <p class="mb-2 text-xs font-medium text-muted">
                  {{ t('wallet.withdraw.methodLabel') }}
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="item in methods"
                    :key="item.key"
                    type="button"
                    class="rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
                    :class="
                      method === item.key
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line text-muted hover:border-brand/50 hover:text-ink'
                    "
                    @click="method = item.key"
                  >
                    {{ t(item.labelKey) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <footer
            v-if="phase === 'form'"
            class="flex gap-3 border-t border-line px-4 py-3 sm:px-5 sm:py-4"
            style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
          >
            <button
              type="button"
              class="flex-1 rounded-xl border border-line bg-page px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
              @click="emit('close')"
            >
              {{ t('wallet.withdraw.cancel') }}
            </button>
            <button
              type="button"
              class="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              @click="onConfirm"
            >
              {{ t('wallet.withdraw.confirm') }}
            </button>
          </footer>
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

.modal-fade-enter-active .withdraw-sheet,
.modal-fade-leave-active .withdraw-sheet {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .withdraw-sheet,
.modal-fade-leave-to .withdraw-sheet {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .modal-fade-enter-from .withdraw-sheet,
  .modal-fade-leave-to .withdraw-sheet {
    transform: translateY(12px) scale(0.98);
  }
}
</style>
