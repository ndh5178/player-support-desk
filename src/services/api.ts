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

// 브라우저와 jsdom 테스트 모두에서 같은 상대 API 경로를 사용할 수 있게 절대 URL로 만든다.
function createApiUrl(path: string): URL {
  let baseUrl = 'http://localhost'

  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin
  }

  return new URL(`${API_ROOT}${path}`, baseUrl)
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers()
  headers.set('Accept', 'application/json')

  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const callerHeaders = new Headers(options.headers)
  callerHeaders.forEach((value, key) => {
    headers.set(key, value)
  })

  const fetchOptions: RequestOptions = Object.assign({}, options)
  fetchOptions.headers = headers

  const response = await fetch(createApiUrl(path), fetchOptions)

  let body: unknown

  // 오류 응답이 JSON이 아니어도 원래 HTTP 상태를 보존해 일관된 ApiError로 변환한다.
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const apiError = body as Partial<ApiErrorBody> | null
    let error: ApiErrorBody['error'] | undefined

    if (apiError !== null) {
      error = apiError.error
    }

    let errorCode = 'UNKNOWN_ERROR'
    let errorMessage = '요청을 처리하지 못했습니다.'
    let errorDetails: Record<string, string> | undefined

    if (error !== undefined) {
      if (error.code !== undefined) {
        errorCode = error.code
      }
      if (error.message !== undefined) {
        errorMessage = error.message
      }
      errorDetails = error.details
    }

    throw new ApiError(response.status, errorCode, errorMessage, errorDetails)
  }

  return body as T
}

export function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return requestJson<DashboardData>('/dashboard', { signal: signal })
}

export function getAgents(signal?: AbortSignal): Promise<AgentListResponse> {
  return requestJson<AgentListResponse>('/agents', { signal: signal })
}

export function getInquiries(
  query: InquiryListQuery = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<Inquiry>> {
  const searchParams = new URLSearchParams()

  // 값이 있는 조회 조건만 URL Query Parameter에 포함한다.
  Object.entries(query).forEach((entry) => {
    const key = entry[0]
    const value = entry[1]

    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  let inquiryListPath = '/inquiries'

  if (queryString) {
    inquiryListPath = `/inquiries?${queryString}`
  }

  return requestJson<PaginatedResponse<Inquiry>>(inquiryListPath, { signal: signal })
}

export function getInquiry(inquiryId: string, signal?: AbortSignal): Promise<Inquiry> {
  return requestJson<Inquiry>(`/inquiries/${encodeURIComponent(inquiryId)}`, {
    signal: signal,
  })
}

export function updateInquiry(
  inquiryId: string,
  payload: UpdateInquiryRequest,
  signal?: AbortSignal,
): Promise<Inquiry> {
  return requestJson<Inquiry>(`/inquiries/${encodeURIComponent(inquiryId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    signal: signal,
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
    signal: signal,
  })
}
