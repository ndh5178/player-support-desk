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
  // 목록 화면과 상세 화면이 함께 사용하는 서버 데이터를 Pinia 상태로 관리한다.
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

  // 요청 종류별 Controller를 보관해 새 요청이나 화면 이탈 시 이전 요청을 취소한다.
  let listRequestController: AbortController | null = null
  let detailRequestController: AbortController | null = null
  let mutationRequestController: AbortController | null = null

  async function fetchInquiryList(query: InquiryListQuery): Promise<void> {
    // 검색과 필터가 빠르게 바뀌면 완료되지 않은 이전 목록 요청은 더 이상 필요하지 않다.
    listRequestController?.abort()

    const controller = new AbortController()
    listRequestController = controller
    isListLoading.value = true
    listErrorMessage.value = ''

    try {
      const response = await getInquiries(query, controller.signal)

      // 취소가 늦게 전달되어도 오래된 응답이 최신 목록을 덮어쓰지 못하게 요청 객체를 비교한다.
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
    // 변경 성공 결과를 상세 원본과 이미 불러온 목록 항목에 동시에 반영한다.
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
      // 상세 본문과 담당자 선택 목록은 서로 독립적이므로 동시에 요청한다.
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
    // 두 변경 요청이 겹치거나 현재 문의가 없는 상태에서는 저장을 시작하지 않는다.
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
        // 저장 중 다른 문의로 이동했다면 이전 문의의 응답을 현재 상세 화면에 적용하지 않는다.
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
        // 메모 API는 생성된 메모만 반환하므로 화면에 즉시 보일 처리 이력은 Store에서 함께 구성한다.
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
    // 상세 화면을 떠날 때 진행 중인 조회와 저장이 이후 상태를 변경하지 못하게 정리한다.
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
