import type { Agent, Inquiry, InquiryPriority } from './inquiry'

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  // 제네릭 T 덕분에 문의 외의 다른 목록 API에도 같은 페이지 응답 구조를 재사용할 수 있다.
  data: T[]
  pagination: Pagination
}

export interface PriorityDistributionItem {
  priority: InquiryPriority
  count: number
}

export interface DashboardData {
  totalCount: number
  newCount: number
  inProgressCount: number
  slaOverdueCount: number
  recentInquiries: Inquiry[]
  priorityDistribution: PriorityDistributionItem[]
}

export interface AgentListResponse {
  data: Agent[]
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

export class ApiError extends Error {
  // 화면과 Store가 HTTP 상태, 서버 오류 코드와 필드 오류를 구분해서 처리할 수 있게 보존한다.
  readonly status: number
  readonly code: string
  readonly details?: Record<string, string>

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}
