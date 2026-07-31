import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import InquiryListView from '@/views/InquiryListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: '대시보드',
      },
    },
    {
      path: '/inquiries',
      name: 'inquiry-list',
      component: InquiryListView,
      meta: {
        title: '문의 관리',
      },
    },
    {
      path: '/inquiries/:id',
      name: 'inquiry-detail',
      component: () => import('@/views/InquiryDetailView.vue'),
      meta: {
        title: '문의 상세',
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

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = title
    ? `${title} | 플레이어 지원 데스크`
    : '플레이어 지원 데스크'
})

export default router
