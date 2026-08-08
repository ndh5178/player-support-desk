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
// storeToRefs를 사용하면 Store의 각 상태를 별도 변수로 꺼내도 Vue 반응성이 유지된다.
const inquiryStoreRefs = storeToRefs(inquiryStore)
const inquiries = inquiryStoreRefs.inquiries
const pagination = inquiryStoreRefs.pagination
const isListLoading = inquiryStoreRefs.isListLoading
const listErrorMessage = inquiryStoreRefs.listErrorMessage

const normalizedQuery = computed(() => parseInquiryListQuery(route.query))
// 검색창 입력은 즉시 보이게 두고, 실제 URL과 API 요청은 Debounce 이후 변경한다.
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
  // URL Query를 필터 상태의 단일 기준으로 사용하며 필터 변경 시 기본적으로 1페이지로 돌아간다.
  const nextQuery: NormalizedInquiryListQuery = Object.assign(
    {},
    normalizedQuery.value,
    patch,
  )

  if (options.resetPage !== false) {
    nextQuery.page = 1
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
  replaceQuery({ page: page }, { resetPage: false })
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
    // 삭제나 필터 변경으로 현재 페이지가 범위를 벗어나면 마지막 유효 페이지로 보정한다.
    replaceQuery({ page: pagination.value.totalPages }, { resetPage: false })
  }
}

watch(
  () => route.query,
  () => {
    // 새로고침과 브라우저 앞·뒤 이동도 같은 필터와 목록을 복원하도록 URL 변화를 관찰한다.
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
  // 화면을 떠날 때 예약된 검색과 진행 중인 목록 요청을 모두 정리한다.
  clearTimeout(searchTimer)
  inquiryStore.cancelInquiryListRequest()
})
</script>

<template>
  <div class="page inquiry-list-page">
    <header class="page-header">
      <div class="page-header__context">
        <span>KR / PC</span>
      </div>
      <h1>플레이어 문의 큐</h1>
      <p class="page-header__description">
        접수된 배틀그라운드 문의를 검색하고 대응 상태와 우선순위를 관리합니다.
      </p>
    </header>

    <InquiryFilterBar
      v-bind:search="searchInput"
      v-bind:status="normalizedQuery.status"
      v-bind:priority="normalizedQuery.priority"
      v-bind:category="normalizedQuery.category"
      v-bind:sort="normalizedQuery.sort"
      v-bind:active-filter-count="activeFilterCount"
      v-on:update:search="handleSearchUpdate"
      v-on:update:status="handleStatusUpdate"
      v-on:update:priority="handlePriorityUpdate"
      v-on:update:category="handleCategoryUpdate"
      v-on:update:sort="handleSortUpdate"
      v-on:reset="resetFilters"
    ></InquiryFilterBar>

    <section
      id="inquiry-list-results"
      class="inquiry-results"
      aria-labelledby="inquiry-results-title"
      v-bind:aria-busy="isListLoading"
    >
      <div class="inquiry-results__heading">
        <h2 id="inquiry-results-title">전체 케이스</h2>
        <p v-if="!isListLoading && !listErrorMessage" aria-live="polite">
          총 {{ pagination.total.toLocaleString('ko-KR') }}건
        </p>
      </div>

      <!-- 같은 결과 영역에서 로딩, 오류, 빈 목록, 정상 목록 중 하나만 표시한다. -->
      <InquiryListSkeleton
        v-if="isListLoading"
        data-testid="inquiry-list-skeleton"
      ></InquiryListSkeleton>

      <ErrorState
        v-else-if="listErrorMessage"
        title="문의 목록을 불러오지 못했습니다"
        v-bind:message="listErrorMessage"
        v-on:retry="fetchCurrentList"
      ></ErrorState>

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
          v-on:click="resetFilters"
        >
          필터 초기화
        </button>
      </div>

      <template v-else>
        <!-- CSS 경계에 따라 데스크톱은 표, 작은 화면은 카드 목록을 보여 준다. -->
        <InquiryTable v-bind:inquiries="inquiries"></InquiryTable>
        <InquiryCardList v-bind:inquiries="inquiries"></InquiryCardList>
        <PaginationControls
          v-bind:pagination="pagination"
          v-on:page-change="handlePageChange"
        ></PaginationControls>
      </template>
    </section>
  </div>
</template>

<style scoped>
.inquiry-list-page {
  gap: var(--space-6);
}

.page-header__context {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.page-header__context span {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 50%);
  color: var(--color-text-muted);
  font-size: 0.625rem;
  font-weight: 850;
  letter-spacing: 0.09em;
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
