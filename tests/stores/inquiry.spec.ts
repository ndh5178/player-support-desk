import { createPinia, setActivePinia } from 'pinia'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetInquiryStorage } from '@/mocks/storage'
import { useInquiryStore } from '@/stores/inquiry'
import { server } from '../mocks/server'

describe('inquiry store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
    resetInquiryStorage(new Date())
  })

  it('빠른 연속 조회에서 이전 요청 결과가 최신 목록을 덮어쓰지 않는다', async () => {
    server.use(
      http.get('/api/inquiries', async ({ request }) => {
        const search = new URL(request.url).searchParams.get('search')

        if (search === 'slow') {
          await delay(100)
        }

        return HttpResponse.json({
          data: [
            {
              id: `result-${search}`,
              title: `${search} 결과`,
              content: '',
              category: 'OTHER',
              priority: 'NORMAL',
              status: 'NEW',
              customer: {
                id: 'customer-test',
                nickname: 'TestPlayer',
                email: 'test@example.com',
                countryCode: 'KR',
                countryName: '대한민국',
                languageCode: 'ko',
                languageName: '한국어',
              },
              assignee: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              slaDueAt: new Date().toISOString(),
              history: [],
              notes: [],
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        })
      }),
    )
    const store = useInquiryStore()

    const slowRequest = store.fetchInquiryList({ search: 'slow' })
    const fastRequest = store.fetchInquiryList({ search: 'fast' })

    await Promise.all([slowRequest, fastRequest])

    expect(store.inquiries).toHaveLength(1)
    expect(store.inquiries[0]?.id).toBe('result-fast')
    expect(store.isListLoading).toBe(false)
    expect(store.listErrorMessage).toBe('')
  })
})
