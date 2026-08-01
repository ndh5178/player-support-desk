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
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredInquiryData>

  return candidate.version === 2 && Array.isArray(candidate.inquiries)
}

export function saveStoredInquiries(inquiries: Inquiry[]): void {
  const nextInquiries = cloneInquiries(inquiries)
  const storage = getBrowserStorage()

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
