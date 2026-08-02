import { nextTick } from 'vue'
import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import InquiryListView from '@/views/InquiryListView.vue'

const FOCUS_RETRY_LIMIT = 20
const FOCUS_RETRY_DELAY_MS = 25

// Lazy Loading된 페이지는 경로 변경 직후 아직 렌더링되지 않을 수 있어 잠시 기다린다.
function waitForHeadingRender(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, FOCUS_RETRY_DELAY_MS)
  })
}

export async function focusPageHeading(): Promise<void> {
  for (let attempt = 0; attempt < FOCUS_RETRY_LIMIT; attempt += 1) {
    await nextTick()

    const pageHeading = document.querySelector<HTMLElement>('#main-content h1')

    if (pageHeading) {
      // 새 페이지의 제목을 키보드 포커스 시작점으로 만들되 화면 스크롤은 유지한다.
      pageHeading.tabIndex = -1
      pageHeading.focus({ preventScroll: true })
      return
    }

    await waitForHeadingRender()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: '전황 대시보드',
      },
    },
    {
      path: '/inquiries',
      name: 'inquiry-list',
      component: InquiryListView,
      meta: {
        title: '플레이어 문의 큐',
      },
    },
    {
      path: '/inquiries/:id',
      name: 'inquiry-detail',
      // 상세 화면은 처음 필요할 때만 내려받아 초기 번들 크기를 줄인다.
      component: () => import('@/views/InquiryDetailView.vue'),
      meta: {
        title: '케이스 상세',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '페이지를 찾을 수 없음',
      },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach(async (to, from) => {
  // 라우트별 meta.title을 브라우저 탭 제목에 반영한다.
  const title = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = title
    ? `${title} | BATTLEGROUNDS Player Support Ops`
    : 'BATTLEGROUNDS Player Support Ops'

  if (from === START_LOCATION || to.path === from.path) {
    // 최초 접속과 필터 Query만 바뀐 경우에는 사용자가 두고 있던 포커스를 빼앗지 않는다.
    return
  }

  await focusPageHeading()
})

export default router
