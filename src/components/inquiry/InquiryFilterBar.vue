<script setup lang="ts">
import { ref } from 'vue'

import type {
  InquiryCategory,
  InquiryPriority,
  InquirySort,
  InquiryStatus,
} from '../../types/inquiry'

defineProps<{
  search: string
  status?: InquiryStatus
  priority?: InquiryPriority
  category?: InquiryCategory
  sort: InquirySort
  activeFilterCount: number
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: InquiryStatus | undefined]
  'update:priority': [value: InquiryPriority | undefined]
  'update:category': [value: InquiryCategory | undefined]
  'update:sort': [value: InquirySort]
  reset: []
}>()

const isExpanded = ref(false)

function getInputValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value
}
</script>

<template>
  <section class="filter-bar" aria-labelledby="inquiry-filter-title">
    <div class="filter-bar__mobile-heading">
      <div>
        <strong>케이스 검색 및 필터</strong>
        <span v-if="activeFilterCount > 0"> {{ activeFilterCount }}개 적용 중 </span>
      </div>
      <button
        type="button"
        :aria-expanded="isExpanded"
        aria-controls="inquiry-filter-options"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? '필터 닫기' : '필터 열기' }}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
    </div>

    <h2 id="inquiry-filter-title" class="filter-bar__title">케이스 검색 및 필터</h2>

    <div class="filter-bar__search">
      <label for="inquiry-search">케이스 검색</label>
      <span aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>
      </span>
      <input
        id="inquiry-search"
        type="search"
        :value="search"
        placeholder="케이스 ID, 제목, 플레이어 닉네임"
        autocomplete="off"
        @input="emit('update:search', getInputValue($event))"
      />
    </div>

    <div
      id="inquiry-filter-options"
      class="filter-bar__options"
      :class="{ 'filter-bar__options--expanded': isExpanded }"
    >
      <div class="filter-field">
        <label for="status-filter">상태</label>
        <select
          id="status-filter"
          :value="status ?? ''"
          @change="
            emit(
              'update:status',
              (getInputValue($event) || undefined) as InquiryStatus | undefined,
            )
          "
        >
          <option value="">전체 상태</option>
          <option value="NEW">신규</option>
          <option value="IN_PROGRESS">처리 중</option>
          <option value="WAITING_CUSTOMER">고객 답변 대기</option>
          <option value="RESOLVED">해결</option>
        </select>
      </div>

      <div class="filter-field">
        <label for="priority-filter">우선순위</label>
        <select
          id="priority-filter"
          :value="priority ?? ''"
          @change="
            emit(
              'update:priority',
              (getInputValue($event) || undefined) as InquiryPriority | undefined,
            )
          "
        >
          <option value="">전체 우선순위</option>
          <option value="URGENT">긴급</option>
          <option value="HIGH">높음</option>
          <option value="NORMAL">보통</option>
          <option value="LOW">낮음</option>
        </select>
      </div>

      <div class="filter-field">
        <label for="category-filter">카테고리</label>
        <select
          id="category-filter"
          :value="category ?? ''"
          @change="
            emit(
              'update:category',
              (getInputValue($event) || undefined) as InquiryCategory | undefined,
            )
          "
        >
          <option value="">전체 카테고리</option>
          <option value="ACCOUNT">계정</option>
          <option value="PAYMENT">결제</option>
          <option value="GAME_ERROR">게임 오류</option>
          <option value="REPORT">신고</option>
          <option value="INSTALLATION">설치 및 실행</option>
          <option value="OTHER">기타</option>
        </select>
      </div>

      <div class="filter-field">
        <label for="sort-filter">정렬</label>
        <select
          id="sort-filter"
          :value="sort"
          @change="emit('update:sort', getInputValue($event) as InquirySort)"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      <button
        class="filter-bar__reset"
        type="button"
        :disabled="activeFilterCount === 0 && sort === 'newest'"
        @click="emit('reset')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4v6h6M20 20v-6h-6M5.5 15a7 7 0 0 0 11.8 2M18.5 9A7 7 0 0 0 6.7 7" />
        </svg>
        초기화
      </button>
    </div>
  </section>
</template>

<style scoped>
.filter-bar {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background:
    linear-gradient(90deg, rgb(214 165 47 / 7%), transparent 28%), rgb(255 255 255 / 92%);
  box-shadow: var(--shadow-sm);
}

.filter-bar__title,
.filter-bar label {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.filter-bar__mobile-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.filter-bar__mobile-heading strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-base);
}

.filter-bar__mobile-heading span {
  display: block;
  margin-top: var(--space-1);
  color: var(--color-brand-700);
  font-size: 0.75rem;
  font-weight: 700;
}

.filter-bar__mobile-heading button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.5rem var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 700;
}

.filter-bar__mobile-heading svg,
.filter-bar__reset svg {
  width: 1rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.filter-bar__search {
  position: relative;
}

.filter-bar__search span {
  position: absolute;
  top: 50%;
  left: var(--space-3);
  display: grid;
  color: var(--color-text-muted);
  transform: translateY(-50%);
}

.filter-bar__search svg {
  width: 1.125rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.filter-bar input,
.filter-bar select {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-strong);
  font: inherit;
}

.filter-bar input {
  padding: 0.625rem var(--space-3) 0.625rem 2.5rem;
}

.filter-bar select {
  padding: 0.625rem 2rem 0.625rem var(--space-3);
}

.filter-bar input::placeholder {
  color: var(--color-text-muted);
}

.filter-bar input:hover,
.filter-bar select:hover {
  border-color: var(--color-brand-500);
}

.filter-bar__options {
  display: none;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

.filter-bar__options--expanded {
  display: grid;
}

.filter-bar__reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.625rem var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-neutral-50);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
}

.filter-bar__reset:disabled {
  color: #98a4aa;
  cursor: not-allowed;
}

@media (min-width: 48rem) {
  .filter-bar {
    grid-template-columns: minmax(16rem, 1fr) auto;
    padding: var(--space-5);
  }

  .filter-bar__mobile-heading {
    display: none;
  }

  .filter-bar__options {
    display: grid;
    grid-template-columns: repeat(4, minmax(6.5rem, 1fr)) auto;
  }

  .filter-bar__reset {
    align-self: end;
  }
}

@media (min-width: 48rem) and (max-width: 74.999rem) {
  .filter-bar {
    grid-template-columns: 1fr;
  }

  .filter-bar__options {
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  }
}

@media (min-width: 75rem) and (max-width: 87.499rem) {
  .filter-bar {
    grid-template-columns: 1fr;
  }
}
</style>
