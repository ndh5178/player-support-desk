import type { Agent, Inquiry, InquiryPriority } from './inquiry'

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
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
