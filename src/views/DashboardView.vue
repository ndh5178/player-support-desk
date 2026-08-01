<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ErrorState from '../components/common/ErrorState.vue'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.vue'
import DashboardSummaryCard from '../components/dashboard/DashboardSummaryCard.vue'
import PriorityDistribution from '../components/dashboard/PriorityDistribution.vue'
import RecentInquiryList from '../components/dashboard/RecentInquiryList.vue'
import { getDashboard } from '../services/api'
import { ApiError, type DashboardData } from '../types/api'

const dashboard = ref<DashboardData | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
let requestController: AbortController | null = null

const summaryCards = computed(() => {
  if (!dashboard.value) {
    return []
  }

  return [
    {
      label: '전체 문의',
      value: dashboard.value.totalCount,
      description: '현재 지원 큐에 등록된 전체 케이스',
      tone: 'neutral' as const,
    },
    {
      label: '신규 문의',
      value: dashboard.value.newCount,
      description: '아직 담당자가 확인하지 않은 케이스',
      tone: 'info' as const,
    },
    {
      label: '처리 중',
      value: dashboard.value.inProgressCount,
      description: '지원 요원이 대응하고 있는 케이스',
      tone: 'progress' as const,
    },
    {
      label: 'SLA 지연',
      value: dashboard.value.slaOverdueCount,
      description: '응답 목표 시각을 초과한 케이스',
      tone: 'danger' as const,
    },
  ]
})

async function loadDashboard(): Promise<void> {
  requestController?.abort()

  const controller = new AbortController()
  requestController = controller
  isLoading.value = true
  errorMessage.value = ''

  try {
    dashboard.value = await getDashboard(controller.signal)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    dashboard.value = null
    errorMessage.value =
      error instanceof ApiError ? error.message : '잠시 후 다시 시도해 주세요.'
  } finally {
    if (requestController === controller) {
      isLoading.value = false
      requestController = null
    }
  }
}

onMounted(() => {
  void loadDashboard()
})

onUnmounted(() => {
  requestController?.abort()
})
</script>

<template>
  <div class="page dashboard-page" :aria-busy="isLoading">
    <header class="page-header dashboard-header">
      <div>
        <div class="dashboard-header__signal" aria-label="현재 운영 환경">
          <span><i aria-hidden="true"></i> 지원 시스템 정상</span>
          <span>지역 · 한국</span>
          <span>플랫폼 · PC</span>
        </div>
        <h1>전황 대시보드</h1>
        <p class="page-header__description">
          배틀그라운드 플레이어 문의와 지원 큐의 대응 현황을 확인합니다.
        </p>
      </div>
      <RouterLink class="dashboard-header__action" to="/inquiries">
        플레이어 문의 열기
        <span aria-hidden="true">→</span>
      </RouterLink>
    </header>

    <DashboardSkeleton v-if="isLoading" data-testid="dashboard-skeleton" />

    <ErrorState
      v-else-if="errorMessage"
      title="운영 현황을 불러오지 못했습니다"
      :message="errorMessage"
      @retry="loadDashboard"
    />

    <template v-else-if="dashboard">
      <section class="summary-grid" aria-label="문의 요약">
        <DashboardSummaryCard
          v-for="card in summaryCards"
          :key="card.label"
          v-bind="card"
        />
      </section>

      <div class="dashboard-content">
        <RecentInquiryList :inquiries="dashboard.recentInquiries" />
        <PriorityDistribution
          :items="dashboard.priorityDistribution"
          :total="dashboard.totalCount"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page {
  gap: var(--space-6);
}

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
}

.dashboard-header__signal {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.dashboard-header__signal span {
  display: inline-flex;
  min-height: 1.625rem;
  align-items: center;
  gap: var(--space-2);
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 52%);
  color: var(--color-text-muted);
  font-size: 0.625rem;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.dashboard-header__signal i {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: #32865a;
  box-shadow: 0 0 0 0.1875rem rgb(50 134 90 / 14%);
}

.dashboard-header__action {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.625rem var(--space-4);
  border: 1px solid var(--color-tactical-900);
  border-radius: var(--radius-sm);
  background: var(--color-tactical-900);
  color: #fff8e6;
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-decoration: none;
}

.dashboard-header__action:hover {
  border-color: var(--color-brand-600);
  background: var(--color-tactical-700);
  color: #f4c64f;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.dashboard-content {
  display: grid;
  gap: var(--space-4);
  align-items: start;
}

@media (min-width: 75rem) {
  .summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .dashboard-content {
    grid-template-columns: minmax(0, 1.8fr) minmax(18rem, 1fr);
  }
}

@media (max-width: 47.999rem) {
  .dashboard-header {
    align-items: stretch;
    flex-direction: column;
  }

  .dashboard-header__action {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
