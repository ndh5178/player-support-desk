import { beforeEach, describe, expect, it } from 'vitest'

import {
  addInquiryNote,
  getAgents,
  getDashboard,
  getInquiries,
  getInquiry,
  updateInquiry,
} from '@/services/api'
import {
  getStoredInquiries,
  INQUIRY_STORAGE_KEY,
  resetInquiryStorage,
} from '@/mocks/storage'

describe('문의 Mock REST API', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetInquiryStorage(new Date())
  })

  it('최신순 목록과 페이지네이션 정보를 반환한다', async () => {
    const response = await getInquiries()

    expect(response.data).toHaveLength(10)
    expect(response.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 24,
      totalPages: 3,
    })

    const createdTimes = response.data.map((inquiry) =>
      new Date(inquiry.createdAt).getTime(),
    )
    expect(createdTimes).toEqual([...createdTimes].sort((a, b) => b - a))
  })

  it('검색, 필터, 오래된순 정렬 조건을 함께 적용한다', async () => {
    const response = await getInquiries({
      search: 'INQ-2026',
      status: 'NEW',
      priority: 'HIGH',
      category: 'ACCOUNT',
      sort: 'oldest',
      limit: 50,
    })

    expect(response.data.length).toBeGreaterThan(0)
    expect(response.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'INQ-2026-0001' })]),
    )
    expect(
      response.data.every(
        (inquiry) =>
          inquiry.status === 'NEW' &&
          inquiry.priority === 'HIGH' &&
          inquiry.category === 'ACCOUNT',
      ),
    ).toBe(true)
  })

  it('잘못된 목록 조건을 구조화된 API 오류로 변환한다', async () => {
    await expect(getInquiries({ page: 0 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: {
        page: '1 이상의 정수여야 합니다.',
      },
    })
  })

  it('존재하지 않는 문의를 404 오류로 반환한다', async () => {
    await expect(getInquiry('INQ-NOT-FOUND')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'INQUIRY_NOT_FOUND',
    })
  })

  it('상태와 담당자 변경을 저장하고 대시보드 집계에 반영한다', async () => {
    const beforeDashboard = await getDashboard()
    const beforeInquiry = await getInquiry('INQ-2026-0001')

    const updatedInquiry = await updateInquiry('INQ-2026-0001', {
      status: 'IN_PROGRESS',
      assigneeId: 'agent-002',
    })
    const persistedInquiry = await getInquiry('INQ-2026-0001')
    const afterDashboard = await getDashboard()

    expect(updatedInquiry.status).toBe('IN_PROGRESS')
    expect(updatedInquiry.assignee?.id).toBe('agent-002')
    expect(updatedInquiry.history).toHaveLength(beforeInquiry.history.length + 2)
    expect(persistedInquiry).toEqual(updatedInquiry)
    expect(afterDashboard.newCount).toBe(beforeDashboard.newCount - 1)
    expect(afterDashboard.inProgressCount).toBe(beforeDashboard.inProgressCount + 1)
  })

  it('내부 메모의 공백을 정리해 저장하고 빈 내용은 거부한다', async () => {
    const createdNote = await addInquiryNote('INQ-2026-0002', {
      content: '  결제 영수증을 추가로 확인했습니다.  ',
    })
    const inquiry = await getInquiry('INQ-2026-0002')

    expect(createdNote.content).toBe('결제 영수증을 추가로 확인했습니다.')
    expect(inquiry.notes.at(-1)).toEqual(createdNote)
    expect(inquiry.history.at(-1)?.type).toBe('NOTE_ADDED')

    await expect(
      addInquiryNote('INQ-2026-0002', { content: '   ' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('담당자 목록을 제공하고 손상된 저장 데이터는 초기화한다', async () => {
    const agentResponse = await getAgents()

    expect(agentResponse.data).toHaveLength(4)

    window.localStorage.setItem(INQUIRY_STORAGE_KEY, '{broken-json')

    expect(getStoredInquiries()).toHaveLength(24)
    expect(window.localStorage.getItem(INQUIRY_STORAGE_KEY)).toContain('"version":1')
  })
})
