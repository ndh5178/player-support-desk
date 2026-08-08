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
  // 같은 Query가 여러 번 들어오면 Vue Router는 배열을 주므로 첫 값만 사용한다.
  let singleValue: string | null | undefined

  if (Array.isArray(value)) {
    singleValue = value[0]
  } else {
    singleValue = value
  }

  if (singleValue === null) {
    return undefined
  }

  return singleValue
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) {
    return fallback
  }

  const parsedValue = Number(value)

  if (Number.isSafeInteger(parsedValue) && parsedValue > 0) {
    return parsedValue
  }

  return fallback
}

export function parseInquiryListQuery(query: LocationQuery): NormalizedInquiryListQuery {
  // 주소창의 문자열을 검증해 화면과 API가 사용할 안전한 필터 값으로 바꾼다.
  const searchQueryValue = getSingleQueryValue(query.search)
  let search = ''

  if (searchQueryValue !== undefined) {
    search = searchQueryValue.trim()
  }

  const status = getSingleQueryValue(query.status)
  const priority = getSingleQueryValue(query.priority)
  const category = getSingleQueryValue(query.category)
  const sort = getSingleQueryValue(query.sort)
  const page = getSingleQueryValue(query.page)
  let normalizedStatus: InquiryStatus | undefined
  let normalizedPriority: InquiryPriority | undefined
  let normalizedCategory: InquiryCategory | undefined
  let normalizedSort = DEFAULT_INQUIRY_SORT

  if (status && isInquiryStatus(status)) {
    normalizedStatus = status
  }

  if (priority && isInquiryPriority(priority)) {
    normalizedPriority = priority
  }

  if (category && isInquiryCategory(category)) {
    normalizedCategory = category
  }

  if (sort && isInquirySort(sort)) {
    normalizedSort = sort
  }

  return {
    search: search,
    status: normalizedStatus,
    priority: normalizedPriority,
    category: normalizedCategory,
    sort: normalizedSort,
    page: parsePositiveInteger(page, DEFAULT_INQUIRY_PAGE),
    limit: DEFAULT_INQUIRY_LIMIT,
  }
}

export function toApiInquiryListQuery(
  query: NormalizedInquiryListQuery,
): InquiryListQuery {
  // 빈 필터는 보내지 않아 API 요청 URL을 짧고 명확하게 유지한다.
  const apiQuery: InquiryListQuery = {
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  }

  if (query.search) {
    apiQuery.search = query.search
  }
  if (query.status) {
    apiQuery.status = query.status
  }
  if (query.priority) {
    apiQuery.priority = query.priority
  }
  if (query.category) {
    apiQuery.category = query.category
  }

  return apiQuery
}

export function toRouteInquiryListQuery(
  query: NormalizedInquiryListQuery,
): LocationQueryRaw {
  // 기본값은 URL에서 생략해 같은 목록 상태가 하나의 간결한 주소로 표현되게 한다.
  const routeQuery: LocationQueryRaw = {}

  if (query.search) {
    routeQuery.search = query.search
  }
  if (query.status) {
    routeQuery.status = query.status
  }
  if (query.priority) {
    routeQuery.priority = query.priority
  }
  if (query.category) {
    routeQuery.category = query.category
  }
  if (query.sort !== DEFAULT_INQUIRY_SORT) {
    routeQuery.sort = query.sort
  }
  if (query.page !== DEFAULT_INQUIRY_PAGE) {
    routeQuery.page = String(query.page)
  }

  return routeQuery
}
