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
      description: '현재 저장된 모든 고객 문의',
      tone: 'neutral' as const,
    },
    {
      label: '신규 문의',
      value: dashboard.value.newCount,
      description: '아직 처리를 시작하지 않은 문의',
      tone: 'info' as const,
    },
    {
      label: '처리 중',
      value: dashboard.value.inProgressCount,
      description: '담당자가 확인하고 있는 문의',
      tone: 'progress' as const,
    },
    {
      label: 'SLA 지연',
      value: dashboard.value.slaOverdueCount,
      description: '응답 목표 시각을 지난 미해결 문의',
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
        <p class="page-header__eyebrow">Operations overview</p>
        <h1>운영 현황</h1>
        <p class="page-header__description">
          신규 문의와 처리 중인 문의, SLA 지연 현황을 한눈에 확인합니다.
        </p>
      </div>
      <RouterLink class="dashboard-header__action" to="/inquiries">
        문의 관리
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

.dashboard-header__action {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.625rem var(--space-4);
  border: 1px solid var(--color-brand-600);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-brand-700);
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-decoration: none;
}

.dashboard-header__action:hover {
  background: var(--color-brand-50);
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
