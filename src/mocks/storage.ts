import { createSeedInquiries } from './data'
import type { Inquiry } from '../types/inquiry'
import { cloneSerializable } from '../utils/clone'

export const INQUIRY_STORAGE_KEY = 'player-support-desk:inquiries:v2'

interface StoredInquiryData {
  version: 2
  inquiries: Inquiry[]
}

let memoryInquiries: Inquiry[] | null = null
let useMemoryFallback = false

function cloneInquiries(inquiries: Inquiry[]): Inquiry[] {
  // 호출부가 반환 배열을 바꿔도 저장된 원본에는 영향이 없도록 항상 복사한다.
  return cloneSerializable(inquiries)
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isStoredInquiryData(value: unknown): value is StoredInquiryData {
  // localStorage의 JSON은 신뢰할 수 없는 외부 값이므로 버전과 최소 구조를 실행 중 확인한다.
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredInquiryData>

  return candidate.version === 2 && Array.isArray(candidate.inquiries)
}

export function saveStoredInquiries(inquiries: Inquiry[]): void {
  const nextInquiries = cloneInquiries(inquiries)
  const storage = getBrowserStorage()

  // localStorage를 쓸 수 없는 환경에서도 현재 세션은 동작하도록 메모리에도 보관한다.
  memoryInquiries = nextInquiries

  if (!storage) {
    return
  }

  const payload: StoredInquiryData = {
    version: 2,
    inquiries: nextInquiries,
  }

  try {
    storage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(payload))
    useMemoryFallback = false
  } catch {
    // 저장 공간이 부족하거나 접근이 차단된 환경에서는 메모리 저장소로 계속 동작한다.
    useMemoryFallback = true
  }
}

export function resetInquiryStorage(now = new Date()): Inquiry[] {
  // 저장 값이 없거나 손상되면 현재 시각 기준의 초기 문의 데이터로 복구한다.
  const seedInquiries = createSeedInquiries(now)

  saveStoredInquiries(seedInquiries)

  return cloneInquiries(seedInquiries)
}

export function getStoredInquiries(): Inquiry[] {
  const storage = getBrowserStorage()

  if (storage) {
    if (useMemoryFallback && memoryInquiries) {
      return cloneInquiries(memoryInquiries)
    }

    try {
      const rawValue = storage.getItem(INQUIRY_STORAGE_KEY)

      if (rawValue) {
        const parsedValue: unknown = JSON.parse(rawValue)

        // 현재 버전과 맞는 데이터만 사용하고 이전 형식은 아래 초기화 경로로 보낸다.
        if (isStoredInquiryData(parsedValue)) {
          memoryInquiries = cloneInquiries(parsedValue.inquiries)
          return cloneInquiries(parsedValue.inquiries)
        }
      }
    } catch {
      // 손상된 JSON이나 접근 제한은 초기 데이터 복구 경로에서 처리한다.
    }

    return resetInquiryStorage()
  }

  if (memoryInquiries) {
    return cloneInquiries(memoryInquiries)
  }

  return resetInquiryStorage()
}
