import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetInquiryStorage } from '@/mocks/storage'
import DashboardView from '@/views/DashboardView.vue'
import { server } from '../mocks/server'

function mountDashboard() {
  return mount(DashboardView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('DashboardView', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetInquiryStorage(new Date())
  })

  it('최초 조회 중에는 접근 가능한 Skeleton을 표시한다', () => {
    const wrapper = mountDashboard()

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[data-testid="dashboard-skeleton"]').text()).toContain(
      '운영 현황을 불러오는 중입니다.',
    )
  })

  it('문의 요약과 최근 문의, 우선순위 분포를 표시한다', async () => {
    const wrapper = mountDashboard()

    await flushPromises()

    const summary = wrapper.get('[aria-label="문의 요약"]')

    expect(wrapper.attributes('aria-busy')).toBe('false')
    expect(summary.text()).toContain('전체 문의')
    expect(summary.text()).toContain('24')
    expect(summary.text()).toContain('신규 문의')
    expect(summary.text()).toContain('처리 중')
    expect(summary.text()).toContain('SLA 지연')
    expect(wrapper.get('#recent-inquiries-title').text()).toBe('최근 접수 문의')
    expect(wrapper.text()).toContain('INQ-2026-0001')
    expect(wrapper.get('#priority-distribution-title').text()).toBe('문의 우선순위 분포')
    expect(wrapper.findAll('[role="progressbar"]')).toHaveLength(4)
  })

  it('최근 문의에서 상세 화면으로 이동할 수 있는 링크를 제공한다', async () => {
    const wrapper = mountDashboard()

    await flushPromises()

    const detailLinks = wrapper
      .findAllComponents(RouterLinkStub)
      .filter((link) => String(link.props('to')).startsWith('/inquiries/'))

    expect(detailLinks).toHaveLength(5)
    const firstDetailLink = detailLinks[0]

    if (firstDetailLink === undefined) {
      throw new Error('첫 번째 문의 상세 링크를 찾을 수 없습니다.')
    }

    expect(firstDetailLink.props('to')).toBe('/inquiries/INQ-2026-0001')
    expect(firstDetailLink.attributes('aria-label')).toContain('문의 상세 보기')
  })

  it('API 오류를 알리고 다시 시도하면 정상 화면을 표시한다', async () => {
    server.use(
      http.get(
        '/api/dashboard',
        () =>
          HttpResponse.json(
            {
              error: {
                code: 'TEMPORARY_UNAVAILABLE',
                message: '잠시 연결이 원활하지 않습니다.',
              },
            },
            { status: 503 },
          ),
        { once: true },
      ),
    )
    const wrapper = mountDashboard()

    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      '운영 현황을 불러오지 못했습니다',
    )
    expect(wrapper.get('[role="alert"]').text()).toContain(
      '잠시 연결이 원활하지 않습니다.',
    )

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('[aria-label="문의 요약"]').text()).toContain('전체 문의')
  })
})
