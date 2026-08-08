import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetInquiryStorage } from '@/mocks/storage'
import InquiryListView from '@/views/InquiryListView.vue'
import { server } from '../mocks/server'

async function mountInquiryList(
  initialLocation = '/inquiries',
): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/inquiries',
        component: InquiryListView,
      },
      {
        path: '/inquiries/:id',
        component: { template: '<div>문의 상세</div>' },
      },
    ],
  })

  await router.push(initialLocation)
  await router.isReady()

  const wrapper = mount(InquiryListView, {
    global: {
      plugins: [createPinia(), router],
    },
  })

  return { wrapper: wrapper, router: router }
}

async function waitForList(): Promise<void> {
  await flushPromises()
  await flushPromises()
}

describe('InquiryListView', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetInquiryStorage(new Date())
  })

  it('최초 로딩 후 문의 10건과 페이지 정보를 표시한다', async () => {
    const mountedList = await mountInquiryList()
    const wrapper = mountedList.wrapper

    expect(wrapper.get('[data-testid="inquiry-list-skeleton"]').text()).toContain(
      '문의 목록을 불러오는 중입니다.',
    )

    await waitForList()

    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.get('[aria-labelledby="inquiry-results-title"]').text()).toContain(
      '총 24건',
    )
    expect(
      wrapper.get('[aria-label="다음 페이지"]').attributes('disabled'),
    ).toBeUndefined()
  })

  it('상태 필터를 URL과 동기화하고 해당 문의만 표시한다', async () => {
    const mountedList = await mountInquiryList()
    const wrapper = mountedList.wrapper
    const router = mountedList.router

    await waitForList()
    await wrapper.get('#status-filter').setValue('RESOLVED')
    await waitForList()

    expect(router.currentRoute.value.query.status).toBe('RESOLVED')
    expect(router.currentRoute.value.query.page).toBeUndefined()
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThan(0)
    expect(wrapper.findAll('tbody tr').every((row) => row.text().includes('해결'))).toBe(
      true,
    )
  })

  it('검색어를 Debounce한 뒤 URL과 목록에 반영한다', async () => {
    const mountedList = await mountInquiryList()
    const wrapper = mountedList.wrapper
    const router = mountedList.router

    await waitForList()
    await wrapper.get('#inquiry-search').setValue('CloudRider')

    expect(router.currentRoute.value.query.search).toBeUndefined()

    await new Promise((resolve) => setTimeout(resolve, 400))
    await waitForList()

    expect(router.currentRoute.value.query.search).toBe('CloudRider')
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThan(0)
    expect(
      wrapper.findAll('tbody tr').every((row) => row.text().includes('CloudRider')),
    ).toBe(true)
    expect(wrapper.get('tbody').text()).toContain('CloudRider')
  })

  it('URL Query에서 필터와 정렬 상태를 복원한다', async () => {
    const mountedList = await mountInquiryList('/inquiries?priority=URGENT&sort=oldest')
    const wrapper = mountedList.wrapper

    await waitForList()

    expect((wrapper.get('#priority-filter').element as HTMLSelectElement).value).toBe(
      'URGENT',
    )
    expect((wrapper.get('#sort-filter').element as HTMLSelectElement).value).toBe(
      'oldest',
    )
    expect(wrapper.findAll('tbody tr').every((row) => row.text().includes('긴급'))).toBe(
      true,
    )
  })

  it('페이지 이동을 URL에 기록한다', async () => {
    const mountedList = await mountInquiryList()
    const wrapper = mountedList.wrapper
    const router = mountedList.router

    await waitForList()
    await wrapper.get('[aria-label="다음 페이지"]').trigger('click')
    await waitForList()

    expect(router.currentRoute.value.query.page).toBe('2')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2')
    expect(wrapper.get('[aria-labelledby="inquiry-results-title"]').text()).toContain(
      '11–20건',
    )
  })

  it('API 오류를 알리고 다시 시도하면 목록을 복구한다', async () => {
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
    const mountedList = await mountInquiryList()
    const wrapper = mountedList.wrapper

    await waitForList()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      '문의 목록 연결이 원활하지 않습니다.',
    )

    await wrapper.get('[role="alert"] button').trigger('click')
    await waitForList()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
  })

  it('결과가 없는 필터를 초기화해 전체 목록으로 돌아간다', async () => {
    const mountedList = await mountInquiryList(
      '/inquiries?status=RESOLVED&priority=URGENT',
    )
    const wrapper = mountedList.wrapper
    const router = mountedList.router

    await waitForList()

    expect(wrapper.text()).toContain('조건에 맞는 문의가 없습니다')

    await wrapper.get('.empty-state button').trigger('click')
    await waitForList()

    expect(router.currentRoute.value.query).toEqual({})
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
  })
})
