import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  addInquiryNote,
  getAgents,
  getInquiries,
  getInquiry,
  updateInquiry,
} from '../services/api'
import { ApiError, type Pagination } from '../types/api'
import type {
  Agent,
  Inquiry,
  InquiryListQuery,
  UpdateInquiryRequest,
} from '../types/inquiry'

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
  const currentInquiry = ref<Inquiry | null>(null)
  const agents = ref<Agent[]>([])
  const isDetailLoading = ref(false)
  const detailErrorMessage = ref('')
  const detailErrorStatus = ref<number | null>(null)
  const isUpdatingInquiry = ref(false)
  const isAddingNote = ref(false)
  const mutationErrorMessage = ref('')
  let listRequestController: AbortController | null = null
  let detailRequestController: AbortController | null = null
  let mutationRequestController: AbortController | null = null

  async function fetchInquiryList(query: InquiryListQuery): Promise<void> {
    listRequestController?.abort()

    const controller = new AbortController()
    listRequestController = controller
    isListLoading.value = true
    listErrorMessage.value = ''

    try {
      const response = await getInquiries(query, controller.signal)

      if (listRequestController !== controller) {
        return
      }

      inquiries.value = response.data
      pagination.value = response.pagination
    } catch (error) {
      if (listRequestController !== controller || isAbortError(error)) {
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

  function syncInquiry(inquiry: Inquiry): void {
    currentInquiry.value = inquiry

    const listIndex = inquiries.value.findIndex((item) => item.id === inquiry.id)

    if (listIndex >= 0) {
      inquiries.value.splice(listIndex, 1, inquiry)
    }
  }

  async function fetchInquiryDetail(inquiryId: string): Promise<void> {
    detailRequestController?.abort()

    const controller = new AbortController()
    detailRequestController = controller
    currentInquiry.value = null
    isDetailLoading.value = true
    detailErrorMessage.value = ''
    detailErrorStatus.value = null
    mutationErrorMessage.value = ''

    try {
      const [inquiry, agentResponse] = await Promise.all([
        getInquiry(inquiryId, controller.signal),
        getAgents(controller.signal),
      ])

      if (detailRequestController !== controller) {
        return
      }

      currentInquiry.value = inquiry
      agents.value = agentResponse.data
    } catch (error) {
      if (detailRequestController !== controller || isAbortError(error)) {
        return
      }

      currentInquiry.value = null
      detailErrorMessage.value =
        error instanceof ApiError
          ? error.message
          : '문의 상세 정보를 불러오지 못했습니다.'
      detailErrorStatus.value = error instanceof ApiError ? error.status : null
    } finally {
      if (detailRequestController === controller) {
        isDetailLoading.value = false
        detailRequestController = null
      }
    }
  }

  async function saveInquiryChanges(payload: UpdateInquiryRequest): Promise<boolean> {
    if (!currentInquiry.value || isUpdatingInquiry.value || isAddingNote.value) {
      return false
    }

    mutationRequestController?.abort()

    const inquiryId = currentInquiry.value.id
    const controller = new AbortController()
    mutationRequestController = controller
    isUpdatingInquiry.value = true
    mutationErrorMessage.value = ''

    try {
      const inquiry = await updateInquiry(inquiryId, payload, controller.signal)

      if (
        mutationRequestController !== controller ||
        currentInquiry.value?.id !== inquiryId
      ) {
        return false
      }

      syncInquiry(inquiry)
      return true
    } catch (error) {
      if (mutationRequestController !== controller || isAbortError(error)) {
        return false
      }

      mutationErrorMessage.value =
        error instanceof ApiError
          ? error.message
          : '문의 변경 사항을 저장하지 못했습니다.'
      return false
    } finally {
      if (mutationRequestController === controller) {
        isUpdatingInquiry.value = false
        mutationRequestController = null
      }
    }
  }

  async function createInquiryNote(content: string): Promise<boolean> {
    if (!currentInquiry.value || isAddingNote.value || isUpdatingInquiry.value) {
      return false
    }

    mutationRequestController?.abort()

    const inquiryId = currentInquiry.value.id
    const controller = new AbortController()
    mutationRequestController = controller
    isAddingNote.value = true
    mutationErrorMessage.value = ''

    try {
      const note = await addInquiryNote(inquiryId, { content }, controller.signal)

      if (
        mutationRequestController !== controller ||
        currentInquiry.value?.id !== inquiryId
      ) {
        return false
      }

      syncInquiry({
        ...currentInquiry.value,
        updatedAt: note.createdAt,
        notes: [...currentInquiry.value.notes, note],
        history: [
          ...currentInquiry.value.history,
          {
            id: `${note.id}-history`,
            type: 'NOTE_ADDED',
            actorName: note.author.name,
            description: '내부 메모를 추가했습니다.',
            createdAt: note.createdAt,
          },
        ],
      })
      return true
    } catch (error) {
      if (mutationRequestController !== controller || isAbortError(error)) {
        return false
      }

      mutationErrorMessage.value =
        error instanceof ApiError ? error.message : '운영 메모를 저장하지 못했습니다.'
      return false
    } finally {
      if (mutationRequestController === controller) {
        isAddingNote.value = false
        mutationRequestController = null
      }
    }
  }

  function clearMutationError(): void {
    mutationErrorMessage.value = ''
  }

  function cancelInquiryDetailRequests(): void {
    detailRequestController?.abort()
    mutationRequestController?.abort()
    detailRequestController = null
    mutationRequestController = null
    isDetailLoading.value = false
    isUpdatingInquiry.value = false
    isAddingNote.value = false
  }

  function resetInquiryDetail(): void {
    cancelInquiryDetailRequests()
    currentInquiry.value = null
    agents.value = []
    detailErrorMessage.value = ''
    detailErrorStatus.value = null
    mutationErrorMessage.value = ''
  }

  return {
    inquiries,
    pagination,
    isListLoading,
    listErrorMessage,
    currentInquiry,
    agents,
    isDetailLoading,
    detailErrorMessage,
    detailErrorStatus,
    isUpdatingInquiry,
    isAddingNote,
    mutationErrorMessage,
    fetchInquiryList,
    cancelInquiryListRequest,
    resetInquiryList,
    fetchInquiryDetail,
    saveInquiryChanges,
    createInquiryNote,
    clearMutationError,
    cancelInquiryDetailRequests,
    resetInquiryDetail,
  }
})
