<script setup lang="ts">
import PriorityBadge from '../common/PriorityBadge.vue'
import StatusBadge from '../common/StatusBadge.vue'
import type { Inquiry } from '../../types/inquiry'
import { formatDateTime } from '../../utils/date'
import { getCategoryLabel } from '../../utils/inquiry'

defineProps<{
  inquiry: Inquiry
}>()
</script>

<template>
  <article class="overview-card" aria-labelledby="inquiry-content-title">
    <div class="overview-card__heading">
      <div>
        <p class="section-eyebrow">{{ getCategoryLabel(inquiry.category) }}</p>
        <h2 id="inquiry-content-title">문의 내용</h2>
      </div>
      <div class="overview-card__badges" aria-label="문의 분류">
        <PriorityBadge :priority="inquiry.priority" />
        <StatusBadge :status="inquiry.status" />
      </div>
    </div>

    <p class="overview-card__content">{{ inquiry.content }}</p>

    <dl class="overview-card__meta">
      <div>
        <dt>문의 번호</dt>
        <dd>{{ inquiry.id }}</dd>
      </div>
      <div>
        <dt>접수 시각</dt>
        <dd>
          <time :datetime="inquiry.createdAt">{{
            formatDateTime(inquiry.createdAt)
          }}</time>
        </dd>
      </div>
      <div>
        <dt>최근 변경</dt>
        <dd>
          <time :datetime="inquiry.updatedAt">{{
            formatDateTime(inquiry.updatedAt)
          }}</time>
        </dd>
      </div>
      <div>
        <dt>SLA 기한</dt>
        <dd>
          <time :datetime="inquiry.slaDueAt">{{ formatDateTime(inquiry.slaDueAt) }}</time>
        </dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.overview-card {
  display: grid;
  gap: var(--space-6);
  padding: clamp(var(--space-5), 4vw, var(--space-8));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--shadow-sm);
}

.overview-card__heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: flex-start;
}

.section-eyebrow {
  margin-bottom: var(--space-1);
  color: var(--color-brand-700);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-card h2 {
  color: var(--color-text-strong);
  font-size: 1.25rem;
}

.overview-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.overview-card__content {
  color: var(--color-text);
  font-size: 1.0625rem;
  line-height: 1.8;
  white-space: pre-wrap;
}

.overview-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.overview-card__meta div {
  min-width: 0;
}

.overview-card__meta dt {
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-weight: 700;
}

.overview-card__meta dd {
  overflow-wrap: anywhere;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 650;
}

@media (max-width: 32rem) {
  .overview-card__meta {
    grid-template-columns: 1fr;
  }
}
</style>
