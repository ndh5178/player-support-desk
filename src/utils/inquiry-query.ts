import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import {
  isInquiryCategory,
  isInquiryPriority,
  isInquirySort,
  isInquiryStatus,
  type InquiryCategory,
  type InquiryListQuery,
  type InquiryPriority,
  type InquirySort,
  type InquiryStatus,
} from '../types/inquiry'

export const DEFAULT_INQUIRY_PAGE = 1
export const DEFAULT_INQUIRY_LIMIT = 10
export const DEFAULT_INQUIRY_SORT: InquirySort = 'newest'

export interface NormalizedInquiryListQuery {
  search: string
  status?: InquiryStatus
  priority?: InquiryPriority
  category?: InquiryCategory
  sort: InquirySort
  page: number
  limit: number
}

function getSingleQueryValue(
  value: string | null | (string | null)[] | undefined,
): string | undefined {
  const singleValue = Array.isArray(value) ? value[0] : value

  return singleValue ?? undefined
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) {
    return fallback
  }

  const parsedValue = Number(value)

  return Number.isSafeInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

export function parseInquiryListQuery(query: LocationQuery): NormalizedInquiryListQuery {
  const search = getSingleQueryValue(query.search)?.trim() ?? ''
  const status = getSingleQueryValue(query.status)
  const priority = getSingleQueryValue(query.priority)
  const category = getSingleQueryValue(query.category)
  const sort = getSingleQueryValue(query.sort)
  const page = getSingleQueryValue(query.page)

  return {
    search,
    status: status && isInquiryStatus(status) ? status : undefined,
    priority: priority && isInquiryPriority(priority) ? priority : undefined,
    category: category && isInquiryCategory(category) ? category : undefined,
    sort: sort && isInquirySort(sort) ? sort : DEFAULT_INQUIRY_SORT,
    page: parsePositiveInteger(page, DEFAULT_INQUIRY_PAGE),
    limit: DEFAULT_INQUIRY_LIMIT,
  }
}

export function toApiInquiryListQuery(
  query: NormalizedInquiryListQuery,
): InquiryListQuery {
  return {
    ...(query.search ? { search: query.search } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.category ? { category: query.category } : {}),
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  }
}

export function toRouteInquiryListQuery(
  query: NormalizedInquiryListQuery,
): LocationQueryRaw {
  return {
    ...(query.search ? { search: query.search } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.sort !== DEFAULT_INQUIRY_SORT ? { sort: query.sort } : {}),
    ...(query.page !== DEFAULT_INQUIRY_PAGE ? { page: String(query.page) } : {}),
  }
}
