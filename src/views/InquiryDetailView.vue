<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import ErrorState from '../components/common/ErrorState.vue'
import InquiryDetailSkeleton from '../components/inquiry/InquiryDetailSkeleton.vue'
import InquiryManagementPanel from '../components/inquiry/InquiryManagementPanel.vue'
import InquiryNotes from '../components/inquiry/InquiryNotes.vue'
import InquiryOverview from '../components/inquiry/InquiryOverview.vue'
import InquiryTimeline from '../components/inquiry/InquiryTimeline.vue'
import { useInquiryStore } from '../stores/inquiry'
import type { UpdateInquiryRequest } from '../types/inquiry'
import { formatDateTime } from '../utils/date'

interface Feedback {
  type: 'success' | 'error'
  message: string
}

const route = useRoute()
const inquiryStore = useInquiryStore()
const {
  currentInquiry,
  agents,
  isDetailLoading,
  detailErrorMessage,
  detailErrorStatus,
  isUpdatingInquiry,
  isAddingNote,
  mutationErrorMessage,
} = storeToRefs(inquiryStore)

const noteInput = ref('')
const noteErrorMessage = ref('')
const feedback = ref<Feedback | null>(null)

const inquiryId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? (id[0] ?? '') : (id ?? '')
})

const isNotFound = computed(() => detailErrorStatus.value === 404)

function resetLocalState(): void {
  noteInput.value = ''
  noteErrorMessage.value = ''
  feedback.value = null
}

async function loadInquiry(): Promise<void> {
  resetLocalState()

  if (!inquiryId.value) {
    inquiryStore.resetInquiryDetail()
    return
  }

  await inquiryStore.fetchInquiryDetail(inquiryId.value)
}

async function saveInquiryChanges(payload: UpdateInquiryRequest): Promise<void> {
  feedback.value = null
  inquiryStore.clearMutationError()

  const saved = await inquiryStore.saveInquiryChanges(payload)

  feedback.value = saved
    ? {
        type: 'success',
        message: '문의 상태와 담당자 변경 사항을 저장했습니다.',
      }
    : {
        type: 'error',
        message: mutationErrorMessage.value || '문의 변경 사항을 저장하지 못했습니다.',
      }
}

function updateNoteInput(value: string): void {
  noteInput.value = value

  if (noteErrorMessage.value) {
    noteErrorMessage.value = ''
  }
}

async function submitNote(): Promise<void> {
  const content = noteInput.value.trim()

  if (!content) {
    noteErrorMessage.value = '공백이 아닌 메모 내용을 입력해 주세요.'
    return
  }

  if (content.length > 1000) {
    noteErrorMessage.value = '메모는 1,000자 이하로 입력해 주세요.'
    return
  }

  noteErrorMessage.value = ''
  feedback.value = null
  inquiryStore.clearMutationError()

  const saved = await inquiryStore.createInquiryNote(content)

  if (saved) {
    noteInput.value = ''
    feedback.value = {
      type: 'success',
      message: '운영 메모를 추가하고 처리 이력을 갱신했습니다.',
    }
    return
  }

  feedback.value = {
    type: 'error',
    message: mutationErrorMessage.value || '운영 메모를 저장하지 못했습니다.',
  }
}

watch(inquiryId, loadInquiry, { immediate: true })

onUnmounted(() => {
  inquiryStore.resetInquiryDetail()
})
</script>

<template>
  <div class="page inquiry-detail-page">
    <InquiryDetailSkeleton v-if="isDetailLoading" />

    <template v-else-if="isNotFound">
      <section class="not-found-state" aria-labelledby="inquiry-not-found-title">
        <span class="not-found-state__code">404</span>
        <p class="page-header__eyebrow">Inquiry not found</p>
        <h1 id="inquiry-not-found-title">문의를 찾을 수 없습니다</h1>
        <p>
          문의 번호 <strong>{{ inquiryId }}</strong
          >가 삭제됐거나 올바르지 않습니다. 목록에서 다른 문의를 선택해 주세요.
        </p>
        <div class="not-found-state__actions">
          <RouterLink :to="{ name: 'inquiry-list' }">문의 목록으로</RouterLink>
          <button type="button" @click="loadInquiry">다시 확인</button>
        </div>
      </section>
    </template>

    <template v-else-if="detailErrorMessage">
      <header class="page-header">
        <p class="page-header__eyebrow">Inquiry detail</p>
        <h1>문의 상세</h1>
        <p class="page-header__description">
          문의 상세 정보를 불러오는 중 문제가 발생했습니다.
        </p>
      </header>
      <ErrorState
        title="문의 상세 정보를 불러오지 못했습니다"
        :message="detailErrorMessage"
        @retry="loadInquiry"
      />
    </template>

    <template v-else-if="currentInquiry">
      <header class="detail-header">
        <RouterLink class="detail-header__back" :to="{ name: 'inquiry-list' }">
          <span aria-hidden="true">←</span>
          문의 목록
        </RouterLink>
        <div class="detail-header__title">
          <div>
            <p class="page-header__eyebrow">Inquiry detail · {{ currentInquiry.id }}</p>
            <h1>{{ currentInquiry.title }}</h1>
          </div>
          <p>
            {{ currentInquiry.customer.nickname }} 님이
            <time :datetime="currentInquiry.createdAt">
              {{ formatDateTime(currentInquiry.createdAt) }}
            </time>
            접수
          </p>
        </div>
      </header>

      <div class="feedback-region" aria-live="polite" aria-atomic="true">
        <div
          v-if="feedback"
          class="feedback-message"
          :class="`feedback-message--${feedback.type}`"
          :role="feedback.type === 'error' ? 'alert' : 'status'"
        >
          <span aria-hidden="true">{{ feedback.type === 'success' ? '✓' : '!' }}</span>
          <p>{{ feedback.message }}</p>
          <button type="button" aria-label="알림 닫기" @click="feedback = null">×</button>
        </div>
      </div>

      <div class="detail-layout">
        <InquiryOverview class="detail-overview" :inquiry="currentInquiry" />

        <aside class="detail-aside" aria-label="문의 처리와 고객 정보">
          <InquiryManagementPanel
            :inquiry="currentInquiry"
            :agents="agents"
            :is-saving="isUpdatingInquiry"
            :disabled="isAddingNote"
            @save="saveInquiryChanges"
          />

          <section class="customer-card" aria-labelledby="customer-card-title">
            <div class="customer-card__heading">
              <div class="customer-card__avatar" aria-hidden="true">
                {{ currentInquiry.customer.nickname.slice(0, 1).toUpperCase() }}
              </div>
              <div>
                <p>Customer</p>
                <h2 id="customer-card-title">{{ currentInquiry.customer.nickname }}</h2>
              </div>
            </div>
            <dl>
              <div>
                <dt>이메일</dt>
                <dd>
                  <a :href="`mailto:${currentInquiry.customer.email}`">
                    {{ currentInquiry.customer.email }}
                  </a>
                </dd>
              </div>
              <div>
                <dt>국가</dt>
                <dd>
                  {{ currentInquiry.customer.countryName }}
                  <span>{{ currentInquiry.customer.countryCode }}</span>
                </dd>
              </div>
              <div>
                <dt>언어</dt>
                <dd>
                  {{ currentInquiry.customer.languageName }}
                  <span>{{ currentInquiry.customer.languageCode }}</span>
                </dd>
              </div>
              <div>
                <dt>현재 담당자</dt>
                <dd>
                  {{ currentInquiry.assignee?.name ?? '미배정' }}
                  <span v-if="currentInquiry.assignee">
                    {{ currentInquiry.assignee.team }}
                  </span>
                </dd>
              </div>
            </dl>
          </section>
        </aside>

        <InquiryNotes
          class="detail-notes"
          :notes="currentInquiry.notes"
          :model-value="noteInput"
          :error-message="noteErrorMessage"
          :is-saving="isAddingNote"
          :disabled="isUpdatingInquiry"
          @update:model-value="updateNoteInput"
          @submit="submitNote"
        />
        <InquiryTimeline class="detail-timeline" :history="currentInquiry.history" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.inquiry-detail-page {
  gap: var(--space-6);
}

.detail-header {
  display: grid;
  gap: var(--space-5);
}

.detail-header__back {
  display: inline-flex;
  width: fit-content;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-brand-700);
  font-size: var(--font-size-sm);
  font-weight: 750;
  text-decoration: none;
}

.detail-header__back:hover {
  color: var(--color-brand-900);
  text-decoration: underline;
}

.detail-header__title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: end;
}

.detail-header h1 {
  max-width: 58rem;
  margin-top: var(--space-1);
  color: var(--color-text-strong);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.25;
}

.detail-header__title > p {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.feedback-region {
  min-height: 0;
}

.feedback-region:empty {
  display: none;
}

.feedback-message {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 650;
}

.feedback-message > span {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  border-radius: 50%;
  color: var(--color-neutral-0);
  font-weight: 900;
}

.feedback-message--success {
  border-color: #acd7c3;
  background: #effaf5;
  color: #1d6847;
}

.feedback-message--success > span {
  background: #27835b;
}

.feedback-message--error {
  border-color: #edbdc2;
  background: #fff3f4;
  color: #942e3a;
}

.feedback-message--error > span {
  background: #b83b48;
}

.feedback-message button {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: currentcolor;
  font-size: 1.35rem;
  cursor: pointer;
}

.feedback-message button:hover {
  background: rgb(255 255 255 / 65%);
}

.detail-layout,
.detail-aside {
  display: grid;
  min-width: 0;
  gap: var(--space-5);
}

.detail-aside {
  align-content: start;
}

.detail-overview {
  grid-area: overview;
}

.detail-aside {
  grid-area: aside;
}

.detail-notes {
  grid-area: notes;
}

.detail-timeline {
  grid-area: timeline;
}

.detail-layout {
  grid-template-areas:
    'overview'
    'aside'
    'notes'
    'timeline';
}

.customer-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.customer-card__heading {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.customer-card__avatar {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand-100);
  color: var(--color-brand-900);
  font-weight: 850;
}

.customer-card__heading p {
  color: var(--color-brand-700);
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.customer-card h2 {
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.customer-card dl {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
}

.customer-card dl div {
  min-width: 0;
}

.customer-card dt {
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.customer-card dd {
  overflow-wrap: anywhere;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 650;
}

.customer-card dd span {
  display: block;
  margin-top: 0.125rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
}

.customer-card a {
  color: var(--color-brand-700);
}

.not-found-state {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  padding: clamp(3rem, 10vw, 7rem) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 90%);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.not-found-state__code {
  color: var(--color-brand-100);
  font-size: clamp(4rem, 16vw, 8rem);
  font-weight: 900;
  line-height: 0.9;
}

.not-found-state h1 {
  color: var(--color-text-strong);
  font-size: clamp(1.5rem, 5vw, 2.25rem);
}

.not-found-state > p:not(.page-header__eyebrow) {
  max-width: 35rem;
  color: var(--color-text-muted);
}

.not-found-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.not-found-state__actions a,
.not-found-state__actions button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.625rem var(--space-5);
  border-radius: var(--radius-sm);
  font: inherit;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
}

.not-found-state__actions a {
  border: 1px solid var(--color-brand-700);
  background: var(--color-brand-700);
  color: var(--color-neutral-0);
}

.not-found-state__actions button {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-strong);
}

@media (min-width: 64rem) {
  .detail-layout {
    grid-template-columns: minmax(0, 1.75fr) minmax(19rem, 0.8fr);
    grid-template-areas:
      'overview aside'
      'notes aside'
      'timeline aside';
    align-items: start;
  }

  .detail-aside {
    position: sticky;
    top: var(--space-6);
  }
}

@media (max-width: 40rem) {
  .detail-header__title {
    align-items: start;
  }

  .detail-header__title > p {
    width: 100%;
  }

  .feedback-message {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .feedback-message button {
    grid-column: 1 / -1;
    width: 100%;
    border-top: 1px solid currentcolor;
    border-radius: 0;
    font-size: var(--font-size-sm);
  }

  .feedback-message button::after {
    content: '알림 닫기';
  }

  .feedback-message button {
    font-size: 0;
  }

  .feedback-message button::after {
    font-size: var(--font-size-sm);
  }
}
</style>
