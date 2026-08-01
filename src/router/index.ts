import { nextTick } from 'vue'
import { createRouter, createWebHistory, START_LOCATION } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import InquiryListView from '@/views/InquiryListView.vue'

const FOCUS_RETRY_LIMIT = 20
const FOCUS_RETRY_DELAY_MS = 25

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
  const title = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = title
    ? `${title} | BATTLEGROUNDS Player Support Ops`
    : 'BATTLEGROUNDS Player Support Ops'

  if (from === START_LOCATION || to.path === from.path) {
    return
  }

  await focusPageHeading()
})

export default router
