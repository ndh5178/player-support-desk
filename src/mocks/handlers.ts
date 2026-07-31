import { delay, http, HttpResponse, type RequestHandler } from 'msw'

import { agents, CURRENT_AGENT_ID } from './data'
import { getStoredInquiries, saveStoredInquiries } from './storage'
import {
  INQUIRY_PRIORITIES,
  isInquiryCategory,
  isInquiryPriority,
  isInquirySort,
  isInquiryStatus,
  type Inquiry,
  type InquiryCategory,
  type InquiryHistory,
  type InquiryPriority,
  type InquirySort,
  type InquiryStatus,
} from '../types/inquiry'
import { cloneSerializable } from '../utils/clone'

const API_ROOT = '/api'
const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250
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
  const suffix =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

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
  return HttpResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  )
}

function parsePositiveInteger(value: string | null, fallback: number): number | null {
  if (value === null) {
    return fallback
  }

  if (!/^\d+$/.test(value)) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isSafeInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function parseListQuery(
  url: URL,
): { query: ParsedListQuery } | { response: ReturnType<typeof errorResponse> } {
  const search = url.searchParams.get('search')?.trim() ?? ''
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const category = url.searchParams.get('category')
  const sort = url.searchParams.get('sort') ?? 'newest'
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

  return {
    query: {
      search,
      status: status !== null && isInquiryStatus(status) ? status : undefined,
      priority: priority !== null && isInquiryPriority(priority) ? priority : undefined,
      category: category !== null && isInquiryCategory(category) ? category : undefined,
      sort: isInquirySort(sort) ? sort : 'newest',
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
  const inquiries = getStoredInquiries()
  const index = inquiries.findIndex((inquiry) => inquiry.id === id)

  return {
    inquiries,
    inquiry: inquiries[index],
    index,
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
    type,
    actorName: currentAgent.name,
    description,
    createdAt: new Date().toISOString(),
    previousValue,
    nextValue,
  }
}

export const handlers: RequestHandler[] = [
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
      recentInquiries: [...inquiries]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        )
        .slice(0, 5),
      priorityDistribution: INQUIRY_PRIORITIES.map((priority) => ({
        priority,
        count: inquiries.filter((inquiry) => inquiry.priority === priority).length,
      })),
    })
  }),

  http.get(`${API_ROOT}/agents`, async () => {
    await waitForMockDelay()

    return HttpResponse.json({ data: agents })
  }),

  http.get(`${API_ROOT}/inquiries`, async ({ request }) => {
    await waitForMockDelay()

    const parsedQuery = parseListQuery(new URL(request.url))

    if ('response' in parsedQuery) {
      return parsedQuery.response
    }

    const { search, status, priority, category, sort, page, limit } = parsedQuery.query
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

        return sort === 'newest' ? secondTime - firstTime : firstTime - secondTime
      })

    const total = filteredInquiries.length
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filteredInquiries.slice(startIndex, startIndex + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),

  http.get(`${API_ROOT}/inquiries/:id`, async ({ params }) => {
    await waitForMockDelay()

    const id = String(params.id)
    const { inquiry } = findInquiry(id)

    if (!inquiry) {
      return errorResponse(404, 'INQUIRY_NOT_FOUND', '요청한 문의를 찾을 수 없습니다.')
    }

    return HttpResponse.json(inquiry)
  }),

  http.patch(`${API_ROOT}/inquiries/:id`, async ({ params, request }) => {
    await waitForMockDelay()

    const id = String(params.id)
    const { inquiries, inquiry, index } = findInquiry(id)

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

    const nextAssignee =
      hasAssigneeId && typeof body.assigneeId === 'string'
        ? agents.find((agent) => agent.id === body.assigneeId)
        : null

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
      const assigneeChanged = previousAssignee?.id !== (nextAssignee?.id ?? undefined)

      if (assigneeChanged) {
        histories.push(
          createHistory(
            'ASSIGNEE_CHANGED',
            nextAssignee
              ? `${nextAssignee.name} 담당자로 배정했습니다.`
              : '담당자 배정을 해제했습니다.',
            previousAssignee?.id ?? null,
            nextAssignee?.id ?? null,
          ),
        )
        nextInquiry.assignee = nextAssignee ?? null
      }
    }

    if (histories.length > 0) {
      nextInquiry.history.push(...histories)
      nextInquiry.updatedAt = new Date().toISOString()
      inquiries[index] = nextInquiry
      saveStoredInquiries(inquiries)
    }

    return HttpResponse.json(nextInquiry)
  }),

  http.post(`${API_ROOT}/inquiries/:id/notes`, async ({ params, request }) => {
    await waitForMockDelay()

    const id = String(params.id)
    const { inquiries, inquiry, index } = findInquiry(id)

    if (!inquiry) {
      return errorResponse(404, 'INQUIRY_NOT_FOUND', '요청한 문의를 찾을 수 없습니다.')
    }

    let rawBody: unknown

    try {
      rawBody = await request.json()
    } catch {
      return errorResponse(400, 'INVALID_JSON', '올바른 JSON 요청 본문이 필요합니다.')
    }

    const contentValue =
      rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody)
        ? (rawBody as Record<string, unknown>).content
        : undefined
    const content = typeof contentValue === 'string' ? contentValue.trim() : ''

    if (content.length === 0 || content.length > 1000) {
      return errorResponse(400, 'VALIDATION_ERROR', '메모 내용을 확인해 주세요.', {
        content: '공백이 아닌 1자 이상 1,000자 이하의 내용이 필요합니다.',
      })
    }

    const createdAt = new Date().toISOString()
    const note = {
      id: createId('note'),
      content,
      author: currentAgent,
      createdAt,
    }
    const nextInquiry = cloneSerializable(inquiry)

    nextInquiry.notes.push(note)
    nextInquiry.history.push({
      id: createId('history'),
      type: 'NOTE_ADDED',
      actorName: currentAgent.name,
      description: '내부 메모를 추가했습니다.',
      createdAt,
    })
    nextInquiry.updatedAt = createdAt
    inquiries[index] = nextInquiry
    saveStoredInquiries(inquiries)

    return HttpResponse.json(note, { status: 201 })
  }),
]
