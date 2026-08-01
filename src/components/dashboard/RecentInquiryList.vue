<script setup lang="ts">
import { RouterLink } from 'vue-router'

import PriorityBadge from '../common/PriorityBadge.vue'
import StatusBadge from '../common/StatusBadge.vue'
import type { Inquiry } from '../../types/inquiry'
import { formatDateTime, formatRelativeTime } from '../../utils/date'
import { getCategoryLabel } from '../../utils/inquiry'

defineProps<{
  inquiries: Inquiry[]
}>()
</script>

<template>
  <section class="panel recent-inquiries" aria-labelledby="recent-inquiries-title">
    <div class="panel__heading">
      <div>
        <h2 id="recent-inquiries-title">최근 접수 문의</h2>
      </div>
      <RouterLink class="panel__link" to="/inquiries">
        전체 큐 보기
        <span aria-hidden="true">→</span>
      </RouterLink>
    </div>

    <ul v-if="inquiries.length > 0" class="recent-inquiries__list">
      <li v-for="inquiry in inquiries" :key="inquiry.id">
        <RouterLink
          class="inquiry-row"
          :to="`/inquiries/${inquiry.id}`"
          :aria-label="`${inquiry.title} 문의 상세 보기`"
        >
          <div class="inquiry-row__main">
            <div class="inquiry-row__meta">
              <span>{{ inquiry.id }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ getCategoryLabel(inquiry.category) }}</span>
            </div>
            <strong>{{ inquiry.title }}</strong>
            <p>
              {{ inquiry.customer.nickname }}
              <span aria-hidden="true">·</span>
              {{ inquiry.customer.countryName }}
            </p>
          </div>
          <div class="inquiry-row__status">
            <PriorityBadge :priority="inquiry.priority" />
            <StatusBadge :status="inquiry.status" />
          </div>
          <time
            class="inquiry-row__time"
            :datetime="inquiry.createdAt"
            :title="formatDateTime(inquiry.createdAt)"
          >
            {{ formatRelativeTime(inquiry.createdAt) }}
          </time>
          <span class="inquiry-row__arrow" aria-hidden="true">›</span>
        </RouterLink>
      </li>
    </ul>

    <p v-else class="recent-inquiries__empty">아직 접수된 문의가 없습니다.</p>
  </section>
</template>

<style scoped>
.panel {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--shadow-sm);
}

.panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  background:
    linear-gradient(90deg, rgb(214 165 47 / 8%), transparent 32%), rgb(255 255 255 / 45%);
}

.panel h2 {
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.panel__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-brand-700);
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.panel__link:hover {
  text-decoration: underline;
}

.recent-inquiries__list {
  list-style: none;
}

.recent-inquiries__list li + li {
  border-top: 1px solid var(--color-neutral-100);
}

.inquiry-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  text-decoration: none;
  transition: background-color 160ms ease;
}

.inquiry-row:hover {
  background: var(--color-brand-50);
  box-shadow: inset 0.1875rem 0 var(--color-brand-500);
}

.inquiry-row__main {
  min-width: 0;
}

.inquiry-row__meta {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  font-weight: 700;
}

.inquiry-row__main strong {
  display: block;
  overflow: hidden;
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inquiry-row__main > p {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.inquiry-row__status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.inquiry-row__time {
  align-self: center;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.inquiry-row__arrow {
  display: none;
  align-self: center;
  color: var(--color-text-muted);
  font-size: 1.5rem;
}

.recent-inquiries__empty {
  padding: var(--space-10) var(--space-5);
  color: var(--color-text-muted);
  text-align: center;
}

@media (min-width: 48rem) {
  .inquiry-row {
    grid-template-columns: minmax(0, 1fr) auto 5rem 1rem;
    align-items: center;
  }

  .inquiry-row__arrow {
    display: block;
  }
}

@media (max-width: 47.999rem) {
  .inquiry-row__status {
    align-items: flex-end;
    flex-direction: column;
    grid-row: span 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .inquiry-row {
    transition: none;
  }
}
</style>
