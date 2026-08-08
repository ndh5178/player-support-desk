<script setup lang="ts">
import type { PriorityDistributionItem } from '../../types/api'
import { getPriorityLabel } from '../../utils/inquiry'

defineProps<{
  items: PriorityDistributionItem[]
  total: number
}>()

function getPercentage(count: number, total: number): number {
  // 문의가 없을 때 0으로 나누어 NaN이 표시되는 것을 막는다.
  if (total === 0) {
    return 0
  }

  return Math.round((count / total) * 100)
}
</script>

<template>
  <section class="distribution" aria-labelledby="priority-distribution-title">
    <div class="distribution__heading">
      <div>
        <h2 id="priority-distribution-title">문의 우선순위 분포</h2>
      </div>
      <span>총 {{ total.toLocaleString('ko-KR') }}건</span>
    </div>

    <ul class="distribution__list">
      <li
        v-for="item in items"
        v-bind:key="item.priority"
        v-bind:class="`distribution__item--${item.priority.toLowerCase()}`"
      >
        <div class="distribution__label">
          <span>{{ getPriorityLabel(item.priority) }}</span>
          <strong>{{ item.count.toLocaleString('ko-KR') }}</strong>
        </div>
        <div
          class="distribution__track"
          role="progressbar"
          v-bind:aria-label="`${getPriorityLabel(item.priority)} 문의 비율`"
          aria-valuemin="0"
          aria-valuemax="100"
          v-bind:aria-valuenow="getPercentage(item.count, total)"
        >
          <span v-bind:style="{ width: `${getPercentage(item.count, total)}%` }"></span>
        </div>
        <p>{{ getPercentage(item.count, total) }}%</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.distribution {
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background:
    linear-gradient(135deg, rgb(214 165 47 / 7%), transparent 38%), rgb(255 255 255 / 92%);
  box-shadow: var(--shadow-sm);
}

.distribution__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.distribution__heading h2 {
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.distribution__heading > span {
  padding: 0.3125rem 0.625rem;
  border-radius: 999px;
  background: var(--color-neutral-100);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.distribution__list {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-8);
  list-style: none;
}

.distribution__list li {
  --distribution-color: var(--color-brand-600);

  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.5rem;
  gap: var(--space-2) var(--space-3);
}

.distribution__item--urgent {
  --distribution-color: #c33744 !important;
}

.distribution__item--high {
  --distribution-color: #d66b12 !important;
}

.distribution__item--normal {
  --distribution-color: #168892 !important;
}

.distribution__item--low {
  --distribution-color: #829198 !important;
}

.distribution__label {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.distribution__label span {
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.distribution__label strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
}

.distribution__track {
  align-self: center;
  overflow: hidden;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-neutral-100);
}

.distribution__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--distribution-color);
}

.distribution__list li > p {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  text-align: right;
}
</style>
