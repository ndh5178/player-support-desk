export const INQUIRY_STATUSES = [
  'NEW',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'RESOLVED',
] as const

// 위 상수 배열을 타입의 기준으로 함께 사용해 실행 시 값과 TypeScript 타입의 중복을 줄인다.
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const INQUIRY_PRIORITIES = ['URGENT', 'HIGH', 'NORMAL', 'LOW'] as const

export type InquiryPriority = (typeof INQUIRY_PRIORITIES)[number]

export const INQUIRY_CATEGORIES = [
  'ACCOUNT',
  'PAYMENT',
  'GAME_ERROR',
  'REPORT',
  'INSTALLATION',
  'OTHER',
] as const

export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number]

export const INQUIRY_SORT_OPTIONS = ['newest', 'oldest'] as const

export type InquirySort = (typeof INQUIRY_SORT_OPTIONS)[number]

export type InquiryHistoryType =
  'CREATED' | 'STATUS_CHANGED' | 'ASSIGNEE_CHANGED' | 'NOTE_ADDED'

export interface Customer {
  id: string
  nickname: string
  email: string
  countryCode: string
  countryName: string
  languageCode: string
  languageName: string
}

export interface Agent {
  id: string
  name: string
  team: string
}

export interface InquiryHistory {
  id: string
  type: InquiryHistoryType
  actorName: string
  description: string
  createdAt: string
  previousValue?: string | null
  nextValue?: string | null
}

export interface InquiryNote {
  id: string
  content: string
  author: Agent
  createdAt: string
}

export interface Inquiry {
  // 문의 상세 화면과 목록, 대시보드가 공유하는 핵심 도메인 객체다.
  id: string
  title: string
  content: string
  category: InquiryCategory
  priority: InquiryPriority
  status: InquiryStatus
  customer: Customer
  assignee: Agent | null
  createdAt: string
  updatedAt: string
  slaDueAt: string
  history: InquiryHistory[]
  notes: InquiryNote[]
}

export interface InquiryListQuery {
  // 모두 선택 사항이므로 화면은 필요한 검색·필터 조건만 API에 전달할 수 있다.
  search?: string
  status?: InquiryStatus
  priority?: InquiryPriority
  category?: InquiryCategory
  sort?: InquirySort
  page?: number
  limit?: number
}

export interface UpdateInquiryRequest {
  status?: InquiryStatus
  assigneeId?: string | null
}

export interface CreateInquiryNoteRequest {
  content: string
}

export function isInquiryStatus(value: string): value is InquiryStatus {
  // URL과 JSON에서 들어온 문자열은 타입 정보가 없으므로 실행 중에도 유효성을 확인한다.
  return INQUIRY_STATUSES.some((status) => status === value)
}

export function isInquiryPriority(value: string): value is InquiryPriority {
  return INQUIRY_PRIORITIES.some((priority) => priority === value)
}

export function isInquiryCategory(value: string): value is InquiryCategory {
  return INQUIRY_CATEGORIES.some((category) => category === value)
}

export function isInquirySort(value: string): value is InquirySort {
  return INQUIRY_SORT_OPTIONS.some((sort) => sort === value)
}
