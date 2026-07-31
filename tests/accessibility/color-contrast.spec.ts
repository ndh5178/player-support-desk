/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const tokenCss = readFileSync(resolve('src/assets/styles/tokens.css'), 'utf8')
const priorityBadgeCss = readFileSync(
  resolve('src/components/common/PriorityBadge.vue'),
  'utf8',
)
const statusBadgeCss = readFileSync(
  resolve('src/components/common/StatusBadge.vue'),
  'utf8',
)

function getToken(name: string): string {
  const match = tokenCss.match(new RegExp(`${name}:\\s*([^;]+)`))

  if (!match?.[1]) {
    throw new Error(`${name} 색상 토큰을 찾을 수 없습니다.`)
  }

  const value = match[1].trim()
  const referencedToken = value.match(/^var\((--[^)]+)\)$/)?.[1]

  return referencedToken ? getToken(referencedToken) : value
}

function getLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((value) => Number.parseInt(value, 16) / 255)

  if (!channels || channels.length !== 3) {
    throw new Error(`올바르지 않은 색상입니다: ${hex}`)
  }

  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )

  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

function getContrastRatio(first: string, second: string): number {
  const firstLuminance = getLuminance(first)
  const secondLuminance = getLuminance(second)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

describe('UI 색상 대비', () => {
  it('기본 텍스트와 포커스 색상이 각 배경에서 기준 대비를 충족한다', () => {
    const surface = getToken('--color-neutral-0')
    const background = getToken('--color-neutral-50')
    const darkBackground = getToken('--color-brand-900')

    expect(
      getContrastRatio(getToken('--color-text-muted'), surface),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      getContrastRatio(getToken('--color-text-muted'), background),
    ).toBeGreaterThanOrEqual(4.5)
    expect(
      getContrastRatio(getToken('--color-brand-700'), surface),
    ).toBeGreaterThanOrEqual(4.5)
    expect(getContrastRatio(getToken('--color-focus'), surface)).toBeGreaterThanOrEqual(3)
    expect(
      getContrastRatio(getToken('--color-focus-on-dark'), darkBackground),
    ).toBeGreaterThanOrEqual(3)
  })

  it('모든 상태 Badge의 텍스트 대비가 4.5:1 이상이다', () => {
    const colorPairs = [
      ...statusBadgeCss.matchAll(
        /--status-background:\s*(#[0-9a-fA-F]{6});\s*--status-color:\s*(#[0-9a-fA-F]{6})/g,
      ),
    ]

    expect(colorPairs).toHaveLength(4)

    colorPairs.forEach(([, background, color]) => {
      expect(getContrastRatio(color!, background!)).toBeGreaterThanOrEqual(4.5)
    })
  })

  it('모든 우선순위 텍스트 대비가 4.5:1 이상이다', () => {
    const surface = getToken('--color-neutral-0')
    const colors = [
      ...priorityBadgeCss.matchAll(/--priority-color:\s*(#[0-9a-fA-F]{6})/g),
    ]

    expect(colors).toHaveLength(4)

    colors.forEach(([, color]) => {
      expect(getContrastRatio(color!, surface)).toBeGreaterThanOrEqual(4.5)
    })
  })
})
