<script setup lang="ts">
import { RouterLink } from 'vue-router'

import PriorityBadge from '../common/PriorityBadge.vue'
import StatusBadge from '../common/StatusBadge.vue'
import type { Inquiry } from '../../types/inquiry'
import { formatDateTime } from '../../utils/date'
import { getCategoryLabel } from '../../utils/inquiry'

defineProps<{
  // 데스크톱에서 사용할 동일한 문의 배열을 행 단위로 표시한다.
  inquiries: Inquiry[]
}>()
</script>

<template>
  <div class="inquiry-table">
    <table>
      <caption>
        접수된 플레이어 지원 케이스 목록
      </caption>
      <thead>
        <tr>
          <th scope="col">케이스</th>
          <th scope="col">플레이어</th>
          <th scope="col">우선순위</th>
          <th scope="col">상태</th>
          <th scope="col">접수 시각</th>
          <th scope="col">담당자</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inquiry in inquiries" :key="inquiry.id">
          <td>
            <div class="inquiry-cell">
              <div>
                <RouterLink :to="`/inquiries/${inquiry.id}`">
                  {{ inquiry.title }}
                </RouterLink>
                <span>{{ inquiry.id }}</span>
              </div>
              <small>{{ getCategoryLabel(inquiry.category) }}</small>
            </div>
          </td>
          <td>
            <strong class="customer-name">{{ inquiry.customer.nickname }}</strong>
            <span class="customer-location">
              {{ inquiry.customer.countryName }}
              <span aria-hidden="true">·</span>
              {{ inquiry.customer.languageName }}
            </span>
          </td>
          <td><PriorityBadge :priority="inquiry.priority" /></td>
          <td><StatusBadge :status="inquiry.status" /></td>
          <td>
            <time :datetime="inquiry.createdAt">
              {{ formatDateTime(inquiry.createdAt) }}
            </time>
          </td>
          <td>
            <span v-if="inquiry.assignee" class="assignee">
              <span aria-hidden="true">
                {{ inquiry.assignee.name.slice(0, 1) }}
              </span>
              {{ inquiry.assignee.name }}
            </span>
            <span v-else class="unassigned">미배정</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.inquiry-table {
  display: none;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 94%);
  box-shadow: var(--shadow-sm);
}

table {
  width: 100%;
  border-collapse: collapse;
}

caption {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

th {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-tactical-800);
  color: rgb(255 255 255 / 68%);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-100);
  color: var(--color-text);
  font-size: 0.8125rem;
  vertical-align: middle;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr {
  transition: background-color 160ms ease;
}

tbody tr:hover {
  background: var(--color-brand-50);
  box-shadow: inset 0.1875rem 0 var(--color-brand-500);
}

.inquiry-cell {
  display: flex;
  min-width: 17rem;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.inquiry-cell div {
  min-width: 0;
}

.inquiry-cell a {
  display: inline-flex;
  overflow: hidden;
  min-height: 2.75rem;
  align-items: center;
  max-width: 25rem;
  color: var(--color-text-strong);
  font-weight: 700;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inquiry-cell a:hover {
  color: var(--color-brand-700);
  text-decoration: underline;
}

.inquiry-cell span,
.customer-location {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
}

.inquiry-cell small {
  flex: 0 0 auto;
  padding: 0.25rem 0.5rem;
  border-radius: 0.125rem;
  background: var(--color-brand-50);
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  font-weight: 700;
}

.customer-name {
  color: var(--color-text-strong);
  font-size: 0.8125rem;
}

time {
  color: var(--color-text-muted);
  white-space: nowrap;
}

.assignee {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
}

.assignee > span {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border-radius: 50%;
  background: var(--color-brand-100);
  color: var(--color-brand-900);
  font-size: 0.6875rem;
  font-weight: 800;
}

.unassigned {
  color: var(--color-text-muted);
}

@media (min-width: 64rem) {
  .inquiry-table {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  tbody tr {
    transition: none;
  }
}
</style>
