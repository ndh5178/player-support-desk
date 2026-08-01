<script setup lang="ts">
import type { InquiryNote } from '../../types/inquiry'
import { formatDateTime } from '../../utils/date'

defineProps<{
  notes: InquiryNote[]
  modelValue: string
  errorMessage: string
  isSaving: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>

<template>
  <section class="notes-card" aria-labelledby="inquiry-notes-title">
    <div class="notes-card__heading">
      <div>
        <h2 id="inquiry-notes-title">내부 메모</h2>
      </div>
      <span>{{ notes.length }}개</span>
    </div>

    <form class="notes-form" novalidate @submit.prevent="$emit('submit')">
      <label for="inquiry-note">새 메모</label>
      <textarea
        id="inquiry-note"
        :value="modelValue"
        :disabled="isSaving || disabled"
        :aria-invalid="Boolean(errorMessage)"
        :aria-describedby="
          errorMessage ? 'inquiry-note-help inquiry-note-error' : 'inquiry-note-help'
        "
        maxlength="1000"
        rows="5"
        placeholder="다른 운영 담당자에게 공유할 처리 내용을 입력해 주세요."
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <div class="notes-form__support">
        <p id="inquiry-note-help">공백 제외 1자 이상 입력해 주세요.</p>
        <span>{{ modelValue.length.toLocaleString('ko-KR') }} / 1,000</span>
      </div>
      <p v-if="errorMessage" id="inquiry-note-error" class="notes-form__error">
        {{ errorMessage }}
      </p>
      <button type="submit" :disabled="isSaving || disabled" :aria-busy="isSaving">
        {{ isSaving ? '메모 저장 중…' : '메모 추가' }}
      </button>
    </form>

    <div class="notes-list">
      <article v-for="note in [...notes].reverse()" :key="note.id" class="note">
        <div class="note__avatar" aria-hidden="true">
          {{ note.author.name.slice(0, 1) }}
        </div>
        <div>
          <div class="note__meta">
            <strong>{{ note.author.name }}</strong>
            <span>{{ note.author.team }}</span>
            <time :datetime="note.createdAt">{{ formatDateTime(note.createdAt) }}</time>
          </div>
          <p>{{ note.content }}</p>
        </div>
      </article>

      <p v-if="notes.length === 0" class="notes-list__empty">
        아직 등록된 운영 메모가 없습니다.
      </p>
    </div>
  </section>
</template>

<style scoped>
.notes-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.notes-card__heading {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-5) clamp(var(--space-5), 4vw, var(--space-6));
  border-bottom: 1px solid var(--color-border);
}

.notes-card h2 {
  color: var(--color-text-strong);
  font-size: 1.25rem;
}

.notes-card__heading > span {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.notes-form {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5) clamp(var(--space-5), 4vw, var(--space-6));
  border-bottom: 1px solid var(--color-border);
  background: var(--color-neutral-50);
}

.notes-form label {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 750;
}

.notes-form textarea {
  width: 100%;
  min-height: 7.5rem;
  resize: vertical;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-strong);
  font: inherit;
  line-height: 1.6;
}

.notes-form textarea:hover:not(:disabled) {
  border-color: var(--color-brand-500);
}

.notes-form textarea[aria-invalid='true'] {
  border-color: #b83b48;
}

.notes-form__support {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.notes-form__error {
  color: #a32431;
  font-size: 0.8125rem;
  font-weight: 700;
}

.notes-form button {
  justify-self: end;
  min-height: 2.75rem;
  padding: 0.625rem var(--space-5);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-brand-700);
  color: var(--color-neutral-0);
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

.notes-form button:hover:not(:disabled) {
  background: var(--color-brand-900);
}

.notes-form button:disabled {
  background: var(--color-neutral-200);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.notes-list {
  display: grid;
  gap: var(--space-5);
  padding: clamp(var(--space-5), 4vw, var(--space-6));
}

.note {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
}

.note + .note {
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.note__avatar {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand-100);
  color: var(--color-brand-900);
  font-size: var(--font-size-sm);
  font-weight: 800;
}

.note__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  align-items: baseline;
  margin-bottom: var(--space-2);
}

.note__meta strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}

.note__meta span,
.note__meta time {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.note__meta time {
  margin-left: auto;
}

.note p {
  color: var(--color-text);
  line-height: 1.7;
  white-space: pre-wrap;
}

.notes-list__empty {
  padding: var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 32rem) {
  .notes-form button {
    width: 100%;
  }

  .note__meta time {
    width: 100%;
    margin-left: 0;
  }
}
</style>
