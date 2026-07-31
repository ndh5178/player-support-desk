import {
  ApiError,
  type AgentListResponse,
  type ApiErrorBody,
  type DashboardData,
  type PaginatedResponse,
} from '../types/api'
import type {
  CreateInquiryNoteRequest,
  Inquiry,
  InquiryListQuery,
  InquiryNote,
  UpdateInquiryRequest,
} from '../types/inquiry'

const API_ROOT = '/api'

interface RequestOptions extends RequestInit {
  signal?: AbortSignal
}

function createApiUrl(path: string): URL {
  const baseUrl =
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin

  return new URL(`${API_ROOT}${path}`, baseUrl)
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(createApiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  let body: unknown

  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const apiError = body as Partial<ApiErrorBody> | null
    const error = apiError?.error

    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? '요청을 처리하지 못했습니다.',
      error?.details,
    )
  }

  return body as T
}

export function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return requestJson<DashboardData>('/dashboard', { signal })
}

export function getAgents(signal?: AbortSignal): Promise<AgentListResponse> {
  return requestJson<AgentListResponse>('/agents', { signal })
}

export function getInquiries(
  query: InquiryListQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<Inquiry>> {
  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()

  return requestJson<PaginatedResponse<Inquiry>>(
    `/inquiries${queryString ? `?${queryString}` : ''}`,
    { signal },
  )
}

export function getInquiry(inquiryId: string, signal?: AbortSignal): Promise<Inquiry> {
  return requestJson<Inquiry>(`/inquiries/${encodeURIComponent(inquiryId)}`, { signal })
}

export function updateInquiry(
  inquiryId: string,
  payload: UpdateInquiryRequest,
  signal?: AbortSignal,
): Promise<Inquiry> {
  return requestJson<Inquiry>(`/inquiries/${encodeURIComponent(inquiryId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    signal,
  })
}

export function addInquiryNote(
  inquiryId: string,
  payload: CreateInquiryNoteRequest,
  signal?: AbortSignal,
): Promise<InquiryNote> {
  return requestJson<InquiryNote>(`/inquiries/${encodeURIComponent(inquiryId)}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  })
}
