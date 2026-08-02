<script setup lang="ts">
import { RouterLink } from 'vue-router'

import PriorityBadge from '../common/PriorityBadge.vue'
import StatusBadge from '../common/StatusBadge.vue'
import type { Inquiry } from '../../types/inquiry'
import { formatDateTime } from '../../utils/date'
import { getCategoryLabel } from '../../utils/inquiry'

defineProps<{
  // 작은 화면에서는 표 대신 같은 문의 배열을 터치하기 쉬운 카드로 표시한다.
  inquiries: Inquiry[]
}>()
</script>

<template>
  <ul class="inquiry-cards" aria-label="접수된 플레이어 지원 케이스 목록">
    <li v-for="inquiry in inquiries" :key="inquiry.id">
      <RouterLink
        :to="`/inquiries/${inquiry.id}`"
        :aria-label="`${inquiry.title} 문의 상세 보기`"
      >
        <div class="inquiry-card__meta">
          <span>{{ inquiry.id }}</span>
          <span>{{ getCategoryLabel(inquiry.category) }}</span>
        </div>

        <h2>{{ inquiry.title }}</h2>

        <div class="inquiry-card__badges">
          <PriorityBadge :priority="inquiry.priority" />
          <StatusBadge :status="inquiry.status" />
        </div>

        <dl>
          <div>
            <dt>플레이어</dt>
            <dd>{{ inquiry.customer.nickname }}</dd>
          </div>
          <div>
            <dt>지역</dt>
            <dd>
              {{ inquiry.customer.countryName }} ·
              {{ inquiry.customer.languageName }}
            </dd>
          </div>
          <div>
            <dt>담당자</dt>
            <dd>{{ inquiry.assignee?.name ?? '미배정' }}</dd>
          </div>
          <div>
            <dt>접수</dt>
            <dd>
              <time :datetime="inquiry.createdAt">
                {{ formatDateTime(inquiry.createdAt) }}
              </time>
            </dd>
          </div>
        </dl>

        <span class="inquiry-card__action">
          케이스 열기
          <span aria-hidden="true">→</span>
        </span>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.inquiry-cards {
  display: grid;
  gap: var(--space-3);
  list-style: none;
}

.inquiry-cards > li > a {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 94%);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
}

.inquiry-cards > li > a:hover {
  border-color: var(--color-brand-500);
  box-shadow:
    inset 0.1875rem 0 var(--color-brand-500),
    var(--shadow-md);
}

.inquiry-card__meta,
.inquiry-card__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.inquiry-card__meta span {
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  font-weight: 700;
}

.inquiry-card__meta span + span::before {
  margin-right: var(--space-2);
  content: '·';
}

.inquiry-cards h2 {
  color: var(--color-text-strong);
  font-size: var(--font-size-base);
  line-height: 1.4;
}

.inquiry-card__badges {
  gap: var(--space-4);
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-100);
}

dt {
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  font-weight: 700;
}

dd {
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.8125rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inquiry-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  color: var(--color-brand-700);
  font-size: 0.8125rem;
  font-weight: 700;
}

@media (min-width: 48rem) {
  .inquiry-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 64rem) {
  .inquiry-cards {
    display: none;
  }
}
</style>
