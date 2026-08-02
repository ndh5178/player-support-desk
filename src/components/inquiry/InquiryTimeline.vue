<script setup lang="ts">
import type { InquiryHistory, InquiryStatus } from '../../types/inquiry'
import { isInquiryStatus } from '../../types/inquiry'
import { formatDateTime } from '../../utils/date'
import { getStatusLabel } from '../../utils/inquiry'

defineProps<{
  history: InquiryHistory[]
}>()

const historyLabels: Record<InquiryHistory['type'], string> = {
  CREATED: '케이스 접수',
  STATUS_CHANGED: '상태 변경',
  ASSIGNEE_CHANGED: '담당자 변경',
  NOTE_ADDED: '지원팀 메모',
}

function getHistoryDescription(item: InquiryHistory): string {
  // 저장된 상태 코드는 사용자에게 보여 줄 때 한글 문구로 변환한다.
  if (
    item.type === 'STATUS_CHANGED' &&
    item.previousValue &&
    item.nextValue &&
    isInquiryStatus(item.previousValue) &&
    isInquiryStatus(item.nextValue)
  ) {
    return `문의 상태를 ${getStatusLabel(item.previousValue as InquiryStatus)}에서 ${getStatusLabel(item.nextValue as InquiryStatus)}(으)로 변경했습니다.`
  }

  return item.description
}
</script>

<template>
  <section class="timeline-card" aria-labelledby="inquiry-timeline-title">
    <div class="timeline-card__heading">
      <div>
        <h2 id="inquiry-timeline-title">처리 이력</h2>
      </div>
      <span>{{ history.length }}건</span>
    </div>

    <ol class="timeline">
      <!-- 원본 배열을 바꾸지 않고 복사본만 뒤집어 최신 활동부터 표시한다. -->
      <li v-for="item in [...history].reverse()" :key="item.id">
        <span class="timeline__marker" :data-type="item.type" aria-hidden="true"></span>
        <article>
          <div class="timeline__meta">
            <strong>{{ historyLabels[item.type] }}</strong>
            <time :datetime="item.createdAt">{{ formatDateTime(item.createdAt) }}</time>
          </div>
          <p>{{ getHistoryDescription(item) }}</p>
          <span class="timeline__actor">{{ item.actorName }}</span>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline-card {
  padding: clamp(var(--space-5), 4vw, var(--space-8));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--shadow-sm);
}

.timeline-card__heading {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: center;
  margin-bottom: var(--space-6);
}

.timeline-card h2 {
  color: var(--color-text-strong);
  font-size: 1.25rem;
}

.timeline-card__heading > span {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.timeline {
  list-style: none;
}

.timeline li {
  position: relative;
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  gap: var(--space-4);
  padding-bottom: var(--space-6);
}

.timeline li:not(:last-child)::before {
  position: absolute;
  top: 1rem;
  bottom: 0;
  left: 0.4375rem;
  width: 0.125rem;
  background: var(--color-neutral-200);
  content: '';
}

.timeline li:last-child {
  padding-bottom: 0;
}

.timeline__marker {
  z-index: 1;
  width: 1rem;
  height: 1rem;
  margin-top: 0.2rem;
  border: 0.1875rem solid var(--color-surface);
  border-radius: 50%;
  background: var(--color-brand-500);
  box-shadow: 0 0 0 1px var(--color-brand-500);
}

.timeline__marker[data-type='STATUS_CHANGED'] {
  background: #c87916;
  box-shadow: 0 0 0 1px #c87916;
}

.timeline__marker[data-type='ASSIGNEE_CHANGED'] {
  background: #6750a4;
  box-shadow: 0 0 0 1px #6750a4;
}

.timeline__marker[data-type='NOTE_ADDED'] {
  background: #3275a8;
  box-shadow: 0 0 0 1px #3275a8;
}

.timeline__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.timeline__meta strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}

.timeline__meta time,
.timeline__actor {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.timeline article > p {
  margin-bottom: var(--space-1);
  color: var(--color-text);
  line-height: 1.6;
}
</style>
