import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, type Pinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetInquiryStorage } from '@/mocks/storage'
import { useInquiryStore } from '@/stores/inquiry'
import InquiryDetailView from '@/views/InquiryDetailView.vue'
import { server } from '../mocks/server'

interface MountedDetail {
  wrapper: ReturnType<typeof mount>
  router: Router
  pinia: Pinia
}

async function mountInquiryDetail(
  initialLocation = '/inquiries/INQ-2026-0001',
): Promise<MountedDetail> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/inquiries',
        name: 'inquiry-list',
        component: { template: '<div>문의 목록</div>' },
      },
      {
        path: '/inquiries/:id',
        name: 'inquiry-detail',
        component: InquiryDetailView,
      },
    ],
  })
  const pinia = createPinia()

  await router.push(initialLocation)
  await router.isReady()

  return {
    wrapper: mount(InquiryDetailView, {
      global: {
        plugins: [pinia, router],
      },
    }),
    router,
    pinia,
  }
}

async function waitForDetail(): Promise<void> {
  await flushPromises()
  await flushPromises()
}

describe('InquiryDetailView', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetInquiryStorage(new Date())
  })

  it('문의 본문과 고객 정보, 처리 이력을 표시한다', async () => {
    const { wrapper } = await mountInquiryDetail()

    expect(wrapper.get('[data-testid="inquiry-detail-skeleton"]').text()).toContain(
      '문의 상세 정보를 불러오는 중입니다.',
    )

    await waitForDetail()

    expect(wrapper.get('h1').text()).toContain('로그인 인증 이메일이 도착하지 않습니다')
    expect(wrapper.get('#inquiry-content-title').text()).toBe('문의 내용')
    expect(wrapper.get('#customer-card-title').text()).toBe('CloudRider')
    expect(wrapper.get('#inquiry-timeline-title').text()).toBe('처리 이력')
    expect(wrapper.get('[name="inquiry-assignee"]').findAll('option')).toHaveLength(5)
  })

  it('상태와 담당자 변경을 저장하고 Store와 처리 이력을 갱신한다', async () => {
    const { wrapper, pinia } = await mountInquiryDetail()
    const store = useInquiryStore(pinia)

    await waitForDetail()
    await wrapper.get('[name="inquiry-status"]').setValue('IN_PROGRESS')
    await wrapper.get('[name="inquiry-assignee"]').setValue('agent-002')
    await wrapper.get('.management-panel__form').trigger('submit')
    await waitForDetail()

    expect(store.currentInquiry?.status).toBe('IN_PROGRESS')
    expect(store.currentInquiry?.assignee?.id).toBe('agent-002')
    expect(wrapper.get('[role="status"]').text()).toContain(
      '문의 상태와 담당자 변경 사항을 저장했습니다.',
    )
    expect(wrapper.get('.timeline').text()).toContain(
      '문의 상태를 신규에서 처리 중(으)로 변경했습니다.',
    )
  })

  it('빈 운영 메모 제출을 API 요청 전에 차단한다', async () => {
    const { wrapper } = await mountInquiryDetail()

    await waitForDetail()
    await wrapper.get('#inquiry-note').setValue('   ')
    await wrapper.get('.notes-form').trigger('submit')

    expect(wrapper.get('#inquiry-note-error').text()).toBe(
      '공백이 아닌 메모 내용을 입력해 주세요.',
    )
    expect(wrapper.get('#inquiry-note').attributes('aria-invalid')).toBe('true')
  })

  it('운영 메모를 저장하고 입력값과 처리 이력을 갱신한다', async () => {
    const { wrapper, pinia } = await mountInquiryDetail('/inquiries/INQ-2026-0002')
    const store = useInquiryStore(pinia)

    await waitForDetail()
    const initialNoteCount = store.currentInquiry?.notes.length ?? 0
    const initialHistoryCount = store.currentInquiry?.history.length ?? 0

    await wrapper.get('#inquiry-note').setValue('결제 내역 확인을 요청했습니다.')
    await wrapper.get('.notes-form').trigger('submit')
    await waitForDetail()

    expect(store.currentInquiry?.notes).toHaveLength(initialNoteCount + 1)
    expect(store.currentInquiry?.history).toHaveLength(initialHistoryCount + 1)
    expect((wrapper.get('#inquiry-note').element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.get('.notes-list').text()).toContain('결제 내역 확인을 요청했습니다.')
    expect(wrapper.get('[role="status"]').text()).toContain(
      '운영 메모를 추가하고 처리 이력을 갱신했습니다.',
    )
  })

  it('변경 저장 실패를 알리고 기존 Store 값을 유지한다', async () => {
    server.use(
      http.patch(
        '/api/inquiries/:id',
        () =>
          HttpResponse.json(
            {
              error: {
                code: 'TEMPORARY_UNAVAILABLE',
                message: '변경 사항을 저장할 수 없습니다.',
              },
            },
            { status: 503 },
          ),
        { once: true },
      ),
    )
    const { wrapper, pinia } = await mountInquiryDetail()
    const store = useInquiryStore(pinia)

    await waitForDetail()
    expect(store.currentInquiry?.status).toBe('NEW')

    await wrapper.get('[name="inquiry-status"]').setValue('RESOLVED')
    await wrapper.get('.management-panel__form').trigger('submit')
    await waitForDetail()

    expect(store.currentInquiry?.status).toBe('NEW')
    expect(wrapper.get('[role="alert"]').text()).toContain(
      '변경 사항을 저장할 수 없습니다.',
    )
    expect(
      (wrapper.get('[name="inquiry-status"]').element as HTMLSelectElement).value,
    ).toBe('RESOLVED')
  })

  it('존재하지 않는 문의에서 목록 이동과 다시 확인을 제공한다', async () => {
    const { wrapper, router } = await mountInquiryDetail('/inquiries/INQ-NOT-FOUND')

    await waitForDetail()

    expect(wrapper.get('#inquiry-not-found-title').text()).toBe('문의를 찾을 수 없습니다')

    await wrapper.get('.not-found-state__actions a').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('inquiry-list')
  })

  it('조회 오류를 알리고 다시 시도하면 상세 화면을 복구한다', async () => {
    server.use(
      http.get(
        '/api/inquiries/:id',
        () =>
          HttpResponse.json(
            {
              error: {
                code: 'TEMPORARY_UNAVAILABLE',
                message: '문의 상세 연결이 원활하지 않습니다.',
              },
            },
            { status: 503 },
          ),
        { once: true },
      ),
    )
    const { wrapper } = await mountInquiryDetail()

    await waitForDetail()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      '문의 상세 연결이 원활하지 않습니다.',
    )

    await wrapper.get('[role="alert"] button').trigger('click')
    await waitForDetail()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('h1').text()).toContain('로그인 인증 이메일이 도착하지 않습니다')
  })
})
