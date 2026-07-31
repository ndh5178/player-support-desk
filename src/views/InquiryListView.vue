<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ErrorState from '../components/common/ErrorState.vue'
import InquiryCardList from '../components/inquiry/InquiryCardList.vue'
import InquiryFilterBar from '../components/inquiry/InquiryFilterBar.vue'
import InquiryListSkeleton from '../components/inquiry/InquiryListSkeleton.vue'
import InquiryTable from '../components/inquiry/InquiryTable.vue'
import PaginationControls from '../components/inquiry/PaginationControls.vue'
import { useInquiryStore } from '../stores/inquiry'
import type {
  InquiryCategory,
  InquiryPriority,
  InquirySort,
  InquiryStatus,
} from '../types/inquiry'
import {
  parseInquiryListQuery,
  toApiInquiryListQuery,
  toRouteInquiryListQuery,
  type NormalizedInquiryListQuery,
} from '../utils/inquiry-query'

const SEARCH_DEBOUNCE_MS = 350

const route = useRoute()
const router = useRouter()
const inquiryStore = useInquiryStore()
const { inquiries, pagination, isListLoading, listErrorMessage } =
  storeToRefs(inquiryStore)

const normalizedQuery = computed(() => parseInquiryListQuery(route.query))
const searchInput = ref(normalizedQuery.value.search)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const activeFilterCount = computed(
  () =>
    [
      normalizedQuery.value.search,
      normalizedQuery.value.status,
      normalizedQuery.value.priority,
      normalizedQuery.value.category,
    ].filter(Boolean).length,
)

const emptyState = computed(() => {
  if (normalizedQuery.value.search) {
    return {
      title: '검색 결과가 없습니다',
      description: '다른 검색어를 입력하거나 필터를 초기화해 보세요.',
    }
  }

  if (activeFilterCount.value > 0) {
    return {
      title: '조건에 맞는 문의가 없습니다',
      description: '필터 조건을 줄이거나 전체 조건으로 다시 확인해 보세요.',
    }
  }

  return {
    title: '접수된 문의가 없습니다',
    description: '새로운 문의가 접수되면 이곳에 표시됩니다.',
  }
})

function replaceQuery(
  patch: Partial<NormalizedInquiryListQuery>,
  options: { resetPage?: boolean } = {},
): void {
  const nextQuery: NormalizedInquiryListQuery = {
    ...normalizedQuery.value,
    ...patch,
    ...(options.resetPage === false ? {} : { page: 1 }),
  }

  void router.replace({
    query: toRouteInquiryListQuery(nextQuery),
  })
}

function handleSearchUpdate(value: string): void {
  searchInput.value = value
  clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    replaceQuery({ search: value.trim() })
  }, SEARCH_DEBOUNCE_MS)
}

function handleStatusUpdate(value: InquiryStatus | undefined): void {
  replaceQuery({ status: value })
}

function handlePriorityUpdate(value: InquiryPriority | undefined): void {
  replaceQuery({ priority: value })
}

function handleCategoryUpdate(value: InquiryCategory | undefined): void {
  replaceQuery({ category: value })
}

function handleSortUpdate(value: InquirySort): void {
  replaceQuery({ sort: value })
}

function handlePageChange(page: number): void {
  replaceQuery({ page }, { resetPage: false })
}

function resetFilters(): void {
  clearTimeout(searchTimer)
  searchInput.value = ''
  void router.replace({ query: {} })
}

async function fetchCurrentList(): Promise<void> {
  const query = normalizedQuery.value

  await inquiryStore.fetchInquiryList(toApiInquiryListQuery(query))

  if (
    !listErrorMessage.value &&
    pagination.value.totalPages > 0 &&
    query.page > pagination.value.totalPages
  ) {
    replaceQuery({ page: pagination.value.totalPages }, { resetPage: false })
  }
}

watch(
  () => route.query,
  () => {
    const routeSearch = normalizedQuery.value.search

    if (searchInput.value !== routeSearch) {
      clearTimeout(searchTimer)
      searchInput.value = routeSearch
    }

    void fetchCurrentList()
  },
  { immediate: true },
)

onUnmounted(() => {
  clearTimeout(searchTimer)
  inquiryStore.cancelInquiryListRequest()
})
</script>

<template>
  <div class="page inquiry-list-page">
    <header class="page-header">
      <p class="page-header__eyebrow">Inquiry management</p>
      <h1>문의 관리</h1>
      <p class="page-header__description">
        접수된 문의를 검색하고 상태, 우선순위, 카테고리별로 분류합니다.
      </p>
    </header>

    <InquiryFilterBar
      :search="searchInput"
      :status="normalizedQuery.status"
      :priority="normalizedQuery.priority"
      :category="normalizedQuery.category"
      :sort="normalizedQuery.sort"
      :active-filter-count="activeFilterCount"
      @update:search="handleSearchUpdate"
      @update:status="handleStatusUpdate"
      @update:priority="handlePriorityUpdate"
      @update:category="handleCategoryUpdate"
      @update:sort="handleSortUpdate"
      @reset="resetFilters"
    />

    <section
      id="inquiry-list-results"
      class="inquiry-results"
      aria-labelledby="inquiry-results-title"
      :aria-busy="isListLoading"
    >
      <div class="inquiry-results__heading">
        <div>
          <p class="inquiry-results__eyebrow">All inquiries</p>
          <h2 id="inquiry-results-title">문의 목록</h2>
        </div>
        <p v-if="!isListLoading && !listErrorMessage" aria-live="polite">
          총 {{ pagination.total.toLocaleString('ko-KR') }}건
        </p>
      </div>

      <InquiryListSkeleton v-if="isListLoading" data-testid="inquiry-list-skeleton" />

      <ErrorState
        v-else-if="listErrorMessage"
        title="문의 목록을 불러오지 못했습니다"
        :message="listErrorMessage"
        @retry="fetchCurrentList"
      />

      <div v-else-if="inquiries.length === 0" class="empty-state">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 5h16v14H4zM4 9h16M8 13h8m-8 3h5" />
          </svg>
        </span>
        <h3>{{ emptyState.title }}</h3>
        <p>{{ emptyState.description }}</p>
        <button
          v-if="activeFilterCount > 0 || normalizedQuery.sort !== 'newest'"
          type="button"
          @click="resetFilters"
        >
          필터 초기화
        </button>
      </div>

      <template v-else>
        <InquiryTable :inquiries="inquiries" />
        <InquiryCardList :inquiries="inquiries" />
        <PaginationControls :pagination="pagination" @page-change="handlePageChange" />
      </template>
    </section>
  </div>
</template>

<style scoped>
.inquiry-list-page {
  gap: var(--space-6);
}

.inquiry-results {
  display: grid;
  gap: var(--space-4);
}

.inquiry-results__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.inquiry-results__eyebrow {
  margin-bottom: var(--space-1);
  color: var(--color-brand-700);
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.inquiry-results h2 {
  color: var(--color-text-strong);
  font-size: 1.25rem;
}

.inquiry-results__heading > p {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  padding: clamp(var(--space-8), 8vw, 4.5rem) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 92%);
  text-align: center;
}

.empty-state > span {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 50%;
  background: var(--color-neutral-100);
  color: var(--color-text-muted);
}

.empty-state svg {
  width: 1.5rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.empty-state h3 {
  color: var(--color-text-strong);
  font-size: var(--font-size-lg);
}

.empty-state p {
  color: var(--color-text-muted);
}

.empty-state button {
  min-height: 2.75rem;
  margin-top: var(--space-2);
  padding: 0.625rem var(--space-4);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-brand-700);
  color: var(--color-neutral-0);
  font-weight: 700;
  cursor: pointer;
}
</style>
