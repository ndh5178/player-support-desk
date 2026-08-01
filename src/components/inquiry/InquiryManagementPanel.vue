<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type {
  Agent,
  Inquiry,
  InquiryStatus,
  UpdateInquiryRequest,
} from '../../types/inquiry'
import { INQUIRY_STATUSES } from '../../types/inquiry'
import { getStatusLabel } from '../../utils/inquiry'

const props = defineProps<{
  inquiry: Inquiry
  agents: Agent[]
  isSaving: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  save: [payload: UpdateInquiryRequest]
}>()

const selectedStatus = ref<InquiryStatus>(props.inquiry.status)
const selectedAssigneeId = ref(props.inquiry.assignee?.id ?? '')

watch(
  () => props.inquiry,
  (inquiry) => {
    selectedStatus.value = inquiry.status
    selectedAssigneeId.value = inquiry.assignee?.id ?? ''
  },
)

const hasChanges = computed(
  () =>
    selectedStatus.value !== props.inquiry.status ||
    selectedAssigneeId.value !== (props.inquiry.assignee?.id ?? ''),
)

function submitChanges(): void {
  if (!hasChanges.value || props.isSaving || props.disabled) {
    return
  }

  emit('save', {
    status: selectedStatus.value,
    assigneeId: selectedAssigneeId.value || null,
  })
}
</script>

<template>
  <section class="management-panel" aria-labelledby="management-panel-title">
    <div class="management-panel__heading">
      <div>
        <h2 id="management-panel-title">문의 처리</h2>
      </div>
      <span :class="{ 'management-panel__state--assigned': inquiry.assignee }">
        {{ inquiry.assignee ? '담당자 배정됨' : '미배정' }}
      </span>
    </div>

    <form class="management-panel__form" @submit.prevent="submitChanges">
      <label>
        <span>문의 상태</span>
        <select
          v-model="selectedStatus"
          :disabled="isSaving || disabled"
          name="inquiry-status"
        >
          <option v-for="status in INQUIRY_STATUSES" :key="status" :value="status">
            {{ getStatusLabel(status) }}
          </option>
        </select>
      </label>

      <label>
        <span>담당자</span>
        <select
          v-model="selectedAssigneeId"
          :disabled="isSaving || disabled"
          name="inquiry-assignee"
        >
          <option value="">미배정</option>
          <option v-for="agent in agents" :key="agent.id" :value="agent.id">
            {{ agent.name }} · {{ agent.team }}
          </option>
        </select>
      </label>

      <p class="management-panel__hint">
        변경 내용을 저장하면 처리 이력에 자동으로 기록됩니다.
      </p>

      <button
        type="submit"
        :disabled="!hasChanges || isSaving || disabled"
        :aria-busy="isSaving"
      >
        <span v-if="isSaving" class="button-spinner" aria-hidden="true"></span>
        {{ isSaving ? '저장 중…' : '변경 사항 저장' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.management-panel {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.management-panel__heading {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  background:
    linear-gradient(90deg, rgb(214 165 47 / 16%), transparent 48%), var(--color-surface);
}

.management-panel h2 {
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.management-panel__heading > span {
  padding: 0.3rem 0.625rem;
  border-radius: 999px;
  background: var(--color-neutral-100);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 750;
}

.management-panel__heading .management-panel__state--assigned {
  background: var(--color-brand-100);
  color: var(--color-brand-900);
}

.management-panel__form {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.management-panel label {
  display: grid;
  gap: var(--space-2);
}

.management-panel label span {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 750;
}

.management-panel select {
  width: 100%;
  min-height: 3rem;
  padding: 0.625rem 2.25rem 0.625rem var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-strong);
  font: inherit;
}

.management-panel select:hover:not(:disabled) {
  border-color: var(--color-brand-500);
}

.management-panel__hint {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.management-panel button {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.75rem var(--space-4);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-brand-700);
  color: var(--color-neutral-0);
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

.management-panel button:hover:not(:disabled) {
  background: var(--color-brand-900);
}

.management-panel button:disabled {
  background: var(--color-neutral-200);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.button-spinner {
  width: 1rem;
  height: 1rem;
  border: 0.125rem solid rgb(255 255 255 / 45%);
  border-top-color: currentcolor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .button-spinner {
    animation: none;
  }
}
</style>
