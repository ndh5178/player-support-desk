export const INQUIRY_STATUSES = [
  'NEW',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'RESOLVED',
] as const

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
