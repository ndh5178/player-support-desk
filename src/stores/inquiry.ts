import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getInquiries } from '../services/api'
import { ApiError, type Pagination } from '../types/api'
import type { Inquiry, InquiryListQuery } from '../types/inquiry'

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export const useInquiryStore = defineStore('inquiry', () => {
  const inquiries = ref<Inquiry[]>([])
  const pagination = ref<Pagination>({ ...initialPagination })
  const isListLoading = ref(false)
  const listErrorMessage = ref('')
  let listRequestController: AbortController | null = null

  async function fetchInquiryList(query: InquiryListQuery): Promise<void> {
    listRequestController?.abort()

    const controller = new AbortController()
    listRequestController = controller
    isListLoading.value = true
    listErrorMessage.value = ''

    try {
      const response = await getInquiries(query, controller.signal)

      inquiries.value = response.data
      pagination.value = response.pagination
    } catch (error) {
      if (isAbortError(error)) {
        return
      }

      inquiries.value = []
      pagination.value = { ...initialPagination }
      listErrorMessage.value =
        error instanceof ApiError ? error.message : '문의 목록을 불러오지 못했습니다.'
    } finally {
      if (listRequestController === controller) {
        isListLoading.value = false
        listRequestController = null
      }
    }
  }

  function cancelInquiryListRequest(): void {
    listRequestController?.abort()
    listRequestController = null
    isListLoading.value = false
  }

  function resetInquiryList(): void {
    cancelInquiryListRequest()
    inquiries.value = []
    pagination.value = { ...initialPagination }
    listErrorMessage.value = ''
  }

  return {
    inquiries,
    pagination,
    isListLoading,
    listErrorMessage,
    fetchInquiryList,
    cancelInquiryListRequest,
    resetInquiryList,
  }
})
