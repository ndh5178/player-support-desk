import { afterEach, describe, expect, it, vi } from 'vitest'

import { cloneSerializable } from '@/utils/clone'

describe('cloneSerializable', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('structuredClone을 지원하지 않는 환경에서도 독립된 복사본을 만든다', () => {
    vi.stubGlobal('structuredClone', undefined)

    const original = {
      id: 'INQ-2026-0001',
      nested: {
        status: 'NEW',
      },
    }
    const cloned = cloneSerializable(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned.nested).not.toBe(original.nested)
  })
})
