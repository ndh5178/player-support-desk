<script setup lang="ts">
import { computed } from 'vue'

import type { Pagination } from '../../types/api'

const props = defineProps<{
  pagination: Pagination
}>()

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const pageCount = props.pagination.totalPages
  const currentPage = props.pagination.page
  const startPage = Math.max(1, Math.min(currentPage - 2, pageCount - 4))
  const endPage = Math.min(pageCount, startPage + 4)

  return Array.from(
    { length: Math.max(0, endPage - startPage + 1) },
    (_, index) => startPage + index,
  )
})

const itemRange = computed(() => {
  if (props.pagination.total === 0) {
    return '0건'
  }

  const start = (props.pagination.page - 1) * props.pagination.limit + 1
  const end = Math.min(
    props.pagination.page * props.pagination.limit,
    props.pagination.total,
  )

  return `총 ${props.pagination.total.toLocaleString('ko-KR')}건 중 ${start.toLocaleString('ko-KR')}–${end.toLocaleString('ko-KR')}건`
})
</script>

<template>
  <div class="pagination-wrap">
    <p>{{ itemRange }}</p>
    <nav
      v-if="pagination.totalPages > 1"
      class="pagination"
      aria-label="문의 목록 페이지"
    >
      <button
        type="button"
        :disabled="pagination.page <= 1"
        aria-label="이전 페이지"
        @click="emit('page-change', pagination.page - 1)"
      >
        <span aria-hidden="true">←</span>
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        :class="{ 'pagination__page--active': page === pagination.page }"
        :aria-current="page === pagination.page ? 'page' : undefined"
        :aria-label="`${page}페이지`"
        @click="emit('page-change', page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        :disabled="pagination.page >= pagination.totalPages"
        aria-label="다음 페이지"
        @click="emit('page-change', pagination.page + 1)"
      >
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.pagination-wrap > p {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.pagination {
  display: flex;
  gap: var(--space-1);
}

.pagination button {
  display: grid;
  min-width: 2.75rem;
  min-height: 2.75rem;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--color-brand-500);
  background: var(--color-brand-50);
  color: var(--color-brand-900);
}

.pagination button:disabled {
  color: #a1abb0;
  cursor: not-allowed;
}

.pagination .pagination__page--active {
  border-color: var(--color-brand-700);
  background: var(--color-brand-700);
  color: var(--color-neutral-0);
}

@media (max-width: 35rem) {
  .pagination-wrap {
    align-items: stretch;
    flex-direction: column;
  }

  .pagination {
    justify-content: center;
  }
}
</style>
