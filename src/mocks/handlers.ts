import { delay, http, HttpResponse, type RequestHandler } from 'msw'

import { agents, CURRENT_AGENT_ID } from './data'
import { getStoredInquiries, saveStoredInquiries } from './storage'
import {
  INQUIRY_PRIORITIES,
  isInquiryCategory,
  isInquiryPriority,
  isInquirySort,
  isInquiryStatus,
  type Agent,
  type Inquiry,
  type InquiryCategory,
  type InquiryHistory,
  type InquiryPriority,
  type InquirySort,
  type InquiryStatus,
} from '../types/inquiry'
import { cloneSerializable } from '../utils/clone'

const API_ROOT = '/api'
function getMockDelay(): number {
  if (import.meta.env.MODE === 'test') {
    return 0
  }

  return 250
}

const MOCK_DELAY_MS = getMockDelay()
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

const currentAgent = agents.find((agent) => agent.id === CURRENT_AGENT_ID)!

interface ParsedListQuery {
  search: string
  status?: InquiryStatus
  priority?: InquiryPriority
  category?: InquiryCategory
  sort: InquirySort
  page: number
  limit: number
}

function createId(prefix: string): string {
  let suffix: string

  if (typeof crypto.randomUUID === 'function') {
    suffix = crypto.randomUUID()
  } else {
    suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  return `${prefix}-${suffix}`
}

async function waitForMockDelay(): Promise<void> {
  if (MOCK_DELAY_MS > 0) {
    await delay(MOCK_DELAY_MS)
  }
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string>,
) {
  const errorBody: {
    error: {
      code: string
      message: string
      details?: Record<string, string>
    }
  } = {
    error: {
      code: code,
      message: message,
    },
  }

  if (details !== undefined) {
    errorBody.error.details = details
  }

  return HttpResponse.json(errorBody, { status: status })
}

function parsePositiveInteger(value: string | null, fallback: number): number | null {
  if (value === null) {
    return fallback
  }

  if (!/^\d+$/.test(value)) {
    return null
  }

  const parsedValue = Number(value)

  if (Number.isSafeInteger(parsedValue) && parsedValue > 0) {
    return parsedValue
  }

  return null
}

function parseListQuery(
  url: URL,
): { query: ParsedListQuery } | { response: ReturnType<typeof errorResponse> } {
  // 실제 백엔드처럼 Query Parameter를 검증하고 잘못된 필드는 400 응답 정보로 모은다.
  const searchParameter = url.searchParams.get('search')
  let search = ''

  if (searchParameter !== null) {
    search = searchParameter.trim()
  }
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const category = url.searchParams.get('category')
  const sortParameter = url.searchParams.get('sort')
  let sort = 'newest'

  if (sortParameter !== null) {
    sort = sortParameter
  }
  const page = parsePositiveInteger(url.searchParams.get('page'), DEFAULT_PAGE)
  const limit = parsePositiveInteger(url.searchParams.get('limit'), DEFAULT_LIMIT)
  const details: Record<string, string> = {}

  if (status !== null && !isInquiryStatus(status)) {
    details.status = '지원하지 않는 문의 상태입니다.'
  }

  if (priority !== null && !isInquiryPriority(priority)) {
    details.priority = '지원하지 않는 우선순위입니다.'
  }

  if (category !== null && !isInquiryCategory(category)) {
    details.category = '지원하지 않는 문의 유형입니다.'
  }

  if (!isInquirySort(sort)) {
    details.sort = 'newest 또는 oldest만 사용할 수 있습니다.'
  }

  if (page === null) {
    details.page = '1 이상의 정수여야 합니다.'
  }

  if (limit === null || limit > MAX_LIMIT) {
    details.limit = `1 이상 ${MAX_LIMIT} 이하의 정수여야 합니다.`
  }

  if (Object.keys(details).length > 0) {
    return {
      response: errorResponse(
        400,
        'VALIDATION_ERROR',
        '목록 조회 조건을 확인해 주세요.',
        details,
      ),
    }
  }

  let parsedStatus: InquiryStatus | undefined
  let parsedPriority: InquiryPriority | undefined
  let parsedCategory: InquiryCategory | undefined
  let parsedSort: InquirySort = 'newest'

  if (status !== null && isInquiryStatus(status)) {
    parsedStatus = status
  }
  if (priority !== null && isInquiryPriority(priority)) {
    parsedPriority = priority
  }
  if (category !== null && isInquiryCategory(category)) {
    parsedCategory = category
  }
  if (isInquirySort(sort)) {
    parsedSort = sort
  }

  return {
    query: {
      search: search,
      status: parsedStatus,
      priority: parsedPriority,
      category: parsedCategory,
      sort: parsedSort,
      page: page!,
      limit: limit!,
    },
  }
}

function findInquiry(id: string): {
  inquiries: Inquiry[]
  inquiry: Inquiry | undefined
  index: number
} {
  // 수정 후 전체 배열을 다시 저장할 수 있도록 문의와 배열 위치를 함께 반환한다.
  const inquiries = getStoredInquiries()
  const index = inquiries.findIndex((inquiry) => inquiry.id === id)

  return {
    inquiries: inquiries,
    inquiry: inquiries[index],
    index: index,
  }
}

function createHistory(
  type: InquiryHistory['type'],
  description: string,
  previousValue?: string | null,
  nextValue?: string | null,
): InquiryHistory {
  return {
    id: createId('history'),
    type: type,
    actorName: currentAgent.name,
    description: description,
    createdAt: new Date().toISOString(),
    previousValue: previousValue,
    nextValue: nextValue,
  }
}

export const handlers: RequestHandler[] = [
  // 대시보드 통계는 저장된 문의 원본에서 요청 시점마다 다시 집계한다.
  http.get(`${API_ROOT}/dashboard`, async () => {
    await waitForMockDelay()

    const inquiries = getStoredInquiries()
    const now = Date.now()

    return HttpResponse.json({
      totalCount: inquiries.length,
      newCount: inquiries.filter((inquiry) => inquiry.status === 'NEW').length,
      inProgressCount: inquiries.filter((inquiry) => inquiry.status === 'IN_PROGRESS')
        .length,
      slaOverdueCount: inquiries.filter(
        (inquiry) =>
          inquiry.status !== 'RESOLVED' && new Date(inquiry.slaDueAt).getTime() < now,
      ).length,
      recentInquiries: inquiries
        .slice()
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        )
        .slice(0, 5),
      priorityDistribution: INQUIRY_PRIORITIES.map((priority) => ({
        priority: priority,
        count: inquiries.filter((inquiry) => inquiry.priority === priority).length,
      })),
    })
  }),

  http.get(`${API_ROOT}/agents`, async () => {
    await waitForMockDelay()

    return HttpResponse.json({ data: agents })
  }),

  http.get(`${API_ROOT}/inquiries`, async (requestContext) => {
    const request = requestContext.request
    await waitForMockDelay()

    const parsedQuery = parseListQuery(new URL(request.url))

    if ('response' in parsedQuery) {
      return parsedQuery.response
    }

    const search = parsedQuery.query.search
    const status = parsedQuery.query.status
    const priority = parsedQuery.query.priority
    const category = parsedQuery.query.category
    const sort = parsedQuery.query.sort
    const page = parsedQuery.query.page
    const limit = parsedQuery.query.limit
    // 검색 → 필터 → 정렬 → 페이지 자르기 순서로 실제 목록 API 동작을 재현한다.
    const normalizedSearch = search.toLocaleLowerCase('ko-KR')
    const filteredInquiries = getStoredInquiries()
      .filter((inquiry) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [inquiry.id, inquiry.title, inquiry.customer.nickname].some((value) =>
            value.toLocaleLowerCase('ko-KR').includes(normalizedSearch),
          )

        return (
          matchesSearch &&
          (!status || inquiry.status === status) &&
          (!priority || inquiry.priority === priority) &&
          (!category || inquiry.category === category)
        )
      })
      .sort((first, second) => {
        const firstTime = new Date(first.createdAt).getTime()
        const secondTime = new Date(second.createdAt).getTime()

        if (sort === 'newest') {
          return secondTime - firstTime
        }

        return firstTime - secondTime
      })

    const total = filteredInquiries.length
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filteredInquiries.slice(startIndex, startIndex + limit),
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),

  http.get(`${API_ROOT}/inquiries/:id`, async (requestContext) => {
    const params = requestContext.params
    await waitForMockDelay()

    const id = String(params.id)
    const inquiryResult = findInquiry(id)
    const inquiry = inquiryResult.inquiry

    if (!inquiry) {
      return errorResponse(404, 'INQUIRY_NOT_FOUND', '요청한 문의를 찾을 수 없습니다.')
    }

    return HttpResponse.json(inquiry)
  }),

  http.patch(`${API_ROOT}/inquiries/:id`, async (requestContext) => {
    const params = requestContext.params
    const request = requestContext.request
    await waitForMockDelay()

    const id = String(params.id)
    const inquiryResult = findInquiry(id)
    const inquiries = inquiryResult.inquiries
    const inquiry = inquiryResult.inquiry
    const index = inquiryResult.index

    if (!inquiry) {
      return errorResponse(404, 'INQUIRY_NOT_FOUND', '요청한 문의를 찾을 수 없습니다.')
    }

    let rawBody: unknown

    try {
      rawBody = await request.json()
    } catch {
      return errorResponse(400, 'INVALID_JSON', '올바른 JSON 요청 본문이 필요합니다.')
    }

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return errorResponse(400, 'VALIDATION_ERROR', '수정할 문의 정보를 확인해 주세요.')
    }

    // TypeScript 타입은 네트워크 JSON을 보장하지 못하므로 허용한 필드를 실행 중 검증한다.
    const body = rawBody as Record<string, unknown>
    const hasStatus = Object.hasOwn(body, 'status')
    const hasAssigneeId = Object.hasOwn(body, 'assigneeId')
    const details: Record<string, string> = {}

    if (!hasStatus && !hasAssigneeId) {
      details.body = 'status 또는 assigneeId 중 하나 이상이 필요합니다.'
    }

    if (hasStatus && (typeof body.status !== 'string' || !isInquiryStatus(body.status))) {
      details.status = '지원하지 않는 문의 상태입니다.'
    }

    let nextAssignee: Agent | null | undefined = null

    if (hasAssigneeId && typeof body.assigneeId === 'string') {
      nextAssignee = agents.find((agent) => agent.id === body.assigneeId)
    }

    if (
      hasAssigneeId &&
      body.assigneeId !== null &&
      (typeof body.assigneeId !== 'string' || !nextAssignee)
    ) {
      details.assigneeId = '존재하는 담당자 ID 또는 null이어야 합니다.'
    }

    if (Object.keys(details).length > 0) {
      return errorResponse(
        400,
        'VALIDATION_ERROR',
        '수정할 문의 정보를 확인해 주세요.',
        details,
      )
    }

    // 검증이 모두 끝난 뒤 복사본을 변경해 실패한 요청이 저장 원본에 영향을 주지 않게 한다.
    const nextInquiry = cloneSerializable(inquiry)
    const histories: InquiryHistory[] = []

    if (hasStatus && body.status !== nextInquiry.status) {
      const nextStatus = body.status as Inquiry['status']
      histories.push(
        createHistory(
          'STATUS_CHANGED',
          `문의 상태를 ${nextInquiry.status}에서 ${nextStatus}(으)로 변경했습니다.`,
          nextInquiry.status,
          nextStatus,
        ),
      )
      nextInquiry.status = nextStatus
    }

    if (hasAssigneeId) {
      const previousAssignee = nextInquiry.assignee
      let previousAssigneeId: string | undefined
      let nextAssigneeId: string | undefined

      if (previousAssignee !== null) {
        previousAssigneeId = previousAssignee.id
      }
      if (nextAssignee !== null && nextAssignee !== undefined) {
        nextAssigneeId = nextAssignee.id
      }

      const assigneeChanged = previousAssigneeId !== nextAssigneeId

      if (assigneeChanged) {
        let historyDescription = '담당자 배정을 해제했습니다.'
        let previousHistoryValue: string | null = null
        let nextHistoryValue: string | null = null

        if (nextAssignee !== null && nextAssignee !== undefined) {
          historyDescription = `${nextAssignee.name} 담당자로 배정했습니다.`
          nextHistoryValue = nextAssignee.id
        }
        if (previousAssignee !== null) {
          previousHistoryValue = previousAssignee.id
        }

        histories.push(
          createHistory(
            'ASSIGNEE_CHANGED',
            historyDescription,
            previousHistoryValue,
            nextHistoryValue,
          ),
        )

        if (nextAssignee === undefined) {
          nextInquiry.assignee = null
        } else {
          nextInquiry.assignee = nextAssignee
        }
      }
    }

    if (histories.length > 0) {
      for (const history of histories) {
        nextInquiry.history.push(history)
      }
      nextInquiry.updatedAt = new Date().toISOString()
      inquiries[index] = nextInquiry
      saveStoredInquiries(inquiries)
    }

    return HttpResponse.json(nextInquiry)
  }),

  http.post(`${API_ROOT}/inquiries/:id/notes`, async (requestContext) => {
    const params = requestContext.params
    const request = requestContext.request
    await waitForMockDelay()

    const id = String(params.id)
    const inquiryResult = findInquiry(id)
    const inquiries = inquiryResult.inquiries
    const inquiry = inquiryResult.inquiry
    const index = inquiryResult.index

    if (!inquiry) {
      return errorResponse(404, 'INQUIRY_NOT_FOUND', '요청한 문의를 찾을 수 없습니다.')
    }

    let rawBody: unknown

    try {
      rawBody = await request.json()
    } catch {
      return errorResponse(400, 'INVALID_JSON', '올바른 JSON 요청 본문이 필요합니다.')
    }

    // 공백을 제거한 1~1,000자의 문자열만 내부 메모로 저장한다.
    let contentValue: unknown

    if (rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody)) {
      contentValue = (rawBody as Record<string, unknown>).content
    }

    let content = ''

    if (typeof contentValue === 'string') {
      content = contentValue.trim()
    }

    if (content.length === 0 || content.length > 1000) {
      return errorResponse(400, 'VALIDATION_ERROR', '메모 내용을 확인해 주세요.', {
        content: '공백이 아닌 1자 이상 1,000자 이하의 내용이 필요합니다.',
      })
    }

    const createdAt = new Date().toISOString()
    const note = {
      id: createId('note'),
      content: content,
      author: currentAgent,
      createdAt: createdAt,
    }
    const nextInquiry = cloneSerializable(inquiry)

    nextInquiry.notes.push(note)
    nextInquiry.history.push({
      id: createId('history'),
      type: 'NOTE_ADDED',
      actorName: currentAgent.name,
      description: '내부 메모를 추가했습니다.',
      createdAt: createdAt,
    })
    nextInquiry.updatedAt = createdAt
    inquiries[index] = nextInquiry
    saveStoredInquiries(inquiries)

    return HttpResponse.json(note, { status: 201 })
  }),
]
