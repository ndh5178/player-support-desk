import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/App.vue'
import { resetInquiryStorage } from '@/mocks/storage'
import DashboardView from '@/views/DashboardView.vue'
import InquiryDetailView from '@/views/InquiryDetailView.vue'
import InquiryListView from '@/views/InquiryListView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { server } from '../mocks/server'

function createTestRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: DashboardView },
      { path: '/inquiries', name: 'inquiry-list', component: InquiryListView },
      {
        path: '/inquiries/:id',
        name: 'inquiry-detail',
        component: InquiryDetailView,
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundView,
      },
    ],
  })
}

async function mountApplication(initialLocation: string) {
  const router = createTestRouter()

  await router.push(initialLocation)
  await router.isReady()

  return {
    router: router,
    wrapper: mount(App, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router],
      },
    }),
  }
}

async function waitForView(): Promise<void> {
  await flushPromises()
  await flushPromises()
}

function getSummaryValue(wrapper: ReturnType<typeof mount>, label: string): number {
  const card = wrapper
    .findAll('.summary-card')
    .find((candidate) => candidate.get('.summary-card__heading p').text() === label)

  if (!card) {
    throw new Error(`${label} 요약 카드를 찾을 수 없습니다.`)
  }

  return Number(card.get('strong').text().replaceAll(',', ''))
}

describe('핵심 사용자 흐름', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetInquiryStorage(new Date())
  })

  it('문의 상태 변경을 목록과 대시보드 집계에 반영한다', async () => {
    const mountedApplication = await mountApplication('/')
    const router = mountedApplication.router
    const wrapper = mountedApplication.wrapper

    await waitForView()
    const initialNewCount = getSummaryValue(wrapper, '신규 문의')
    const initialInProgressCount = getSummaryValue(wrapper, '처리 중')

    await wrapper.get('a[href="/inquiries"]').trigger('click')
    await waitForView()
    expect(router.currentRoute.value.name).toBe('inquiry-list')

    await wrapper.get('tbody a[href="/inquiries/INQ-2026-0001"]').trigger('click')
    await waitForView()
    expect(router.currentRoute.value.name).toBe('inquiry-detail')

    await wrapper.get('[name="inquiry-status"]').setValue('IN_PROGRESS')
    await wrapper.get('[name="inquiry-assignee"]').setValue('agent-002')
    await wrapper.get('.management-panel__form').trigger('submit')
    await waitForView()
    expect(wrapper.get('[role="status"]').text()).toContain('변경 사항을 저장했습니다')

    await wrapper.get('.detail-header__back').trigger('click')
    await waitForView()

    const updatedRow = wrapper
      .findAll('tbody tr')
      .find((row) => row.text().includes('INQ-2026-0001'))

    if (updatedRow === undefined) {
      throw new Error('변경된 문의 행을 찾을 수 없습니다.')
    }

    expect(updatedRow.text()).toContain('처리 중')
    expect(updatedRow.text()).toContain('박민준')

    await wrapper.get('nav a[href="/"]').trigger('click')
    await waitForView()

    expect(getSummaryValue(wrapper, '신규 문의')).toBe(initialNewCount - 1)
    expect(getSummaryValue(wrapper, '처리 중')).toBe(initialInProgressCount + 1)
  })

  it('새 앱 인스턴스에서도 저장된 문의 변경을 복원한다', async () => {
    const firstApplication = await mountApplication('/inquiries/INQ-2026-0001')

    await waitForView()
    await firstApplication.wrapper.get('[name="inquiry-status"]').setValue('RESOLVED')
    await firstApplication.wrapper.get('[name="inquiry-assignee"]').setValue('agent-003')
    await firstApplication.wrapper.get('.management-panel__form').trigger('submit')
    await waitForView()
    firstApplication.wrapper.unmount()

    const refreshedApplication = await mountApplication('/inquiries/INQ-2026-0001')

    await waitForView()

    expect(
      (
        refreshedApplication.wrapper.get('[name="inquiry-status"]')
          .element as HTMLSelectElement
      ).value,
    ).toBe('RESOLVED')
    expect(
      (
        refreshedApplication.wrapper.get('[name="inquiry-assignee"]')
          .element as HTMLSelectElement
      ).value,
    ).toBe('agent-003')
    expect(refreshedApplication.wrapper.get('.timeline').text()).toContain(
      '문의 상태를 신규에서 해결(으)로 변경했습니다.',
    )
  })

  it('목록 실패 후 재시도해도 URL 필터 조건을 유지한다', async () => {
    server.use(
      http.get(
        '/api/inquiries',
        () =>
          HttpResponse.json(
            {
              error: {
                code: 'TEMPORARY_UNAVAILABLE',
                message: '문의 목록 연결이 원활하지 않습니다.',
              },
            },
            { status: 503 },
          ),
        { once: true },
      ),
    )
    const mountedApplication = await mountApplication('/inquiries?status=NEW')
    const router = mountedApplication.router
    const wrapper = mountedApplication.wrapper

    await waitForView()
    expect(wrapper.get('[role="alert"]').text()).toContain(
      '문의 목록 연결이 원활하지 않습니다.',
    )

    await wrapper.get('[role="alert"] button').trigger('click')
    await waitForView()

    expect(router.currentRoute.value.query).toEqual({ status: 'NEW' })
    expect((wrapper.get('#status-filter').element as HTMLSelectElement).value).toBe('NEW')
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThan(0)
    expect(wrapper.findAll('tbody tr').every((row) => row.text().includes('신규'))).toBe(
      true,
    )
  })
})
